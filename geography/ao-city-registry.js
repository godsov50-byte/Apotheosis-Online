/* AO City Registry browser adapter.
 * Imports source artifacts into IndexedDB; renders only the current map viewport.
 * GIS evidence is not AO canon, Kernel state, a verified entrance, or a route graph.
 */
(() => {
  "use strict";
  const DB_NAME = "ao-city-registry-cache-v1";
  const DB_VERSION = 2;
  const TILE_DEGREES = 0.02;
  const MAX_VIEW_TILES = 240;
  const MAX_RENDER_FEATURES = 2200;
  const ADDRESS_KEY = "ao-city-entrance-addresses-v1";
  let entrancePins = loadEntrancePins();
  let entranceLayer = L.layerGroup().addTo(map);
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

  function loadEntrancePins(){try{return JSON.parse(localStorage.getItem(ADDRESS_KEY)||"[]")}catch{return []}}
  function saveEntrancePins(){try{localStorage.setItem(ADDRESS_KEY,JSON.stringify(entrancePins))}catch(e){status("Could not save entrance/address markers locally: "+e.message)}}
  function entranceIcon(){return L.divIcon({className:"",html:'<div class="ao-address-icon" aria-label="Address or entrance">⌂</div>',iconSize:[28,28],iconAnchor:[14,25]})}
  function openEntranceCard(pin){const card=$("aoEntranceCard"),body=$("aoEntranceCardBody");if(!card||!body)return;body.replaceChildren();const title=document.createElement("h2");title.textContent=pin.address||"Entrance";body.append(title);const subtitle=document.createElement("div");subtitle.className="hint";subtitle.textContent="AO entrance/address marker · browser-local record";body.append(subtitle);const info=document.createElement("p");info.textContent=pin.description||"Door position recorded. Interior visibility and access are not assumed.";body.append(info);const coords=document.createElement("div");coords.className="hint";coords.textContent=Number(pin.lat).toFixed(7)+", "+Number(pin.lng).toFixed(7);body.append(coords);if(pin.parentName){const p=document.createElement("div");p.className="hint";p.textContent="Building: "+pin.parentName;body.append(p)}const btn=document.createElement("button");btn.className="primary ao-card-action";btn.textContent="Inspect location";btn.onclick=()=>{card.hidden=true;map.setView([pin.lat,pin.lng],19)};body.append(btn);card.hidden=false}
  $("aoEntranceClose").onclick=()=>{$("aoEntranceCard").hidden=true};
  function renderEntrancePins(){entranceLayer.clearLayers();entrancePins.forEach(pin=>{const marker=L.marker([pin.lat,pin.lng],{icon:entranceIcon()}).addTo(entranceLayer);marker.on("click",e=>{if(e.originalEvent)L.DomEvent.stopPropagation(e.originalEvent);openEntranceCard(pin)});marker.bindTooltip(pin.address||"Entrance")})}
  function addEntrancePinAt(latlng){if(!pinAuthoring)return;pinAuthoring=false;const address=prompt("Address / entrance label (do not guess):","");if(address===null||!address.trim())return;const description=prompt("Optional description / access note (leave blank if unknown):","")||"";const parentName=selectedRecord&&selectedRecord.kind==="building"?selectedRecord.name:"";const pin={id:"ao-door-"+Date.now(),lat:latlng.lat,lng:latlng.lng,address:address.trim(),description,parentName,createdAt:new Date().toISOString(),source:"user-authored"};entrancePins.push(pin);saveEntrancePins();renderEntrancePins();openEntranceCard(pin);status("Entrance/address pin added at clicked door location (local-only).")}

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
        if (!db.objectStoreNames.contains("features")) {
          const features = db.createObjectStore("features", { keyPath: "id" });
          features.createIndex("kind", "kind", { unique: false });
          features.createIndex("dataset", "dataset", { unique: false });
        }
        if (!db.objectStoreNames.contains("tileRefs")) {
          const refs = db.createObjectStore("tileRefs", { keyPath: "key" });
          refs.createIndex("tile", "tile", { unique: false });
          refs.createIndex("featureId", "featureId", { unique: false });
        }
        if (!db.objectStoreNames.contains("datasets")) db.createObjectStore("datasets", { keyPath: "id" });
        if (!db.objectStoreNames.contains("streetAliases")) db.createObjectStore("streetAliases", { keyPath: "groupKey" });
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
      nameGroupKey: item.name_group_key || null,
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
  async function* streamArrayObjects(file, targetArrayName) {
    const reader = file.stream().getReader(), decoder = new TextDecoder();
    let buffer="", started=false, inObject=false, depth=0, inString=false, escape=false, objectText="", searchTail="";
    try {
      while (true) {
        const part=await reader.read();
        buffer+=decoder.decode(part.value||new Uint8Array(),{stream:!part.done});
        if(!started){
          const scan=searchTail+buffer, marker='"'+targetArrayName+'"', at=scan.indexOf(marker);
          if(at>=0){
            const after=scan.slice(at+marker.length), bracket=after.indexOf("[");
            if(bracket>=0){buffer=scan.slice(at+marker.length+bracket+1);started=true;}
            else {searchTail=scan.slice(-marker.length-16);buffer="";}
          } else {searchTail=scan.slice(-marker.length-16);buffer="";}
        }
        if(started){
          let i=0;
          for(;i<buffer.length;i++){
            const ch=buffer[i];
            if(!inObject){
              if(ch==="]"){buffer=buffer.slice(i+1);return;}
              if(ch!=="{")continue;
              inObject=true;depth=1;inString=false;escape=false;objectText="{";continue;
            }
            objectText+=ch;
            if(inString){if(escape)escape=false;else if(ch==="\\")escape=true;else if(ch==='"')inString=false;continue;}
            if(ch==='"'){inString=true;continue;}
            if(ch==="{")depth++;
            else if(ch==="}"){depth--;if(depth===0){yield JSON.parse(objectText);inObject=false;objectText="";}}
          }
          buffer=inObject?"":buffer.slice(i);
        }
        if(part.done)break;
      }
      if(!started)throw new Error("Could not find JSON array '"+targetArrayName+"' in selected file.");
      if(inObject)throw new Error("Incomplete JSON object at end of file.");
    } finally {reader.releaseLock();}
  }
  function normalizeStreamingItem(item,kind,sourceLabel,index){
    if(kind==="street"){
      const props=item.properties||item.raw_source_attributes||{}, sourceIdentity=item.identity_key||item.source_global_id||item.source_record_key||("row-"+index);
      return {id:"street:"+String(sourceIdentity),kind:"street",dataset:item.registry_id||"ao-houston-street-registry",name:pickName(props,item.display_name),geometry:item.geometry,properties:props,rawProperties:item.raw_source_attributes||{},provenance:item.provenance||{},sourceIdentity,nameGroupKey:item.name_group_key||null,sourceStatus:"source-reported centerline; not a validated route edge"};
    }
    const p=item.properties||{},sourceId=p.GlobalID||p.GLOBALID||p.globalid||p.FID||p.OBJECTID||p.OBJECTID_1||p.id||item.id||("feature-"+index),featureKind=kind==="lot"?"lot":"building";
    return {id:featureKind+":"+sourceLabel+":"+String(sourceId),kind:featureKind,dataset:sourceLabel,name:pickName(p,(kind==="lot"?"Parcel ":"Building ")+sourceId),geometry:item.geometry,properties:p,rawProperties:p,provenance:{publisher:sourceLabel,source_record_id:String(sourceId)},sourceIdentity:String(sourceId),sourceStatus:kind==="lot"?"source parcel boundary; not field-verified property truth":"source footprint; not field-verified building truth"};
  }
  async function importFile(file,kind){
    if(!file)return;
    const sourceLabel=kind==="building"?($("buildingSource").value||"user-imported-building-footprints"):kind==="lot"?"user-imported-parcel-boundaries":"";
    const arrayName=kind==="street"?"street_segments":"features";
    status("Streaming "+file.name+" — large-file mode…");
    try{
      let accepted=0,rejected=0,batch=[],bounds=null;
      const db=await openDB(),datasetKey=(kind==="street"?"street:":kind==="lot"?"lot:":"building:")+sourceLabelOrDefault(kind,sourceLabel);
      const oldTx=db.transaction("datasets","readonly");
      const old=await new Promise((resolve,reject)=>{const req=oldTx.objectStore("datasets").get(datasetKey);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});
      await transactionDone(oldTx);
      let index=0;
      for await(const item of streamArrayObjects(file,arrayName)){
        const record=normalizeStreamingItem(item,kind,sourceLabel,index++),bbox=geometryBBox(record.geometry);
        if(!bbox||!record.geometry||!["LineString","MultiLineString","Polygon","MultiPolygon"].includes(record.geometry.type)){rejected++;continue;}
        record.bbox=bbox;record.tiles=tilesForBBox(bbox);
        if(!record.tiles.length||record.tiles.length>500){rejected++;continue;}
        batch.push(record);
        if(!bounds)bounds=[...bbox];else{bounds[0]=Math.min(bounds[0],bbox[0]);bounds[1]=Math.min(bounds[1],bbox[1]);bounds[2]=Math.max(bounds[2],bbox[2]);bounds[3]=Math.max(bounds[3],bbox[3]);}
        if(batch.length>=200){await writeBatch(batch);accepted+=batch.length;batch=[];status("Streaming import "+file.name+" · "+accepted.toLocaleString()+" accepted · "+index.toLocaleString()+" scanned");}
      }
      if(batch.length){await writeBatch(batch);accepted+=batch.length;}
      const tx=db.transaction("datasets","readwrite");
      tx.objectStore("datasets").put({id:datasetKey,kind,name:file.name,importedAt:new Date().toISOString(),sourceLabel:sourceLabelOrDefault(kind,sourceLabel),accepted:(old&&old.accepted||0)+accepted,rejected:(old&&old.rejected||0)+rejected,fileBytes:file.size,importMode:"streaming-batches"});
      await transactionDone(tx);
      status("Streaming import complete: "+accepted.toLocaleString()+" new "+(kind==="street"?"street segments":kind==="lot"?"parcel / lot boundaries":"building footprints")+(rejected?"; skipped "+rejected.toLocaleString()+".":".")+" Saved in IndexedDB.");
      await updateCounts();await refreshVisible();
      if(bounds)map.fitBounds([[bounds[1],bounds[0]],[bounds[3],bounds[2]]],{padding:[24,24],maxZoom:16});
    }catch(error){status("Import failed: "+(error&&error.message?error.message:String(error)));}
  }
  function sourceLabelOrDefault(kind, label) {
    return kind === "street" ? "ao-houston-street-registry" : (kind==="lot"?"user-imported-parcel-boundaries":label || "user-imported-building-footprints");
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
            : record.kind === "lot"
              ? { color: "#b68a48", weight: 1.5, fillColor: "#b68a48", fillOpacity: 0.05, dashArray: "5 4" }
              : { color: "#e0b65e", weight: 1.5, fillColor: "#d9b66d", fillOpacity: 0.18 }
        }).addTo(layer);
        const aoName = record.kind === "street" && window.AOStreetNames ? window.AOStreetNames.getName(record) : null;
        drawn.bindTooltip((record.kind==="lot"?"Lot / Parcel · ":"Building · ")+(aoName ? (aoName + " · ") : "")+record.name, { sticky: true });
        drawn.on("click", (event) => {
          if (event.originalEvent) L.DomEvent.stopPropagation(event.originalEvent);
          if(pinAuthoring){addEntrancePinAt(event.latlng);return;}
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
  window.AOCityRegistryRefresh = refreshVisible;
  window.addEventListener("ao:street-names-updated", refreshVisible);
  function showRecord(record) {
    selectedRecord = record;
    const panel = $("registryInspector");
    if (!panel) return;
    panel.replaceChildren();
    const heading = document.createElement("strong");
    const aoName = record.kind === "street" && window.AOStreetNames ? window.AOStreetNames.getName(record) : null;
    heading.textContent = aoName ? (aoName + " · " + record.name) : record.name;
    panel.append(heading);
    window.dispatchEvent(new CustomEvent("ao:registry-record-selected", { detail: record }));
    const type = document.createElement("div");
    type.className = "hint";
    type.textContent = (record.kind === "street" ? "Street centerline segment" : record.kind==="lot" ? "Parcel / lot boundary" : "Building footprint") +
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
    if(record.kind==="building"){const add=document.createElement("button");add.className="primary";add.textContent="Add address / entrance pin at door";add.onclick=()=>{pinAuthoring=true;status("Click the map exactly where the doorway is; then enter its address/label. No entrance is inferred.");};panel.append(add);}
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
        const aoName = record.kind === "street" && window.AOStreetNames ? window.AOStreetNames.getName(record) : null;
        if (record.name.toLocaleLowerCase().includes(query) || (aoName && aoName.toLocaleLowerCase().includes(query))) {
          const button = document.createElement("button");
          button.textContent = (record.kind === "street" ? (aoName ? "Road · " + aoName + " · " : "Road · ") : "Building · ") + record.name;
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
  $("importLots").addEventListener("click", () => $("lotRegistryFile").click());
  $("streetRegistryFile").addEventListener("change", (event) => {
    importFile(event.target.files && event.target.files[0], "street");
    event.target.value = "";
  });
  $("buildingRegistryFile").addEventListener("change", (event) => {
    importFile(event.target.files && event.target.files[0], "building");
    event.target.value = "";
  });
  $("lotRegistryFile").addEventListener("change", (event) => {
    importFile(event.target.files && event.target.files[0], "lot");
    event.target.value = "";
  });
  $("registrySearch").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchRecords().catch((error) => status(error.message || String(error))), 180);
  });
  map.on("moveend", refreshVisible);
  renderEntrancePins();
  let pinAuthoring = false;
  map.on("click",e=>{if(pinAuthoring)addEntrancePinAt(e.latlng);});
  openDB().then(updateCounts).then(refreshVisible).catch((error) => status(error.message || String(error)));
})();
