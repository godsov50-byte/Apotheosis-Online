/**
 * Apotheosis Online — Deterministic Spatial Movement Kernel (staging slice)
 *
 * Pure functions only. This module plans routes on explicitly approved directed
 * navigation edges and advances continuous positions over elapsed movement time.
 * It does not read GPS, persist state, approve GIS evidence, or mutate the world.
 */
const finite = n => typeof n === "number" && Number.isFinite(n);
const nonEmpty = (v, label) => {
  if (typeof v !== "string" || !v.trim()) throw new TypeError(label + " must be a non-empty string");
  return v.trim();
};
const clonePoint = p => ({ x: p.x, y: p.y ?? 0, z: p.z ?? 0 });
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
const DEFAULT_SPEEDS_MPS = Object.freeze({
  accessible_walk: 0.9, walk: 1.2, brisk_walk: 1.6, jog: 2.3,
  bicycle: 4.7, urban_bus: 5.0, urban_car: 7.5
});
const APPROVED_EDGE_STATES = new Set(["source_verified", "accepted_for_staging", "verified"]);

function validatePoint(point, label) {
  if (!point || !finite(point.x) || !finite(point.y ?? 0) || !finite(point.z ?? 0)) {
    throw new TypeError(label + " must have finite x, y and z coordinates");
  }
  return clonePoint(point);
}
function normalizeGeometry(edge, nodes) {
  const raw = edge.geometry ?? [nodes.get(edge.from).position, nodes.get(edge.to).position];
  if (!Array.isArray(raw) || raw.length < 2) throw new TypeError("Edge " + edge.id + " needs at least two geometry points");
  return raw.map((p, i) => validatePoint(p, "edge " + edge.id + " geometry[" + i + "]"));
}
function geometryLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  if (!(total > 0)) throw new RangeError("Navigation edge must have positive length");
  return total;
}

/**
 * Edges are directed. A reverse direction requires a separate edge record.
 * routingApproved=true is mandatory: GIS geometry alone never grants access.
 */
export function createNavigationGraph({ nodes, edges }) {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new TypeError("nodes and edges arrays are required");
  const nodeMap = new Map();
  for (const input of nodes) {
    const id = nonEmpty(input.id, "node.id");
    if (nodeMap.has(id)) throw new Error("Duplicate navigation node: " + id);
    const position = validatePoint(input.position, "node " + id + " position");
    nodeMap.set(id, Object.freeze({
      id, position: Object.freeze(position), layer: input.layer || "ground",
      spaceId: input.spaceId || "world", locationId: input.locationId || null,
      provenance: input.provenance ? Object.freeze({ ...input.provenance }) : null
    }));
  }
  const edgeMap = new Map();
  const adjacency = new Map([...nodeMap.keys()].map(id => [id, []]));
  for (const input of edges) {
    const id = nonEmpty(input.id, "edge.id");
    if (edgeMap.has(id)) throw new Error("Duplicate navigation edge: " + id);
    if (!nodeMap.has(input.from) || !nodeMap.has(input.to)) throw new Error("Edge " + id + " references an unknown node");
    if (input.from === input.to) throw new Error("Edge " + id + " cannot loop to the same node");
    if (input.routingApproved !== true || !APPROVED_EDGE_STATES.has(input.status)) {
      throw new Error("Edge " + id + " is not explicitly approved for staging navigation");
    }
    if (!Array.isArray(input.modes) || input.modes.length === 0) throw new TypeError("Edge " + id + " needs at least one allowed mode");
    const modes = [...new Set(input.modes.map(x => nonEmpty(x, "edge mode")))];
    const geometry = normalizeGeometry(input, nodeMap);
    const lengthM = geometryLength(geometry);
    const speedLimitMps = input.speedLimitMps ?? null;
    if (speedLimitMps !== null && (!finite(speedLimitMps) || speedLimitMps <= 0)) {
      throw new RangeError("Edge " + id + " speedLimitMps must be positive");
    }
    const edge = Object.freeze({
      id, from: input.from, to: input.to, modes: Object.freeze(modes),
      geometry: Object.freeze(geometry.map(p => Object.freeze(p))),
      lengthM, speedLimitMps, status: input.status,
      requiredPermissions: Object.freeze([...(input.requiredPermissions || [])]),
      provenance: input.provenance ? Object.freeze({ ...input.provenance }) : null,
      kind: input.kind || "path"
    });
    edgeMap.set(id, edge);
    adjacency.get(edge.from).push(edge);
  }
  for (const list of adjacency.values()) list.sort((a, b) => a.id.localeCompare(b.id));
  return Object.freeze({
    nodes: nodeMap, edges: edgeMap, adjacency,
    nodeIds: Object.freeze([...nodeMap.keys()].sort()),
    edgeIds: Object.freeze([...edgeMap.keys()].sort())
  });
}

function resolveSpeed(actor, mode, edge, speedProfiles) {
  const profile = speedProfiles[mode];
  if (!profile) throw new RangeError("No movement speed profile exists for mode: " + mode);
  const actorSpeed = actor.speedMps ?? profile;
  if (!finite(actorSpeed) || actorSpeed <= 0) throw new RangeError("Actor speedMps must be positive");
  return edge.speedLimitMps === null ? actorSpeed : Math.min(actorSpeed, edge.speedLimitMps);
}

export function planRoute(graph, {
  fromNodeId, toNodeId, mode, actor = {}, speedProfiles = DEFAULT_SPEEDS_MPS
}) {
  if (!graph || !graph.nodes || !graph.edges || !graph.adjacency) throw new TypeError("A navigation graph is required");
  fromNodeId = nonEmpty(fromNodeId, "fromNodeId");
  toNodeId = nonEmpty(toNodeId, "toNodeId");
  mode = nonEmpty(mode, "mode");
  if (!graph.nodes.has(fromNodeId) || !graph.nodes.has(toNodeId)) throw new RangeError("Route endpoint is not in the navigation graph");
  if (actor.capabilities?.movementModes && !actor.capabilities.movementModes.includes(mode)) {
    throw new Error("Actor lacks movement capability for mode " + mode);
  }
  const permissions = new Set(actor.permissions || []);
  const dist = new Map([[fromNodeId, 0]]);
  const previous = new Map();
  const unsettled = new Set(graph.nodeIds);
  while (unsettled.size) {
    let current = null, best = Infinity;
    for (const id of unsettled) {
      const value = dist.get(id) ?? Infinity;
      if (value < best || (value === best && current !== null && id < current)) {
        best = value; current = id;
      }
    }
    if (current === null || !Number.isFinite(best)) break;
    if (current === toNodeId) break;
    unsettled.delete(current);
    for (const edge of graph.adjacency.get(current) || []) {
      if (!edge.modes.includes(mode)) continue;
      if (edge.requiredPermissions.some(permission => !permissions.has(permission))) continue;
      const speed = resolveSpeed(actor, mode, edge, speedProfiles);
      const candidate = best + edge.lengthM / speed;
      const old = dist.get(edge.to) ?? Infinity;
      if (candidate < old) {
        dist.set(edge.to, candidate);
        previous.set(edge.to, edge);
      }
    }
  }
  if (fromNodeId !== toNodeId && !previous.has(toNodeId)) {
    return Object.freeze({ status: "unreachable", fromNodeId, toNodeId, mode, edges: Object.freeze([]), distanceM: null, estimatedSeconds: null });
  }
  const path = [];
  let cursor = toNodeId;
  while (cursor !== fromNodeId) {
    const edge = previous.get(cursor);
    if (!edge) throw new Error("Route reconstruction failed");
    path.unshift(edge);
    cursor = edge.from;
  }
  return Object.freeze({
    status: "ready", fromNodeId, toNodeId, mode,
    edges: Object.freeze(path),
    distanceM: path.reduce((sum, edge) => sum + edge.lengthM, 0),
    estimatedSeconds: dist.get(toNodeId) ?? 0,
    speedProfiles: Object.freeze({ ...speedProfiles })
  });
}

function pointAtDistance(points, targetM) {
  if (targetM <= 0) return clonePoint(points[0]);
  let remaining = targetM;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], segmentLength = distance(a, b);
    if (remaining <= segmentLength || i === points.length - 1) {
      const t = segmentLength === 0 ? 0 : Math.min(1, remaining / segmentLength);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t
      };
    }
    remaining -= segmentLength;
  }
  return clonePoint(points[points.length - 1]);
}
function segmentCircleEntry(a, b, center, radius) {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const ox = a.x - center.x, oy = a.y - center.y, oz = a.z - center.z;
  const aa = dx * dx + dy * dy + dz * dz;
  const cc = ox * ox + oy * oy + oz * oz - radius * radius;
  if (cc <= 0) return 0;
  if (aa === 0) return null;
  const bb = 2 * (ox * dx + oy * dy + oz * dz);
  const discriminant = bb * bb - 4 * aa * cc;
  if (discriminant < 0) return null;
  const t = (-bb - Math.sqrt(discriminant)) / (2 * aa);
  return t >= 0 && t <= 1 ? t : null;
}
function firstBlocker(a, b, actor, obstacles, occupants) {
  const candidates = [];
  for (const obstacle of obstacles) {
    const center = validatePoint(obstacle.position, "obstacle position");
    const radius = obstacle.radiusM ?? 0;
    if (!finite(radius) || radius < 0) throw new RangeError("Obstacle radiusM must be non-negative");
    const t = segmentCircleEntry(a, b, center, radius + (actor.radiusM || 0));
    if (t !== null) candidates.push({ t, id: obstacle.id || "obstacle", type: "obstacle" });
  }
  for (const other of occupants) {
    if (other.id === actor.id) continue;
    const center = validatePoint(other.position, "occupant position");
    const radius = other.radiusM ?? 0;
    if (!finite(radius) || radius < 0) throw new RangeError("Occupant radiusM must be non-negative");
    const t = segmentCircleEntry(a, b, center, radius + (actor.radiusM || 0));
    if (t !== null) candidates.push({ t, id: other.id || "occupant", type: "occupant" });
  }
  candidates.sort((x, y) => x.t - y.t || String(x.id).localeCompare(String(y.id)));
  return candidates[0] || null;
}

export function resolveMovementStep({
  actor, route, elapsedSeconds, obstacles = [], occupants = [],
  speedProfiles = DEFAULT_SPEEDS_MPS, addressAtPosition = null
}) {
  if (!actor || typeof actor !== "object") throw new TypeError("actor is required");
  const actorId = nonEmpty(actor.id, "actor.id");
  if (!route || route.status !== "ready" || !Array.isArray(route.edges)) throw new TypeError("A ready route is required");
  if (!finite(elapsedSeconds) || elapsedSeconds < 0) throw new RangeError("elapsedSeconds must be non-negative");
  const radiusM = actor.radiusM ?? 0;
  if (!finite(radiusM) || radiusM < 0) throw new RangeError("actor.radiusM must be non-negative");
  const speed = actor.speedMps ?? speedProfiles[route.mode];
  if (!finite(speed) || speed <= 0) throw new RangeError("No valid actor movement speed is available");
  if (actor.mode && actor.mode !== route.mode) throw new Error("Actor movement mode does not match route mode");

  let position = validatePoint(actor.position, "actor.position");
  let edgeIndex = actor.edgeIndex ?? 0;
  let edgeProgressM = actor.edgeProgressM ?? 0;
  if (!Number.isInteger(edgeIndex) || edgeIndex < 0 || edgeIndex > route.edges.length) throw new RangeError("Invalid edgeIndex");
  if (!finite(edgeProgressM) || edgeProgressM < 0) throw new RangeError("edgeProgressM must be non-negative");
  let remainingM = speed * elapsedSeconds, movedM = 0, blocker = null;
  const start = clonePoint(position);
  const epsilonM = 1e-6;

  while (remainingM > epsilonM && edgeIndex < route.edges.length) {
    const edge = route.edges[edgeIndex];
    const nextProgress = Math.min(edge.lengthM, edgeProgressM + remainingM);
    const target = pointAtDistance(edge.geometry, nextProgress);
    const hit = firstBlocker(position, target, { ...actor, id: actorId, radiusM }, obstacles, occupants);
    if (hit) {
      const segmentLength = distance(position, target);
      const safeT = Math.max(0, hit.t - (segmentLength > 0 ? epsilonM / segmentLength : 0));
      const safePoint = {
        x: position.x + (target.x - position.x) * safeT,
        y: position.y + (target.y - position.y) * safeT,
        z: position.z + (target.z - position.z) * safeT
      };
      const actual = distance(position, safePoint);
      movedM += actual; edgeProgressM += actual; position = safePoint;
      blocker = Object.freeze({ id: hit.id, type: hit.type });
      remainingM = 0;
      break;
    }
    const stepDistance = distance(position, target);
    movedM += stepDistance;
    remainingM -= Math.min(remainingM, stepDistance);
    position = target;
    edgeProgressM = nextProgress;
    if (edgeProgressM >= edge.lengthM - epsilonM) {
      edgeIndex++; edgeProgressM = 0;
    } else if (stepDistance <= epsilonM) break;
  }
  const status = blocker ? "blocked" : edgeIndex >= route.edges.length ? "arrived" : "moving";
  const address = addressAtPosition ? addressAtPosition(position, actor, route) : null;
  return Object.freeze({
    actorId, status, mode: route.mode,
    fromPosition: Object.freeze(start), position: Object.freeze(position),
    distanceMovedM: movedM, elapsedSeconds,
    edgeIndex, edgeProgressM,
    remainingRouteEdges: Math.max(0, route.edges.length - edgeIndex),
    blocker, spatialAddress: address, routeId: route.id || null
  });
}

export const MOVEMENT_SPEED_PROFILES_MPS = DEFAULT_SPEEDS_MPS;

export function advanceAoCalendarSeconds(elapsedRealSeconds, realSecondsPerAoSecond = 3) {
  if (!finite(elapsedRealSeconds) || elapsedRealSeconds < 0) throw new RangeError("elapsedRealSeconds must be non-negative");
  if (!finite(realSecondsPerAoSecond) || realSecondsPerAoSecond <= 0) throw new RangeError("realSecondsPerAoSecond must be positive");
  return elapsedRealSeconds / realSecondsPerAoSecond;
}
