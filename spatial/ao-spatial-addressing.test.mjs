import test from "node:test";
import assert from "node:assert/strict";
import {
  createSpatialResolver,
  createSpatialRepository,
  spatialAddressKey,
  sameSimulationSpace,
  samePhysicalPlace,
  assertSpatialAddress
} from "./ao-spatial-addressing.mjs";

const resolver = createSpatialResolver({
  worldId: "ao-test-world",
  regions: [{
    id: "houston-test",
    originLat: 29.76,
    originLon: -95.37,
    bounds: { south: 29.5, north: 30.2, west: -96.0, east: -95.0 },
    maxRadiusKm: 100
  }]
});

test("GPS resolves to deterministic region, chunk, tile and cell identifiers", () => {
  const input = { latitude: 29.761, longitude: -95.369, regionId: "houston-test" };
  const a = resolver.resolveGeographic(input);
  const b = resolver.resolveGeographic(input);
  assert.equal(a.chunkId, b.chunkId);
  assert.equal(a.tileId, b.tileId);
  assert.equal(a.cellId, b.cellId);
  assert.equal(a.geographic.crs, "EPSG:4326");
  assert.equal(a.coordinateSource, "gps");
  assertSpatialAddress(a);
});

test("address signs inherit exact address coordinates and deterministic tile identity", () => {
  const left = resolver.resolveAddressAnchor({
    addressId: "houston-address-100",
    sourceId: "COH_SiteAddresses:OBJECTID:100",
    sourceVersion: "snapshot-2026-11-21",
    latitude: 29.761,
    longitude: -95.369,
    regionId: "houston-test"
  });
  const same = resolver.resolveAddressAnchor({
    addressId: "houston-address-100",
    sourceId: "COH_SiteAddresses:OBJECTID:100",
    sourceVersion: "snapshot-2026-11-21",
    latitude: 29.761,
    longitude: -95.369,
    regionId: "houston-test"
  });
  assert.equal(left.id, same.id);
  assert.equal(left.marker.id, same.marker.id);
  assert.equal(left.coordinate.latitude, 29.761);
  assert.equal(left.coordinate.longitude, -95.369);
  assert.equal(left.spatialAddress.geographic.latitude, 29.761);
  assert.equal(left.spatialAddress.geographic.longitude, -95.369);
  assert.equal(left.marker.spatialAddressKey, left.spatialAddressKey);
  assert.equal(left.marker.inheritsAnchorCoordinate, true);
  assert.equal(left.marker.worldPosition, null);
  assert.equal(left.marker.participatesInCollision, false);
  assert.deepEqual(left.marker.renderOffset, {
    space: "screen-pixels", x: 0, y: -24
  });
  assert.deepEqual(left.coordinate.verticalPosition, {
    value: null, unit: "m", status: "unknown-from-2d-address-point"
  });
  assert.ok(Object.isFrozen(left));
  assert.ok(Object.isFrozen(left.marker));
});

test("address anchors on opposite road sides remain independent source positions", () => {
  const westSide = resolver.resolveAddressAnchor({
    addressId: "west-address",
    sourceId: "site-addresses:west",
    latitude: 29.761,
    longitude: -95.3701,
    regionId: "houston-test"
  });
  const eastSide = resolver.resolveAddressAnchor({
    addressId: "east-address",
    sourceId: "site-addresses:east",
    latitude: 29.761,
    longitude: -95.3699,
    regionId: "houston-test"
  });
  assert.notEqual(westSide.id, eastSide.id);
  assert.notEqual(westSide.coordinate.longitude, eastSide.coordinate.longitude);
  assert.equal(westSide.spatialAddress.geographic.longitude, -95.3701);
  assert.equal(eastSide.spatialAddress.geographic.longitude, -95.3699);
});

test("address anchor rejects missing provenance and invalid visual offsets", () => {
  assert.throws(() => resolver.resolveAddressAnchor({
    addressId: "address-no-source",
    sourceId: "",
    latitude: 29.761,
    longitude: -95.369,
    regionId: "houston-test"
  }), /sourceId/);
  assert.throws(() => resolver.resolveAddressAnchor({
    addressId: "address-bad-offset",
    sourceId: "site-addresses:bad",
    latitude: 29.761,
    longitude: -95.369,
    regionId: "houston-test",
    markerOffsetPx: { x: 0, y: "above" }
  }), /markerOffsetPx/);
});

test("negative world coordinates use mathematical floor, not truncation", () => {
  const a = resolver.resolveWorldPosition({ regionId: "houston-test", x: -0.2, y: 0, z: -64.1 });
  assert.equal(a.grid.chunkX, -1);
  assert.equal(a.grid.tileX, -1);
  assert.equal(a.grid.cellX, -1);
  assert.equal(a.grid.chunkY, 0);
});

test("GPS uses one unique configured region and rejects uncovered or ambiguous points", () => {
  assert.equal(resolver.resolveGeographic({ latitude: 29.7, longitude: -95.4 }).regionId, "houston-test");
  assert.throws(() => resolver.resolveGeographic({ latitude: 31, longitude: -95.4 }), /No configured region covers/);
  const ambiguous = createSpatialResolver({
    worldId: "ambiguous-world",
    regions: [
      { id: "region-a", originLat: 29.76, originLon: -95.37, bounds: { south: 29, north: 30, west: -96, east: -95 } },
      { id: "region-b", originLat: 29.76, originLon: -95.37, bounds: { south: 29, north: 30, west: -96, east: -95 } }
    ]
  });
  assert.throws(() => ambiguous.resolveGeographic({ latitude: 29.7, longitude: -95.4 }), /multiple regions/);
  assert.throws(() => resolver.resolveGeographic({ latitude: 31, longitude: -95.4, regionId: "houston-test" }), /outside explicitly selected region/);
});

test("interior addresses retain building, floor and exterior anchor references", () => {
  const outside = resolver.resolveGeographic({ latitude: 29.76, longitude: -95.37, regionId: "houston-test" });
  const inside = resolver.resolveInterior({
    buildingId: "building-582", exteriorAddress: outside,
    floorId: "2", x: 12.5, y: 7.25, roomId: "room-kitchen"
  });
  assert.equal(inside.layer, "interior");
  assert.equal(inside.parentLocationId, "building-582");
  assert.equal(inside.floorId, "2");
  assert.equal(inside.roomId, "room-kitchen");
  assert.equal(inside.exteriorAddressKey, spatialAddressKey(outside));
  assert.notEqual(inside.spaceId, outside.spaceId);
});

test("underground addresses retain their surface-site anchor and negative depth", () => {
  const surface = resolver.resolveGeographic({ latitude: 29.76, longitude: -95.37, regionId: "houston-test" });
  const below = resolver.resolveUnderground({
    siteId: "utility-tunnel-9", surfaceAddress: surface,
    x: 12, y: -20, z: 8, layer: "underground"
  });
  assert.equal(below.layer, "underground");
  assert.equal(below.regionId, surface.regionId);
  assert.equal(below.parentLocationId, "utility-tunnel-9");
  assert.equal(below.position.y, -20);
  assert.equal(below.exteriorAddressKey, spatialAddressKey(surface));
});

test("instance coordinates are separate simulation space but retain physical source", () => {
  const outside = resolver.resolveGeographic({ latitude: 29.76, longitude: -95.37, regionId: "houston-test" });
  const battle = resolver.resolveInstance({ instanceId: "battle-77", sourceAddress: outside, x: 4, y: 9 });
  assert.equal(battle.instanceId, "battle-77");
  assert.equal(battle.exteriorAddressKey, spatialAddressKey(outside));
  assert.equal(sameSimulationSpace(outside, battle), false);
  assert.equal(samePhysicalPlace(outside, battle), true);
});

test("aerial layer is a distinct spatial layer above the same geographic grid", () => {
  const ground = resolver.resolveGeographic({ latitude: 29.76, longitude: -95.37, regionId: "houston-test" });
  const airAtGroundLevel = resolver.resolveGeographic({
    latitude: 29.76, longitude: -95.37, altitudeM: 0,
    regionId: "houston-test", layer: "aerial"
  });
  const air = resolver.resolveGeographic({
    latitude: 29.76, longitude: -95.37, altitudeM: 120,
    regionId: "houston-test", layer: "aerial", coordinateSource: "flight-sensor"
  });
  assert.equal(air.layer, "aerial");
  assert.notEqual(air.chunkId, ground.chunkId); // layer namespaces never collide
  assert.equal(air.chunkId, airAtGroundLevel.chunkId); // same 1,024 m vertical chunk
  assert.notEqual(air.tileId, airAtGroundLevel.tileId); // different 64 m vertical tile
  assert.notEqual(air.cellId, airAtGroundLevel.cellId); // distinct 1 m vertical cell
  assert.notEqual(spatialAddressKey(air), spatialAddressKey(ground));
  assert.equal(air.position.y, 120);
});

test("teleport transition records immutable origin and destination addresses", () => {
  const from = resolver.resolveGeographic({ latitude: 29.76, longitude: -95.37, regionId: "houston-test" });
  const to = resolver.resolveWorldPosition({ regionId: "houston-test", x: 1500, y: 900 });
  const event = resolver.transition({
    entityId: "character-1", from, to, kind: "teleport",
    occurredAt: "2026-11-21T12:00:00.000Z",
    metadata: { method: "portal" }
  });
  assert.equal(event.originAddressKey, spatialAddressKey(from));
  assert.equal(event.destinationAddressKey, spatialAddressKey(to));
  assert.equal(event.kind, "teleport");
  assert.ok(Object.isFrozen(event));
  assert.ok(Object.isFrozen(event.from));
  assert.ok(Object.isFrozen(event.from.position));
  assert.ok(Object.isFrozen(event.metadata));
  assert.throws(() => resolver.transition({ entityId: "character-1", from, to: from, kind: "teleport" }), /must differ/);
});

test("transitions reject addresses from another world", () => {
  const from = resolver.resolveGeographic({ latitude: 29.76, longitude: -95.37, regionId: "houston-test" });
  const other = createSpatialResolver({
    worldId: "other-world",
    regions: [{ id: "houston-test", originLat: 29.76, originLon: -95.37, maxRadiusKm: 100 }]
  }).resolveWorldPosition({ regionId: "houston-test", x: 1, y: 1 });
  assert.throws(() => resolver.transition({ entityId: "x", from, to: other, kind: "walk" }), /Cross-world/);
});

test("repository loads missing chunks and commits address plus event atomically", async () => {
  const chunks = new Map();
  const addresses = new Map();
  const events = [];
  const adapter = {
    async getChunk(id) { return chunks.get(id) || null; },
    async putChunk(record) { chunks.set(record.id, record); },
    async getEntityAddress(id) { return addresses.get(id) || null; },
    async commitTransitionAtomic({ event, destinationAddress, destinationChunk }) {
      events.push(event);
      chunks.set(destinationChunk.id, destinationChunk);
      addresses.set(event.entityId, destinationAddress);
    }
  };
  const repository = createSpatialRepository(adapter);
  const from = resolver.resolveWorldPosition({ regionId: "houston-test", x: 2, y: 3 });
  const to = resolver.resolveWorldPosition({ regionId: "houston-test", x: 1100, y: 20 });
  const event = resolver.transition({ entityId: "character-2", from, to, kind: "walk" });
  await repository.commitTransition(event);
  assert.equal(events.length, 1);
  assert.equal((await repository.loadEntityAddress("character-2")).cellId, to.cellId);
  assert.ok(chunks.has(to.chunkId));
  assert.equal((await repository.loadChunk(to)).id, to.chunkId);
});

test("repository refuses a partial adapter that cannot commit atomically", () => {
  assert.throws(() => createSpatialRepository({}), /must implement/);
});
