# AO Geography — Architecture and Developer Guide

This directory separates three related but different concerns:

1. **Spherical geographic identity** — S2 cells identify locations on Earth and support global/regional hierarchy.
2. **Projected physical geometry** — source datasets such as Houston roads, parcels, footprints and tunnels retain their original geometry and are adapted into a local AO coordinate frame.
3. **World state** — the AO Kernel decides which evidence becomes entities, access rules, ownership, condition, navigation connections and other persistent world facts.

These layers must not be collapsed into one table or treated as interchangeable.

## Current entry points

| Path | Purpose | Status |
|---|---|---|
| `HOUSTON_SPATIAL_ADAPTER_SPEC.md` | Multi-resolution spatial architecture and safeguards | Design specification |
| `HOUSTON_GIS_SOURCE_MANIFEST.md` | Candidate Houston sources, provenance and coverage limitations | Working source register |
| `profiles/houston-v1.json` | Machine-readable Houston coordinate profile | Draft; origin deliberately unset |
| `adapter/coords.py` | Deterministic projected-coordinate/local-AO conversion | Implemented utility; requires approved profile |
| `database/migrations/20261121000100_ao_houston_spatial_features.sql` | PostGIS source/canonical geometry store | Migration artifact; not applied |
| `../docs/geography/houston-spatial-profile-and-storage.md` | Architecture walkthrough, data flow, setup and test guide | Developer documentation |
| `../tests/geography/` | Coordinate and profile contract tests | Python standard-library tests |

The S2 cell registry and its proposed `ao_geo` schema are a separate layer currently developed in other branches/PRs. This Houston feature store uses `ao_spatial`; it does not replace or duplicate S2 cell identity.

## Coordinate contract

- Working projected CRS candidate: EPSG:2278 (NAD83 / Texas South Central, US survey feet), matching the verified City of Houston road-centerline source metadata.
- AO local axes: X east, Y south, Z up.
- AO horizontal coordinates: integer millimetres.
- One surface cell: 1,000 mm (1 m).
- One chunk: 64 × 64 cells (64 m × 64 m).
- US survey foot to metre: exactly 1200 / 3937.
- Rounding: decimal half away from zero.
- The Houston profile origin is intentionally null until selected and approved.
- Vertical CRS/datum is unknown; this adapter does not transform Z.

Do not use the draft profile for import. A caller must load an approved profile with an origin and explicit transformation metadata; the adapter raises `ProfileNotReadyError` otherwise.

## Authority boundary

GIS records are evidence. PostGIS stores source and canonical geometry. Neither the database nor the map renderer decides that a feature is a canonical AO world entity. The Kernel validates and approves world-state changes; WorldHeart persists approved current state and append-only committed history. Frontend views render authorized state and must not write around the Kernel.

See the developer walkthrough for the complete data path and operational steps.
