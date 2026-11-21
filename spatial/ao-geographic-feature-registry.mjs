/**
 * Apotheosis Online — Geographic Feature Registry Adapter
 *
 * Converts WGS84 GeoJSON source features into AO spatial-address candidates.
 * It is a bridge from the global coordinate reference to road/building/
 * entrance source data, not a route graph or authority to commit world state.
 */
const required = (value, name) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(name + " must be a non-empty string");
  }
  return value.trim();
};

const FEATURE_CLASSES = Object.freeze([
  "road-centerline",
  "pedestrian-path",
  "crossing",
  "bridge",
  "tunnel",
  "building-footprint",
  "entrance",
  "address-point",
  "intersection"
]);

function validateProvenance(input) {
  const source = required(input.source, "provenance.source");
  const license = required(input.license, "provenance.license");
  const sourceId = required(input.sourceId, "provenance.sourceId");
  const featureClass = required(input.featureClass, "provenance.featureClass");
  if (!FEATURE_CLASSES.includes(featureClass)) {
    throw new RangeError("Unsupported geographic featureClass: " + featureClass);
  }
  const sourceVersion = input.sourceVersion == null ? null : String(input.sourceVersion);
  const retrievedAt = input.retrievedAt == null ? null : String(input.retrievedAt);
  if (!sourceVersion && !retrievedAt) {
    throw new TypeError("provenance.sourceVersion or provenance.retrievedAt is required");
  }
  if (retrievedAt && !Number.isFinite(Date.parse(retrievedAt))) {
    throw new TypeError("provenance.retrievedAt must be a valid timestamp");
  }
  const confidence = input.confidence ?? "unassessed";
  if (typeof confidence !== "string" || !confidence.trim()) {
    throw new TypeError("provenance.confidence must be a non-empty string");
  }
  return Object.freeze({
    source,
    license,
    sourceId,
    sourceVersion,
    retrievedAt: retrievedAt ? new Date(retrievedAt).toISOString() : null,
    featureClass,
    confidence
  });
}

function mapCoordinates(geometry, resolver, featureId) {
  const resolvePoint = (coordinate, indexPath) => {
    if (!Array.isArray(coordinate) || coordinate.length < 2 ||
        !Number.isFinite(coordinate[0]) || !Number.isFinite(coordinate[1])) {
      throw new TypeError("Invalid GeoJSON coordinate at " + indexPath);
    }
    const [longitude, latitude, altitudeM] = coordinate;
    const candidate = resolver.resolveGisPoint({
      latitude,
      longitude,
      altitudeM: Number.isFinite(altitudeM) ? altitudeM : null,
      source: "gis-feature:" + featureId,
      sourceRecordId: featureId
    });
    return Object.freeze({
      coordinate: Object.freeze([...coordinate]),
      regionId: candidate.regionId,
      address: candidate.address,
      addressKey: candidate.addressKey,
      quality: candidate.quality
    });
  };

  const mapLine = (line, path) => {
    if (!Array.isArray(line) || line.length < 2) {
      throw new TypeError("GeoJSON line must contain at least two positions at " + path);
    }
    return Object.freeze(line.map((point, i) => resolvePoint(point, path + "[" + i + "]")));
  };

  switch (geometry.type) {
    case "Point":
      return resolvePoint(geometry.coordinates, "coordinates");
    case "MultiPoint":
      if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) {
        throw new TypeError("MultiPoint must contain at least one position");
      }
      return Object.freeze(geometry.coordinates.map((point, i) => resolvePoint(point, "coordinates[" + i + "]")));
    case "LineString":
      return mapLine(geometry.coordinates, "coordinates");
    case "MultiLineString":
      if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) {
        throw new TypeError("MultiLineString must contain at least one line");
      }
      return Object.freeze(geometry.coordinates.map((line, i) => mapLine(line, "coordinates[" + i + "]")));
    case "Polygon":
      if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) {
        throw new TypeError("Polygon must contain at least one ring");
      }
      return Object.freeze(geometry.coordinates.map((ring, i) => {
        if (!Array.isArray(ring) || ring.length < 4) {
          throw new TypeError("Polygon ring must contain at least four positions");
        }
        return Object.freeze(ring.map((point, j) => resolvePoint(point, "coordinates[" + i + "][" + j + "]")));
      }));
    case "MultiPolygon":
      if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) {
        throw new TypeError("MultiPolygon must contain at least one polygon");
      }
      return Object.freeze(geometry.coordinates.map((polygon, i) => {
        if (!Array.isArray(polygon) || !polygon.length) {
          throw new TypeError("MultiPolygon member must contain at least one ring");
        }
        return Object.freeze(polygon.map((ring, j) => {
          if (!Array.isArray(ring) || ring.length < 4) {
            throw new TypeError("Polygon ring must contain at least four positions");
          }
          return Object.freeze(ring.map((point, k) =>
            resolvePoint(point, "coordinates[" + i + "][" + j + "][" + k + "]")
          ));
        }));
      }));
    default:
      throw new RangeError("Unsupported GeoJSON geometry type: " + geometry.type);
  }
}

function collectRegions(mapped) {
  const ids = new Set();
  const visit = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
    } else if (value.regionId) {
      ids.add(value.regionId);
    }
  };
  visit(mapped);
  return [...ids].sort();
}

export function resolveGeographicFeature(feature, {
  resolver,
  provenance,
  featureId = null
} = {}) {
  if (!resolver || typeof resolver.resolveGisPoint !== "function") {
    throw new TypeError("A configured AO global geographic resolver is required");
  }
  if (!feature || feature.type !== "Feature" || !feature.geometry) {
    throw new TypeError("A GeoJSON Feature with geometry is required");
  }
  const id = required(String(featureId ?? feature.id ?? provenance?.sourceId ?? ""), "featureId");
  const source = validateProvenance(provenance || {});
  const geometryCrs = "EPSG:4326";
  const mappedGeometry = mapCoordinates(feature.geometry, resolver, id);
  const regionIds = Object.freeze(collectRegions(mappedGeometry));
  const crossRegion = regionIds.length > 1;
  const candidate = Object.freeze({
    kind: "ao.geographic-feature-candidate",
    id,
    geometryType: feature.geometry.type,
    geometryCrs,
    source: source.source,
    provenance: source,
    sourceProperties: Object.freeze({ ...(feature.properties || {}) }),
    regionIds,
    resolvedGeometry: mappedGeometry,
    status: "candidate-uncommitted",
    topologyStatus: "unverified",
    routeability: "not-routeable-until-topology-and-access-validation",
    requiresKernelValidation: true,
    mayMoveEnvoy: false,
    mayCommitWorldState: false,
    requiresRegionBoundarySegmentation: crossRegion
  });
  return candidate;
}

export const GEOGRAPHIC_FEATURE_CLASSES = FEATURE_CLASSES;
