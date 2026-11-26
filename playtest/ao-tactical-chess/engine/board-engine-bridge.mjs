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
import {
  createTechniqueRegistry,
  resolveTechniqueIntent
} from "./technique-pipeline.mjs";
import { resolveEffectiveAttributes, resolveEffectiveDefense, resolveEffectBatch } from "./effect-pipeline.mjs";

const clone = value => structuredClone(value);
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const cellKey = p => `${p.x},${p.y},${p.z || 0}`;
const techniqueIdFor = name => "board-technique-" + String(name || "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function assertBoardUnit(unit, width, height) {
  if (!unit?.id || !["white", "black"].includes(unit.side)) throw new Error("board unit requires id and valid side");
  if (!Number.isInteger(unit.x) || !Number.isInteger(unit.y) || unit.x < 0 || unit.y < 0 || unit.x >= width || unit.y >= height) {
    throw new Error("board unit position is outside the battlefield");
  }
  const hpCurrent=Number.isFinite(unit.hp)?unit.hp:unit.hp?.current;
  const hpMaximum=Number.isFinite(unit.maxHp)?unit.maxHp:unit.hp?.max;
  if (!Number.isFinite(hpCurrent) || !Number.isFinite(hpMaximum) || hpMaximum <= 0) throw new Error("board unit HP is invalid");
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
    const affinity = unit.naturalAffinity || unit.affinity;
    const affinities = [...new Set([...(unit.ea?.affinities || unit.affinities || (affinity ? [affinity] : []))])]
      .filter(value=>typeof value==="string"&&!/unassigned|none assigned/i.test(value));
    const techniqueId = unit.techniqueId || (unit.technique ? techniqueIdFor(unit.technique) : null);
    const baseAttributes = clone(unit.baseAttributes || unit.stats || { ATT: 0 });
    const equipment = clone(unit.equipment || {});
    const maxTechniqueUses = finite(unit.maxTechniqueUses, 3);
    const currentTechniqueUses = finite(unit.uses, maxTechniqueUses);
    const entity = createEntity({
      id: unit.id,
      name: unit.name,
      side: unit.side,
      class: unit.cls || unit.class,
      tier: unit.characterTier ?? unit.tier,
      archetype: unit.archetype,
      position: { x: unit.x, y: unit.y, z: 0 },
      facing: unit.facing,
      hp: Number.isFinite(unit.hp)?unit.hp:unit.hp.current,
      maxHp: Number.isFinite(unit.maxHp)?unit.maxHp:unit.hp.max,
      ap: finite(unit.ap?.current ?? unit.ap, 8),
      maxAp: finite(unit.apMax ?? unit.ap?.max, 8),
      ea: finite(unit.ea?.current ?? unit.ea, 8),
      maxEa: finite(unit.eaMax ?? unit.ea?.max, 8),
      affinities,
      techniques: [...new Set([...(unit.techniques || []), ...(techniqueId ? [techniqueId] : [])])],
      stats: baseAttributes,
      skills: clone(unit.skills || {}),
      inventory: clone(unit.inventory || []),
      accuracy: finite(unit.atk),
      defense: {
        AC: finite(unit.ac ?? unit.defense?.AC, 10),
        DR: finite(unit.dr ?? unit.defense?.DR),
        armor: finite(unit.defense?.armor),
        resistance: clone(unit.resistance || unit.defense?.resistance || {}),
        penetration: clone(unit.penetration || unit.defense?.penetration || {})
      },
      sourceRef: unit.sourceRef || null
    });
    entity.boardMotion = unit.pattern;
    entity.baseAttributes = baseAttributes;
    entity.raceId = unit.raceId || unit.race || null;
    entity.raceName = unit.raceName || null;
    entity.lineageId = unit.lineageId || unit.originLineage?.race?.lineageId || null;
    entity.existence = clone(unit.existence || {});
    entity.originLineage = clone(unit.originLineage || {});
    entity.formNature = clone(unit.formNature || {});
    entity.speciesClassification = clone(unit.speciesClassification || {});
    entity.ancestryId = unit.ancestryId || null;
    entity.subAncestryId = unit.subAncestryId || null;
    entity.racialRarityId = unit.racialRarityId || null;
    entity.racialAttributeModifiers = clone(unit.racialAttributeModifiers || {});
    entity.rarityAttributeModifiers = clone(unit.rarityAttributeModifiers || {});
    entity.racialModifiers = clone(unit.racialModifiers || {});
    entity.raceModifiers = clone(unit.raceModifiers || {});
    entity.ancestryModifiers = clone(unit.ancestryModifiers || {});
    entity.subAncestryModifiers = clone(unit.subAncestryModifiers || {});
    entity.rarityModifiers = clone(unit.rarityModifiers || {});
    entity.racialEffects = clone(unit.racialEffects || []);
    entity.naturalAffinity = unit.naturalAffinity || unit.affinity || null;
    entity.traits = clone(unit.traits || []);
    entity.racialTechniques = clone(unit.racialTechniques || []);
    entity.equipment = equipment;
    entity.nature = unit.nature || null;
    entity.boardTechniqueId = techniqueId;
    entity.boardTechniqueName = unit.technique || unit.techniqueProfile?.name || null;
    entity.boardTechniqueTier = unit.techniqueTier ?? unit.techniqueProfile?.tier ?? null;
    entity.boardTechniqueProfile = clone(unit.techniqueProfile || null);
    entity.boardTechniqueCost = finite(unit.techniqueCost ?? unit.techniqueProfile?.cost?.ap, 2);
    entity.boardTechniqueEaCost = finite(unit.techniqueEaCost ?? unit.techniqueProfile?.cost?.ea, 3);
    entity.boardTechniqueUsesMax = finite(unit.maxTechniqueUses ?? unit.techniqueProfile?.uses, maxTechniqueUses);
    if (unit.baseAttributes || unit.stats) entity.stats = resolveEffectiveAttributes(entity);
    entity.baseDefense = { ...entity.defense, DR: finite(unit.dr, entity.defense.DR) };
    entity.defense = resolveEffectiveDefense(entity);
    entity.techniqueState = techniqueId ? {
      [techniqueId]: { used: Math.max(0, maxTechniqueUses - currentTechniqueUses), cooldownRemaining: 0 }
    } : {};
    next = placeEntity(next, entity);
    if(entity.racialEffects.length){
      const initialized=resolveEffectBatch(next,{sourceId:entity.id,targetId:entity.id,
        effects:entity.racialEffects,eventId:`racial-initialization:${entity.id}`,
        context:{raceId:entity.raceId,ancestryId:entity.ancestryId,subAncestryId:entity.subAncestryId,rarityId:entity.racialRarityId}});
      if(!initialized.ok)throw new Error("racial effect initialization failed: "+initialized.reason);
      next=initialized.field;
    }
  }
  return next;
}

export function isBoardMotionLegal(field, actor, destination) {
  const motion = actor.boardMotion;
  if (!["King", "Queen", "Rook", "Bishop", "Knight", "Pawn"].includes(motion)) return false;
  const x = actor.position.x, y = actor.position.y;
  const targetAt = (tx, ty) => Object.values(field.entities).find(e =>
    e.alive && e.id !== actor.id && e.position.x === tx && e.position.y === ty
  ) || null;
  const canLand = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= field.width || ty >= field.height) return false;
    return targetAt(tx, ty)?.side !== actor.side;
  };
  const rays = (directions) => {
    for (const [dx, dy] of directions) {
      for (let step = 1; step < Math.max(field.width, field.height); step++) {
        const tx = x + dx * step, ty = y + dy * step;
        if (tx < 0 || ty < 0 || tx >= field.width || ty >= field.height) break;
        const occupant = targetAt(tx, ty);
        const ownOccupant = Object.values(field.entities).some(e =>
          e.alive && e.id !== actor.id && e.side === actor.side && e.position.x === tx && e.position.y === ty
        );
        if (ownOccupant) break;
        if (occupant) { if (occupant.side !== actor.side) return destination.x === tx && destination.y === ty; break; }
        if (destination.x === tx && destination.y === ty) return true;
      }
    }
    return false;
  };
  const dx = destination.x - x, dy = destination.y - y;
  if (motion === "King") return Math.max(Math.abs(dx), Math.abs(dy)) === 1 && canLand(destination.x, destination.y);
  if (motion === "Knight") return Math.abs(dx) * Math.abs(dy) === 2 && canLand(destination.x, destination.y);
  if (motion === "Rook") return (dx === 0 || dy === 0) && (dx !== 0 || dy !== 0) && rays([[1,0],[-1,0],[0,1],[0,-1]]);
  if (motion === "Bishop") return Math.abs(dx) === Math.abs(dy) && dx !== 0 && rays([[1,1],[-1,1],[1,-1],[-1,-1]]);
  if (motion === "Queen") return ((dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && (dx !== 0 || dy !== 0)) &&
    rays([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]);
  if (motion === "Pawn") {
    const direction = actor.side === "white" ? -1 : 1;
    if (dx === 0 && dy === direction) return !targetAt(destination.x, destination.y);
    if (dx === 0 && dy === 2 * direction && y === (actor.side === "white" ? field.height - 2 : 1)) {
      return !targetAt(x, y + direction) && !targetAt(destination.x, destination.y);
    }
    if (Math.abs(dx) === 1 && dy === direction) return targetAt(destination.x, destination.y)?.side === (actor.side === "white" ? "black" : "white");
  }
  return false;
}

function beginBoardAction(field, actorId) {
  const actor = field.entities?.[actorId];
  if (!actor?.alive) return { ok: false, reason: "actor_unavailable" };
  if (field.activeSide && actor.side !== field.activeSide) return { ok: false, reason: "not_active_side" };
  // This legacy board permits multiple actions by a unit in one turn.
  // Clear only this actor's prior acted marker before each validated action.
  const acted = { ...(field.acted || {}) };
  delete acted[actorId];
  const entities = { ...field.entities, [actorId]: { ...actor } };
  delete entities[actorId].acted;
  return { ok: true, field: { ...field, entities, acted } };
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
  const actor = ready.field.entities[actorId];
  if (!isBoardMotionLegal(ready.field, actor, to)) return { ok: false, reason: "illegal_chess_motion" };
  if (Array.isArray(legalCells) && !legalCells.some(p => p.x === to.x && p.y === to.y)) {
    return { ok: false, reason: "ui_candidate_mismatch" };
  }
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
  attackerId, defenderId, roll, damagePackets, eventId, chart = {}, knockback = false, attackBonus = 0, breakAmount = 0, captureAdvance = true
} = {}) {
  const ready = beginBoardAction(field, attackerId);
  if (!ready.ok) return ready;
  const attacker = ready.field.entities[attackerId];
  const defenderBefore = ready.field.entities[defenderId];
  if (!defenderBefore?.alive || defenderBefore.side === attacker.side) return { ok: false, reason: "invalid_target" };
  if (!isBoardMotionLegal(ready.field, attacker, defenderBefore.position)) return { ok: false, reason: "illegal_attack_geometry" };
  if (!Number.isInteger(roll) || roll < 1 || roll > 20) return { ok: false, reason: "invalid_attack_roll" };
  if (!Array.isArray(damagePackets) || damagePackets.length === 0) return { ok: false, reason: "damage_packets_required" };
  const id = eventId || `board-attack-${ready.field.version}-${attackerId}-${defenderId}`;
  // Basic attacks preserve the prototype's free AP/EA rule while delegating
  // hit, defense, damage and combat-ledger resolution to the shared engine.
  const attackActor = attackBonus ? { ...attacker, accuracy: finite(attacker.accuracy) + finite(attackBonus) } : attacker;
  const attackField = attackBonus ? { ...ready.field, entities: { ...ready.field.entities, [attackerId]: attackActor } } : ready.field;
  const resolved = resolveAttack(attackField, {
    attackerId, defenderId, roll,
    apCost: 0, eaCost: 0, staminaCost: 0,
    damagePackets,
    eventId: id + ":commit",
    resolveEventId: id
  }, { roll, chart });
  if (resolved.ok === false) return resolved;
  let next = resolved.field;
  const attackerNow = { ...next.entities[attackerId], accuracy: attacker.accuracy };
  const defenderNow = { ...next.entities[defenderId] };
  if (breakAmount > 0) defenderNow.defense = { ...(defenderNow.defense || {}), break: finite(defenderNow.defense?.break) + breakAmount };
  next = { ...next, entities: { ...next.entities, [defenderId]: defenderNow } };
  const targetPosition = { ...defenderBefore.position };
  const dx = targetPosition.x - attacker.position.x, dy = targetPosition.y - attacker.position.y;
  attackerNow.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : dy ? (dy > 0 ? "S" : "N") : attacker.facing;
  let cells = { ...next.cells };
  let positionEffect = "held";
  if (!defenderNow.alive) {
    for (const [key, cell] of Object.entries(cells)) {
      if ((cell.entities || []).includes(defenderId)) cells[key] = { ...cell, entities: cell.entities.filter(x => x !== defenderId) };
    }
    if (captureAdvance) {
    const oldKey = cellKey(attackerNow.position), oldCell = cells[oldKey] || { entities: [] };
    cells[oldKey] = { ...oldCell, entities: (oldCell.entities || []).filter(x => x !== attackerId) };
    const targetKey = cellKey(targetPosition), targetCell = cells[targetKey] || { blocked: false, opaque: false, entities: [], terrain: "plain", cover: 0 };
    cells[targetKey] = { ...targetCell, entities: [...(targetCell.entities || []).filter(x => x !== defenderId), attackerId] };
    attackerNow.position = targetPosition;
    positionEffect = "capture_advance";
    }
  } else if (resolved.hit && knockback) {
    const push = { x: targetPosition.x + Math.sign(dx), y: targetPosition.y + Math.sign(dy), z: targetPosition.z || 0 };
    const occupied = Object.values(next.entities).some(e => e.alive && e.id !== defenderId && e.position.x === push.x && e.position.y === push.y);
    if (push.x >= 0 && push.y >= 0 && push.x < next.width && push.y < next.height && !occupied && canOccupy(next, defenderNow, push).ok) {
      const oldKey = cellKey(defenderNow.position), oldCell = cells[oldKey] || { entities: [] };
      cells[oldKey] = { ...oldCell, entities: (oldCell.entities || []).filter(x => x !== defenderId) };
      const pushKey = cellKey(push), pushCell = cells[pushKey] || { blocked: false, opaque: false, entities: [], terrain: "plain", cover: 0 };
      cells[pushKey] = { ...pushCell, entities: [...(pushCell.entities || []), defenderId] };
      next = { ...next, entities: { ...next.entities, [defenderId]: { ...defenderNow, position: push } } };
      positionEffect = "knockback";
    }
  }
  next = {
    ...next,
    cells,
    entities: { ...next.entities, [attackerId]: attackerNow }
  };
  if (positionEffect !== "held") {
    next = emitEvent(next, {
      id: id + ":position",
      type: positionEffect === "capture_advance" ? "board_capture_advance" : "board_knockback_resolved",
      attackerId, defenderId, position: positionEffect === "capture_advance" ? targetPosition : next.entities[defenderId].position
    });
  }
  next = finishBoardAction(next, attackerId);
  return {
    ...resolved,
    field: next,
    entity: clone(next.entities[attackerId]),
    defeated: !next.entities[defenderId]?.alive,
    positionEffect
  };
}

export function resolveBoardTechnique(field, {
  actorId, defenderId, roll, damagePackets, eventId, chart = {},
  knockback = false, attackBonus = 2, captureAdvance = true
} = {}) {
  const ready = beginBoardAction(field, actorId);
  if (!ready.ok) return ready;
  const actor = ready.field.entities[actorId], defender = ready.field.entities[defenderId];
  if (!actor?.boardTechniqueId) return { ok: false, reason: "technique_not_configured" };
  if (!defender?.alive || defender.side === actor.side) return { ok: false, reason: "invalid_target" };
  if (!isBoardMotionLegal(ready.field, actor, defender.position)) return { ok: false, reason: "illegal_attack_geometry" };
  const techniqueId = actor.boardTechniqueId;
  const profile = actor.boardTechniqueProfile || {};
  const registry = createTechniqueRegistry([{
    ...profile,
    id: techniqueId,
    name: actor.boardTechniqueName,
    tier: actor.boardTechniqueTier,
    classRequirements: profile.classRequirements || (actor.class ? [actor.class] : []),
    target: profile.target || { type: "enemy" },
    geometry: profile.geometry || { kind: "range", minRange: 1, range: 1 },
    chessMotion: profile.chessMotion || actor.boardMotion,
    cost: profile.cost || { ap: actor.boardTechniqueCost, ea: actor.boardTechniqueEaCost },
    uses: profile.uses ?? actor.boardTechniqueUsesMax,
    cooldown: profile.cooldown ?? 0,
    effects: []
  }]);
  const learning = resolveTechniqueIntent(ready.field, {
    actorId, techniqueId, target: { entityId: defenderId }
  }, registry);
  if (!learning.ok) return learning;
  const configuredDamage = damagePackets || (profile.effects || []).filter(effect=>effect.type==="damage").flatMap(effect=>effect.packets || [{type:effect.damageType||"physical",amount:effect.amount,penetration:effect.penetration,trueDamage:effect.trueDamage}]);
  const attack = resolveBoardAttack(learning.field, {
    attackerId: actorId,
    defenderId,
    roll,
    damagePackets: configuredDamage,
    eventId: eventId ? eventId + ":attack" : undefined,
    chart,
    knockback,
    attackBonus,
    captureAdvance,
    breakAmount: (profile.effects || []).filter(effect=>effect.type==="damage").reduce((sum,effect)=>sum+finite(effect.break),0)
  });
  if (!attack.ok) return { ...attack, field };
  const secondaryEffects = (profile.effects || []).filter(effect=>effect.type!=="damage");
  let resolvedAttack = attack;
  if (attack.hit && secondaryEffects.length) {
    const applied = resolveEffectBatch(attack.field, {
      sourceId: actorId, targetId: defenderId,
      effects: secondaryEffects,
      eventId: (eventId || ("board-technique-" + techniqueId + "-" + field.version)) + ":effects",
      context: { techniqueId }
    });
    if (!applied.ok) return { ...applied, field };
    resolvedAttack = { ...attack, field: applied.field, effectOutcomes: applied.outcomes };
  }
  return {
    ...resolvedAttack,
    techniqueId,
    techniqueName: actor.boardTechniqueName,
    techniqueCosts: { ap: actor.boardTechniqueCost, ea: actor.boardTechniqueEaCost },
    field: resolvedAttack.field
  };
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
      maxHp: entity.hp.max,
      ap: entity.ap.current,
      ea: entity.ea.current,
      stats: resolveEffectiveAttributes(entity),
      defense: resolveEffectiveDefense(entity),
      skills: clone(entity.skills),
      equipment: clone(entity.equipment),
      raceId: entity.raceId,
      raceName: entity.raceName,
      lineageId:entity.lineageId,
      existence:clone(entity.existence||{}),
      originLineage:clone(entity.originLineage||{}),
      formNature:clone(entity.formNature||{}),
      speciesClassification:clone(entity.speciesClassification||{}),
      ancestryId:entity.ancestryId,
      subAncestryId:entity.subAncestryId,
      racialRarityId: entity.racialRarityId,
      traits: clone(entity.traits || []),
      racialTechniques: clone(entity.racialTechniques || []),
      racialModifiers: clone(entity.racialModifiers || {}),
      rarityModifiers: clone(entity.rarityModifiers || {}),
      naturalAffinity: entity.naturalAffinity,
      uses: entity.boardTechniqueId
        ? Math.max(0, entity.boardTechniqueUsesMax - finite(entity.techniqueState?.[entity.boardTechniqueId]?.used))
        : unit.uses
    }];
  });
}
