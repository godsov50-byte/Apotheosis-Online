/**
 * Adapter between the existing AO Chess board-token records and the
 * Layer 1–5 reference engine. The board supplies legal chess-motion cells;
 * the engine validates and commits the resulting action/event.
 *
 * This is a playtest bridge only. It does not connect to WorldHeart or
 * production Kernel persistence.
 */
import {
  createBattlefield,
  createEntity,
  placeEntity,
  commitAction,
  emitEvent,
  canOccupy,
  resolveAttack
} from "./ao-chess-engine.mjs";

const clone = value => structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const cellKey = p => `${p.x},${p.y},${p.z || 0}`;

function assertBoardUnit(unit, width, height) {
  if (!unit?.id || !["white", "black"].includes(unit.side)) throw new Error("board unit requires id and valid side");
  if (!Number.isInteger(unit.x) || !Number.isInteger(unit.y) || unit.x < 0 || unit.y < 0 || unit.x >= width || unit.y >= height) {
    throw new Error("board unit position is outside the battlefield");
  }
  if (!Number.isFinite(unit.hp) || !Number.isFinite(unit.maxHp) || unit.maxHp <= 0) throw new Error("board unit HP is invalid");
}

export function createBoardField(units, { width = 8, height = 8, turn = "white", round = 1 } = {}) {
  if (!Array.isArray(units)) throw new Error("board units must be an array");
  if (!["white", "black"].includes(turn)) throw new Error("invalid active side");
  const field = createBattlefield({ width, height, layers: 1 });
  let next = { ...field, activeSide: turn, round };
  const ids = new Set();
  for (const unit of units) {
    assertBoardUnit(unit, width, height);
    if (ids.has(unit.id)) throw new Error("duplicate board unit id: " + unit.id);
    ids.add(unit.id);
    const affinities = unit.affinity && !/unassigned|none assigned/i.test(unit.affinity) ? [unit.affinity] : [];
    const entity = createEntity({
      id: unit.id,
      name: unit.name,
      side: unit.side,
      class: unit.cls,
      tier: unit.tier,
      archetype: unit.archetype,
      position: { x: unit.x, y: unit.y, z: 0 },
      facing: unit.facing,
      hp: unit.hp,
      maxHp: unit.maxHp,
      ap: finite(unit.ap, 8),
      maxAp: finite(unit.apMax, 8),
      ea: finite(unit.ea, 8),
      maxEa: finite(unit.eaMax, 8),
      affinities,
      stats: { ATT: 0 },
      accuracy: finite(unit.atk),
      defense: {
        AC: finite(unit.ac, 10),
        DR: finite(unit.dr),
        resistance: clone(unit.resistance || {}),
        penetration: clone(unit.penetration || {})
      },
      sourceRef: unit.sourceRef || null
    });
    next = placeEntity(next, entity);
  }
  return next;
}

function beginBoardAction(field, actorId) {
  const actor = field.entities?.[actorId];
  if (!actor?.alive) return { ok: false, reason: "actor_unavailable" };
  if (field.activeSide && actor.side !== field.activeSide) return { ok: false, reason: "not_active_side" };
  // This legacy board permits multiple actions by a unit in one turn.
  // Clear only this actor's prior acted marker before each validated action.
  const acted = { ...(field.acted || {}) };
  delete acted[actorId];
  return { ok: true, field: { ...field, acted } };
}

function finishBoardAction(field, actorId) {
  const acted = { ...(field.acted || {}) };
  delete acted[actorId];
  return { ...field, acted };
}

export function resolveBoardMove(field, { actorId, to, legalCells, eventId } = {}) {
  const ready = beginBoardAction(field, actorId);
  if (!ready.ok) return ready;
  if (!to || !Number.isInteger(to.x) || !Number.isInteger(to.y)) return { ok: false, reason: "invalid_destination" };
  if (!Array.isArray(legalCells) || !legalCells.some(p => p.x === to.x && p.y === to.y)) {
    return { ok: false, reason: "illegal_chess_motion" };
  }
  const actor = ready.field.entities[actorId];
  const destination = { x: to.x, y: to.y, z: 0 };
  if (Object.values(ready.field.entities).some(e => e.alive && e.id !== actorId && cellKey(e.position) === cellKey(destination))) {
    return { ok: false, reason: "destination_occupied" };
  }
  const occupancy = canOccupy(ready.field, actor, destination);
  if (!occupancy.ok) return { ok: false, reason: occupancy.reason };
  const id = eventId || `board-move-${ready.field.version}-${actorId}`;
  const committed = commitAction(ready.field, {
    actorId, type: "board_move", apCost: 0, eaCost: 0, staminaCost: 0, eventId: id + ":commit"
  });
  if (committed.ok === false) return committed;
  const moved = { ...committed.entities[actorId], position: destination };
  const dx = to.x - actor.position.x, dy = to.y - actor.position.y;
  moved.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : dy ? (dy > 0 ? "S" : "N") : actor.facing;
  const cells = { ...committed.cells };
  for (const p of [{ ...actor.position }]) {
    const key = cellKey(p), cell = cells[key] || { entities: [] };
    cells[key] = { ...cell, entities: (cell.entities || []).filter(id => id !== actorId) };
  }
  const targetKey = cellKey(destination), targetCell = cells[targetKey] || { blocked: false, opaque: false, entities: [], terrain: "plain", cover: 0 };
  cells[targetKey] = { ...targetCell, entities: [...(targetCell.entities || []), actorId] };
  const movedField = {
    ...committed,
    cells,
    entities: { ...committed.entities, [actorId]: moved }
  };
  const resolved = emitEvent(movedField, {
    id, type: "board_move_resolved", actorId,
    from: clone(actor.position), to: destination, chessMotionValidated: true
  });
  return { ok: true, field: finishBoardAction(resolved, actorId), entity: clone(moved) };
}

export function resolveBoardAttack(field, {
  attackerId, defenderId, roll, damagePackets, eventId, chart = {}
} = {}) {
  const ready = beginBoardAction(field, attackerId);
  if (!ready.ok) return ready;
  const id = eventId || `board-attack-${ready.field.version}-${attackerId}-${defenderId}`;
  // Core attack validation, hit resolution, damage defenses and ledger event
  // are delegated to the shared engine resolver. Costs remain zero here to
  // preserve the current board prototype's free basic-attack rule.
  const resolved = resolveAttack(ready.field, {
    attackerId, defenderId, roll,
    apCost: 0, eaCost: 0, staminaCost: 0,
    damagePackets: damagePackets || [],
    eventId: id + ":commit",
    resolveEventId: id
  }, { roll, chart });
  if (resolved.ok === false) return resolved;
  let next = finishBoardAction(resolved.field, attackerId);
  const defender = next.entities[defenderId];
  if (defender && !defender.alive) {
    const cells = { ...next.cells };
    for (const [key, cell] of Object.entries(cells)) {
      if ((cell.entities || []).includes(defenderId)) cells[key] = { ...cell, entities: cell.entities.filter(x => x !== defenderId) };
    }
    next = { ...next, cells };
  }
  return { ...resolved, field: next, entity: clone(next.entities[attackerId]), defeated: !next.entities[defenderId]?.alive };
}
  const resolved = resolveAttack(ready.field, {
    attackerId, defenderId, roll,
    apCost: 0, eaCost: 0, staminaCost: 0,
    damagePackets: damagePackets || [],
    eventId: id + ":commit",
    resolveEventId: id
  }, { roll, chart });
  if (resolved.ok === false) return resolved;
  let next = finishBoardAction(resolved.field, attackerId);
  const defender = next.entities[defenderId];
  if (defender && !defender.alive) {
    const cells = { ...next.cells };
    for (const [key, cell] of Object.entries(cells)) {
      if ((cell.entities || []).includes(defenderId)) cells[key] = { ...cell, entities: cell.entities.filter(x => x !== defenderId) };
    }
    next = { ...next, cells };
  }
  return { ...resolved, field: next, entity: clone(next.entities[attackerId]), defeated: !next.entities[defenderId]?.alive };
}

export function endBoardTurn(field, nextSide) {
  if (!["white", "black"].includes(nextSide)) throw new Error("invalid next side");
  const round = field.activeSide === "black" && nextSide === "white" ? field.round + 1 : field.round;
  return { ...field, activeSide: nextSide, round, acted: {} };
}

export function projectBoardUnits(boardUnits, field, { includeDefeated = false } = {}) {
  return boardUnits.flatMap(unit => {
    const entity = field.entities[unit.id];
    if (!entity || (!includeDefeated && !entity.alive)) return [];
    return [{
      ...unit,
      x: entity.position.x,
      y: entity.position.y,
      facing: entity.facing,
      hp: entity.hp.current,
      ap: entity.ap.current,
      ea: entity.ea.current
    }];
  });
}
