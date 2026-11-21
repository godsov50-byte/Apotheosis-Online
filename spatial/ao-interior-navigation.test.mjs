import test from "node:test";
import assert from "node:assert/strict";
import {
  createInteriorNavigationGraph, planInteriorRoute, advanceInteriorRoute,
  resolveInteriorCellAddress, createInteriorTransitionEvent
} from "./ao-interior-navigation.mjs";
import { createSpatialResolver, spatialAddressKey } from "./ao-spatial-addressing.mjs";

function fixture({ doorAccess = "open", stairs = true } = {}) {
  const building = {
    id: "building-a", cellSize: 1, floorPlans: [
      { rows: 3, cols: 3, cells: {}, doors: [{
        id: "door-ab", cells: ["0:1"], fromRoomIds: ["room-a"],
        targetRoomId: "room-b", accessState: doorAccess,
        requiredPermissions: doorAccess === "restricted" ? ["room-b:enter"] : []
      }], stairs: stairs ? [{
        id: "stairs-1-2", roomId: "stair-1", toFloor: 2,
        cells: ["2:0"], targetRoomId: "stair-2", targetCells: ["2:0"],
        travelSeconds: 4, connectionState: "Confirmed by admin"
      }] : [] },
      { rows: 3, cols: 3, cells: {}, doors: [], stairs: [] }
    ],
    rooms: [
      { id: "room-a", floor: 1, type: "Room", cells: ["0:0", "0:1"] },
      { id: "room-b", floor: 1, type: "Room", cells: ["0:2", "1:2"] },
      { id: "stair-1", floor: 1, type: "Stairwell", cells: ["2:0"] },
      { id: "stair-2", floor: 2, type: "Stairwell", cells: ["2:0"] },
      { id: "upper-room", floor: 2, type: "Room", cells: ["2:1", "2:2"] }
    ]
  };
  return building;
}

test("same-room cells connect without a door and route is deterministic", () => {
  const graph = createInteriorNavigationGraph({ building: fixture() });
  const route = planInteriorRoute(graph, { fromNodeId: "1:0:0", toNodeId: "1:0:1" });
  assert.equal(route.status, "ready");
  assert.equal(route.steps.length, 1);
  assert.equal(route.steps[0].kind, "walk");
  assert.equal(route.estimatedSeconds, 1 / 1.2);
});

test("cross-room movement requires an explicit door record", () => {
  const building = fixture();
  building.floorPlans[0].doors = [];
  const graph = createInteriorNavigationGraph({ building });
  const route = planInteriorRoute(graph, { fromNodeId: "1:0:0", toNodeId: "1:1:2" });
  assert.equal(route.status, "unreachable");
});

test("explicit open door permits crossing between its two adjacent rooms", () => {
  const graph = createInteriorNavigationGraph({ building: fixture() });
  const route = planInteriorRoute(graph, { fromNodeId: "1:0:0", toNodeId: "1:1:2" });
  assert.equal(route.status, "ready");
  assert.ok(route.steps.some(step => step.connectionId === "door-ab"));
  assert.equal(route.steps.every(step => step.kind === "walk"), true);
});

test("locked doors are not routeable and restricted doors require permission", () => {
  const locked = createInteriorNavigationGraph({ building: fixture({ doorAccess: "locked" }) });
  assert.equal(planInteriorRoute(locked, { fromNodeId: "1:0:0", toNodeId: "1:1:2" }).status, "unreachable");
  const restricted = createInteriorNavigationGraph({ building: fixture({ doorAccess: "restricted" }) });
  assert.equal(planInteriorRoute(restricted, { fromNodeId: "1:0:0", toNodeId: "1:1:2" }).status, "unreachable");
  assert.equal(planInteriorRoute(restricted, {
    fromNodeId: "1:0:0", toNodeId: "1:1:2", permissions: ["room-b:enter"]
  }).status, "ready");
});

test("floor changes require reciprocal stairwell landings and explicit traversal time", () => {
  const graph = createInteriorNavigationGraph({ building: fixture() });
  const route = planInteriorRoute(graph, { fromNodeId: "1:2:0", toNodeId: "2:2:1" });
  assert.equal(route.status, "ready");
  assert.equal(route.steps[0].kind, "stairs");
  assert.equal(route.steps[0].travelSeconds, 4);
  const noStairs = createInteriorNavigationGraph({ building: fixture({ stairs: false }) });
  assert.equal(planInteriorRoute(noStairs, { fromNodeId: "1:2:0", toNodeId: "2:2:1" }).status, "unreachable");
});

test("stair landing cannot be inferred from a target floor without a matching stairwell cell", () => {
  const building = fixture();
  building.floorPlans[0].stairs[0].targetCells = ["1:1"];
  const graph = createInteriorNavigationGraph({ building });
  assert.equal(planInteriorRoute(graph, { fromNodeId: "1:2:0", toNodeId: "2:2:1" }).status, "unreachable");
});

test("route advancement completes discrete cell and stair steps using elapsed time", () => {
  const graph = createInteriorNavigationGraph({ building: fixture() });
  const route = planInteriorRoute(graph, { fromNodeId: "1:0:0", toNodeId: "2:2:1" });
  assert.equal(route.status, "ready");
  const first = advanceInteriorRoute({ route, elapsedSeconds: 0.5 });
  assert.equal(first.status, "moving");
  assert.equal(first.completedSteps.length, 0);
  const second = advanceInteriorRoute({
    route, elapsedSeconds: route.estimatedSeconds,
    stepIndex: first.stepIndex, stepProgressSeconds: first.stepProgressSeconds
  });
  assert.equal(second.status, "arrived");
  assert.equal(second.completedSteps.length, route.steps.length);
});

test("cell addresses preserve building/floor namespaces and produce immutable walk/stair events", () => {
  const resolver = createSpatialResolver({
    worldId: "ao-test",
    regions: [{ id: "houston-test", originLat: 29.76, originLon: -95.37, maxRadiusKm: 100 }]
  });
  const exterior = resolver.resolveGeographic({
    latitude: 29.76, longitude: -95.37, regionId: "houston-test"
  });
  const one = resolveInteriorCellAddress({
    resolver, buildingId: "building-a", regionId: "houston-test",
    exteriorAddress: exterior, floorId: "1", row: 0, col: 0,
    cellSizeM: 1, roomId: "room-a"
  });
  const two = resolveInteriorCellAddress({
    resolver, buildingId: "building-a", regionId: "houston-test",
    exteriorAddress: exterior, floorId: "2", row: 0, col: 0,
    cellSizeM: 1, roomId: "room-a"
  });
  assert.notEqual(spatialAddressKey(one), spatialAddressKey(two));
  const event = createInteriorTransitionEvent({
    resolver, entityId: "actor-1", fromAddress: one, toAddress: two,
    step: { kind: "stairs", connectionId: "stairs-1-2", travelSeconds: 4 }
  });
  assert.equal(event.kind, "stairs");
  assert.equal(event.metadata.estimatedStepSeconds, 4);
  assert.equal(Object.isFrozen(event), true);
});
