/**
 * AO Chess Encounter Director — isolated prototype utilities.
 * This module orchestrates encounter state only. It never resolves combat,
 * edits HP, grants rewards, or creates entities without source references.
 */

export const ENCOUNTER_STATES = Object.freeze([
  "dormant", "candidate", "evaluating", "registered", "preparing",
  "active", "escalating", "paused", "suspended", "resolved",
  "failed", "terminated", "persisting"
]);

const transitions = Object.freeze({
  dormant: ["candidate", "terminated"],
  candidate: ["evaluating", "dormant", "terminated"],
  evaluating: ["registered", "dormant", "terminated"],
  registered: ["preparing", "terminated"],
  preparing: ["active", "paused", "terminated"],
  active: ["escalating", "paused", "suspended", "resolved", "failed", "terminated", "persisting"],
  escalating: ["active", "paused", "suspended", "resolved", "failed", "terminated", "persisting"],
  paused: ["active", "suspended", "terminated"],
  suspended: ["active", "terminated", "persisting"],
  resolved: ["persisting"],
  failed: ["persisting"],
  terminated: [],
  persisting: []
});

export const OBJECTIVE_STATES = Object.freeze([
  "hidden", "unknown", "available", "discovered", "active", "contested",
  "progressing", "paused", "completed", "failed", "destroyed", "expired"
]);

export const REINFORCEMENT_STATES = Object.freeze([
  "pending", "mobilizing", "traveling", "arrived", "deployed", "cancelled"
]);

const RESOLUTION_OUTCOMES = Object.freeze([
  "victory", "defeat", "partial_victory", "partial_defeat", "draw",
  "retreat", "escape", "surrender", "capture", "stalemate", "interrupted"
]);

function clone(value) {
  return structuredClone(value);
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

export function createEncounterRecord(input) {
  assertNonEmptyString(input?.id, "Encounter id");
  assertNonEmptyString(input?.source?.kind, "Encounter source kind");
  if (!ENCOUNTER_STATES.includes(input.state)) throw new TypeError("Invalid encounter state");
  if (!Array.isArray(input.composition?.participants)) throw new TypeError("participants must be an array");
  const ids = input.composition.participants.map((p) => p.entityId);
  if (ids.some((id) => typeof id !== "string" || !id.trim())) throw new TypeError("Participant entityId is required");
  if (new Set(ids).size !== ids.length) throw new Error("Participant entityIds must be unique");
  return {
    ...clone(input),
    history: input.history ?? { eventLedger: [], stateVersion: 0 }
  };
}

export function transitionEncounter(encounter, nextState, event) {
  if (!ENCOUNTER_STATES.includes(nextState)) throw new TypeError("Unknown encounter state");
  const allowed = transitions[encounter.state] ?? [];
  if (!allowed.includes(nextState)) {
    throw new Error(`Invalid encounter transition: ${encounter.state} -> ${nextState}`);
  }
  if (!event) throw new TypeError("transition event must include a deterministic id, type, and timestamp");
  const transitionEvent = event;
  if ((encounter.history?.eventLedger ?? []).some((existing) => existing.id === transitionEvent.id)) return encounter;
  return appendEncounterEvent({
    ...encounter,
    state: nextState
  }, transitionEvent);
}

export function appendEncounterEvent(encounter, event) {
  assertNonEmptyString(event?.id, "Event id");
  assertNonEmptyString(event?.type, "Event type");
  assertNonEmptyString(event?.timestamp, "Event timestamp");
  const ledger = encounter.history?.eventLedger ?? [];
  if (ledger.some((existing) => existing.id === event.id)) return encounter;
  return {
    ...encounter,
    history: {
      eventLedger: [...ledger, clone(event)],
      stateVersion: (encounter.history?.stateVersion ?? 0) + 1
    }
  };
}

/**
 * Validate deployment against a supplied grid snapshot and optional zone.
 * grid = {width,height,blockedCells:[{x,y,z?}],occupiedCells:[{x,y,z?}]}
 * Spawn validation is intentionally a check-only operation.
 */
export function validateDeployment(request, grid, zone = null) {
  const x = request?.position?.x;
  const y = request?.position?.y;
  const z = request?.position?.z ?? 0;
  const footprint = request?.footprint ?? { width: 1, height: 1 };
  const width = footprint.width ?? 1;
  const height = footprint.height ?? 1;
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) return { valid: false, reason: "invalid_coordinates" };
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) return { valid: false, reason: "invalid_footprint" };
  if (x < 0 || y < 0 || x + width > grid.width || y + height > grid.height) return { valid: false, reason: "out_of_bounds" };
  const cells = [];
  for (let dx = 0; dx < width; dx++) for (let dy = 0; dy < height; dy++) cells.push({ x: x + dx, y: y + dy, z });
  if (zone?.cells && !cells.every((cell) => zone.cells.some((zCell) => zCell.x === cell.x && zCell.y === cell.y && (zCell.z ?? 0) === cell.z))) {
    return { valid: false, reason: "outside_deployment_zone" };
  }
  const blocked = grid.blockedCells ?? [];
  const occupied = grid.occupiedCells ?? [];
  if (cells.some((cell) => blocked.some((b) => b.x === cell.x && b.y === cell.y && (b.z ?? 0) === cell.z))) return { valid: false, reason: "blocked_cell" };
  if (cells.some((cell) => occupied.some((o) => o.x === cell.x && o.y === cell.y && (o.z ?? 0) === cell.z))) return { valid: false, reason: "occupied_cell" };
  return { valid: true, cells };
}

/**
 * Schedule reinforcement entries only when their event trigger matches.
 * Each schedule entry is source-referenced; arrival is tick-based, not teleportation.
 */
export function scheduleReinforcements(encounter, event, currentTick, rules = []) {
  if (!Number.isInteger(currentTick) || currentTick < 0) throw new TypeError("currentTick must be a non-negative integer");
  const prior = encounter.reinforcement?.pending ?? [];
  const scheduledByRule = new Set(prior.map((entry) => entry.ruleId).filter(Boolean));
  const eventId = event?.id;
  const schedules = [];
  for (const rule of rules) {
    if (rule.eventType !== event?.type) continue;
    if (rule.once && scheduledByRule.has(rule.id)) continue;
    const delay = rule.travelTicks ?? 0;
    if (!Number.isInteger(delay) || delay < 0) throw new TypeError("travelTicks must be a non-negative integer");
    assertNonEmptyString(rule.sourceRef, "Reinforcement sourceRef");
    assertNonEmptyString(rule.id, "Reinforcement rule id");
    const id = `${rule.id}:${eventId ?? "event"}`;
    if (prior.some((entry) => entry.id === id)) continue;
    schedules.push({
      id, ruleId: rule.id, sourceRef: rule.sourceRef, trigger: { eventType: event.type, eventId },
      state: "pending", travelTicks: delay, arrivalTick: currentTick + delay,
      routeRef: rule.routeRef ?? null, entityRefs: clone(rule.entityRefs ?? []), deployment: clone(rule.deployment ?? {})
    });
  }
  if (!schedules.length) return encounter;
  return {
    ...encounter,
    reinforcement: { ...encounter.reinforcement, enabled: true, pending: [...prior, ...schedules] },
    history: { ...encounter.history, stateVersion: (encounter.history?.stateVersion ?? 0) + 1 }
  };
}

export function advanceReinforcements(encounter, currentTick, grid, deploymentZoneById = {}) {
  if (!Number.isInteger(currentTick) || currentTick < 0) throw new TypeError("currentTick must be a non-negative integer");
  const pending = encounter.reinforcement?.pending ?? [];
  const newlyArrived = [];
  const nextPending = pending.map((item) => {
    if (!["pending", "mobilizing", "traveling"].includes(item.state) || item.arrivalTick > currentTick) return item;
    newlyArrived.push(item);
    return { ...item, state: "arrived" };
  });
  const deploymentChecks = newlyArrived.map((item) => ({
    reinforcementId: item.id,
    entityRefs: item.entityRefs,
    result: item.entityRefs.map((entityId) => validateDeployment(
      { entityId, position: item.deployment?.position ?? item.position ?? { x: 0, y: 0, z: 0 }, footprint: item.deployment?.footprint },
      grid,
      deploymentZoneById[item.deployment?.zoneId] ?? null
    ))
  }));
  return {
    encounter: {
      ...encounter,
      reinforcement: { ...encounter.reinforcement, pending: nextPending },
      history: { ...encounter.history, stateVersion: (encounter.history?.stateVersion ?? 0) + (newlyArrived.length ? 1 : 0) }
    },
    arrived: newlyArrived,
    deploymentChecks
  };
}

export function updateObjectiveState(encounter, objectiveId, nextState, progress = undefined) {
  if (!OBJECTIVE_STATES.includes(nextState)) throw new TypeError("Invalid objective state");
  const buckets = ["primary", "secondary", "hidden"];
  let found = false;
  const objectives = { ...encounter.objectives };
  for (const bucket of buckets) {
    const list = objectives[bucket] ?? [];
    objectives[bucket] = list.map((objective) => {
      if (objective.id !== objectiveId) return objective;
      found = true;
      return { ...objective, state: nextState, ...(progress === undefined ? {} : { progress }) };
    });
  }
  if (!found) throw new Error(`Objective not found: ${objectiveId}`);
  return { ...encounter, objectives, history: { ...encounter.history, stateVersion: (encounter.history?.stateVersion ?? 0) + 1 } };
}

export function resolveEncounter(encounter, outcome, conditions = {}) {
  if (!RESOLUTION_OUTCOMES.includes(outcome)) throw new TypeError("Invalid encounter outcome");
  if (!["active", "escalating", "paused", "suspended"].includes(encounter.state)) throw new Error("Encounter cannot resolve from current state");
  assertNonEmptyString(conditions.resolvedAt, "resolution timestamp");
  const resolvedAt = conditions.resolvedAt;
  const result = {
    ...encounter,
    state: outcome === "victory" || outcome === "partial_victory" || outcome === "draw" || outcome === "retreat" || outcome === "escape" || outcome === "surrender" || outcome === "capture" || outcome === "stalemate" || outcome === "interrupted" ? "resolved" : "failed",
    resolution: { outcome, conditionsMet: conditions.met ?? [], conditionsFailed: conditions.failed ?? [], unresolved: conditions.unresolved ?? [], resolvedAt }
  };
  return appendEncounterEvent(result, {
    id: `resolution:${encounter.id}:${encounter.history?.stateVersion ?? 0}`,
    type: "encounter_resolved", timestamp: resolvedAt,
    payload: { outcome, conditionsMet: result.resolution.conditionsMet, conditionsFailed: result.resolution.conditionsFailed, unresolved: result.resolution.unresolved }
  });
}
