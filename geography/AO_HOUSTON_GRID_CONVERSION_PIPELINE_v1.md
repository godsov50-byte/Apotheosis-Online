# AO Houston Grid Conversion Pipeline v1

**Status:** implementation foundation; staging only. No Houston import is enabled by this document.
**Scope:** convert the existing Houston GIS project into AO's sparse square-cell spatial representation without replacing the map or changing live AO state.

## 1. Target architecture

`Source GIS → immutable source snapshot → normalized geographic feature → approved local metric frame → S2 geographic index → AO sparse square-cell raster → topology/access validation → Kernel proposal → WorldHeart commit`

Each stage has a distinct responsibility:

- **Source GIS:** reports what a publisher mapped. It is evidence, not world authority.
- **Immutable source snapshot:** retains original geometry, attributes, CRS, publisher, licence, retrieval time, source version and checksum.
- **Normalized geographic feature:** assigns a stable AO feature identity and preserves source identity/provenance.
- **Approved local metric frame:** transforms source coordinates into deterministic integer millimetres. It must have a reviewed CRS operation, origin, axis mapping, vertical reference policy and error budget.
- **S2 index:** supplies hierarchical geographic lookup and region/chunk discovery. S2 cells are not the playable cells and do not define road width or movement.
- **AO square-cell raster:** derives sparse, rebuildable occupancy from the canonical geometry. The same local grid can represent streets, buildings, sidewalks, tunnels, bridges and interiors.
- **Topology/access validation:** determines whether features connect, at what level, and for which movement permissions. Geometry overlap alone is not a confirmed connection.
- **Kernel/WorldHeart:** only Kernel-authorized changes become current world state and append-only committed history.

## 2. Coordinate safety gate

The current Houston profile `geography/profiles/houston-v1.json` is deliberately draft: its origin is unset, its source-to-working CRS operation is unset, its vertical reference is unknown and its approval is false. **Do not run Houston geometry through a city import until those fields are resolved and reviewed.**

There is also a coordinate-contract reconciliation task before runtime integration:

- The Houston adapter draft describes X=east, Y=south, Z=up.
- The existing generic spatial address resolver describes X=east, Y=altitude, Z=north.
- The Houston adapter draft describes 64×64 one-metre cells per 64 m chunk.
- The generic spatial resolver currently defaults to 1,024 m chunks, 64 m tiles and 1 m cells.

These are not silently interchangeable. A versioned Houston adapter must define the transform between the approved local metric frame, the generic spatial address axes, and the 2D rasterizer plane. Existing world coordinates and saved positions must remain unchanged.

## 3. Rasterizer contract

`spatial/ao-grid-rasterizer.mjs` accepts already transformed local metric geometry as integer millimetres:

- Geometry coordinates are `[u_mm, v_mm]` on a caller-selected horizontal grid plane.
- `levelMm` and `layer` are separate from horizontal cell coordinates, so a tunnel and a street may share horizontal cells without becoming the same space.
- `LineString` and `MultiLineString` produce **centerline candidate cells**, not walkable road surfaces.
- `Polygon` and `MultiPolygon` produce **surface occupancy candidates**, respecting interior rings/holes.
- Cells are sparse and deterministic; negative coordinates use floor-based indexing.
- A bounded `maxCells` prevents an unexpectedly large polygon from exhausting memory. Large features must be tiled/split by a deterministic upstream stage.
- Output retains the source feature ID, feature class, layer, level, cell size and derivation role.

Polygon occupancy uses half-open cell extents: cells are included where polygon area overlaps their interior; a boundary-only touch does not create a one-cell halo. Line rasterization uses a supercover rule so a diagonal centerline crossing a cell corner includes both side-adjacent cells. These are derived broad-phase indexes; the original vector geometry remains authoritative for exact collision/contact tests.

The rasterizer intentionally does **not**:
- project WGS84 or select a Houston origin;
- generate road surfaces from centerlines or infer road width;
- decide walkability, public access, legal crossing or turn restrictions;
- connect bridges/tunnels at geometric intersections;
- infer entrances, floors, basements or tunnel routes;
- write to Supabase, Kernel or WorldHeart.

## 4. Feature mapping and layers

| Source feature | Derived AO representation | Important restriction |
|---|---|---|
| Road centerline | Centerline candidate cells + graph candidate | Not a road surface or pedestrian route |
| Road surface polygon | Surface cells | Walkability/access still separately validated |
| Sidewalk/path polygon or line | Pedestrian-surface or path candidate cells | Source access and continuity must be checked |
| Building footprint | Building-footprint surface cells | Does not reveal interior, floors, entrance or occupancy |
| Bridge/deck | Elevated layer cells | Must retain vertical clearance and connector evidence |
| Tunnel path | Underground layer cells | Must preserve vertical separation and access restrictions |
| Tunnel portal | Explicit connector candidate | Must bind to a verified entrance and tunnel path |
| Interior floor | Building-local grid cells | Floor plan and floor-to-floor connectors must be authored or sourced |
| Terrain/elevation | Surface/Z evidence | Preserve units, vertical datum, resolution and uncertainty |

## 5. S2 relationship

S2 is the global geographic index, not the AO movement grid:

- Keep WGS84/source geometry and S2 cell identity as geographic lookup metadata.
- Use S2 parent/child relationships to partition and retrieve geographic coverage at appropriate scales.
- Map an AO chunk or source feature to one or more S2 cells by geometry coverage; retain the S2 level and library/version used.
- Do not assume one S2 cell equals one 64 m AO chunk or one square metre.
- Do not use S2 cell boundaries as road/building boundaries.
- Do not assign a gameplay cell by rounding latitude/longitude directly.

The main-branch global geographic reference currently provides WGS84 observations and bounded local metric region resolution. The S2 cell registry/schema is documented as a separate branch/PR layer; this pipeline defines the integration seam and does not claim that the S2 registry is already wired into Houston imports.

## 6. Pipeline stages

1. Register every publisher dataset, terms/licence, layer URL, source CRS, snapshot date and coverage claim in `HOUSTON_GIS_SOURCE_MANIFEST.md`.
2. Acquire bounded, complete, reproducible source snapshots. Check source counts, IDs, paging, null/invalid geometry and source edit time before accepting a snapshot.
3. Preserve raw source files and canonical checksums outside short-lived workflow artifacts.
4. Normalize geometry without dropping source attributes or identity.
5. Approve a versioned Houston coordinate profile and test round-trip error.
6. Produce canonical AO-local geometry in integer millimetres.
7. Attach S2 coverage/index metadata and AO chunk addressing.
8. Rasterize only supported geometry into sparse cells; retain derivation version and source feature IDs.
9. Audit road topology, grade separation, tunnel portals, building overlap, access, route continuity and coverage gaps.
10. Produce a machine-readable coverage/quality report and review queue.
11. Submit proposed world-state changes to the Kernel. Do not directly mutate WorldHeart state or event history from the GIS importer.

Every run is idempotent and versioned. A changed source produces a diff and new derived version; it must not silently overwrite a player/Kernel-authored world state.

## 7. Acceptance gates

- [ ] Coordinate profile approved; origin, CRS operation, axis mapping and vertical reference policy explicit.
- [ ] Source snapshots complete for the declared target extent and retained with checksums.
- [ ] Every derived cell can be traced to source feature(s) and a rasterizer/profile version.
- [ ] Re-running the same inputs produces byte-equivalent ordered cell output.
- [ ] Polygon holes, negative coordinates, exact cell boundaries and diagonal line crossings are tested.
- [ ] Surface, elevated, underground and building-local layers remain distinct.
- [ ] Centerlines are never treated as road surfaces.
- [ ] No unverified crossing, tunnel connection, entrance or access permission becomes a route.
- [ ] Coverage gaps and unknown vertical data remain explicit.
- [ ] No live AO world or production Supabase change occurs during Houston staging.

## 8. Immediate next work

This first implementation slice adds a pure deterministic rasterizer and contract tests. The next slices should be:

1. Reconcile and approve the Houston coordinate profile and adapter mapping.
2. Add the S2-to-AO chunk coverage bridge using the selected S2 implementation/version.
3. Add a bounded geometry conversion/tiling job that consumes archived GIS snapshots and the approved profile.
4. Rasterize the pilot area first (roads + footprints), compare cells against source geometry, and publish coverage diagnostics.
5. Extend the same pipeline to sidewalks, bridges and the downtown tunnel source after its schema, vertical reference and portal relationships are verified.

Do not start citywide rasterization until the coordinate approval gate is satisfied.
