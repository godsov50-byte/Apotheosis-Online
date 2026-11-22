# AO Chess Houston — Centerline Visual Preview

Use this browser viewer to inspect the candidate road centerlines produced by the Houston preview pipeline.

## Steps
1. Run the Houston preview pipeline described in `ao-houston-road-preview-build.md`.
2. Open `tools/geography/houston-road-preview.html` in a browser (or serve it from a local static server).
3. Load `build/houston-road-network-preview/grid/road-centerline-cells.json`? **Note:** the current viewer loads the local-mm line geometry file `roads-local-mm.json` (use that file).
4. Pan by dragging and use Zoom / Fit controls.

The display is source centerline geometry only. It does not depict validated road widths, sidewalks, building footprints, crossings, intersections, or approved walkability.
