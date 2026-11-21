# Houston Interior Crossing Candidate Audit

**Status:** Preliminary diagnostic complete. This report identifies geometric candidates; it does not declare intersections connected or make the AO road graph routable.

## Why this audit exists

The endpoint-only graph misses street intersections where a road's geometry crosses another road in the interior of a polyline. The new diagnostic identifies point intersections that are at least the configured distance from the endpoints of both paths. It deliberately does not change graph topology.

## Preliminary snapshot results

The verified 2026-11-21 City of Houston road-centerline snapshot was scanned locally:

- 83,760 source features (11 have null geometry)
- 84,267 line paths after splitting MultiLineString paths
- 2,672 interior-crossing point candidates at the default 2.0 m endpoint exclusion threshold
- Candidate crossing is geometric only; bridges, tunnels, rail crossings, duplicate/overlapping roads, ramps, and source data errors may appear in the results.

The 2.0 m threshold is a conservative filtering parameter for this review tool, not a new snap tolerance and not a Kernel movement rule. Distances are estimated from WGS84 coordinates using a local meters-per-degree approximation.

## Tool

Run the candidate audit:

```bash
python scripts/geography/audit_houston_interior_crossings.py \
  --input build/houston-road-network/roads.geojson \
  --output build/houston-road-network/interior-crossing-candidates.json \
  --interior-threshold-m 2.0
```

Self-test (Shapely 2.x required):

```bash
python scripts/geography/audit_houston_interior_crossings.py --self-test
```

Each candidate includes an approximate WGS84 location, distances from both path endpoints, source OBJECTIDs/GlobalIDs/centerline IDs, names/class/raw one-way value, and a review status. No connection is assumed.

## Review procedure

1. Overlay candidate points with the official City Nodes (layer 10) and Links (layer 12) datasets.
2. Compare names and geometry with source node/link semantics.
3. Identify bridges, tunnels, rail crossings, grade separation, ramps, and overlap artifacts.
4. Assign a reviewed classification with evidence and provenance.
5. Only approved at-grade junctions may be considered for graph updates; retain rejected/ambiguous candidates and the review history.

## Safety boundary

This output is a review queue only. It must not be used directly for driving, pedestrian routing, or authoritative Envoy movement. Kernel movement authority and live AO geography remain untouched.
