/* AO City Registry browser adapter.
 * Imports source artifacts into IndexedDB; renders only the current map viewport.
 * GIS evidence is not AO canon, Kernel state, a verified entrance, or a route graph.
 */
(() => {
  "use strict";
  const DB_NAME = "ao-city-registry-cache-v1";
  const DB_VERSION = 1;
  const TILE_DEGREES = 0.02;
  const MAX_VIEW_TILES = 240;
  const MAX_RENDER_FEATURES = 2200;
  const $ = (id) => document.getElementById(id);
  const map = window.AOCityConsoleMap;
  if (!map || !window.L) {
    const status = $("registryStatus");
    if (status) status.textContent = "Registry adapter could not connect to the city map.";
    return;
  }

  const layer = L.layerGroup().addTo(map);
  let dbPromise;
  let refreshToken = 0;
  let selectedRecord = null;
  let searchTimer = null;

  function status(message) {
    const el = $("registryStatus");
    if (el) el.textContent = message;
  }
  function openDB() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
    if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        const features = db.createObjectStore("features", { keyPath: "id" });
        features.createIndex("kind", "kind", { unique: false });
        features.createIndex("dataset", "dataset", { unique: false });
        const refs = db.createObjectStore("tileRefs", { keyPath: "key" });
        refs.createIndex("tile", "tile", { unique: false });
        refs.createIndex("featureId", "featureId", { unique: false });
        db.createObjectStore("datasets", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open the local registry database."));
    });
    return dbPromise;
  }
  function transactionDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Registry storage transaction failed."));
      tx.onabort = () => reject(tx.error || new Error("Registry storage transaction was cancelled."));
    });
  }
  function tileKey(x, y) { return x + ":" + y; }
  function tilesForBBox(bbox) {
    const minX = Math.floor((bbox[0] + 180) / TILE_DEGREES);
    const maxX = Math.floor((bbox[2] + 180) / TILE_DEGREES);
    const minY = Math.floor((bbox[1] + 90) / TILE_DEGREES);
    const maxY = Math.floor((bbox[3] + 90) / TILE_DEGREES);
    const out = [];
    for (let x = minX; x <= maxX && out.length < 500; x++) {
      for (let y = minY; y <= maxY && out.length < 500; y++) out.push(tileKey(x, y));
    }
    return out;
  }
  function geometryBBox(geometry) {
    if (!geometry || !geometry.coordinates) return null;
    let minX = 180, minY = 90, maxX = -180, maxY = -90, found = false;
    const walk = (value) => {
      if (!Array.isArray(value)) return;
      if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
        const x = value[0], y = value[1];
        if (x < -180 || x > 180 || y < -90 || y > 90) return;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y); found = true;
        return;
      }
      value.forEach(walk);
    };
    walk(geometry.coordinates);
    return found ? [minX, minY, maxX, maxY] : null;
  }
  function normalizeName(value) { return String(value ?? "").trim(); }
  function pickName(properties, fallback) {
    const p = properties || {};
    return normalizeName(p.fullname || p.NAME || p.name || p.Address || p.ADDRESS ||
      p.address || p.Parcel_ID || p.PARCEL_ID || p.HGAC_Parcel_Number || p.HGAC_PARCEL_NUMBER || fallback || "Unnamed source feature");
  }
  function normalizeStreetRegistry(data) {
    if (!data || !Array.isArray(data.street_segments)) throw new Error("This is not an AO street-registry JSON artifact.");
    const dataset = data.registry_id || "ao-houston-street-registry";
    return data.street_segments.map((item) => ({
      id: "street:" + String(item.identity_key || item.source_global_id || item.source_record_key),
      kind: "street",
      dataset,
      name: pickName(item.properties || item.raw_source_attributes, item.display_name),
      geometry: item.geometry,
      properties: item.properties || {},
      rawProperties: item.raw_source_attributes || {},
      provenance: item.provenance || {},
      sourceIdentity: item.identity_key || item.source_global_id || item.source_record_key,
      sourceStatus: "source-reported centerline; not a validated route edge"
    }));
  }
  function normalizeBuildingGeoJSON(data, sourceLabel) {
    if (data && data.type === "FeatureCollection" && Array.isArray(data.features)) {
      return data.features.map((feature, index) => {
        const p = feature.properties || {};
        const sourceId = p.GlobalID || p.GLOBALID || p.globalid || p.FID || p.OBJECTID ||
          p.OBJECTID_1 || p.id || feature.id || ("feature-" + index);
        return {
          id: "building:" + sourceLabel + ":" + String(sourceId),
          kind: "building",
          dataset: sourceLabel,
          name: pickName(p, "Building " + sourceId),
          geometry: feature.geometry,
          properties: p,
          rawProperties: p,
          provenance: { publisher: sourceLabel, source_record_id: String(sourceId) },
          sourceIdentity: String(sourceId),
          sourceStatus: "source footprint; not field-verified building truth"
        };
      });
    }
    if (data && Array.isArray(data.buildings)) {
      return data.buildings.map((item, index) => ({
        id: "building:" + sourceLabel + ":" + String(item.identity_key || item.id || item.source_id || index),
        kind: "building",
        dataset: sourceLabel,
        name: pickName(item.properties || item, item.name || item.id),
        geometry: item.geometry,
        properties: item.properties || {},
        rawProperties: item.raw_source_attributes || item.properties || {},
        provenance: item.provenance || { publisher: sourceLabel },
        sourceIdentity: String(item.identity_key || item.id || item.source_id || index),
        sourceStatus: "source footprint; not field-verified building truth"
      }));
    }
    throw new Error("Building import expects a GeoJSON FeatureCollection or a buildings array.");
  }
  async function writeBatch(records) {
    const db = await openDB();
    const tx = db.transaction(["features", "tileRefs"], "readwrite");
    const featureStore = tx.objectStore("features");
    const refStore = tx.objectStore("tileRefs");
    for (const record of records) {
      featureStore.put(record);
      for (const tile of record.tiles) {
        refStore.put({ key: tile + "|" + record.id, tile, featureId: record.id });
      }
    }
    await transactionDone(tx);
  }

  async function* streamArrayObjects(file, targetKey) {
    const reader = file.stream().getReader();
    const decoder = new TextDecoder();
    let buffer = "", done = false, started = false, cursor = 0;
    let depth = 0, inString = false, escaped = false, itemStart = -1;
    const marker = JSON.stringify(targetKey);
    try {
      while (!done || cursor < buffer.length) {
        if (!done && depth === 0 && (cursor > 65536 || buffer.length - cursor < 8192)) {
          buffer = buffer.slice(cursor); cursor = 0;
          const part = await reader.read();
          done = part.done;
          if (part.value) buffer += decoder.decode(part.value, {stream: true});
          if (done) buffer += decoder.decode();
        }
        if (!started) {
          const keyPos = buffer.indexOf(marker, cursor);
          if (keyPos >= 0) {
            const colon = buffer.indexOf(":", keyPos + marker.length);
            if (colon >= 0) {
              const bracket = buffer.indexOf("[", colon + 1);
              if (bracket >= 0) { cursor = bracket + 1; started = true; continue; }
            }
          }
          if (done) throw new Error("JSON array key not found: " + targetKey);
          if (buffer.length - cursor > marker.length + 8192) cursor = Math.max(0, buffer.length - marker.length - 8192);
          continue;
        }
        while (cursor < buffer.length) {
          const ch = buffer[cursor++];
          if (depth === 0) {
            if (ch === "]") return;
            if (ch === "{") { depth = 1; itemStart = cursor - 1; inString = false; escaped = false; }
            continue;
          }
          if (inString) {
            if (escaped) escaped = false;
            else if (ch === "\\") escaped = true;
            else if (ch === '"') inString = false;
          } else if (ch === '"') inString = true;
          else if (ch === "{") depth++;
          else if (ch === "}") {
            depth--;
            if (depth === 0) {
              const raw = buffer.slice(itemStart, cursor);
              yield JSON.parse(raw);
              itemStart = -1;
            }
          }
        }
        if (!done) {
          if (depth === 0) { buffer = buffer.slice(cursor); cursor = 0; }
          const part = await reader.read();
          done = part.done;
          if (part.value) buffer += decoder.decode(part.value, {stream: true});
          if (done) buffer += decoder.decode();
        }
      }
      if (depth !== 0) throw new Error("Truncated JSON array item.");
    } finally { reader.releaseLock(); }
  }

  async function importFile(file, kind) {
    if (!file) return;
    const sourceLabel = kind === "building" ? ($("buildingSource").value || "user-imported-building-footprints") : "";
    const arrayKey = kind === "street" ? "street_segments" : "features";
    status("Streaming " + file.name + "…");
    let accepted = 0, rejected = 0, processed = 0, batch = [];
    let minX = 180, minY = 90, maxX = -180, maxY = -90;
    const db = await openDB();
    const existingTx = db.transaction("datasets", "readonly");
    const prior = await new Promise((resolve, reject) => {
      const req = existingTx.objectStore("datasets").get((kind === "street" ? "street:" : "building:") + sourceLabelOrDefault(kind, sourceLabel));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    // Resume safely: stable source IDs make repeated imports idempotent. The import
    // still refreshes tile references, but avoids deleting a previous cache mid-run.
    async function commitBatch() {
      if (!batch.length) return;
      await writeBatch(batch);
      accepted += batch.length;
      batch = [];
      status("Streaming " + file.name + " · " + accepted.toLocaleString() + " accepted");
    }
    try {
      for await (const item of streamArrayObjects(file, arrayKey)) {
        processed++;
        let record;
        if (kind === "street") {
          record = {
            id: "street:" + String(item.identity_key || item.source_global_id || item.source_record_key),
            kind: "street", dataset: item.registry_id || "ao-houston-street-registry",
            name: pickName(item.properties || item.raw_source_attributes, item.display_name),
            geometry: item.geometry, properties: item.properties || {},
            rawProperties: item.raw_source_attributes || {}, provenance: item.provenance || {},
            sourceIdentity: item.identity_key || item.source_global_id || item.source_record_key,
            sourceStatus: "source-reported centerline; not a validated route edge"
          };
        } else {
          const p = item.properties || {};
          const sourceId = p.GlobalID || p.GLOBALID || p.globalid || p.FID || p.OBJECTID || p.OBJECTID_1 || p.id || item.id || ("feature-" + (processed - 1));
          record = {
            id: "building:" + sourceLabel + ":" + String(sourceId),
            kind: "building", dataset: sourceLabel, name: pickName(p, "Building " + sourceId),
            geometry: item.geometry, properties: p, rawProperties: p,
            provenance: { publisher: sourceLabel, source_record_id: String(sourceId) },
            sourceIdentity: String(sourceId), sourceStatus: "source footprint; not field-verified building truth"
          };
        }
        const bbox = geometryBBox(record.geometry);
        if (!bbox || !record.geometry || !["LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(record.geometry.type)) { rejected++; continue; }
        record.bbox = bbox; record.tiles = tilesForBBox(bbox);
        if (!record.tiles.length || record.tiles.length > 500) { rejected++; continue; }
        minX = Math.min(minX, bbox[0]); minY = Math.min(minY, bbox[1]); maxX = Math.max(maxX, bbox[2]); maxY = Math.max(maxY, bbox[3]);
        batch.push(record);
        if (batch.length >= 200) await commitBatch();
      }
      await commitBatch();
      const tx = db.transaction("datasets", "readwrite");
      tx.objectStore("datasets").put({
        id: (kind === "street" ? "street:" : "building:") + sourceLabelOrDefault(kind, sourceLabel),
        kind, name: file.name, importedAt: new Date().toISOString(),
        sourceLabel: sourceLabelOrDefault(kind, sourceLabel),
        accepted, rejected, processed, fileBytes: file.size, status: "complete",
        previousImport: prior ? prior.importedAt : null
      });
      await transactionDone(tx);
      status("Import complete: " + accepted.toLocaleString() + " " + (kind === "street" ? "street segments" : "building footprints") +
        (rejected ? "; skipped " + rejected.toLocaleString() + " invalid records." : ".") + " Streamed to IndexedDB.");
      await updateCounts();
      await refreshVisible();
      if (accepted) map.fitBounds(L.latLngBounds([minY, minX], [maxY, maxX]), { padding: [24, 24], maxZoom: 16 });
    } catch (error) {
      status("Streaming import stopped after " + processed.toLocaleString() + " records (" + accepted.toLocaleString() + " saved): " + (error && error.message ? error.message : String(error)) + ". Retry import to continue safely.");
    }
  }
  function sourceLabelOrDefault(kind, label) {
    return kind === "street" ? "ao-houston-street-registry" : (label || "user-imported-building-footprints");
  }
  async function updateCounts() {
    try {
      const db = await openDB();
      const tx = db.transaction("features", "readonly");
      const store = tx.objectStore("features");
      const [streets, buildings] = await Promise.all([
        new Promise((resolve, reject) => { const r = store.index("kind").count("street"); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }),
        new Promise((resolve, reject) => { const r = store.index("kind").count("building"); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); })
      ]);
      await transactionDone(tx);
      if ($("registryStreetCount")) $("registryStreetCount").textContent = streets.toLocaleString();
      if ($("registryBuildingCount")) $("registryBuildingCount").textContent = buildings.toLocaleString();
    } catch (error) { status(error.message || String(error)); }
  }
  function visibleTiles() {
    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    return tilesForBBox(bbox);
  }
  function intersects(a, b) { return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]; }
  async function refreshVisible() {
    const token = ++refreshToken;
    try {
      const tiles = visibleTiles();
      if (tiles.length > MAX_VIEW_TILES) {
        layer.clearLayers();
        status("Zoom in to inspect imported features; this view covers too many registry tiles.");
        return;
      }
      const ids = new Set();
      for (const tile of tiles) {
        const db = await openDB();
        const tx = db.transaction("tileRefs", "readonly");
        const request = tx.objectStore("tileRefs").index("tile").getAll(tile);
        const rows = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        rows.forEach((row) => ids.add(row.featureId));
      }
      const db = await openDB();
      const tx = db.transaction("features", "readonly");
      const store = tx.objectStore("features");
      const requests = Array.from(ids, (id) => new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }));
      const fetched = await Promise.all(requests);
      const view = map.getBounds();
      const viewBox = [view.getWest(), view.getSouth(), view.getEast(), view.getNorth()];
      const records = fetched.filter((record) => record && intersects(record.bbox, viewBox));
      if (token !== refreshToken) return;
      records.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
      layer.clearLayers();
      records.slice(0, MAX_RENDER_FEATURES).forEach((record) => {
        const feature = { type: "Feature", geometry: record.geometry, properties: {} };
        const drawn = L.geoJSON(feature, {
          style: () => record.kind === "street"
            ? { color: "#64c7e8", weight: 2.2, opacity: 0.86 }
            : { color: "#e0b65e", weight: 1.5, fillColor: "#d9b66d", fillOpacity: 0.18 }
        }).addTo(layer);
        drawn.bindTooltip(record.name, { sticky: true });
        drawn.on("click", (event) => {
          if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
          showRecord(record);
        });
      });
      const suffix = records.length > MAX_RENDER_FEATURES ? " (render limit applied)" : "";
      status("Visible registry features: " + Math.min(records.length, MAX_RENDER_FEATURES).toLocaleString() +
        " · " + $("registryStreetCount").textContent + " street segments · " +
        $("registryBuildingCount").textContent + " buildings in local cache" + suffix + ".");
    } catch (error) {
      status("Registry view error: " + (error && error.message ? error.message : String(error)));
    }
  }
  function showRecord(record) {
    selectedRecord = record;
    const panel = $("registryInspector");
    if (!panel) return;
    panel.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = record.name;
    panel.append(heading);
    const type = document.createElement("div");
    type.className = "hint";
    type.textContent = (record.kind === "street" ? "Street centerline segment" : "Building footprint") +
      " · " + record.sourceIdentity;
    panel.append(type);
    const provenance = document.createElement("div");
    provenance.className = "hint";
    provenance.textContent = record.sourceStatus + " · Dataset: " + record.dataset;
    panel.append(provenance);
    const props = record.rawProperties || record.properties || {};
    const preferred = record.kind === "street"
      ? ["roadclass", "onewaydir", "lanes", "speed", "funcclass", "munileft", "muniright", "fromleft", "toleft", "fromright", "toright", "zipleft", "zipright"]
      : ["Parcel_ID", "PARCEL_ID", "Address", "ADDRESS", "address", "height", "HEIGHT", "zipcode", "ZIP", "department", "CreationDate", "EditDate"];
    let shown = 0;
    preferred.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(props, key) && props[key] !== null && props[key] !== "") {
        const line = document.createElement("div");
        line.className = "kv";
        const label = document.createElement("span");
        label.textContent = key;
        const value = document.createElement("b");
        value.textContent = String(props[key]);
        line.append(label, value);
        panel.append(line);
        shown++;
      }
    });
    if (!shown) {
      const note = document.createElement("div");
      note.className = "hint";
      note.textContent = "No preferred attributes were populated in this source record. Raw properties remain stored in the registry.";
      panel.append(note);
    }
    const bounds = L.geoJSON({ type: "Feature", geometry: record.geometry, properties: {} }).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.8), { maxZoom: 19 });
  }
  async function searchRecords() {
    const query = ($("registrySearch").value || "").trim().toLocaleLowerCase();
    const results = $("registryResults");
    results.replaceChildren();
    if (!query) return;
    const db = await openDB();
    const tx = db.transaction("features", "readonly");
    const request = tx.objectStore("features").openCursor();
    let found = 0;
    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || found >= 50) { resolve(); return; }
        const record = cursor.value;
        if (record.name.toLocaleLowerCase().includes(query)) {
          const button = document.createElement("button");
          button.textContent = (record.kind === "street" ? "Road · " : "Building · ") + record.name;
          button.onclick = () => showRecord(record);
          results.append(button);
          found++;
        }
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });
    await transactionDone(tx);
    if (!found) {
      const empty = document.createElement("div");
      empty.className = "hint";
      empty.textContent = "No matching imported records.";
      results.append(empty);
    }
  }

  $("importStreets").addEventListener("click", () => $("streetRegistryFile").click());
  $("importBuildings").addEventListener("click", () => $("buildingRegistryFile").click());
  $("streetRegistryFile").addEventListener("change", (event) => {
    importFile(event.target.files && event.target.files[0], "street");
    event.target.value = "";
  });
  $("buildingRegistryFile").addEventListener("change", (event) => {
    importFile(event.target.files && event.target.files[0], "building");
    event.target.value = "";
  });
  $("registrySearch").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchRecords().catch((error) => status(error.message || String(error))), 180);
  });
  map.on("moveend", refreshVisible);
  openDB().then(updateCounts).then(refreshVisible).catch((error) => status(error.message || String(error)));
})();
