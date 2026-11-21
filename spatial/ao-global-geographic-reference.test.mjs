import test from "node:test";
import assert from "node:assert/strict";
import { createGlobalGeographicResolver } from "./ao-global-geographic-reference.mjs";
import { resolveGeographicFeature } from "./ao-geographic-feature-registry.mjs";

const houstonRegion = {
  id: "houston-fixture",
  originLat: 29.76,
  originLon: -95.37,
  maxRadiusKm: 50,
  bounds: { south: 29.6, north: 29.9, west: -95.6, east: -95.1 }
};

function makeResolver(regions = [houstonRegion], options = {}) {
  return createGlobalGeographicResolver({
    worldId: "ao-geography-test",
    regions,
    ...options
  });
}

const provenance = {
  source: "Test GIS",
  license: "Test-only fixture",
  sourceId: "roads:feature:1",
  sourceVersion: "snapshot-1",
  featureClass: "road-centerline",
  confidence: "source geometry; topology unverified"
};

test("global WGS84 observations resolve to candidate-only AO addresses", () => {
  const resolver = makeResolver();
  const result = resolver.resolveGisPoint({
    latitude: 29.761,
    longitude: -95.369,
    horizontalAccuracyM: 4.5,
    verticalDatum: null,
    source: "test-gis",
    sourceRecordId: "point-1"
  });
  assert.equal(result.status, "candidate-uncommitted");
  assert.equal(result.address.geographic.crs, "EPSG:4326");
  assert.equal(result.observation.horizontalAccuracyM, 4.5);
  assert.equal(result.quality.spatialResolution, "coarser-than-cell");
  assert.equal(result.mayMoveEnvoy, false);
  assert.equal(result.mayCommitWorldState, false);
  assert.ok(result.addressKey.includes("houston-fixture"));
});

test("GPS browser fixes preserve altitude, accuracy and observation time", () => {
  const resolver = makeResolver();
  const result = resolver.resolveGpsFix({
    timestamp: Date.parse("2026-11-21T12:00:00.000Z"),
    coords: {
      latitude: 29.761,
      longitude: -95.369,
      altitude: 18,
      accuracy: 3,
      altitudeAccuracy: 7
    }
  });
  assert.equal(result.observation.altitudeM, 18);
  assert.equal(result.observation.horizontalAccuracyM, 3);
  assert.equal(result.observation.verticalAccuracyM, 7);
  assert.equal(result.observation.observedAt, "2026-11-21T12:00:00.000Z");
  assert.equal(result.observation.source, "device-gps");
});

test("unknown altitude stays unknown in observation while address uses local reference plane", () => {
  const result = makeResolver().resolveGisPoint({
    latitude: 29.761, longitude: -95.369, source: "test-gis"
  });
  assert.equal(result.observation.altitudeM, null);
  assert.equal(result.address.position.y, 0);
});

test("global resolver rejects invalid coordinates, bad bounds, overlap and uncovered gaps", () => {
  assert.throws(() => makeResolver().resolveGisPoint({
    latitude: 91, longitude: 0, source: "test"
  }), /latitude/);
  assert.throws(() => makeResolver([{
    ...houstonRegion,
    bounds: { south: 31, north: 30, west: -96, east: -95 }
  }]), /valid explicit WGS84 bounds/);
  const overlap = makeResolver([
    houstonRegion,
    { ...houstonRegion, id: "overlap" }
  ]);
  assert.throws(() => overlap.resolveGisPoint({
    latitude: 29.76, longitude: -95.37, source: "test"
  }), /multiple AO regions/);
  assert.throws(() => makeResolver().resolveGisPoint({
    latitude: 30.5, longitude: -95.37, source: "test"
  }), /not covered/);
});

test("antimeridian-crossing regional frames project the short way around the globe", () => {
  const resolver = makeResolver([{
    id: "dateline-fixture",
    originLat: 0,
    originLon: 179.9,
    maxRadiusKm: 50,
    bounds: { south: -0.2, north: 0.2, west: 179.5, east: -179.5 }
  }]);
  const result = resolver.resolveGisPoint({
    latitude: 0, longitude: -179.9, source: "dateline-test"
  });
  assert.ok(result.address.position.x > 0);
  assert.ok(result.address.position.x < 30000);
});

test("regional frame radius measures horizontal X/Z distance, not altitude", () => {
  const resolver = makeResolver([{
    id: "north-south-radius",
    originLat: 0,
    originLon: 0,
    maxRadiusKm: 10,
    bounds: { south: -1, north: 1, west: -1, east: 1 }
  }]);
  assert.throws(() => resolver.resolveGisPoint({
    latitude: 0.11, longitude: 0, source: "radius-test"
  }), /exceeds this region's local metric frame/);
  const samePoint = resolver.resolveGisPoint({
    latitude: 0, longitude: 0, altitudeM: 2000, source: "altitude-test"
  });
  assert.equal(samePoint.address.position.y, 2000);
});

test("regional registry is copied and frozen against caller mutation", () => {
  const region = structuredClone(houstonRegion);
  const resolver = makeResolver([region]);
  region.bounds.south = 29.8;
  region.id = "tampered";
  assert.equal(resolver.findRegion(29.76, -95.37).id, "houston-fixture");
  assert.deepEqual(resolver.regions, ["houston-fixture"]);
});

test("accuracy quality warns when GPS uncertainty can cross the AO region boundary", () => {
  const result = makeResolver().resolveGpsFix({
    timestamp: Date.now(),
    coords: {
      latitude: 29.60001,
      longitude: -95.35,
      altitude: null,
      accuracy: 20,
      altitudeAccuracy: null
    }
  });
  assert.equal(result.quality.regionBoundary, "accuracy-may-cross-region-boundary");
});

test("road centerline GeoJSON becomes a provenance-bearing, non-routeable spatial candidate", () => {
  const resolver = makeResolver();
  const candidate = resolveGeographicFeature({
    type: "Feature",
    id: "road-1",
    properties: { name: "Example Road", class: "local" },
    geometry: {
      type: "LineString",
      coordinates: [[-95.37, 29.76], [-95.369, 29.761]]
    }
  }, { resolver, provenance });
  assert.equal(candidate.status, "candidate-uncommitted");
  assert.equal(candidate.routeability, "not-routeable-until-topology-and-access-validation");
  assert.equal(candidate.provenance.license, "Test-only fixture");
  assert.equal(candidate.resolvedGeometry.length, 2);
  assert.equal(candidate.regionIds[0], "houston-fixture");
  assert.equal(candidate.mayMoveEnvoy, false);
  assert.equal(candidate.mayCommitWorldState, false);
});

test("entrance Point GeoJSON resolves to the same AO address system", () => {
  const resolver = makeResolver();
  const candidate = resolveGeographicFeature({
    type: "Feature",
    id: "entrance-1",
    properties: { entrance: "main" },
    geometry: { type: "Point", coordinates: [-95.37, 29.76] }
  }, {
    resolver,
    provenance: { ...provenance, sourceId: "entrances:1", featureClass: "entrance" }
  });
  assert.equal(candidate.geometryType, "Point");
  assert.equal(candidate.resolvedGeometry.regionId, "houston-fixture");
  assert.ok(candidate.resolvedGeometry.addressKey);
});

test("features crossing configured AO regions are flagged for explicit segmentation", () => {
  const resolver = makeResolver([
    {
      id: "west",
      originLat: 29.76,
      originLon: -95.5,
      maxRadiusKm: 50,
      bounds: { south: 29.5, north: 30, west: -95.8, east: -95.4 }
    },
    {
      id: "east",
      originLat: 29.76,
      originLon: -95.3,
      maxRadiusKm: 50,
      bounds: { south: 29.5, north: 30, west: -95.4, east: -95.0 }
    }
  ]);
  const candidate = resolveGeographicFeature({
    type: "Feature",
    id: "cross-region-road",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [[-95.5, 29.76], [-95.3, 29.76]]
    }
  }, { resolver, provenance });
  assert.deepEqual(candidate.regionIds, ["east", "west"]);
  assert.equal(candidate.requiresRegionBoundarySegmentation, true);
  assert.equal(candidate.routeability, "not-routeable-until-topology-and-access-validation");
});

test("geographic feature import rejects missing provenance and invalid GeoJSON", () => {
  const resolver = makeResolver();
  assert.throws(() => resolveGeographicFeature({
    type: "Feature", id: "x", geometry: { type: "Point", coordinates: [0, 0] }
  }, { resolver, provenance: { ...provenance, license: "" } }), /license/);
  assert.throws(() => resolveGeographicFeature({
    type: "Feature", id: "bad", geometry: { type: "Point", coordinates: [500, 95] }
  }, { resolver, provenance }), /latitude|longitude/);
});
