# AO Earth — Regional Grid Prototype

This is a standalone browser prototype for exploring Earth's first S2 regional grid.

## Open it

Open `index.html` in a modern browser with internet access. It loads Three.js and s2js as browser ES modules from public CDNs and loads an equirectangular Earth texture.

## Included

- Rotatable, zoomable 3D Earth.
- The 24 Level 1 S2 cells generated from the six Level 0 faces.
- Selectable cells with their S2 ID, parent face, level, center coordinates, and spherical area.
- Four-child subdivision of a selected cell.
- Reset to the 24-cell starting view.

## Technical basis

- S2 cell IDs and geometry: [s2js](https://s2js.org/) (Apache-2.0).
- 3D rendering and orbit controls: [Three.js](https://threejs.org/) (MIT).
- S2 cell hierarchy: [S2 Geometry documentation](https://s2geometry.io/devguide/s2cell_hierarchy).

The app uses S2's cell vertices and samples each great-circle edge for rendering. The Earth texture is a visual layer and is not used to calculate the grid.

## Prototype limitations

- This is a visual and interaction prototype, not yet the canonical AO geographic data service.
- It does not yet export GeoJSON or persist selected cells.
- Land imagery is a texture, not a validated coastline dataset.
- Surface area is calculated on a sphere using a mean Earth radius, not on the WGS84 reference ellipsoid.
- The app requires network access to load its CDN dependencies and texture.
