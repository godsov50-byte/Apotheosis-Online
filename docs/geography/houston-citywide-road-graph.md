# Houston Citywide Road Graph — implementation contract

**Scope:** City of Houston, using the official centerline filter already defined in `data/geography/houston-road-network.json`. The 83,760 figure is a source observation from 2026-11-20, not a hard-coded import target.

## Build sequence

1. Acquire a stable source snapshot:
   `python scripts/geography/acquire_houston_road_centerlines.py --output-dir build/houston-road-network`
2. Build a conservative endpoint graph:
   `python scripts/geography/build_houston_road_graph.py --input build/houston-road-network/roads.geojson --output-dir build/houston-road-network`
3. Run the graph builder self-test:
   `python scripts/geography/build_houston_road_graph.py --self-test`

Outputs are local build artifacts and are not automatically committed, uploaded to Supabase, or written to live AO state:
- `roads.geojson`: immutable source snapshot
- `manifest.json`: source edit stamp, count, and SHA-256
- `graph.json`: deterministic AO node/edge candidate graph
- `topology-report.json`: component and degree diagnostics

## Graph rules

- Every source line path becomes an edge with source GlobalID, OBJECTID, centerline ID, name, class, raw direction/speed/lanes, jurisdiction sides, full geometry, and measured length.
- Endpoint pairs within the configured 1.5 m default tolerance are grouped into candidate junction nodes. IDs are deterministic from rounded node coordinates and source identity for edges.
- The graph is initially undirected. Source direction values remain raw. No driving or walking route is authorized by this build.
- Interior crossings are intentionally not joined. A visual crossing may be a bridge, tunnel, rail crossing, or other grade-separated feature. Do not infer at-grade connectivity from line intersection alone.
- City Nodes and Links layers remain independent reference data until a defensible geometry/ID crosswalk and special-node semantics are verified.
- The report exposes connected components and degree distribution. A large component is not proof of completeness; isolated components and degree-1 nodes require review.

## Required next validation before operational routing

1. Acquire and snapshot the official Nodes (layer 10) and Links (layer 12) reference layers, preserving their own IDs and source timestamps.
2. Establish crosswalks using documented IDs or spatial/name evidence with confidence scores; never silently equate IDs from different services.
3. Detect interior line-crossing candidates with spatial indexing, then classify at-grade vs bridge/tunnel/rail separation using authoritative attributes or reviewed source evidence.
4. Validate one-way, speed, lanes, access and turn restrictions from source coded-value domains and related authoritative records.
5. Add pedestrian paths/sidewalks as a separate graph; road centerlines do not prove pedestrian access.
6. Route known origin/destination test pairs, boundary connector cases, one-way cases, grade-separated crossings and disconnected-road cases.
7. Publish only a reviewed, versioned graph into a separate staging geography registry. The AO Kernel remains the authority for movement; Supabase stores records and history but does not decide movement.

## Geographic hierarchy

The Houston street graph is the citywide geographic substrate. Downtown remains the first detailed construction zone. Buildings, parcels, entrances, sidewalks, interior doors, corridors and stairs are separate connected layers attached to this shared geography. This work does not alter the Grand Meridian experimental world or the existing live world.

## Cloud build

The repository workflow `.github/workflows/houston-road-network-build.yml` runs the self-test, downloads the full filtered Houston snapshot, builds the endpoint graph, and uploads the four outputs as a 14-day GitHub Actions artifact. It runs on relevant pushes to `feature/houston-gps-spatial-data` and supports manual dispatch. The workflow uses read-only repository permissions and does not write to Supabase or AO world state.
