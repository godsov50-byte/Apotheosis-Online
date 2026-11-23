# Houston Spatial Adapter — Multi-Resolution Design (Draft v1)

**Status:** implementation specification; not production canon until reviewed and accepted.
**Branch:** `feature/houston-multiresolution-adapter-spec`
**Scope:** Houston staging environment only. No live-world writes.

## 1. Decision

Use a **single metric world coordinate system with multi-resolution presentation and computation**, not multiple incompatible coordinate scales.

- One AO surface cell represents **1 metre** horizontally.
- Existing fixed-point convention remains: **1,000 subunits per cell**, therefore 1 subunit = 1 millimetre.
- X increases east, Y increases south, Z increases up.
- Existing 64 × 64-cell chunks become 64 m × 64 m computational partitions.
- Store native source geometry at its original precision in a geographic reference layer. Grid cells are derived indexes/occupancy aids, never the sole copy of source geometry.
- Regional maps use level-of-detail aggregation over the same coordinates. They do not redefine what a cell means.
- Buildings, roads, parcels, sidewalks, water edges and other features retain vector geometry for precise collision, containment and routing. Cell occupancy is derived where useful.

This is a scale decision for the Houston adapter, not an instruction to blindly change every existing world's current coordinate scale. Existing worlds need an explicit, versioned scale profile and migration/compatibility plan.

## 2. Why this model

A 1 m surface cell is suitable for street-level movement and tactical positioning while retaining millimetre fixed-point subunits for sub-cell offsets and geometry transforms. A 64 m chunk is a useful local partition. A metro area should be sparse and lazy: do not create a dense row for every square metre. Persist source features and populated/active chunks; derive other cells and regional summaries on demand.

At continental or regional zoom, render aggregated roads, districts, terrain and building massing. At street zoom, render individual footprints and road surfaces. At interior zoom, use local building frames and floor-level geometry. All levels resolve to the same world coordinates.

## 3. Coordinate and transformation contract

1. Ingest source CRS, source dataset/version, feature ID, retrieval date, licence/terms, original attributes and original geometry.
2. Transform geometry into a documented local projected CRS suitable for the Houston area (use the appropriate NAD83 / Texas South Central StatePlane realization and units after validating source metadata; do not assume all services use the same CRS).
3. Define one AO Houston origin and axis convention. Convert projected coordinates to integer millimetre subunits using deterministic rounding.
4. Store the exact source geometry and the transformed canonical geometry, plus transformation pipeline/version and error budget.
5. Never use longitude/latitude degrees as planar AO movement coordinates.
6. Preserve source Z/height values with units and vertical datum when supplied. Unknown floor count, height, elevation or underground extent stays unknown; do not fabricate it.

The origin and CRS realization must be recorded in a versioned Houston spatial profile before importing features. Changing either requires a migration, not an in-place silent shift.

## 4. Data layers

### Immutable source/reference layer
Stores source feature identity, source geometry, source CRS, attributes, source URL/item/layer, retrieval timestamp, licence, source hash, transformation metadata and confidence. This layer is not player-editable world state.

### Canonical geographic feature layer
Stores normalized AO geometry and typed features: building footprint, parcel, road centerline, road surface, sidewalk, bridge, waterbody, terrain/elevation, entrance, tunnel path and other verified infrastructure. Geometry is retained as vector data (for example PostGIS geometry) with spatial indexes. A separate geometry service/store is acceptable if the current database cannot support it.

### AO world-state layer
The Kernel decides which imported features become world entities, their accessibility, ownership/control, condition, construction, occupancy, damage, use and current state. Imported GIS facts are evidence, not authority to invent world-state facts.

### Derived spatial indexes
Generate cell occupancy, chunk intersections, collision proxies, road graph edges, navigation costs, tactical tiles and render LOD from canonical geometry. Every derived record carries source feature IDs and derivation/version metadata so it can be rebuilt.

## 5. Feature mapping

| GIS feature | AO representation | Rules |
|---|---|---|
| Building polygon | building entity + canonical polygon + derived footprint | Polygon does not prove floors, occupancy, entrance or interior layout |
| Parcel polygon | parcel/land reference + possible rights evidence | Parcel boundary is not automatically ownership or jurisdiction |
| Road centerline | road graph candidate | Not a drivable/walkable surface by itself |
| Road surface polygon | road physical surface + width/shape | Prefer surface geometry where verified |
| Sidewalk | pedestrian surface | Keep separate from road carriageway |
| Bridge | structure + deck + vertical clearance/connection | Crossing grade and connectivity need validation |
| Tunnel entrance/path | entrance + below-grade path + access connection | Do not treat as ordinary street intersection |
| Elevation/terrain | terrain and Z evidence | Preserve vertical datum and resolution |
| Address/POI | address or point reference | Does not prove a physical entrance |

## 6. Navigation and collision

- Build a routable graph from validated road/sidewalk surfaces and verified connectors, not raw centerline intersections alone.
- Preserve one-way direction, road class, restrictions, bridge/tunnel grade separation, gates and access permissions when sourced.
- Distinguish candidate intersection, at-grade crossing, grade-separated crossing and verified connection.
- Use exact polygon/line geometry for collision and contact tests; grid occupancy is a broad-phase accelerator.
- Keep road existence, legal owner, maintainer, construction, condition, width and access as separate properties.
- Never infer public access from the presence of a road or parcel.
- Downtown tunnels are a vertical pedestrian network with access points, paths, buildings and restrictions. Connect them through explicit AO structural connections.

## 7. Data quality and confidence

Every feature has a confidence/status field: `source_verified`, `derived_candidate`, `needs_review`, `accepted_for_staging`, or `rejected`. Keep source coverage footprints and known omissions. A service's advertised extent or total feature count is not proof of complete coverage inside the AO target boundary.

Do not equate one footprint record with one physical building. Do not treat a parcel reference as an acquired parcel polygon. Do not assume a road centerline is a road surface. Do not infer floors, basements, entrances or tunnel access without evidence.

## 8. Import pipeline

1. Register dataset and licence in the source manifest.
2. Download/query in bounded geographic tiles with stable pagination and retries.
3. Validate CRS, geometry validity, duplicate IDs, null geometry, coverage and feature counts.
4. Preserve immutable raw snapshot and checksums.
5. Transform to the versioned AO Houston coordinate profile.
6. Normalize feature types and attributes without losing original fields.
7. Run topology checks: road endpoints, crossings, bridges, tunnels, building/road overlap, parcel/building relationships.
8. Generate derived cells, chunk intersections, collision proxies and graph candidates.
9. Produce a coverage/quality report and review queue.
10. Submit proposed world-state changes through Kernel validation and approval. Only accepted commits update WorldHeart current state and append-only history.

All import runs are idempotent and versioned. Re-importing a changed source produces a diff; it must not silently overwrite player or Kernel-authored world state.

## 9. Staging and acceptance tests

Use a separate Houston staging world and a small representative pilot area before city-scale ingestion. Test:
- coordinate round-trip and measured transform error;
- building polygon preservation and cell rasterization;
- adjacent buildings, narrow alleys and road-width/collision edge cases;
- sidewalk vs carriageway routing;
- one-way roads and grade-separated crossings;
- bridge and tunnel connectivity;
- downtown tunnel access restrictions;
- building entrance and floor transitions only where verified;
- sparse chunk creation and LOD consistency;
- import repeatability, source diffs and provenance;
- Kernel authorization, event append-only behavior and no live-world mutation.

Acceptance requires reproducible reports, no untraceable geometry, no unverified crossing promoted to a connection, and no source-only fact silently promoted into canonical world state.

## 10. Current implementation gaps

The inspected spatial schema stores occupied grid cells in `sp_footprints`; it does not provide a native source/canonical polygon store. The existing snapshot has a 96 × 64-cell world boundary, so it cannot represent Houston as a city-sized 1 m grid without removing or versioning that boundary. Several runtime modules import these constants directly.

Before changing runtime constants, implement and test:
- a versioned per-world spatial scale/profile;
- an AO geographic feature/provenance schema;
- sparse chunk addressing and bounds that do not impose the old small-world rectangle;
- geometry-to-fixed-point transform and deterministic rasterization;
- compatibility tests for existing world seeds and saved positions.

## 11. Explicit non-goals

This draft does not import GIS data, alter Supabase, modify the live world, change existing world coordinates, assert citywide building coverage, infer missing interiors, or make unverified data canonical. It defines the architecture and test gate for doing that safely.
