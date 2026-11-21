import test from "node:test";
import assert from "node:assert/strict";
import {
  createSpatialResolver, createSpatialRepository, spatialAddressKey, samePhysicalPlace
} from "./ao-spatial-addressing.mjs";
import {
  createBuildingPortal, resolveBuildingPortalTransition,
  commitSpatialTransition, authorizeAndCommitSpatialTransition,
  createBrowserStagingSpatialAdapter
} from "./ao-building-transitions.mjs";

const resolver = createSpatialResolver({
  worldId: "ao-test",
  regions: [{ id: "houston-test", originLat: 29.76, originLon: -95.37, maxRadiusKm: 100 }]
});
const exterior = resolver.resolveGeographic({
  latitude: 29.7601, longitude: -95.3701, regionId: "houston-test",
  coordinateSource: "test-entrance"
});
const portal = createBuildingPortal({
  buildingId: "building-1", entranceId: "front-door", regionId: "houston-test",
  latitude: 29.7601, longitude: -95.3701,
  access: "Verified by admin", connectorState: "Confirmed by admin",
  interiorBinding: {
    floorId: "1", roomId: "entry-room", roomType: "Entrance hall",
    row: 2, col: 3, cellSizeM: 1, connectionState: "Confirmed by admin"
  },
  provenance: { source: "test-fixture", status: "admin-staging" }
});
function memoryRepository(initial = {}) {
  const state = { positions: { ...initial }, events: [], chunks: new Map() };
  const adapter = {
    async getChunk(id) { return state.chunks.get(id) || null; },
    async putChunk(chunk) { state.chunks.set(chunk.id, chunk); },
    async getEntityAddress(id) { return state.positions[id] || null; },
    async commitTransitionAtomic({ event, destinationAddress, expectedOriginAddressKey }) {
      const current = state.positions[event.entityId];
      if (!current || spatialAddressKey(current) !== expectedOriginAddressKey ||
          expectedOriginAddressKey !== event.originAddressKey) throw new Error("stale origin");
      if (state.events.some(e => e.id === event.id)) throw new Error("duplicate event");
      state.events.push(event);
      state.positions[event.entityId] = destinationAddress;
    }
  };
  return { state, repository: createSpatialRepository(adapter) };
}

test("validated portal resolves an exterior-to-interior address transition", () => {
  const event = resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1",
    currentAddress: exterior, occurredAt: "2026-11-21T00:00:00.000Z", transitionId: "event-enter-1"
  });
  assert.equal(event.kind, "enter");
  assert.equal(event.from.layer, "ground");
  assert.equal(event.to.layer, "interior");
  assert.equal(event.to.parentLocationId, "building-1");
  assert.equal(event.to.floorId, "1");
  assert.equal(event.to.roomId, "entry-room");
  assert.equal(event.metadata.authority, "houston-admin-staging-assertion");
  assert.equal(event.metadata.thresholdCell.row, 2);
});

test("exit transition returns through the same entrance and preserves portal linkage", () => {
  const enter = resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1", currentAddress: exterior
  });
  const exit = resolveBuildingPortalTransition({
    resolver, portal, direction: "exit", entityId: "actor-1", currentAddress: enter.to
  });
  assert.equal(exit.kind, "exit");
  assert.equal(spatialAddressKey(exit.to), spatialAddressKey(exterior));
  assert.equal(enter.to.exteriorAddressKey, spatialAddressKey(exterior));
  assert.equal(samePhysicalPlace(enter.to, exterior), true);
});

test("unverified connectors and non-entrance-hall bindings cannot create portals", () => {
  assert.throws(() => createBuildingPortal({
    buildingId: "b", entranceId: "e", regionId: "houston-test",
    latitude: 29.76, longitude: -95.37, access: "Verified by admin",
    connectorState: "Candidate — unverified",
    interiorBinding: { floorId: "1", roomId: "r", roomType: "Entrance hall", row: 0, col: 0, cellSizeM: 1, connectionState: "Confirmed by admin" }
  }), /connector is not admin-confirmed/);
  assert.throws(() => createBuildingPortal({
    buildingId: "b", entranceId: "e", regionId: "houston-test",
    latitude: 29.76, longitude: -95.37, access: "Verified by admin",
    connectorState: "Confirmed by admin",
    interiorBinding: { floorId: "1", roomId: "r", roomType: "Room", row: 0, col: 0, cellSizeM: 1, connectionState: "Confirmed by admin" }
  }), /Entrance hall/);
});

test("restricted portal requires declared permission and actor possession", () => {
  const restricted = createBuildingPortal({
    buildingId: "b", entranceId: "e", regionId: "houston-test",
    latitude: 29.7601, longitude: -95.3701, access: "Restricted access",
    connectorState: "Confirmed by admin",
    interiorBinding: {
      floorId: "1", roomId: "entry-room", roomType: "Entrance hall",
      row: 0, col: 0, cellSizeM: 1, connectionState: "Confirmed by admin",
      requiredPermissions: ["building:b:entry"]
    }
  });
  assert.throws(() => resolveBuildingPortalTransition({
    resolver, portal: restricted, direction: "enter", entityId: "actor-1", currentAddress: exterior
  }), /Missing portal permission/);
  assert.equal(resolveBuildingPortalTransition({
    resolver, portal: restricted, direction: "enter", entityId: "actor-1",
    currentAddress: exterior, permissions: ["building:b:entry"]
  }).kind, "enter");
});

test("portal rejects actors not at the correct side of the threshold", () => {
  const elsewhere = resolver.resolveGeographic({
    latitude: 29.761, longitude: -95.371, regionId: "houston-test"
  });
  assert.throws(() => resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1", currentAddress: elsewhere
  }), /not at the portal's exterior threshold/);
});

test("repository commits event and current address with expected-origin compare", async () => {
  const { state, repository } = memoryRepository({ "actor-1": exterior });
  const event = resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1",
    currentAddress: exterior, transitionId: "event-atomic-1"
  });
  await commitSpatialTransition({ repository, event });
  assert.equal(state.events.length, 1);
  assert.equal(spatialAddressKey(state.positions["actor-1"]), event.destinationAddressKey);
});

test("stale transition origin is rejected without appending or moving", async () => {
  const elsewhere = resolver.resolveGeographic({
    latitude: 29.761, longitude: -95.371, regionId: "houston-test"
  });
  const { state, repository } = memoryRepository({ "actor-1": elsewhere });
  const event = resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1", currentAddress: exterior,
    transitionId: "event-stale-1"
  });
  await assert.rejects(() => commitSpatialTransition({ repository, event }), /stale/);
  assert.equal(state.events.length, 0);
  assert.equal(spatialAddressKey(state.positions["actor-1"]), spatialAddressKey(elsewhere));
});

test("Kernel approval is mandatory before production repository commit", async () => {
  const { state, repository } = memoryRepository({ "actor-1": exterior });
  const event = resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1", currentAddress: exterior,
    transitionId: "event-kernel-1"
  });
  const rejected = await authorizeAndCommitSpatialTransition({
    kernel: { async authorizeSpatialTransition() { return { status: "rejected", reason: "door locked" }; } },
    repository, event
  });
  assert.equal(rejected.status, "rejected");
  assert.equal(state.events.length, 0);
  const accepted = await authorizeAndCommitSpatialTransition({
    kernel: { async authorizeSpatialTransition() { return { status: "approved", approvalId: "kernel-approval-9" }; } },
    repository, event
  });
  assert.equal(accepted.status, "committed");
  assert.equal(accepted.event.metadata.authority, "ao-kernel");
  assert.equal(accepted.event.metadata.kernelApprovalId, "kernel-approval-9");
  assert.equal(state.events.length, 1);
});

test("browser staging adapter persists event and position together in one storage value", async () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const adapter = createBrowserStagingSpatialAdapter(storage);
  const repository = createSpatialRepository(adapter);
  await adapter.seedEntityAddress("actor-1", exterior);
  const event = resolveBuildingPortalTransition({
    resolver, portal, direction: "enter", entityId: "actor-1",
    currentAddress: exterior, transitionId: "event-browser-1"
  });
  await commitSpatialTransition({ repository, event });
  const saved = JSON.parse(data.get("aoHoustonSpatialTransitionsV1"));
  assert.equal(saved.events.length, 1);
  assert.equal(spatialAddressKey(saved.positions["actor-1"]), event.destinationAddressKey);
  assert.equal(saved.baselines["actor-1"].layer, "ground");
});
