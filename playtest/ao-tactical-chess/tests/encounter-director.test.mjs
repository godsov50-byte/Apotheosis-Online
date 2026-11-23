import test from "node:test";
import assert from "node:assert/strict";
import {
  createEncounterRecord, transitionEncounter, appendEncounterEvent,
  validateDeployment, scheduleReinforcements, advanceReinforcements,
  updateObjectiveState, resolveEncounter
} from "../encounter-director.mjs";

const seed = () => createEncounterRecord({
  id: "enc-test",
  source: { kind: "fixture", originId: "origin-test" },
  state: "candidate",
  scale: "group",
  composition: { participants: [{ entityId: "envoy-a", sourceKind: "existing" }] },
  objectives: { primary: [{ id: "hold", type: "hold", state: "available" }], secondary: [], hidden: [] },
  environment: {},
  deployment: {},
  persistence: { continueWhenAbsent: false },
  history: { eventLedger: [], stateVersion: 0 }
});

test("record rejects duplicate participant IDs", () => {
  assert.throws(() => createEncounterRecord({
    id: "dup", source: { kind: "fixture" }, state: "candidate", scale: "group",
    composition: { participants: [{ entityId: "a" }, { entityId: "a" }] },
    objectives: {}, environment: {}, deployment: {}, persistence: {}, history: {}
  }), /unique/);
});

test("encounter state transitions enforce allowed edges", () => {
  const candidate = seed();
  const evaluating = transitionEncounter(candidate, "evaluating", { id: "e1", type: "begin_evaluation", timestamp: "2026-01-01T00:00:00Z" });
  assert.equal(evaluating.state, "evaluating");
  assert.throws(() => transitionEncounter(candidate, "active"), /Invalid encounter transition/);
});

test("event append is idempotent by event id", () => {
  const record = seed();
  const event = { id: "evt-1", type: "alarm", timestamp: "2026-01-01T00:00:00Z" };
  const first = appendEncounterEvent(record, event);
  const second = appendEncounterEvent(first, event);
  assert.equal(second.history.eventLedger.length, 1);
});

test("deployment rejects occupied and blocked cells, accepts clear cell", () => {
  const grid = { width: 8, height: 8, blockedCells: [{ x: 2, y: 2 }], occupiedCells: [{ x: 3, y: 3 }] };
  assert.equal(validateDeployment({ position: { x: 2, y: 2 } }, grid).reason, "blocked_cell");
  assert.equal(validateDeployment({ position: { x: 3, y: 3 } }, grid).reason, "occupied_cell");
  assert.equal(validateDeployment({ position: { x: 4, y: 4 } }, grid).valid, true);
  assert.equal(validateDeployment({ position: { x: 8, y: 0 } }, grid).reason, "out_of_bounds");
});

test("reinforcements wait for travel ticks and check deployment at arrival", () => {
  const record = seed();
  const scheduled = scheduleReinforcements(record, { id: "alarm-1", type: "alarm" }, 4, [
    { id: "guard-response", eventType: "alarm", sourceRef: "patrol-7", travelTicks: 3, entityRefs: ["guard-a"], deployment: { position: { x: 5, y: 5 } } }
  ]);
  const early = advanceReinforcements(scheduled, 6, { width: 8, height: 8, blockedCells: [], occupiedCells: [] });
  assert.equal(early.arrived.length, 0);
  const arrived = advanceReinforcements(scheduled, 7, { width: 8, height: 8, blockedCells: [], occupiedCells: [] });
  assert.equal(arrived.arrived.length, 1);
  assert.equal(arrived.deploymentChecks[0].result[0].valid, true);
});

test("objective state updates and encounter resolution are validated", () => {
  const record = seed();
  const updated = updateObjectiveState(record, "hold", "progressing", { value: 2, total: 5 });
  assert.equal(updated.objectives.primary[0].state, "progressing");
  assert.throws(() => updateObjectiveState(record, "missing", "active"), /not found/);
  const active = { ...record, state: "active" };
  const resolved = resolveEncounter(active, "victory", { met: ["hold"], resolvedAt: "2026-01-01T00:00:00Z" });
  assert.equal(resolved.state, "resolved");
  assert.equal(resolved.resolution.outcome, "victory");
  assert.throws(() => resolveEncounter(record, "victory"), /cannot resolve/);
});
