/* AO Demo viewport builder: imports mapped streets/buildings across the whole visible map
 * and creates a clearly marked local demo starting anchor with an entrance.
 * No OSM doorways are inferred and nothing is committed to Kernel/WorldHeart.
 */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const button = $("buildDemoViewport");
  const runtime = window.AOCityConsoleRuntime;
  const map = window.AOCityConsoleMap;
  if (!button || !runtime || !map) return;
  const { state, renderObjects, chat } = runtime;
  const START = [29.760193, -95.369361];
  const STORE = "ao-city-console-demo-v1";
  const metersLat = (m) => m / 111320;
  const metersLng = (m, lat) => m / (111320 * Math.cos(lat * Math.PI / 180));
  function seedAnchor() {
    const found = state.objects.find(o => o.id === "ao-demo-start-anchor-building");
    if (found) return;
    const anchorLat = START[0], anchorLng = START[1];
    const centerLat = anchorLat + metersLat(6);
    const halfW = 6, halfD = 4;
    const ring = [
      [centerLat + metersLat(halfD), anchorLng - metersLng(halfW, centerLat)],
      [centerLat + metersLat(halfD), anchorLng + metersLng(halfW, centerLat)],
      [centerLat - metersLat(halfD), anchorLng + metersLng(halfW, centerLat)],
      [centerLat - metersLat(halfD), anchorLng - metersLng(halfW, centerLat)]
    ];
    const building = {
      id: "ao-demo-start-anchor-building", kind: "building",
      name: "Demo Starting Anchor · Entrance Building", use: "Demo",
      lat: centerLat, lng: anchorLng, center: {lat: centerLat, lng: anchorLng},
      width: 12, depth: 8, footprint: ring,
      developmentState: "demo_seeded", access: "unknown", rooms: [],
      sourceStatus: "Demo placeholder footprint; not an OSM-verified structure",
      createdAt: new Date().toISOString()
    };
    const entrance = {
      id: "ao-demo-start-anchor-entrance", kind: "entrance",
      name: "Demo Starting Anchor Entrance", lat: anchorLat, lng: anchorLng,
      parentId: building.id, access: "demo", doorState: "open",
      developmentState: "demo_seeded",
      sourceStatus: "Demo-authored entrance marker at the starting coordinate; not field verified",
      createdAt: new Date().toISOString()
    };
    state.objects.push(building, entrance);
    state.connections.push({id: "ao-demo-anchor-connection", from: building.id, to: entrance.id, kind: "building_entrance", state: "demo_seeded"});
    try { localStorage.setItem(STORE, JSON.stringify({objects: state.objects, connections: state.connections})); } catch {}
    renderObjects();
  }
  button.addEventListener("click", () => {
    button.disabled = true;
    button.textContent = "Building viewport…";
    seedAnchor();
    // Existing importers already query their own map.getBounds() viewport.
    const buildings = $("loadOsmBuildings"), roads = $("loadOsmRoads");
    if (buildings) buildings.click();
    if (roads) roads.click();
    const viewport = map.getBounds();
    chat("AO", "Demo environment build started for the full visible map area: mapped building outlines and roads are being imported. The starting anchor and entrance are demo-authored at the starting point. OSM does not establish door locations; other entrances remain unknown. Imports stay browser-local.");
    button.textContent = "Viewport Build Started · Run Again";
    button.disabled = false;
    map.fitBounds(viewport, {padding: [12, 12]});
  });
})();
