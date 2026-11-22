# AO Houston Road Network Preview — One-command build

This wrapper executes the existing four-stage road pipeline as one reproducible local build. It does **not** make the Houston staging profile canonical or import data into AO persistence.

## Prerequisites

- Python 3.12+
- `pyproj==3.7.2` (for the coordinate conversion stage)
- Node.js (for sparse rasterization)

## Build

From the repository root:

```bash
python -m pip install pyproj==3.7.2
python scripts/geography/build_houston_road_preview.py --plan
python scripts/geography/build_houston_road_preview.py --preview-only
```

Outputs are under `build/houston-road-network-preview/`:
- `source/`: original GeoJSON snapshot, acquisition manifest, compiled street registry and registry report.
- `grid/`: Houston-local integer-mm preview geometry, manifest, sparse centerline candidate cells, and cell manifest.
- `BUILD_SUMMARY.json`: source record count, geometry gaps, registry group counts, transformed vertex count, candidate-cell count and checksums.

The source acquisition checks completeness against the publisher's independent count and ID list, captures the publisher edit timestamp before/after, and refuses mixed-time snapshots. A failed stage stops the pipeline.

## Safety and interpretation

- This is a preview-only build. Houston profile v2 has not passed the required coordinate/axis/accuracy approval gate.
- Centerline cells are **not** road-surface cells, sidewalks, walkable areas, legal route edges, or confirmed intersections.
- The wrapper never writes to Supabase, Kernel, or WorldHeart.
- No raw source snapshot is committed to Git.
- Generated outputs should be retained locally or as short-lived CI artifacts and checked for completeness before further AO integration.

## Tests

Run the focused contract tests:

```bash
python -m unittest tests.street_registry.test_acquisition_and_sql_contract tests.street_registry.test_houston_street_registry tests.street_registry.test_preview_orchestrator
```
