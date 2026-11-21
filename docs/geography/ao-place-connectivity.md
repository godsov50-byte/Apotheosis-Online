# AO Place Connectivity — Houston outward to Texas and the United States

## Purpose

Start at Houston and expand outward through a single geographic registry:

`Houston → Texas → United States → other U.S. states and territories → North America → global places`.

The graph answers **which place is contained in or connected to which**. It is separate from the coordinate resolver, road geometry, and building/interior geometry. Do not create a parallel map or addressing hierarchy.

## Relationship types

- `located-in`: administrative containment (city → state/province → country).
- `shares-land-border-with`: two administrative areas have a shared land boundary.
- `street-connected-to`: sourced road-network connection, distinct from administrative adjacency.
- `crossing-connects`: a specific sourced bridge, tunnel, pedestrian, road, rail, or border crossing.
- `transport-connects`: sourced ferry, maritime, rail, or air link. Mode and service constraints must be explicit.

Do not treat these relationship types as interchangeable. A shared border is not a usable travel route.

## Geographic expansion plan

### 1. Houston reference area

Houston remains the first detailed build area. The City of Houston COHGIS road-centerline source snapshot is a local source-backed foundation for its documented query scope. Its centerlines are not road surfaces and are not automatically a verified pedestrian routing graph. Preserve exact source feature IDs, geometry, source CRS, transformed coordinates, retrieval date, source version, and checksum.

### 2. Texas statewide coverage

Expand from Houston to all of Texas, not just the major metropolitan areas. The statewide coverage target includes:

- Municipal streets and local roads.
- County roads and rural roads.
- State highways and frontage roads.
- Interstate and U.S. highway segments.
- Bridges, tunnels, ramps, grade-separated junctions, and controlled-access links.
- Named and unnamed road segments, retaining unnamed features rather than dropping them.

Use TxDOT, county, municipal, and other authoritative public GIS sources where they provide suitable coverage. Maintain a consistent statewide backbone and source-specific overlays. Where local sources overlap the backbone, preserve both source identities and explicitly reconcile them; do not deduplicate on street name alone. Track counties/areas with complete, partial, stale, unavailable, or unverified coverage.

### 3. United States coverage

Seed the identities of all 50 U.S. states under the United States administrative node. These are identity/containment records only: state boundary geometry and road data remain pending until sourced and validated.

For nationwide road coverage, use a consistent national centerline dataset as the baseline (for example, U.S. Census TIGER/Line roads), then supplement it with state and local authoritative GIS where greater detail or more current geometry is available. Preserve the provenance and source-specific feature IDs of every imported feature. Do not pretend national coverage has uniform update dates, accuracy, completeness, or road-class detail.

Include Alaska and Hawaii as non-contiguous U.S. states. Do not draw fictitious road connections across water; air, ferry, maritime, and other transport links are separate sourced relationships. U.S. territories and tribal/indigenous jurisdictional geographies should be represented as distinct administrative/place records when their boundaries and identities are supported by approved sources, not silently folded into a state.

### 4. North America and global continuation

Continue through Canada, Mexico, Central America, and the rest of the world using the same place, coordinate, feature, and provenance contracts. Shared land borders establish adjacency only. Island and non-contiguous places require explicit sourced transport relationships.

## Road geometry and coordinate rules

- Global geographic interchange uses WGS84 / EPSG:4326; preserve each source's original CRS and transformation metadata.
- The source centerline is the canonical imported line geometry. A yellow map line is only a renderer style; screen pixels are never source geometry.
- Preserve exact source coordinates and geometry hashes. Display simplification, reprojection, zooming, snapping, or styling must never overwrite canonical coordinates.
- Centerlines, road-surface polygons, lanes, sidewalks, curbs, intersections, ramps, crossings, bridges, tunnels, and addresses are separate feature classes with explicit relationships.
- A geometric line crossing does not prove a legal, at-grade, traversable junction. Routing remains disabled until topology, grade separation, access, direction, restrictions, and pedestrian facilities are validated.
- Road records become locked only through the approved Sovereign + Kernel process. A source import or coverage map is not itself an approval to make a road canonical.

## Coverage and evidence tracking

Every acquisition must report its geographic scope, source and layer, source version/edit date, retrieval time, license/attribution, CRS, feature count, unique source IDs, missing/null geometries, invalid geometries, duplicate/conflicting IDs, pagination/transfer limits, and coverage gaps. State coverage as `not-started`, `in-progress`, `partial`, `validated`, or `locked`. Do not call Texas or the United States complete until the full intended scope has passed a coverage audit.

## AO spatial interpretation

A geographic place is not automatically one giant room. Country/state/city/district records provide identity, containment, labels, and search context. Playable regions/chunks/cells resolve through the existing global WGS84 → AO Region → Chunk → Tile → Cell → Position system. Buildings and interiors attach above the geographic base. Do not introduce a second room-addressing hierarchy.

GPS remains an untrusted candidate observation. Only Kernel-authorized movement may update Envoy state; only WorldHeart records committed results.

## Current scope and status

The machine-readable seed is `data/geography/ao-place-connectivity-starter.json`. It contains Houston → Texas → United States, all 50 U.S. state identity nodes, and the initial North American neighboring-country seed.

**Not yet present:** all 50 state boundary geometries, a complete Texas road snapshot, nationwide road imports, nationwide parcel/building datasets, a complete crossing/transport graph, or a deployed shared Kernel retrieval service. The next acquisition milestones are Texas-wide road coverage, followed by nationwide road coverage and per-region completeness audits.
