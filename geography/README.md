# AO Earth — S2 Geographic Registry

This browser app is the first structured geographic registry layer for AO. It uses S2 as the authority for spherical cell identity and geometry; Three.js only renders that data.

## Open it

Open `index.html` in a modern browser with internet access. The app loads Three.js and `s2js@1.44.0` from public CDNs and loads an Earth texture for visual reference.

## Current capabilities

- Rotatable and zoomable 3D Earth.
- Six S2 Level 0 face records and all 24 Level 1 cell records.
- Selectable cells with stable S2 identity, parent face, level, center, and spherical area.
- Four-child subdivision with parent/child links retained in the registry.
- Edge-neighbor and vertex-only neighbor references at the same S2 level.
- Exact S2 corner vertices plus sampled points along the four great-circle edges.
- Expanded-cell state restored from this browser's local storage.
- Export of the explored geographic registry as `ao-geographic-registry-v1.json`.

## Geographic record schema

Each cell record includes:

| Field | Meaning |
| --- | --- |
| `cellId` | Fixed-width 16-digit hexadecimal S2 ID; stable cell identity |
| `token` | Canonical compact S2 token |
| `face`, `level` | S2 cube face and subdivision level |
| `parentCellId` | Parent S2 cell ID, or null for a Level 0 face |
| `childCellIds` | The four direct child IDs (empty at maximum S2 level) |
| `center` | Center latitude/longitude and normalized XYZ direction |
| `boundary` | Four exact S2 vertices and sampled great-circle edge points |
| `area` | Exact spherical area in steradians and km² using mean Earth radius |
| `neighbors` | Four edge neighbors, vertex-only neighbors, and all touching neighbors; edge order follows S2 face-space down/right/up/left, not compass directions |

The registry checks that cells have four distinct edge neighbors, that all edge neighbors appear in the full touching-neighbor set, and that each subdivision has four unique children whose areas conserve the parent area. The app also verifies that the 24 Level 1 cells cover 4π steradians.\n\nThe exported document includes a schema version, coordinate and area model metadata, the currently visible frontier, and all records explored in the current browser session.

## Important geographic rules

- S2 cell IDs are the identity. Names, labels, countries, and descriptive metadata must never replace them.
- S2 has six Level 0 cube faces. Each subdivision creates four children following S2's Hilbert-curve order. Child order is not a compass-direction naming scheme.
- Cell boundaries are quadrilaterals made from four minor great-circle arcs. The sampled ring is a rendering/export aid; the four canonical vertices plus the S2 edge model define the boundary.
- Neighbor relationships are geometric. Edge neighbors share an edge; vertex-only neighbors touch at a point.
- S2 geometry is spherical. Area values use a mean Earth radius and are not WGS84 ellipsoidal areas.
- Land imagery is only a visual texture. It is not a validated coastline, elevation, bathymetry, or political-boundary dataset.

## Persistence boundary

The current prototype saves the expanded-cell view in the browser's local storage and can export all generated records to JSON. This is device/browser-local persistence, not yet a shared AO database or server-authoritative geographic service. The exported JSON is the handoff artifact for later ingestion into AO's canonical data store.

## Dependencies

- [s2js](https://s2js.org/) 1.44.0 — Apache-2.0
- [Three.js](https://threejs.org/) 0.170.0 — MIT
- [S2 cell hierarchy documentation](https://s2geometry.io/devguide/s2cell_hierarchy)
