/**
 * AO Pedestrian Network Builder (staging-only).
 * Builds a directed walk graph from explicitly approved sidewalk segments and
 * entrance connectors. Geometry alone never implies pedestrian access.
 */
const ACCEPTED = new Set(["source_verified", "accepted_for_staging", "verified"]);

function validRecord(record, type) {
  if (!record || typeof record !== "object") throw new TypeError(`Invalid ${type} record`);
  if (!record.id || !record.from || !record.to) throw new TypeError(`Missing ${type} identity or endpoints`);
  if (!Array.isArray(record.geometry) || record.geometry.length < 2) throw new TypeError(`Invalid ${type} geometry`);
  if (record.geometry.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z ?? 0))) {
    throw new TypeTypeError(`Non-finite ${type} geometry`);
  }
}
function edgeEligible(record) {
  return record.routingApproved === true && ACCEPTED.has(record.status) && record.walkAccess === true;
}
function toEdge(record, kind) {
  const lengthM = Number(record.lengthM);
  if (!Number.isFinite(lengthM) || lengthM <= 0) throw new RangeError("lengthM must be positive");
  return {
    id: record.id, from: record.from, to: record.to, kind,
    modes: ["walk"], routingApproved: true, status: record.status,
    lengthM, geometry: record.geometry.map(p => ({ x:p.x, y:p.y, z:p.z ?? 0 })),
    ...(record.speedLimitMps ? { speedLimitMps: record.speedLimitMps } : {}),
    provenance: record.provenance ?? null
  };
}
export function buildPedestrianGraph({ sidewalks = [], entranceConnectors = [] } = {}) {
  if (!Array.isArray(sidewalks) || !Array.isArray(entranceConnectors)) throw new TypeError("Expected sidewalk and connector arrays");
  const edges = [];
  const ids = new Set();
  for (const [kind, records] of [["sidewalk", sidewalks], ["entrance_connector", entranceConnectors]]) {
    for (const record of records) {
      validRecord(record, kind);
      if (ids.has(record.id)) throw new Error(`Duplicate edge id: ${record.id}`);
      ids.add(record.id);
      if (edgeEligible(record)) edges.push(toEdge(record, kind));
    }
  }
  const nodes = [...new Set(edges.flatMap(edge => [edge.from, edge.to]))].sort();
  return { nodes, edges, mode: "walk", stagingOnly: true };
}
