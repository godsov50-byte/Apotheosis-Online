/**
 * AO Geographic Registry
 *
 * S2 is the authoritative identity and spherical geometry layer.
 * Renderer-specific meshes and display labels do not define geography.
 *
 * Cell IDs are 64-bit BigInts in memory and fixed-width hexadecimal strings
 * in exported JSON. Never convert an S2 ID to a JavaScript Number.
 */
const EARTH_MEAN_RADIUS_KM = 6371.0088;
const REGISTRY_SCHEMA_VERSION = "ao-geography-registry/1";

function hexId(id) {
  return id.toString(16).toUpperCase().padStart(16, "0");
}

function latLng(point) {
  const p = normalize(point);
  return {
    latitude: Number((Math.asin(Math.max(-1, Math.min(1, p.z))) * 180 / Math.PI).toFixed(9)),
    longitude: Number((Math.atan2(p.y, p.x) * 180 / Math.PI).toFixed(9))
  };
}

function normalize(point) {
  const length = Math.hypot(point.x, point.y, point.z);
  return { x: point.x / length, y: point.y / length, z: point.z / length };
}

function interpolateGreatCircle(a, b, t) {
  const dot = Math.max(-1, Math.min(1, a.x*b.x + a.y*b.y + a.z*b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-10) return normalize({
    x: a.x + (b.x-a.x)*t,
    y: a.y + (b.y-a.y)*t,
    z: a.z + (b.z-a.z)*t
  });
  const sinOmega = Math.sin(omega);
  const wa = Math.sin((1-t)*omega) / sinOmega;
  const wb = Math.sin(t*omega) / sinOmega;
  return normalize({
    x: wa*a.x + wb*b.x,
    y: wa*a.y + wb*b.y,
    z: wa*a.z + wb*b.z
  });
}

export function createGeographicRegistry(s2, options = {}) {
  if (!s2?.Cell || !s2?.cellid) throw new TypeError("A compatible s2js namespace is required.");
  const edgeSamples = Math.max(2, Math.min(64, options.edgeSamples ?? 12));
  const records = new Map();

  function recordFor(id) {
    if (records.has(id)) return records.get(id);

    const cell = s2.Cell.fromCellID(id);
    const level = s2.cellid.level(id);
    const face = s2.cellid.face(id);
    const parentId = level === 0 ? null : s2.cellid.parent(id, level - 1);
    const children = level < 30 ? s2.cellid.children(id) : [];
    const edgeNeighbors = [...new Set(s2.cellid.edgeNeighbors(id))];
    const allNeighbors = [...new Set(s2.cellid.allNeighbors(id, level))];
    const edgeSet = new Set(edgeNeighbors);
    const vertexOnlyNeighbors = allNeighbors.filter(neighborId => !edgeSet.has(neighborId));

    const centerVector = normalize(cell.center());
    const vertices = [0, 1, 2, 3].map(index => {
      const vector = normalize(cell.vertex(index));
      return { ...latLng(vector), xyz: vector };
    });

    // Sample each exact S2 great-circle edge for map export/rendering.
    // The four canonical vertices remain the exact compact boundary definition.
    const sampledRing = [];
    for (let edge = 0; edge < 4; edge++) {
      const a = normalize(cell.vertex(edge));
      const b = normalize(cell.vertex((edge + 1) % 4));
      for (let step = 0; step < edgeSamples; step++) {
        sampledRing.push(latLng(interpolateGreatCircle(a, b, step / edgeSamples)));
      }
    }
    sampledRing.push({ ...sampledRing[0] });

    const areaSteradians = cell.exactArea();
    const cellId = hexId(id);
    const record = {
      cellId,
      token: s2.cellid.toToken(id),
      face,
      level,
      parentCellId: parentId === null ? null : hexId(parentId),
      childCellIds: children.map(hexId),
      center: { ...latLng(centerVector), xyz: centerVector },
      boundary: {
        type: "S2Cell",
        edgeModel: "minor great-circle arcs",
        edgeOrder: ["face-down", "face-right", "face-up", "face-left"],
        longitudeRule: "normalized to [-180, 180]; split antimeridian crossings when building GeoJSON",
        vertices,
        sampledRingLatLng: sampledRing,
        edgeSampleCount: edgeSamples
      },
      area: {
        steradians: areaSteradians,
        squareKilometersOnMeanSphere: areaSteradians * EARTH_MEAN_RADIUS_KM ** 2,
        earthRadiusKm: EARTH_MEAN_RADIUS_KM,
        model: "sphere"
      },
      neighbors: {
        edgeCellIds: edgeNeighbors.map(hexId),
        vertexOnlyCellIds: vertexOnlyNeighbors.map(hexId),
        allTouchingCellIds: allNeighbors.map(hexId)
      }
    };
    records.set(id, record);
    return record;
  }

  function register(id) {
    const record = recordFor(id);
    if (record.parentCellId !== null) {
      const parentId = s2.cellid.parent(id, record.level - 1);
      const parent = recordFor(parentId);
      parent.childCellIds = s2.cellid.children(parentId).map(hexId);
    }
    return record;
  }

  function registerChildren(parentId) {
    const parent = register(parentId);
    if (parent.level >= 30) return [];
    const childIds = s2.cellid.children(parentId);
    parent.childCellIds = childIds.map(hexId);
    return childIds.map(register);
  }

  function get(id) {
    return records.get(id) ?? register(id);
  }

  function exportJSON(activeCellIds = []) {
    const sortedRecords = [...records.values()].sort((a, b) =>
      a.level - b.level || a.face - b.face || a.cellId.localeCompare(b.cellId)
    );
    return {
      schemaVersion: REGISTRY_SCHEMA_VERSION,
      authority: "S2 Geometry",
      coordinateModel: "unit sphere; geographic coordinates are latitude/longitude in degrees",
      cellModel: "six Level 0 cube faces; each cell is a quadrilateral bounded by four minor great-circle arcs",
      identityRule: "S2 64-bit cell IDs are permanent identities; names and labels are metadata only",
      areaModel: {
        type: "sphere",
        meanEarthRadiusKm: EARTH_MEAN_RADIUS_KM,
        note: "Areas are spherical, not WGS84 ellipsoidal measurements."
      },
      activeFrontierCellIds: activeCellIds.map(hexId),
      recordCount: sortedRecords.length,
      records: sortedRecords
    };
  }

  return {
    records,
    register,
    registerChildren,
    get,
    exportJSON,
    getRecordCount: () => records.size,
    idToHex: hexId
  };
}
