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

test("negative world coordinates use mathematical floor, not truncation", () => {
  const a = resolver.resolveWorldPosition({ regionId: "houston-test", x: -0.2, y: -64.1 });
  assert.equal(a.grid.chunkX, -1);
  assert.equal(a.grid.tileX, -1);
  assert.equal(a.grid.cellX, -1);
  assert.equal(a.grid.chunkZ, 0);
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
  const air = resolver.resolveGeographic({
    latitude: 29.76, longitude: -95.37, altitudeM: 120,
    regionId: "houston-test", layer: "aerial", coordinateSource: "flight-sensor"
  });
  assert.equal(air.layer, "aerial");
  assert.equal(air.chunkId, ground.chunkId); // same 1,024 m vertical chunk
  assert.notEqual(air.tileId, ground.tileId); // different 64 m vertical tile
  assert.notEqual(air.cellId, ground.cellId); // distinct 1 m vertical cell
  assert.notEqual(spatialAddressKey(air), spatialAddressKey(ground));
  assert.equal(air.position.z, 120);
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
