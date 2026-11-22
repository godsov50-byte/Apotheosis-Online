/* AO Street Name Overlay
 * AO street aliases are browser-local staging metadata, keyed by compiler name_group_key.
 * Source street identity, source properties, and geometry are never changed.
 */
(() => {
  "use strict";
  const DB_NAME = "ao-city-registry-cache-v1";
  const DB_VERSION = 2;
  const $ = (id) => document.getElementById(id);
  const panel = $("aoStreetRenamePanel");
  const aliases = new Map();
  let selectedStreet = null;
  let dbPromise;

  function status(message) {
    const el = $("aoStreetNameStatus");
    if (el) el.textContent = message;
  }
  function openDB() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable."));
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
      request.onerror = () => reject(request.error || new Error("Unable to open street-name database."));
    });
    return dbPromise;
  }
  function getName(record) {
    const alias = record && record.nameGroupKey ? aliases.get(record.nameGroupKey) : null;
    return alias && alias.aoName ? alias.aoName : null;
  }
  async function loadAliases() {
    const db = await openDB();
    const tx = db.transaction("streetAliases", "readonly");
    const req = tx.objectStore("streetAliases").getAll();
    const rows = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    await done(tx);
    aliases.clear();
    rows.forEach(row => aliases.set(row.groupKey, row));
  }
  function done(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("Street-name transaction failed."));
      tx.onabort = () => reject(tx.error || new Error("Street-name transaction aborted."));
    });
  }
  async function putAlias(row) {
    const db = await openDB(), tx = db.transaction("streetAliases", "readwrite");
    tx.objectStore("streetAliases").put(row);
    await done(tx);
    aliases.set(row.groupKey, row);
  }
  async function removeAlias(groupKey) {
    const db = await openDB(), tx = db.transaction("streetAliases", "readwrite");
    tx.objectStore("streetAliases").delete(groupKey);
    await done(tx);
    aliases.delete(groupKey);
  }
  function show(record) {
    selectedStreet = record && record.kind === "street" ? record : null;
    if (!panel) return;
    panel.hidden = !selectedStreet;
    if (!selectedStreet) return;
    const alias = selectedStreet.nameGroupKey ? aliases.get(selectedStreet.nameGroupKey) : null;
    $("aoStreetNameInput").value = alias ? alias.aoName : "";
    if (!selectedStreet.nameGroupKey) {
      $("aoStreetNameInput").disabled = true;
      $("saveAoStreetName").disabled = true;
      status("This source record has no name_group_key. Import a compiled street registry to enable grouped renaming.");
    } else {
      $("aoStreetNameInput").disabled = false;
      $("saveAoStreetName").disabled = false;
      status(alias ? "Existing AO name loaded. Saving applies to all segments in this source name group." : "No AO alias yet. Saving applies to all segments in this source name group.");
    }
  }
  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
  }
  async function saveCurrent() {
    if (!selectedStreet || !selectedStreet.nameGroupKey) return status("Select a compiled street segment with a name group first.");
    const aoName = $("aoStreetNameInput").value.trim();
    if (!aoName) return status("Enter an AO street name before saving.");
    const row = { groupKey: selectedStreet.nameGroupKey, aoName, sourceName: selectedStreet.name, updatedAt: new Date().toISOString(), schemaVersion: 1 };
    await putAlias(row);
    status("Saved locally: " + aoName + ". All segments sharing this source name group will use it.");
    window.dispatchEvent(new Event("ao:street-names-updated"));
    if (window.AOCityRegistryRefresh) window.AOCityRegistryRefresh();
  }
  async function exportAliases() {
    const db = await openDB(), tx = db.transaction("streetAliases", "readonly"), req = tx.objectStore("streetAliases").getAll();
    const rows = await new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error); });
    await done(tx);
    downloadJSON("ao-street-names.json", { registry: "ao-street-name-overlay", schemaVersion: 1, exportedAt: new Date().toISOString(), aliases: rows });
    status("Exported " + rows.length + " AO street-name aliases.");
  }
  async function importAliases(file) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.registry !== "ao-street-name-overlay" || !Array.isArray(data.aliases)) throw new Error("File is not an AO street-name overlay export.");
      let count = 0;
      for (const row of data.aliases) {
        if (!row || typeof row.groupKey !== "string" || !row.groupKey.trim() || typeof row.aoName !== "string" || !row.aoName.trim()) continue;
        await putAlias({ groupKey: row.groupKey, aoName: row.aoName.trim(), sourceName: String(row.sourceName || ""), updatedAt: row.updatedAt || new Date().toISOString(), schemaVersion: 1 });
        count++;
      }
      status("Imported " + count + " valid aliases. Source geometry and official names were not changed.");
      window.dispatchEvent(new Event("ao:street-names-updated"));
      if (window.AOCityRegistryRefresh) window.AOCityRegistryRefresh();
      if (selectedStreet) show(selectedStreet);
    } catch (error) { status("Import failed: " + (error.message || String(error))); }
    finally { $("aoStreetNamesFile").value = ""; }
  }
  window.AOStreetNames = { getName };
  window.addEventListener("ao:registry-record-selected", event => show(event.detail));
  $("saveAoStreetName").addEventListener("click", () => saveCurrent().catch(error => status(error.message || String(error))));
  $("clearAoStreetName").addEventListener("click", async () => {
    if (!selectedStreet || !selectedStreet.nameGroupKey) return status("Select a compiled street segment first.");
    await removeAlias(selectedStreet.nameGroupKey);
    $("aoStreetNameInput").value = "";
    status("AO alias removed. Source street name restored for this group.");
    window.dispatchEvent(new Event("ao:street-names-updated"));
    if (window.AOCityRegistryRefresh) window.AOCityRegistryRefresh();
  });
  $("exportAoStreetNames").addEventListener("click", () => exportAliases().catch(error => status(error.message || String(error))));
  $("importAoStreetNames").addEventListener("click", () => $("aoStreetNamesFile").click());
  $("aoStreetNamesFile").addEventListener("change", event => importAliases(event.target.files && event.target.files[0]));
  loadAliases().then(() => {
    status("Loaded " + aliases.size + " local AO street aliases.");
    if (window.AOCityRegistryRefresh) window.AOCityRegistryRefresh();
  }).catch(error => status(error.message || String(error)));
})();
