/**
 * Apotheosis Online — Global Geographic Reference
 *
 * WGS84 is the global geographic input/reference system. It is NOT one
 * planet-sized flat coordinate plane. Each configured AO region owns a
 * bounded local metric frame and maps into the existing spatial address
 * hierarchy (Region -> Chunk -> Tile -> Cell -> Position).
 *
 * GPS/GIS observations produce candidate addresses only. The AO Kernel must
 * validate movement and authorize any WorldHeart state/history commit.
 */
import {
  createSpatialResolver,
  spatialAddressKey,
  assertSpatialAddress
} from "./ao-spatial-addressing.mjs";

const finite = n => typeof n === "number" && Number.isFinite(n);
const EARTH_RADIUS_M = 6371008.8;

function requiredString(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(name + " must be a non-empty string");
  }
  return value.trim();
}

function validateWgs84(latitude, longitude) {
  if (!finite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError("latitude must be within -90..90 degrees");
  }
  if (!finite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError("longitude must be within -180..180 degrees");
  }
}

function contains(bounds, latitude, longitude) {
  if (!bounds) return false;
  const longitudeInside = bounds.west <= bounds.east
    ? longitude >= bounds.west && longitude <= bounds.east
    : longitude >= bounds.west || longitude <= bounds.east;
  return latitude >= bounds.south && latitude <= bounds.north && longitudeInside;
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const p1 = lat1 * rad;
  const p2 = lat2 * rad;
  const dp = (lat2 - lat1) * rad;
  let dl = (lon2 - lon1) * rad;
  if (dl > Math.PI) dl -= 2 * Math.PI;
  if (dl < -Math.PI) dl += 2 * Math.PI;
  const a = Math.sin(dp / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

function normalizeObservation(input, defaults = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("A geographic observation object is required");
  }
  const latitude = input.latitude;
  const longitude = input.longitude;
  validateWgs84(latitude, longitude);
  const horizontalAccuracyM = input.horizontalAccuracyM ??
    input.accuracyM ?? defaults.horizontalAccuracyM ?? null;
  if (horizontalAccuracyM !== null &&
      (!finite(horizontalAccuracyM) || horizontalAccuracyM < 0)) {
    throw new RangeError("horizontalAccuracyM must be a non-negative finite number or null");
  }
  const altitudeM = input.altitudeM ?? null;
  if (altitudeM !== null && !finite(altitudeM)) {
    throw new RangeError("altitudeM must be a finite number or null");
  }
  const verticalAccuracyM = input.verticalAccuracyM ?? null;
  if (verticalAccuracyM !== null &&
      (!finite(verticalAccuracyM) || verticalAccuracyM < 0)) {
    throw new RangeError("verticalAccuracyM must be a non-negative finite number or null");
  }
  const observedAt = input.observedAt ?? new Date().toISOString();
  if (typeof observedAt !== "string" || !Number.isFinite(Date.parse(observedAt))) {
    throw new TypeError("observedAt must be a valid ISO-compatible timestamp");
  }
  const source = requiredString(input.source ?? defaults.source ?? "unspecified", "source");
  const sourceRecordId = input.sourceRecordId ?? null;
  if (sourceRecordId !== null && typeof sourceRecordId !== "string") {
    throw new TypeError("sourceRecordId must be a string or null");
  }
  const verticalDatum = input.verticalDatum ?? null;
  if (verticalDatum !== null && typeof verticalDatum !== "string") {
    throw new TypeError("verticalDatum must be a string or null");
  }
  return Object.freeze({
    crs: "EPSG:4326",
    datum: "WGS84",
    latitude,
    longitude,
    altitudeM,
    verticalDatum,
    verticalAccuracyM,
    horizontalAccuracyM,
    observedAt: new Date(observedAt).toISOString(),
    source,
    sourceRecordId
  });
}

/**
 * regions are the approved AO geographic-region registry, not arbitrary
 * client-supplied names. Each needs: id, bounds, originLat, originLon.
 * Local metric frames must remain small enough for the configured projection.
 * Large countries/continents are covered by multiple AO spatial regions.
 */
export function createGlobalGeographicResolver({
  worldId,
  regions,
  grid,
  maxRegionRadiusKm = 250
}) {
  worldId = requiredString(worldId, "worldId");
  if (!finite(maxRegionRadiusKm) || maxRegionRadiusKm <= 0) {
    throw new RangeError("maxRegionRadiusKm must be a positive finite number");
  }
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new TypeError("A configured global AO region registry is required");
  }
  const seen = new Set();
  const registry = regions.map(inputRegion => {
    if (!inputRegion || typeof inputRegion !== "object") {
      throw new TypeError("Every AO region must be an object");
    }
    const id = requiredString(inputRegion.id, "region.id");
    if (seen.has(id)) throw new Error("Duplicate AO region id: " + id);
    seen.add(id);
    const bounds = inputRegion.bounds;
    if (!bounds ||
        ![bounds.south, bounds.north, bounds.west, bounds.east].every(finite) ||
        bounds.south < -90 || bounds.north > 90 || bounds.south > bounds.north ||
        bounds.west < -180 || bounds.west > 180 ||
        bounds.east < -180 || bounds.east > 180) {
      throw new RangeError("Region " + id + " requires valid explicit WGS84 bounds");
    }
    const originLat = inputRegion.originLat;
    const originLon = inputRegion.originLon;
    validateWgs84(originLat, originLon);
    const radius = inputRegion.maxRadiusKm ?? maxRegionRadiusKm;
    if (!finite(radius) || radius <= 0 || radius > maxRegionRadiusKm) {
      throw new RangeError("Region " + id + " local frame radius must be >0 and <= " + maxRegionRadiusKm + " km");
    }
    return Object.freeze({
      ...inputRegion,
      id,
      originLat,
      originLon,
      maxRadiusKm: radius,
      bounds: Object.freeze({ ...bounds })
    });
  });

  const resolver = createSpatialResolver({
    worldId,
    regions: registry,
    grid,
    maxRegionRadiusKm
  });

  function findRegion(latitude, longitude) {
    validateWgs84(latitude, longitude);
    const matches = registry.filter(region => contains(region.bounds, latitude, longitude));
    if (matches.length === 0) {
      throw new RangeError("Coordinate is not covered by a configured AO geographic region");
    }
    if (matches.length > 1) {
      throw new RangeError("Coordinate matches multiple AO regions; resolve the region-boundary overlap explicitly");
    }
    const region = matches[0];
    const radius = region.maxRadiusKm * 1000;
    const distance = distanceMeters(region.originLat, region.originLon, latitude, longitude);
    if (distance > radius) {
      throw new RangeError("Coordinate exceeds this region's local metric frame; configure a smaller AO region cell");
    }
    return region;
  }

  function resolveObservation(input) {
    const observation = normalizeObservation(input);
    const region = findRegion(observation.latitude, observation.longitude);
    // Unknown elevation stays unknown. Zero is only the resolver's local
    // reference plane; preserve the source's null altitude in observation.
    const address = resolver.resolveGeographic({
      latitude: observation.latitude,
      longitude: observation.longitude,
      altitudeM: observation.altitudeM ?? 0,
      regionId: region.id,
      layer: input.layer ?? "ground",
      coordinateSource: observation.source
    });
    assertSpatialAddress(address);
    const horizontalAccuracyM = observation.horizontalAccuracyM;
    const cellSizeM = grid?.cellSizeM ?? 1;
    const accuracyResolution = horizontalAccuracyM === null
      ? "unknown"
      : horizontalAccuracyM <= cellSizeM
        ? "cell-scale-candidate"
        : "coarser-than-cell";
    const latitudeBoundaryM = Math.min(
      observation.latitude - region.bounds.south,
      region.bounds.north - observation.latitude
    ) * Math.PI / 180 * EARTH_RADIUS_M;
    const longitudeBoundaryDegrees = Math.min(
      Math.abs(observation.longitude - region.bounds.west),
      Math.abs(observation.longitude - region.bounds.east)
    );
    const longitudeBoundaryM = longitudeBoundaryDegrees * Math.PI / 180 *
      EARTH_RADIUS_M * Math.max(0, Math.cos(observation.latitude * Math.PI / 180));
    const boundaryDistanceM = Math.min(latitudeBoundaryM, longitudeBoundaryM);
    const regionBoundaryConfidence = horizontalAccuracyM === null
      ? "unknown"
      : horizontalAccuracyM >= boundaryDistanceM
        ? "accuracy-may-cross-region-boundary"
        : "within-reported-accuracy";
    return Object.freeze({
      kind: "ao.geographic-observation",
      worldId,
      status: "candidate-uncommitted",
      observation,
      regionId: region.id,
      address,
      addressKey: spatialAddressKey(address),
      quality: Object.freeze({
        horizontalAccuracyM,
        spatialResolution: accuracyResolution,
        regionBoundary: regionBoundaryConfidence,
        boundaryDistanceM
      }),
      requiresKernelValidation: true,
      mayMoveEnvoy: false,
      mayCommitWorldState: false
    });
  }

  function resolveGpsFix(position, options = {}) {
    if (!position || !position.coords) throw new TypeError("A browser GeolocationPosition is required");
    const c = position.coords;
    return resolveObservation({
      latitude: c.latitude,
      longitude: c.longitude,
      altitudeM: c.altitude,
      horizontalAccuracyM: c.accuracy,
      verticalAccuracyM: c.altitudeAccuracy,
      observedAt: position.timestamp ? new Date(position.timestamp).toISOString() : undefined,
      source: "device-gps",
      layer: options.layer ?? "ground"
    });
  }

  function resolveGisPoint(input) {
    return resolveObservation({
      ...input,
      source: input.source ?? "gis-reference"
    });
  }

  return Object.freeze({
    worldId,
    crs: "EPSG:4326",
    datum: "WGS84",
    regions: Object.freeze(registry.map(region => region.id)),
    findRegion,
    resolveObservation,
    resolveGpsFix,
    resolveGisPoint
  });
}
