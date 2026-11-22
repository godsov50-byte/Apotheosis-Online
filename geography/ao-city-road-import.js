/* AO OSM road viewport importer.
 * Stores source centerlines in the existing browser-local AO city registry.
 * OSM geometry is evidence, not a verified pedestrian/vehicle graph or Kernel state.
 */
(() => {
  "use strict";
  const DB_NAME = "ao-city-registry-cache-v1";
  const DB_VERSION = 2;
  const TILE_DEGREES = 0.02;
  const MAX_TILES_PER_FEATURE = 500;
  const MAX_WAYS_PER_VIEW = 12000;
  const $ = (id) => document.getElementById(id);
  const button = $("loadOsmRoads");
  const statusEl = $("registryStatus");
  if (!button || !window.AOCityConsoleMap || !window.L) return;
  const map = window.AOCityConsoleMap;
  let dbPromise = null;
  let busy = false;

  function status(message) {
    if (statusEl) statusEl.textContent = message;
  }
  function openDB() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable."));
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("features")) {
          const store = db.createObjectStore("features", { keyPath: "id" });
          store.createIndex("kind", "kind", { unique: false });
          store.createIndex("dataset", "dataset", { unique: false });
        }
        if (!db.objectStoreNames.contains("tileRefs")) {
          const store = db.createObjectStore("tileRefs", { keyPath: "key" });
          store.createIndex("tile", "tile", { unique: false });
          store.createIndex("featureId", "featureId", { unique: false });
        }
        if (!db.objectStoreNames.contains("datasets")) db.createObjectStore("datasets", { keyPath: "id" });
        if (!db.objectStoreNames.contains("streetAliases")) db.createObjectStore("streetAliases", { keyPath: "groupKey" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open the AO city registry."));
      request.onblocked = () => reject(new Error("Close other AO map tabs to finish opening the local registry."));
    });
    return dbPromise;
  }
  function transactionDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Road import storage failed."));
      tx.onabort = () => reject(tx.error || new Error("Road import storage was cancelled."));
    });
  }
  function bboxOf(coords) {
    let west = 180, south = 90, east = -180, north = -90, valid = 0;
    for (const point of coords) {
      const lon = Number(point[0]), lat = Number(point[1]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;
      west = Math.min(west, lon); east = Math.max(east, lon);
      south = Math.min(south, lat); north = Math.max(north, lat); valid++;
    }
    return valid >= 2 ? [west, south, east, north] : null;
  }
  function tilesForBBox(bbox) {
    const minX = Math.floor((bbox[0] + 180) / TILE_DEGREES);
    const maxX = Math.floor((bbox[2] + 180) / TILE_DEGREES);
    const minY = Math.floor((bbox[1] + 90) / TILE_DEGREES);
    const maxY = Math.floor((bbox[3] + 90) / TILE_DEGREES);
    const tiles = [];
    for (let x = minX; x <= maxX && tiles.length <= MAX_TILES_PER_FEATURE; x++) {
      for (let y = minY; y <= maxY && tiles.length <= MAX_TILES_PER_FEATURE; y++) tiles.push(x + ":" + y);
    }
    return tiles;
  }
  function intersects(a, b) {
    return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
  }
  function normalizeWay(way) {
    if (way.type !== "way" || !Number.isSafeInteger(Number(way.id)) ||
        !Array.isArray(way.geometry) || way.geometry.length < 2) return null;
    const coords = way.geometry.map(p => [Number(p.lon), Number(p.lat)]);
    if (coords.some(p => !Number.isFinite(p[0]) || !Number.isFinite(p[1]) ||
        p[0] < -180 || p[0] > 180 || p[1] < -90 || p[1] > 90)) return null;
    const bbox = bboxOf(coords);
    if (!bbox) return null;
    const tiles = tilesForBBox(bbox);
    if (!tiles.length || tiles.length > MAX_TILES_PER_FEATURE) return null;
    const tags = way.tags || {};
    const osmId = String(way.id);
    const highway = String(tags.highway || "unclassified");
    const props = {
      ...tags,
      osm_type: "way",
      osm_id: osmId,
      osm_nodes: Array.isArray(way.nodes) ? way.nodes : null,
      osm_version: way.version ?? null,
      osm_timestamp: way.timestamp ?? null,
      highway,
      name: tags.name || null,
      ref: tags.ref || null,
      oneway: tags.oneway || null,
      lanes: tags.lanes || null,
      maxspeed: tags.maxspeed || null,
      surface: tags.surface || null,
      access: tags.access || null,
      bridge: tags.bridge || null,
      tunnel: tags.tunnel || null,
      layer: tags.layer || "0"
    };
    return {
      id: "street:osm:way:" + osmId,
      kind: "street",
      dataset: "openstreetmap-overpass-roads",
      name: String(tags.name || tags.ref || (highway + " road · OSM " + osmId)),
      geometry: { type: "LineString", coordinates: coords },
      properties: props,
      rawProperties: props,
      provenance: {
        publisher: "OpenStreetMap contributors",
        source_type: "OpenStreetMap way",
        source_id: "way/" + osmId,
        source_url: "https://www.openstreetmap.org/way/" + osmId,
        license: "Open Database License (ODbL) 1.0",
        retrieved_at: new Date().toISOString()
      },
      sourceIdentity: "way/" + osmId,
      nameGroupKey: tags.name ? "osm:name:" + String(tags.name).trim().toLocaleLowerCase() : null,
      sourceStatus: "community-mapped road centerline; not a surveyed pavement edge, sidewalk, legal access record, or verified route edge",
      bbox,
      tiles
    };
  }
  async function writeRoads(records) {
    const db = await openDB();
    const tx = db.transaction(["features", "tileRefs", "datasets"], "readwrite");
    const features = tx.objectStore("features");
    const refs = tx.objectStore("tileRefs");
    for (const record of records) {
      features.put(record);
      for (const tile of record.tiles) {
        refs.put({ key: tile + "|" + record.id, tile, featureId: record.id });
      }
    }
    tx.objectStore("datasets").put({
      id: "street:openstreetmap-overpass-roads",
      kind: "street",
      name: "OpenStreetMap roads · map viewport imports",
      sourceLabel: "openstreetmap-overpass-roads",
      lastImportedAt: new Date().toISOString(),
      lastBatchCount: records.length,
      importMode: "viewport-fetch",
      attribution: "© OpenStreetMap contributors · ODbL 1.0"
    });
    await transactionDone(tx);
  }
  async function fetchOverpass(query) {
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];
    let lastError;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: "data=" + encodeURIComponent(query)
        });
        if (!response.ok) throw new Error("Overpass returned HTTP " + response.status);
        return await response.json();
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error("No Overpass endpoint responded.");
  }
  async function loadRoadsInView() {
    if (busy) return;
    const bounds = map.getBounds();
    const south = bounds.getSouth(), west = bounds.getWest();
    const north = bounds.getNorth(), east = bounds.getEast();
    if ((north - south) * (east - west) > 0.0015) {
      status("Zoom in to a smaller map area before loading roads. The request is limited to a neighbourhood-sized viewport.");
      return;
    }
    busy = true;
    button.disabled = true;
    button.textContent = "Loading OSM roads…";
    status("Requesting mapped highway ways for the current map view…");
    try {
      const query = '[out:json][timeout:25];way["highway"](' +
        south + "," + west + "," + north + "," + east + ");out meta geom;";
      const data = await fetchOverpass(query);
      const elements = Array.isArray(data.elements) ? data.elements : [];
      if (elements.length > MAX_WAYS_PER_VIEW) {
        throw new Error("The source returned too many ways for one safe import. Zoom in further.");
      }
      const unique = new Map();
      let rejected = 0;
      for (const way of elements) {
        const record = normalizeWay(way);
        if (!record || !intersects(record.bbox, [west, south, east, north])) { rejected++; continue; }
        unique.set(record.id, record);
      }
      const records = Array.from(unique.values());
      if (!records.length) {
        status("No mapped road centerlines were returned for this view. Try a nearby viewport or a closer zoom.");
        return;
      }
      for (let i = 0; i < records.length; i += 200) await writeRoads(records.slice(i, i + 200));
      if (window.AOCityRegistryRefresh) await window.AOCityRegistryRefresh();
      const count = $("registryStreetCount");
      const total = count ? count.textContent : "updated";
      status("Imported " + records.length.toLocaleString() + " OSM road ways into this browser's AO source registry. " +
        "Street inventory now shows " + total + ". Skipped " + rejected.toLocaleString() +
        " invalid or oversized ways. OSM centerlines are not yet a verified routing graph or Supabase/Kernel commit. " +
        "© OpenStreetMap contributors · ODbL 1.0.");
    } catch (error) {
      status("OSM road import failed: " + (error && error.message ? error.message : String(error)));
    } finally {
      busy = false;
      button.disabled = false;
      button.textContent = "Load OSM roads in current map view";
    }
  }
  button.addEventListener("click", loadRoadsInView);
})();