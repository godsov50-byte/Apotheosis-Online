// AO Fresh Chunk-and-Connector World Foundation — isolated, data-only model.
export const AO_WORLD_SCHEMA_VERSION = 1;
export const DIRECTIONS = Object.freeze(["north", "east", "south", "west"]);
const opposite = { north: "south", east: "west", south: "north", west: "east" };
const offset = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };
const validId = v => typeof v === "string" && v.trim().length > 0;
const clone = v => structuredClone(v);
const coord = (x, y) => `${x},${y}`;
function req(v, name) { if (!validId(v)) throw new TypeError(name + " required"); return v.trim(); }
function dir(v) { if (!DIRECTIONS.includes(v)) throw new TypeTypeError("invalid direction"); return v; }
function connectors() {
  return Object.fromEntries(DIRECTIONS.map(d => [d, { direction: d, neighborChunkId: null, environmentId: null, access: { mode: "open", allow: [] } }]));
}
function assertCoordinate(x, y) { if (!Number.isInteger(x) || !Number.isInteger(y)) throw new TypeTypeError("coordinates must be integers"); }
function expectedNeighbor(a, d) { const [dx, dy] = offset[d]; return { x: a.x + dx, y: a.y + dy }; }

export function createWorld({ worldId, name = "AO World" } = {}) {
  req(worldId, "worldId");
  return { schemaVersion: AO_WORLD_SCHEMA_VERSION, worldId: worldId.trim(), name, chunks: [], regions: [], environments: [] };
}
// A chunk address exists independently of whether a chunk record is stored.
export function chunkAddress(x, y) { assertCoordinate(x, y); return { x, y, key: coord(x, y) }; }
export function getChunkAt(w, x, y) { assertCoordinate(x, y); return w.chunks.find(c => c.x === x && c.y === y) ?? null; }
export function createChunk({ chunkId, x, y, token = "🌿", terrainTag = "wilderness", regionId = null } = {}) {
  req(chunkId, "chunkId"); assertCoordinate(x, y);
  if (typeof token !== "string" || !token.trim()) throw new TypeTypeError("token required");
  return { chunkId: chunkId.trim(), x, y, token: token.trim(), terrainTag, regionId, connectors: connectors() };
}
function getChunk(w, id) { const c = w.chunks.find(c => c.chunkId === id); if (!c) throw new Error("unknown chunk " + id); return c; }
export function materializeChunk(w, address, options = {}) {
  const { x, y } = typeof address === "string" ? (() => { const parts = address.split(",").map(Number); if (parts.length !== 2 || parts.some(n => !Number.isInteger(n)) throw new TypeError("invalid chunk address"); return { x: parts[0], y: parts[1] }; })() : address;
  assertCoordinate(x, y);
  const existing = getChunkAt(w, x, y);
  if (existing) return existing;
  const chunkId = options.chunkId ?? `chunk:${x},${y}`;
  const chunk = createChunk({ chunkId, x, y, ...options });
  if (w.chunks.some(c => c.chunkId === chunk.chunkId)) throw new Error("duplicate chunk ID");
  w.chunks.push(chunk);
  return chunk;
}
export function addChunk(w, input) {
  const c = input.connectors ? clone(input) : createChunk(input);
  if (w.chunks.some(v => v.chunkId === c.chunkId)) throw new Error("duplicate chunk ID");
  if (getChunkAt(w, c.x, c.y)) throw new Error("chunk coordinate occupied");
  validateChunkShape(c);
  w.chunks.push(c); return w;
}
function validateChunkShape(c) {
  req(c.chunkId, "chunkId"); assertCoordinate(c.x, c.y);
  if (!c.connectors || DIRECTIONS.some(d => !c.connectors[d])) throw new Error("four connectors required");
  for (const d of DIRECTIONS) {
    const con = c.connectors[d];
    if (con.direction !== d || !con.access || !["open", "restricted", "closed"].includes(con.access.mode) || !Array.isArray(con.access.allow)) throw new Error("invalid connector shape");
  }
}
export function setChunkToken(w, id, token, terrainTag) {
  const c = getChunk(w, id); if (typeof token !== "string" || !token.trim()) throw new TypeError("token required");
  c.token = token.trim(); if (terrainTag !== undefined) c.terrainTag = terrainTag; return w;
}
export function connectChunks(w, { fromChunkId, fromDirection, toChunkId }) {
  const a = getChunk(w, fromChunkId), b = getChunk(w, toChunkId), d = dir(fromDirection);
  if (a === b) throw new Error("chunk cannot connect to itself");
  const expected = expectedNeighbor(a, d);
  if (b.x !== expected.x || b.y !== expected.y) throw new Error("chunks are not cardinal coordinate neighbors");
  const ca = a.connectors[d], cb = b.connectors[opposite[d]];
  if (ca.environmentId || ca.neighborChunkId || cb.environmentId || cb.neighborChunkId) throw new Error("connector occupied");
  ca.neighborChunkId = b.chunkId; cb.neighborChunkId = a.chunkId; return w;
}
export function attachEnvironment(w, { chunkId, direction, environmentId, environmentType = "environment" }) {
  const c = getChunk(w, chunkId), d = dir(direction), con = c.connectors[d]; req(environmentId, "environmentId");
  if (con.neighborChunkId || con.environmentId) throw new Error("connector occupied");
  if (w.environments.some(e => e.environmentId === environmentId)) throw new Error("duplicate environment");
  con.environmentId = environmentId; w.environments.push({ environmentId, environmentType, entry: { chunkId, direction: d } }); return w;
}
export function claimRegion(w, { regionId, ownerId, chunkIds }) {
  req(regionId, "regionId"); req(ownerId, "ownerId");
  if (!Array.isArray(chunkIds) || !chunkIds.length) throw new TypeTypeError("chunkIds required");
  const ids = [...new Set(chunkIds)]; ids.forEach(id => getChunk(w, id));
  const r = w.regions.find(v => v.regionId === regionId);
  if (r) { r.ownerId = ownerId; r.chunkIds = ids; } else w.regions.push({ regionId, ownerId, chunkIds: ids });
  ids.forEach(id => getChunk(w, id).regionId = regionId); return w;
}
export function setConnectorAccess(w, { chunkId, direction, mode, allow = [] }) {
  const c = getChunk(w, chunkId).connectors[dir(direction)];
  if (!["open", "restricted", "closed"].includes(mode)) throw new TypeError("invalid access mode");
  if (!Array.isArray(allow) || allow.some(v => !validId(v))) throw new TypeTypeError("allow must be string IDs");
  c.access = { mode, allow: [...new Set(allow.map(v => v.trim()))] }; return w;
}
export function canAccessConnector(c, actorId) {
  if (c.access.mode === "open") return true;
  if (c.access.mode === "closed") return false;
  return validId(actorId) && c.access.allow.includes(actorId.trim());
}
export function validateWorld(w) {
  req(w?.worldId, "worldId");
  if (!Array.isArray(w.chunks) || !Array.isArray(w.regions) || !Array.isArray(w.environments)) throw new TypeError("world lists missing");
  const ids = new Set(), coords = new Set();
  for (const c of w.chunks) {
    validateChunkShape(c);
    if (ids.has(c.chunkId)) throw new Error("duplicate chunk ID"); ids.add(c.chunkId);
    const k = coord(c.x, c.y); if (coords.has(k)) throw new Error("duplicate coordinates"); coords.add(k);
  }
  for (const c of w.chunks) for (const d of DIRECTIONS) {
    const con = c.connectors[d];
    if (con.neighborChunkId) {
      const n = w.chunks.find(v => v.chunkId === con.neighborChunkId); if (!n) throw new Error("unknown neighbor");
      const pos = expectedNeighbor(c, d); if (n.x !== pos.x || n.y !== pos.y) throw new Error("neighbor coordinate mismatch");
      if (n.connectors[opposite[d]].neighborChunkId !== c.chunkId) throw new Error("connection is not reciprocal");
    }
    if (con.environmentId && !w.environments.some(e => e.environmentId === con.environmentId && e.entry.chunkId === c.chunkId && e.entry.direction === d)) throw new Error("environment entry mismatch");
  }
  for (const r of w.regions) for (const id of r.chunkIds) {
    const c = getChunk(w, id); if (c.regionId !== r.regionId) throw new Error("region membership mismatch");
  }
  return true;
}
export function exportWorld(w) { validateWorld(w); return clone(w); }
