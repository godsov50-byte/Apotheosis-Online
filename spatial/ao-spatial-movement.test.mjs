import test from "node:test";
import assert from "node:assert/strict";
import {
  createNavigationGraph, planRoute, resolveMovementStep,
  advanceAoCalendarSeconds, MOVEMENT_SPEED_PROFILES_MPS,
  createMovementTransitionEvent
} from "./ao-spatial-movement.mjs";
import { createSpatialResolver, createSpatialRepository, spatialAddressKey } from "./ao-spatial-addressing.mjs";

function graph(edges = []) {
  return createNavigationGraph({
    nodes: [
      { id: "A", position: { x: 0, y: 0, z: 0 } },
      { id: "B", position: { x: 10, y: 0, z: 0 } },
      { id: "C", position: { x: 10, y: 0, z: 10 } },
      { id: "D", position: { x: 20, y: 0, z: 0 } }
    ],
    edges: edges.length ? edges : [
      { id: "AB", from: "A", to: "B", modes: ["walk"], routingApproved: true, status: "accepted_for_staging" },
      { id: "BD", from: "B", to: "D", modes: ["walk"], routingApproved: true, status: "accepted_for_staging" },
      { id: "AC", from: "A", to: "C", modes: ["walk"], routingApproved: true, status: "accepted_for_staging" },
      { id: "CD", from: "C", to: "D", modes: ["walk"], routingApproved: true, status: "accepted_for_staging" }
    ]
  });
}

test("candidate GIS geometry cannot silently become a route edge", () => {
  assert.throws(() => createNavigationGraph({
    nodes: [{ id: "A", position: { x: 0 } }, { id: "B", position: { x: 1 } }],
    edges: [{ id: "candidate", from: "A", to: "B", modes: ["walk"], routingApproved: false, status: "derived_candidate" }]
  }), /not explicitly approved/);
});

test("directed edges enforce one-way travel", () => {
  const g = graph();
  assert.equal(planRoute(g, { fromNodeId: "A", toNodeId: "D", mode: "walk" }).status, "ready");
  assert.equal(planRoute(g, { fromNodeId: "D", toNodeId: "A", mode: "walk" }).status, "unreachable");
});

test("route planner respects mode restrictions and actor capabilities", () => {
  const g = graph([
    { id: "AB", from: "A", to: "B", modes: ["walk"], routingApproved: true, status: "verified" },
    { id: "BD", from: "B", to: "D", modes: ["car"], routingApproved: true, status: "verified" }
  ]);
  assert.equal(planRoute(g, { fromNodeId: "A", toNodeId: "D", mode: "walk" }).status, "unreachable");
  assert.throws(() => planRoute(g, {
    fromNodeId: "A", toNodeId: "B", mode: "walk",
    actor: { capabilities: { movementModes: ["car"] } }
  }), /lacks movement capability/);
});

test("route planner honors permissions and computes travel time from edge speeds", () => {
  const g = graph([
    { id: "AB", from: "A", to: "B", modes: ["walk"], routingApproved: true, status: "verified", requiredPermissions: ["staff"] },
    { id: "BD", from: "B", to: "D", modes: ["walk"], routingApproved: true, status: "verified", speedLimitMps: 0.5 }
  ]);
  assert.equal(planRoute(g, { fromNodeId: "A", toNodeId: "D", mode: "walk" }).status, "unreachable");
  const route = planRoute(g, { fromNodeId: "A", toNodeId: "D", mode: "walk", actor: { permissions: ["staff"] } });
  assert.equal(route.distanceM, 20);
  assert.equal(route.estimatedSeconds, 10 / 1.2 + 10 / 0.5);
});

test("edge geometry must terminate at its directed graph nodes", () => {
  assert.throws(() => createNavigationGraph({
    nodes: [{ id: "A", position: { x: 0 } }, { id: "B", position: { x: 10 } }],
    edges: [{
      id: "misaligned", from: "A", to: "B",
      geometry: [{ x: 0 }, { x: 9 }],
      modes: ["walk"], routingApproved: true, status: "verified"
    }]
  }), /geometry endpoints must match/);
});

test("movement obeys an edge speed limit while traversing it", () => {
  const g = graph([
    { id: "AB", from: "A", to: "B", modes: ["walk"], routingApproved: true, status: "verified", speedLimitMps: 0.5 }
  ]);
  const route = planRoute(g, { fromNodeId: "A", toNodeId: "B", mode: "walk" });
  const step = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, mode: "walk" },
    route, elapsedSeconds: 2
  });
  assert.equal(step.distanceMovedM, 1);
  assert.equal(step.position.x, 1);
});

test("Dijkstra chooses faster valid path, not merely fewer edges", () => {
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "D", mode: "walk" });
  assert.deepEqual(route.edges.map(edge => edge.id), ["AB", "BD"]);
  assert.equal(route.distanceM, 20);
});

test("movement advances continuous positions without snapping to cell centres", () => {
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "B", mode: "walk" });
  const step = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, mode: "walk" },
    route, elapsedSeconds: 2
  });
  assert.equal(step.status, "moving");
  assert.ok(Math.abs(step.position.x - 2.4) < 1e-9);
  assert.equal(step.position.z, 0);
  assert.equal(step.distanceMovedM, 2.4);
});

test("movement crosses edge boundaries and arrives at destination", () => {
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "D", mode: "walk" });
  const step = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, mode: "walk" },
    route, elapsedSeconds: 20 / 1.2
  });
  assert.equal(step.status, "arrived");
  assert.equal(step.position.x, 20);
  assert.equal(step.remainingRouteEdges, 0);
});

test("collision sweep stops before static obstacles and other occupants", () => {
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "B", mode: "walk" });
  const obstacleStep = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, radiusM: 0.5, mode: "walk" },
    route, elapsedSeconds: 10,
    obstacles: [{ id: "wall", position: { x: 5, y: 0, z: 0 }, radiusM: 1 }]
  });
  assert.equal(obstacleStep.status, "blocked");
  assert.equal(obstacleStep.blocker.id, "wall");
  assert.ok(obstacleStep.position.x < 3.5 && obstacleStep.position.x > 3.49);
  const occupiedStep = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, radiusM: 0.5, mode: "walk" },
    route, elapsedSeconds: 10,
    occupants: [{ id: "p2", position: { x: 5, y: 0, z: 0 }, radiusM: 0.5 }]
  });
  assert.equal(occupiedStep.status, "blocked");
  assert.equal(occupiedStep.blocker.type, "occupant");
});

test("movement returns canonical address through an injected address resolver", () => {
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "B", mode: "walk" });
  const step = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, mode: "walk" },
    route, elapsedSeconds: 1,
    addressAtPosition: p => ({ cell: Math.floor(p.x), x: p.x })
  });
  assert.equal(step.spatialAddress.cell, 1);
  assert.equal(step.spatialAddress.x, 1.2);
});

test("movement resolves into canonical AO address and produces a commit-ready transition", async () => {
  const resolver = createSpatialResolver({
    worldId: "ao-movement-test",
    regions: [{
      id: "houston-test", originLat: 29.76, originLon: -95.37,
      bounds: { south: 29.5, north: 30.2, west: -96, east: -95 }
    }]
  });
  const fromAddress = resolver.resolveWorldPosition({ regionId: "houston-test", x: 0, y: 0, z: 0 });
  const g = createNavigationGraph({
    nodes: [
      { id: "street-start", position: { x: 0, y: 0, z: 0 } },
      { id: "street-end", position: { x: 10, y: 0, z: 0 } }
    ],
    edges: [{
      id: "verified-sidewalk-1", from: "street-start", to: "street-end",
      modes: ["walk"], routingApproved: true, status: "accepted_for_staging",
      kind: "sidewalk", addressContext: { layer: "ground", regionId: "houston-test" }
    }]
  });
  const route = planRoute(g, { fromNodeId: "street-start", toNodeId: "street-end", mode: "walk" });
  const step = resolveMovementStep({
    actor: { id: "traveler-1", position: { x: 0, y: 0, z: 0 }, mode: "walk" },
    route, elapsedSeconds: 1,
    addressAtPosition: (p, actor, plannedRoute, cursor) => {
      assert.equal(cursor.edge.kind, "sidewalk");
      return resolver.resolveWorldPosition({
        regionId: cursor.edge.addressContext.regionId, x: p.x, y: p.y, z: p.z
      });
    }
  });
  const event = createMovementTransitionEvent({
    resolver, entityId: "traveler-1", fromAddress, movementResult: step,
    occurredAt: "2026-11-21T18:00:00.000Z"
  });
  assert.equal(event.kind, "walk");
  assert.equal(event.from.worldId, "ao-movement-test");
  assert.equal(event.to.position.x, 1.2);
  assert.equal(event.originAddressKey, spatialAddressKey(fromAddress));
  assert.equal(event.destinationAddressKey, spatialAddressKey(step.spatialAddress));
  assert.equal(event.metadata.distanceMovedM, 1.2);

  const current = new Map(), chunks = new Map(), ledger = [];
  const repository = createSpatialRepository({
    async getChunk(id) { return chunks.get(id) || null; },
    async putChunk(chunk) { chunks.set(chunk.id, chunk); },
    async getEntityAddress(id) { return current.get(id) || null; },
    async commitTransitionAtomic({ event: committed, destinationAddress, destinationChunk }) {
      ledger.push(committed);
      current.set(committed.entityId, destinationAddress);
      chunks.set(destinationChunk.id, destinationChunk);
    }
  });
  await repository.commitTransition(event);
  assert.equal(ledger.length, 1);
  assert.equal((await repository.loadEntityAddress("traveler-1")).cellId, step.spatialAddress.cellId);
});

test("zero displacement cannot create a movement transition event", () => {
  const resolver = createSpatialResolver({
    worldId: "ao-movement-test",
    regions: [{ id: "r", originLat: 0, originLon: 0 }]
  });
  const address = resolver.resolveWorldPosition({ regionId: "r", x: 0, y: 0 });
  assert.throws(() => createMovementTransitionEvent({
    resolver, entityId: "traveler-1", fromAddress: address,
    movementResult: { mode: "walk", distanceMovedM: 0, spatialAddress: address }
  }), /positive resolved displacement/);
});

test("AO calendar runs at one third of elapsed real time, independently of movement", () => {
  assert.equal(advanceAoCalendarSeconds(3), 1);
  assert.equal(advanceAoCalendarSeconds(259200), 86400);
  assert.equal(MOVEMENT_SPEED_PROFILES_MPS.walk, 1.2);
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "B", mode: "walk" });
  const step = resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, mode: "walk" },
    route, elapsedSeconds: 3
  });
  assert.ok(Math.abs(step.distanceMovedM - 3.6) < 1e-9);
});

test("movement validates elapsed time and route cursor", () => {
  const route = planRoute(graph(), { fromNodeId: "A", toNodeId: "B", mode: "walk" });
  assert.throws(() => resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 } }, route, elapsedSeconds: -1
  }), /elapsedSeconds/);
  assert.throws(() => resolveMovementStep({
    actor: { id: "p1", position: { x: 0, y: 0, z: 0 }, edgeIndex: 9 }, route, elapsedSeconds: 1
  }), /edgeIndex/);
});
