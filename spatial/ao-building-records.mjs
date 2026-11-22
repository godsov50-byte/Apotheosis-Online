/**
 * Convert a sourced GeoJSON Polygon into an isolated AO building proposal.
 * This is a staging adapter: it preserves provenance and never establishes canon.
 */
function stableHash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
const finitePair = (p) => Array.isArray(p) && p.length >= 2 &&
  Number.isFinite(p[0]) && Number.isFinite(p[1]);
export function createSourceBuildingRecord(feature, options = {}) {
  if (!feature || feature.type !== "Feature" || !feature.geometry) {
    throw new TypeError("Expected a GeoJSON Feature with geometry.");
  }
  if (feature.geometry.type !== "Polygon") {
    throw new TypeError("Only Polygon footprints are supported for editable proposals.");
  }
  const rings = feature.geometry.coordinates;
  const outer = rings?.[0];
  if (!Array.isArray(outer) || outer.length < 4 || !outer.every(finitePair)) {
    throw new TypeError("Polygon must have a valid outer ring with at least four coordinates.");
  }
  const props = feature.properties || {};
  const sourceId = feature.id ?? props.OBJECTID ?? props.OBJECTID_1 ?? props.id ?? null;
  const sourceName = props.NAME ?? props.name ?? props.BUILDING ?? props.building ?? null;
  const idBase = sourceId !== null && sourceId !== undefined
    ? String(sourceId).replace(/[^a-zA-Z0-9._:-]/g, "-")
    : stableHash(JSON.stringify(feature.geometry));
  const floors = Math.max(1, Math.min(100, Math.floor(Number(options.defaultFloors) || 1)));
  const cellSize = Math.max(.25, Number(options.cellSize) || 1);
  const floorPlans = Array.from({ length: floors }, () => ({
    rows: 20, cols: 20, cells: {}, doors: [], stairs: []
  }));
  return {
    id: "source-building:" + idBase,
    name: String(sourceName || options.namePrefix || "Imported building"),
    purpose: options.purpose || "Other",
    floors,
    floorsKnown: false,
    floorsSource: "unknown — placeholder plan count only",
    cellSize,
    notes: "Imported footprint proposal. Building identity/use/floor count require verification.",
    footprint: outer.map(([lon, lat]) => [lat, lon]),
    source: {
      kind: "geojson",
      sourceId,
      properties: structuredClone(props),
      geometry: structuredClone(feature.geometry)
    },
    entrances: [],
    rooms: [],
    floorPlans
  };
}
