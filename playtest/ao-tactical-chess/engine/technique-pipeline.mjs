/**
 * AO Chess technique pipeline.
 * Data-driven playtest implementation. No technique values or palettes are canonized here.
 * Intent is validated before costs are committed; effects resolve against a cloned field.
 */
const clone = value => structuredClone(value);
const num = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const key = p => `${p.x},${p.y},${p.z || 0}`;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
import { skillProgress, createSkillRegistry } from "./skill-pipeline.mjs";
const skillRegistry = createSkillRegistry();

export const CHESS_MOTIONS = Object.freeze(["King", "Queen", "Rook", "Bishop", "Knight", "Pawn"]);

export function createTechnique(definition) {
  if (!definition?.id || !definition?.name) throw new Error("technique id and name required");
  const technique = {
    id: definition.id,
    name: definition.name,
    tier: definition.tier ?? null,
    category: definition.category || "general",
    classRequirements: [...(definition.classRequirements || [])],
    archetypeRequirements: [...(definition.archetypeRequirements || [])],
    affinityRequirements: [...(definition.affinityRequirements || [])],
    raceRequirements: [...(definition.raceRequirements || [])],
    traitRequirements: [...(definition.traitRequirements || [])],
    requiredAttributes: clone(definition.requiredAttributes || {}),
    requiredSkills: clone(definition.requiredSkills || []),
    target: { type: "enemy", ...(definition.target || {}) },
    geometry: { kind: "range", range: 1, minRange: 0, ...(definition.geometry || {}) },
    chessMotion: definition.chessMotion || null,
    cost: { ap: 0, ea: 0, ...(definition.cost || {}) },
    uses: definition.uses ?? null,
    cooldown: definition.cooldown ?? 0,
    effects: clone(definition.effects || []),
    tags: [...(definition.tags || [])],
    prerequisites: [...(definition.prerequisites || [])],
    presentation: clone(definition.presentation || {})
  };
  if (technique.chessMotion && !CHESS_MOTIONS.includes(technique.chessMotion)) throw new Error("unknown chess motion");
  for (const pool of ["ap", "ea"]) if (num(technique.cost[pool], -1) < 0) throw new Error("technique costs cannot be negative");
  return technique;
}

export function createTechniqueRegistry(definitions = []) {
  const records = {};
  for (const definition of definitions) {
    const technique = createTechnique(definition);
    if (records[technique.id]) throw new Error("duplicate technique id: " + technique.id);
    records[technique.id] = technique;
  }
  return records;
}

export function assignTechniqueLoadout(entity, { offensive = entity.offensiveTechniqueId || null, slots = entity.techniqueSlots || [] } = {}) {
  const learned = new Set(entity.techniques || []);
  if (offensive && !learned.has(offensive)) throw new Error("offensive technique must be learned");
  if (slots.some(id => !learned.has(id))) throw new Error("all assigned technique slots must be learned");
  return { ...clone(entity), offensiveTechniqueId: offensive, techniqueSlots: [...slots] };
}

export function chessMotionCells(origin, motion, maxRange, { side = "white", occupied = () => false, includeOccupied = true } = {}) {
  if (!CHESS_MOTIONS.includes(motion)) throw new Error("unknown chess motion");
  const cells = [], add = (x, y, stop = false) => {
    if (x < 0 || y < 0) return false;
    const blocked = occupied({ x, y, z: origin.z || 0 });
    if (!blocked || includeOccupied) cells.push({ x, y, z: origin.z || 0 });
    return blocked && stop;
  };
  const ray = (dx, dy, limit = maxRange) => {
    for (let step = 1; step <= limit; step++) {
      const x = origin.x + dx * step, y = origin.y + dy * step;
      if (x < 0 || y < 0) break;
      const blocked = occupied({ x, y, z: origin.z || 0 });
      add(x, y);
      if (blocked) break;
    }
  };
  if (motion === "King") {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (dx || dy) {
      const x = origin.x + dx, y = origin.y + dy;
      if (x >= 0 && y >= 0 && Math.max(Math.abs(dx), Math.abs(dy)) <= maxRange) add(x, y);
    }
  } else if (motion === "Knight") {
    for (const [dx, dy] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) <= maxRange) add(origin.x + dx, origin.y + dy);
    }
  } else if (motion === "Rook" || motion === "Queen") {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => ray(dx,dy));
  }
  if (motion === "Bishop" || motion === "Queen") {
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([dx,dy]) => ray(dx,dy));
  }
  if (motion === "Pawn") {
    const dy = side === "black" ? 1 : -1;
    if (maxRange >= 1) add(origin.x, origin.y + dy);
    if (maxRange >= 2) add(origin.x, origin.y + 2 * dy);
    for (const dx of [-1, 1]) if (maxRange >= 1) add(origin.x + dx, origin.y + dy);
  }
  return cells;
}

function entityAt(field, position) {
  const ids = field.cells?.[key(position)]?.entities || [];
  return ids.map(id => field.entities?.[id]).find(entity => entity?.alive !== false) ||
    Object.values(field.entities || {}).find(entity => entity?.alive !== false && key(entity.position) === key(position)) || null;
}
function distance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs((a.z || 0) - (b.z || 0)));
}
function hasLineOfSight(field, from, to) {
  const dx = to.x - from.x, dy = to.y - from.y, steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 1; i < steps; i++) {
    const p = { x: Math.round(from.x + dx * i / steps), y: Math.round(from.y + dy * i / steps), z: from.z || 0 };
    const cell = field.cells?.[key(p)];
    if (cell?.blocked || cell?.opaque) return false;
  }
  return true;
}
function fail(reason, details = {}) { return { ok: false, reason, ...details }; }

export function validateTechniqueIntent(field, intent, registry, { requireOffensiveSlot = false } = {}) {
  if (!intent?.actorId || !intent?.techniqueId || !intent?.target) return fail("incomplete_intent");
  const actor = field.entities?.[intent.actorId], technique = registry?.[intent.techniqueId];
  if (!actor || actor.alive === false) return fail("actor_unavailable");
  if (field.activeSide && actor.side !== field.activeSide) return fail("not_active_side");
  if (!technique) return fail("unknown_technique");
  if (!(actor.techniques || []).includes(technique.id)) return fail("technique_not_learned");
  if (requireOffensiveSlot && actor.offensiveTechniqueId !== technique.id) return fail("not_equipped_as_offensive");
  if (actor.acted || field.acted?.[actor.id]) return fail("already_acted");
  if (actor.statuses?.some(s => s.blocksAll || s.blocks?.includes("technique"))) return fail("technique_blocked_by_status");
  if (technique.classRequirements.length && !technique.classRequirements.includes(actor.class)) return fail("class_requirement");
  if (technique.archetypeRequirements.length && !technique.archetypeRequirements.includes(actor.archetype)) return fail("archetype_requirement");
  if (technique.affinityRequirements.length && !technique.affinityRequirements.some(a => (actor.ea?.affinities || actor.affinities || []).includes(a))) return fail("affinity_requirement");
  if (technique.raceRequirements.length && !technique.raceRequirements.includes(actor.raceId || actor.race)) return fail("race_requirement");
  if (technique.traitRequirements.some(id => !(actor.traits || []).includes(id))) return fail("trait_requirement");
  for (const [stat, minimum] of Object.entries(technique.requiredAttributes)) {
    if (!Number.isFinite(minimum) || !Number.isFinite(actor.stats?.[stat]) || actor.stats[stat] < minimum) return fail("attribute_requirement", { stat, minimum });
  }
  for (const requirement of technique.requiredSkills) {
    const skillId = requirement.id || requirement.skillId;
    const progress = skillProgress(actor, skillId, skillRegistry);
    const minimum = num(requirement.level, 1);
    if (!progress.ok || progress.effectiveLevel < minimum) return fail("skill_requirement", { skillId, minimum, actual: progress.effectiveLevel ?? 0 });
  }
  if (technique.prerequisites.some(id => !(actor.techniques || []).includes(id))) return fail("prerequisite_missing");
  const usage = actor.techniqueState?.[technique.id] || {};
  if (technique.uses != null && num(usage.used) >= technique.uses) return fail("uses_exhausted");
  if (num(usage.cooldownRemaining) > 0) return fail("cooldown_active");
  for (const [pool, cost] of [["ap", technique.cost.ap], ["ea", technique.cost.ea]]) {
    const state = actor[pool];
    if (!state || num(state.current) - num(state.reserved) < cost) return fail("insufficient_" + pool.toUpperCase());
  }
  const target = intent.target.entityId ? field.entities?.[intent.target.entityId] : intent.target.position ? entityAt(field, intent.target.position) : null;
  const targetType = technique.target.type;
  if (targetType === "self" && intent.target.entityId !== actor.id) return fail("target_must_be_self");
  if (["enemy", "ally", "entity"].includes(targetType) && (!target || target.alive === false)) return fail("target_missing");
  if (target && targetType === "enemy" && target.side === actor.side) return fail("target_must_be_enemy");
  if (target && targetType === "ally" && target.side !== actor.side) return fail("target_must_be_ally");
  const position = target?.position || intent.target.position;
  if (technique.geometry.kind !== "global") {
    if (!position) return fail("target_position_missing");
    const range = distance(actor.position, position);
    if (range < num(technique.geometry.minRange) || range > num(technique.geometry.range, 1)) return fail("target_out_of_range", { range });
    if (technique.geometry.lineOfSight && !hasLineOfSight(field, actor.position, position)) return fail("line_of_sight_blocked");
    if (technique.chessMotion) {
      const legal = chessMotionCells(actor.position, technique.chessMotion, num(technique.geometry.range, 1), {
        side: actor.side, occupied: p => !!entityAt(field, p), includeOccupied: true
      });
      if (!legal.some(p => key(p) === key(position))) return fail("invalid_chess_motion_target");
    }
  }
  return { ok: true, actor: clone(actor), target: target ? clone(target) : null, technique: clone(technique), targetPosition: position ? clone(position) : null };
}

function affinityMultiplier(affinity, targetAffinities = [], chart = {}) {
  if (!affinity) return 1;
  const rule = chart[affinity] || {};
  if (targetAffinities.some(value => (rule.strong || []).includes(value))) return num(rule.multiplier, 1.5);
  if (targetAffinities.some(value => (rule.weak || []).includes(value))) return num(rule.weakMultiplier, 0.75);
  return 1;
}
function damagePacket(target, packet, affinityChart = {}) {
  const type = packet.type || "physical";
  const trueDamage = packet.trueDamage === true || type === "true";
  if (trueDamage) return Math.max(0, num(packet.amount));
  const penetration = Math.max(0, num(packet.penetration));
  const armor = Math.max(0, num(target.defense?.armor) - penetration);
  const dr = Math.max(0, num(target.defense?.DR) - penetration);
  const afterArmor = Math.max(0, num(packet.amount) - armor);
  const afterDR = Math.max(0, afterArmor - dr);
  const resistance = clamp(num(target.defense?.resistance?.[type]), -1, 1);
  const affinity = affinityMultiplier(packet.affinity, target.ea?.affinities || target.affinities || [], affinityChart);
  return Math.max(0, afterDR * (1 - resistance) * affinity);
}
function addEvent(field, event) {
  const ledger = [...(field.ledger || []), { id: event.id || `tech_${(field.ledger || []).length + 1}`, ...clone(event) }];
  return { ...field, ledger, version: num(field.version) + 1 };
}

/** Resolves only an already validated intent. A failed phase returns the original field unchanged. */
export function resolveTechniqueIntent(field, intent, registry, options = {}) {
  const validation = validateTechniqueIntent(field, intent, registry, options);
  if (!validation.ok) return { ...validation, field };
  const { actor: originalActor, target: originalTarget, technique, targetPosition } = validation;
  let next = clone(field), actor = next.entities[originalActor.id];
  const costs = technique.cost;
  actor.ap.current -= costs.ap;
  actor.ea.current -= costs.ea;
  const state = { ...(actor.techniqueState || {}) }, prior = state[technique.id] || { used: 0, cooldownRemaining: 0 };
  state[technique.id] = { used: num(prior.used) + 1, cooldownRemaining: technique.cooldown };
  actor.techniqueState = state;
  actor.acted = true;
  next.entities[actor.id] = actor;
  const affected = [], outcomes = [];
  const targetEntity = originalTarget ? next.entities[originalTarget.id] : null;
  for (const effect of technique.effects) {
    if (effect.type === "damage") {
      if (!targetEntity) continue;
      const packets = effect.packets || [{ type: effect.damageType || "physical", amount: effect.amount || 0, penetration: effect.penetration, trueDamage: effect.trueDamage }];
      const amount = Math.round(packets.reduce((sum, packet) => sum + damagePacket(targetEntity, packet, options.affinityChart || {}), 0));
      targetEntity.hp.current = Math.max(0, num(targetEntity.hp?.current) - amount);
      if (effect.break != null) targetEntity.defense = { ...(targetEntity.defense || {}), break: num(targetEntity.defense?.break) + num(effect.break) };
      if (targetEntity.hp.current <= 0) targetEntity.alive = false;
      affected.push(targetEntity.id); outcomes.push({ type: "damage", targetId: targetEntity.id, amount, break: num(effect.break) });
    } else if (effect.type === "heal") {
      const recipient = effect.target === "self" ? actor : targetEntity;
      if (!recipient?.hp) continue;
      const amount = Math.max(0, num(effect.amount));
      recipient.hp.current = Math.min(num(recipient.hp.max, recipient.hp.current), recipient.hp.current + amount);
      affected.push(recipient.id); outcomes.push({ type: "heal", targetId: recipient.id, amount });
    } else if (effect.type === "status" && targetEntity) {
      const status = clone(effect.status);
      if (!status?.id) return fail("invalid_status_effect", { field });
      const statuses = [...(targetEntity.statuses || [])], index = statuses.findIndex(s => s.id === status.id);
      if (index < 0) statuses.push(status);
      else if (status.stackRule === "refresh") statuses[index] = { ...statuses[index], duration: Math.max(num(statuses[index].duration), num(status.duration)) };
      else if (status.stackRule === "stack") statuses[index] = { ...statuses[index], stacks: num(statuses[index].stacks, 1) + num(status.stacks, 1) };
      targetEntity.statuses = statuses; affected.push(targetEntity.id); outcomes.push({ type: "status", targetId: targetEntity.id, statusId: status.id });
    } else if (effect.type === "resource") {
      const recipient = effect.target === "self" ? actor : targetEntity;
      const pool = recipient?.[effect.pool];
      if (!pool) continue;
      const amount = num(effect.amount);
      pool.current = clamp(pool.current + amount, 0, num(pool.max, pool.current + amount));
      affected.push(recipient.id); outcomes.push({ type: "resource", targetId: recipient.id, pool: effect.pool, amount });
    } else if (effect.type === "displace" && targetEntity && effect.to) {
      const to = clone(effect.to);
      const occupant = Object.values(next.entities).find(e => e.id !== targetEntity.id && e.alive !== false && key(e.position) === key(to));
      const cell = next.cells?.[key(to)];
      if (occupant || cell?.blocked || to.x < 0 || to.y < 0 || to.x >= next.width || to.y >= next.height) { outcomes.push({ type: "displace", targetId: targetEntity.id, applied: false }); continue; }
      targetEntity.position = to; affected.push(targetEntity.id); outcomes.push({ type: "displace", targetId: targetEntity.id, to, applied: true });
    } else if (effect.type === "summon") {
      const entity = clone(effect.entity || {});
      if (!entity.id || next.entities[entity.id]) return fail("invalid_summon_entity", { field });
      entity.position = clone(effect.position || targetPosition || actor.position);
      if (entity.side == null) entity.side = actor.side;
      entity.alive = entity.alive !== false;
      next.entities[entity.id] = entity; affected.push(entity.id); outcomes.push({ type: "summon", entityId: entity.id });
    } else if (effect.type === "terrain" && effect.position) {
      const k = key(effect.position), cell = next.cells?.[k] || { entities: [] };
      next.cells = { ...(next.cells || {}), [k]: { ...cell, ...(effect.patch || {}) } };
      outcomes.push({ type: "terrain", position: clone(effect.position), patch: clone(effect.patch || {}) });
    }
  }
  next.entities[actor.id] = actor;
  if (targetEntity) next.entities[targetEntity.id] = targetEntity;
  next = addEvent(next, { type: "technique_resolved", actorId: actor.id, techniqueId: technique.id, target: clone(intent.target), costs: clone(costs), affected, outcomes });
  return { ok: true, field: next, technique, actorId: actor.id, targetId: originalTarget?.id || null, affected, outcomes, costs: clone(costs) };
}

export function tickTechniqueCooldowns(entity) {
  const state = {};
  for (const [id, record] of Object.entries(entity.techniqueState || {})) state[id] = { ...record, cooldownRemaining: Math.max(0, num(record.cooldownRemaining) - 1) };
  return { ...clone(entity), techniqueState: state };
}

/** Called by the turn controller when this entity becomes eligible to act again. */
export function resetTechniqueTurn(entity, { tickCooldowns = true } = {}) {
  const next = tickCooldowns ? tickTechniqueCooldowns(entity) : clone(entity);
  delete next.acted;
  return next;
}
