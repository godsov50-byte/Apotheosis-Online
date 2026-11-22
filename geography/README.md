# AO Geography — Architecture and Developer Guide

This directory separates three related but different concerns:

1. **Spherical geographic identity** — S2 cells identify locations on Earth and support global/regional hierarchy.
2. **Projected physical geometry** — source datasets such as Houston roads, parcels, footprints, waterways and tunnels retain their original geometry and are adapted into a local AO coordinate frame.
3. **World state** — the AO Kernel decides which evidence becomes entities, access rules, ownership, condition, navigation connections and other persistent world facts.

These layers must not be collapsed into one table or treated as interchangeable.

## Current entry points

| Path | Purpose | Status |
|---|---|---|
| `HOUSTON_SPATIAL_ADAPTER_SPEC.md` | Multi-resolution spatial architecture and safeguards | Design specification |
| `profiles/houston-v2.json` | User-selected downtown Houston map origin in EPSG:2278; still import-gated pending validation | Staging profile v2 |
| `AO_HOUSTON_GRID_CONVERSION_PIPELINE_v1.md` | Source-to-S2-to-sparse-square-cell conversion pipeline and acceptance gates | Implementation foundation; staging only |
| `../spatial/ao-grid-rasterizer.mjs` | Deterministic line/polygon geometry-to-cell rasterizer | Pure utility; requires local metric input |
| `../scripts/geography/build_houston_road_grid.py` | WGS84 road snapshot → EPSG:2278 → Houston-local integer millimetres | Preview-only while Houston v2 remains unapproved; preserves source IDs/attributes and projection metadata |
| `../scripts/geography/rasterize_houston_road_grid.mjs` | Converts local-mm road centerlines into sparse 1 m AO candidate cells | Bounded deterministic preview; centerlines are not walkable surfaces or route edges |
| `../tests/spatial/test_houston_road_grid.py` and `rasterize-houston-road-grid.test.mjs` | Coordinate conversion, approval gate, provenance and cell rasterization tests | CI contract tests |
| `.github/workflows/houston-road-grid-preview.yml` | Manual acquisition + full road-centerline preview artifact build | Manual-only; preview artifacts, no persistence or world commit |
| `../tests/spatial/ao-grid-rasterizer.test.mjs` | Rasterization contract tests | Node test suite |
| `HOUSTON_GIS_SOURCE_MANIFEST.md` | Houston source groups, attribution, coverage caveats and unresolved adapters | Working source register |
| `houston-source-catalog.json` | 36 registered ArcGIS feature layers covering roads, boundaries, parcels, addresses, buildings, sidewalks, trails, bikeways, water, transit, fire districts, flood hazard, safety risk, historic landmarks, emergency facilities and downtown tunnels | Staging catalog; HCAD ZIP, paid LiDAR, road nodes/links and additional assets remain unresolved |
| `../scripts/geography/acquire_houston_ao_sources.py` | Count-checked, paginated ArcGIS acquisition into provenance-preserving WGS84 GeoJSON with source attribution, geometry extents and optional field whitelists | Staging-only source converter; no world/database writes |
| `../.github/workflows/houston-ao-source-snapshot.yml` | Manual, bounded source acquisition for all catalog layers or selected IDs; uploads GeoJSON and manifests as an artifact | On-demand; source snapshot only, no live-world writes |
| `profiles/houston-v1.json` | Machine-readable Houston coordinate profile | Draft; origin deliberately unset |
| `adapter/coords.py` | Deterministic projected-coordinate/local-AO conversion | Implemented utility; requires approved profile |
| `database/migrations/20261121000100_ao_houston_spatial_features.sql` | PostGIS source/canonical geometry store | Migration artifact; not applied |
| `database/migrations/20261121000200_ao_houston_spatial_scaffold.sql` | Spatial objects, typed connections, and admin development queue | Migration artifact; not applied |
| `../docs/geography/houston-spatial-profile-and-storage.md` | Coordinate/storage architecture and developer walkthrough | Documentation |
| `../docs/geography/houston-admin-place-development.md` | Empty spatial scaffold and incremental admin workflow | Documentation |
| `ao-city-console.html` | Interactive text/GPS/tactical/navigation/narration/admin browser prototype | Local demo only; not Kernel-connected |
| `ao-houston-buildings-roads-world-builder.html` | Local Houston builder with a read-only overlay for converted AO source GeoJSON FeatureCollections | Local staging preview; source evidence only, not movement graph or live-world state |
| `ao-city-registry.js` | IndexedDB import, viewport rendering, search and inspection for street/building source artifacts | Local browser evidence cache; not trusted persistence |
| `../docs/geography/ao-city-console.md` | Console behavior, boundaries, and integration roadmap | Documentation |
| `consistency-registry.js` | Deterministic identity, retrieval, coordinate keys, correction proposals and generation manifests | Utility; not yet wired to trusted API |
| `../docs/geography/ao-deterministic-world-registry.md` | Identity, provenance, visual references, generation and correction contract | Implementation foundation |
| `database/migrations/20261121000300_ao_deterministic_registry.sql` | Persistent identity aliases, revisions, visual references and correction history | Migration artifact; not applied |
| `../scripts/geography/acquire_houston_road_centerlines.py` | Complete, count-checked City of Houston centerline acquisition | Local build; no database writes |
| `../scripts/geography/build_houston_street_registry.py` | Stable segment identities, source properties, name-search groups and count manifest | Local compiler; no database writes |
| `database/migrations/20261121000400_ao_houston_street_registry.sql` | Persistent street segment records, append-only property revisions and name observations | Migration artifact; not applied |
| `../docs/geography/ao-houston-street-registry.md` | Houston source, properties, identity and import contract | Implementation documentation |
| `../tests/street_registry/` | Street identity, grouping and null-preservation tests | Python standard-library tests |
| `../scripts/geography/acquire_houston_building_footprints.py` | Acquires H-GAC 2018 footprints intersecting the Houston city-limit polygon | Manual snapshot workflow; approximate LiDAR evidence |
| `../docs/geography/ao-integrated-city-registry-console.md` | Combined street/building import, provenance and console workflow | Implementation guide |
| `../tests/spatial/` | Coordinate and migration contract tests | Python standard-library tests |

The S2 cell registry and its proposed `ao_geo` schema are a separate layer currently developed in other branches/PRs. This Houston feature store uses `ao_spatial`; it does not replace or duplicate S2 cell identity.

## Coordinate contract

- Working projected CRS candidate: EPSG:2278 (NAD83 / Texas South Central, US survey feet), matching the verified City of Houston road-centerline source metadata.
- AO local axes: X east, Y south, Z up.
- AO horizontal coordinates: integer millimetres.
- One surface cell: 1,000 mm (1 m).
- One chunk: 64 × 64 cells (64 m × 64 m).
- US survey foot to metre: exactly 1200 / 3937.
- Rounding: decimal half away from zero.
- Houston v2 records the selected downtown map origin but remains blocked from authoritative imports until coordinate, source-operation, vertical-reference, error-budget and Kernel approval gates are complete.
- Vertical CRS/datum is unknown; this adapter does not transform Z.

Do not use the draft profile for import. A caller must load an approved profile with an origin and explicit transformation metadata; the adapter raises `ProfileNotReadyError` otherwise.

## Empty-space-first workflow

The spatial import establishes geometry and stable spatial identities. It does **not** populate every building interior, entrance, business, resident, or dungeon. The new spatial scaffold lets admins develop one location at a time:

- `spatial_objects` represents imported features and admin-created spaces.
- `spatial_connections` represents typed physical/navigation relationships.
- `admin_development_queue` tracks work to verify or flesh out a place.

A building footprint can exist with no entrances, floors, rooms, businesses, or residents. Those are added only when verified or intentionally authored. See [Houston Admin Place Development](../docs/geography/houston-admin-place-development.md).

## Authority boundary

GIS records are evidence. PostGIS stores source and canonical geometry and the admin-facing spatial scaffold. Neither the database nor the map renderer decides that a feature is a canonical AO world entity. The Kernel validates and approves world-state changes; WorldHeart persists approved current state and append-only committed history. Frontend views render authorized state and must not write around the Kernel.

The migrations are artifacts only; they have not been applied to Supabase. No live-world data has been changed.
