# AO Houston Buildings & Roads World Builder

## Purpose

A single isolated Houston test workspace for developing the physical environment substrate: street geometry, building footprints, entrances, measured interior floor grids, room assignments, door connections, stair connections and local occupant placement.

This is an admin prototype and exportable proposal tool. It does not write to the live AO world, Kernel, WorldHeart or Supabase.

## Included

- Load user-supplied road centerline GeoJSON and construct a geometric graph from line segments and inferred intersections.
- Display imported building footprint GeoJSON as source reference geometry.
- Draw admin-authored building footprints and record name, purpose, floor count, notes and configured interior cell size.
- Add entrance records with access states, nearest road edge/projection and an explicit admin-confirmed connector state.
- Create per-floor measured grid plans. Each cell represents the configured cell size in metres; the default plan is 20 × 20 cells.
- Assign cells to named rooms with room types.
- Record door connections between adjacent room areas, with width derived from the number of selected door cells and cell size.
- Record stair connections between floors from designated stairwell areas.
- Place local occupant records into individual floor cells, preventing two occupants from using the same cell.
- Place an admin avatar on the nearest road segment.
- Save browser-local data and import/export a versioned JSON proposal.

## Important limitations

- Road topology is geometric. It does not establish sidewalks, legal crossings, pedestrian permissions, one-way restrictions, turn restrictions, bridge/tunnel levels or accessible routes.
- The nearest-road entrance connector is only a proposed straight segment. Admin confirmation is an assertion, not proof that the path is physically accessible or does not cross walls, fences, private property or water.
- The interior grid is a measured 2D planning substrate, not a finished 3D interior renderer, CAD/BIM model or structural engineering model.
- Door records are adjacency-checked connections between room cells, but detailed wall thickness, door swing, locking, visibility and movement-through-opening simulation remain future work.
- Stair records identify a stairwell and destination floor, but reciprocal stair geometry and continuous vertical movement are not yet simulated.
- Occupants are local placement records; they do not yet have persistent autonomous movement, collision, initiative or perception.
- The app uses Leaflet and OpenStreetMap tiles from external CDNs/services. Large Houston GeoJSON performance and real-device browser behavior require runtime testing.
- Browser local storage is not shared persistence. Export JSON for backup and transfer.

## Data authority

Imported GIS geometry is retained as source reference. Admin-authored buildings, entrances, room plans, doors, stairs and occupant positions are proposals in the isolated test workspace. Nothing becomes AO canon or live-world state automatically.

## Suggested validation sequence

1. Load a small road GeoJSON sample and verify graph counts and map rendering.
2. Load a building footprint sample; draw a separate test building.
3. Add an entrance, inspect the road projection and explicitly confirm only a physically checked connector.
4. Create rooms on multiple floors, assign cells, add adjacent-room doors and stair links.
5. Place occupants in cells and verify duplicate occupancy is rejected.
6. Export, clear, import and compare the project data.
7. Repeat on the full Houston datasets and supported mobile browsers before considering integration.
