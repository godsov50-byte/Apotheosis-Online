/**
 * AO Chess regular-combat foundations.
 * Small, deterministic helpers for match-level spatial mechanics.
 * These are deliberately simple; advanced simulation belongs in later layers.
 */
const clone = value => structuredClone(value);
const chebyshev = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs((a.z || 0) - (b.z || 0)));

export function createZone({ id, ownerId = null, type = "effect", cells = null, center = null, radius = 0, expiresAt = null, effects = {} }) {
  if (!id) throw new Error("zone id required");
  if (!cells && !center) throw new Error("zone requires cells or center");
  return { id, ownerId, type, cells: cells ? clone(cells) : null, center: center ? clone(center) : null, radius, expiresAt, effects: clone(effects) };
}

export function zoneContains(zone, position) {
  if (zone.cells) return zone.cells.some(c => c.x === position.x && c.y === position.y && (c.z || 0) === (position.z || 0));
  return chebyshev(zone.center, position) <= Math.max(0, zone.radius || 0);
}

export function entitiesInZone(entities, zone) {
  return Object.values(entities).filter(e => e.alive !== false && zoneContains(zone, e.position)).map(e => e.id);
}

export function createDestructibleTerrain({ id, kind = "object", hp, maxHp = hp, blocked = true, cover = 0, drops = [] }) {
  if (!id || !(maxHp > 0)) throw new Error("terrain id and positive durability required");
  return { id, kind, hp: Math.max(0, hp ?? maxHp), maxHp, blocked, cover, destroyed: false, drops: clone(drops) };
}

export function damageTerrain(terrain, amount, { damageType = "physical", canDestroy = true } = {}) {
  if (!terrain || terrain.destroyed) return { terrain: clone(terrain), destroyedNow: false, damage: 0 };
  const dealt = Math.max(0, Math.floor(amount || 0));
  const hp = Math.max(0, terrain.hp - dealt);
  const destroyedNow = canDestroy && hp === 0;
  return {
    terrain: { ...clone(terrain), hp: canDestroy ? hp : Math.max(1, hp), destroyed: destroyedNow, blocked: destroyedNow ? false : terrain.blocked, cover: destroyedNow ? 0 : terrain.cover },
    destroyedNow, damage: dealt, damageType
  };
}

export const BODY_PARTS = Object.freeze(["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"]);

export function createBodyState(parts = BODY_PARTS) {
  return Object.fromEntries(parts.map(part => [part, { condition: "intact", disabled: false, severed: false, crushed: false, injuries: [] }]));
}

export function applyBodyEffect(body, part, effect, { allowSever = false, allowCrush = false } = {}) {
  if (!body?.[part]) throw new Error("unknown body part");
  const current = body[part];
  const next = clone(body);
  const injuries = [...current.injuries, ...(effect.injury ? [effect.injury] : [])];
  let severed = current.severed || (effect.type === "sever" && allowSever);
  let crushed = current.crushed || (effect.type === "crush" && allowCrush);
  const disabled = current.disabled || effect.type === "disable" || severed || crushed;
  const condition = severed ? "severed" : crushed ? "crushed" : disabled ? "disabled" : injuries.length ? "injured" : "intact";
  next[part] = { ...current, condition, disabled, severed, crushed, injuries };
  return next;
}

export function formationCohesion(entities, entityId, { adjacency = 1, minimumSupport = 1 } = {}) {
  const unit = entities[entityId];
  if (!unit) throw new Error("entity missing");
  const allies = Object.values(entities).filter(other => other.id !== entityId && other.side === unit.side && other.alive !== false && chebyshev(unit.position, other.position) <= adjacency);
  const supported = allies.length >= minimumSupport;
  return { supported, adjacentAllies: allies.map(x => x.id), count: allies.length, modifier: supported ? "supported" : "isolated" };
}

export function grappleAction(state, actorId, targetId, action) {
  const actor = state[actorId], target = state[targetId];
  if (!actor || !target || actor.side === target.side) throw new Error("grapple requires opposing entities");
  const next = clone(state);
  const actorState = next[actorId], targetState = next[targetId];
  if (action === "initiate") {
    if (actorState.grapple || targetState.grapple) throw new Error("already grappled");
    actorState.grapple = { targetId, role: "grappler" };
    targetState.grapple = { targetId: actorId, role: "grappled" };
  } else if (action === "break") {
    if (actorState.grapple?.targetId !== targetId) throw new Error("grapple relationship not found");
    actorState.grapple = null;
    targetState.grapple = null;
  } else if (action === "pin") {
    if (actorState.grapple?.targetId !== targetId) throw new Error("must grapple target to pin");
    targetState.grapple.pinned = true;
  } else if (action === "release") {
    if (actorState.grapple?.targetId !== targetId) throw new Error("grapple relationship not found");
    actorState.grapple = null;
    targetState.grapple = null;
  } else throw new Error("unsupported grapple action");
  return next;
}

/** Grid ray for the regular match: straight cell-to-cell travel only. */
export function projectilePath(from, to) {
  let x = from.x, y = from.y;
  const dx = Math.abs(to.x - x), sx = x < to.x ? 1 : -1;
  const dy = -Math.abs(to.y - y), sy = y < to.y ? 1 : -1;
  let err = dx + dy, path = [];
  while (x !== to.x || y !== to.y) {
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
    path.push({ x, y, z: to.z || 0 });
  }
  return path;
}

export function launchSimpleProjectile({ id, sourceId, targetId = null, from, to, range, damage = 0, damageType = "physical" }) {
  if (!id || !sourceId || !from || !to) throw new Error("projectile id, source and coordinates required");
  const path = projectilePath(from, to);
  if (range != null && path.length > range) throw new Error("projectile range exceeded");
  return { id, sourceId, targetId, position: clone(from), destination: clone(to), path, nextIndex: 0, state: "traveling", damage, damageType };
}

/** Advance one board cell: terrain block, ready interceptor, then unit collision. */
export function advanceSimpleProjectile(projectile, { blockers = [], units = [], interceptorId = null } = {}) {
  if (projectile.state !== "traveling") return { projectile: clone(projectile), event: { type: "inactive" } };
  const nextCell = projectile.path[projectile.nextIndex];
  if (!nextCell) return { projectile: { ...clone(projectile), state: "missed" }, event: { type: "miss" } };
  const sameCell = (a, b) => a.x === b.x && a.y === b.y && (a.z || 0) === (b.z || 0);
  if (blockers.some(c => sameCell(c, nextCell))) {
    return { projectile: { ...clone(projectile), position: clone(nextCell), nextIndex: projectile.nextIndex + 1, state: "blocked" }, event: { type: "blocked", cell: clone(nextCell) } };
  }
  const interceptor = units.find(u => u.id === interceptorId && u.alive !== false && u.interceptionReady && sameCell(u.position, nextCell));
  if (interceptor) {
    return { projectile: { ...clone(projectile), position: clone(nextCell), nextIndex: projectile.nextIndex + 1, state: "intercepted" }, event: { type: "intercepted", interceptorId: interceptor.id, damage: 0 }, updatedInterceptor: { ...clone(interceptor), interceptionReady: false } };
  }
  const collision = units.find(u => u.alive !== false && u.id !== projectile.sourceId && sameCell(u.position, nextCell));
  if (collision) return { projectile: { ...clone(projectile), position: clone(nextCell), nextIndex: projectile.nextIndex + 1, state: "hit" }, event: { type: "hit", targetId: collision.id, damage: projectile.damage, damageType: projectile.damageType } };
  const advanced = { ...clone(projectile), position: clone(nextCell), nextIndex: projectile.nextIndex + 1 };
  if (advanced.nextIndex >= advanced.path.length) advanced.state = "missed";
  return { projectile: advanced, event: { type: advanced.state === "missed" ? "miss" : "advanced", cell: clone(nextCell) } };
}
