# AO Houston Buildings & Roads World Builder

## Purpose

A single isolated Houston test workspace for developing the physical environment substrate: street geometry, building footprints, entrances, measured interior floor grids, room assignments, door connections, stair connections and local occupant placement.

This is an admin prototype and exportable proposal tool. It does not write to the live AO world, Kernel, WorldHeart or Supabase.

## Included

- Automatically query the configured road-centerline and building-footprint ArcGIS FeatureServer sources for the initial map extent and again as the admin pans/zooms; visited extents are cached for the session. Manual GeoJSON/service imports remain available as fallbacks.
- Display imported building footprint GeoJSON or query an ArcGIS FeatureServer layer for the current map extent as source reference geometry.
- Draw admin-authored building footprints and record name, purpose, floor count, notes and configured interior cell size.
- Add entrance records with access states, nearest road edge/projection and an explicit admin-confirmed connector state.
- Bind one explicitly selected cell in an Entrance hall room as the interior threshold for an entrance.
- Enter/exit only through a bound, admin-confirmed portal after the avatar reaches the exterior threshold. Restricted entrances require matching actor permissions.
- Create per-floor measured grid plans. Each cell represents the configured cell size in metres; the default plan is 20 × 20 cells.
- Assign cells to named rooms with room types.
- Record door connections between adjacent room areas, with width derived from the number of selected door cells and cell size; doors may be open, restricted by permissions, or locked.
- Navigate between cells in the same room and between rooms only through explicit door records.
- Record a stair link only when one source landing and one destination landing are each assigned to a Stairwell room on their respective floors; the admin supplies a traversal-time estimate and confirms the link.
- Record stair connections between floors from designated stairwell areas.
- Place local occupant records into individual floor cells, preventing two occupants from using the same cell.
- Place an admin avatar on the nearest road segment.
- Save browser-local building/occupant data and import/export a versioned JSON proposal.
- Record local walk, enter and exit transitions in a separate browser-local spatial ledger, storing each immutable event and the actor's derived current address in one local-storage value.

## Important limitations

- Road topology is geometric. It does not establish sidewalks, legal crossings, pedestrian permissions, one-way restrictions, turn restrictions, bridge/tunnel levels or accessible routes.
- The nearest-road entrance connector is only a proposed straight segment. Admin confirmation is an assertion, not proof that the path is physically accessible or does not cross walls, fences, private property or water.
- The interior grid is a measured 2D planning substrate, not a finished 3D interior renderer, CAD/BIM model or structural engineering model.
- Door records constrain room-to-room routing, including open/restricted/locked states. Detailed wall thickness, door swing, collision through openings, visibility and physical door animation remain future work.
- Stair records now require explicit source/destination Stairwell cells and an admin-entered traversal duration. The route engine models this as a discrete floor transition; physical riser geometry, measured elevation and continuous vertical movement are not inferred.
- Occupants are local placement records; they do not yet have persistent autonomous movement, collision, initiative or perception.
- Automatic source loading is viewport-based, not a complete citywide offline download. It requires browser CORS access and source-service availability; failed requests need retry/manual fallback. The default H-GAC footprint source is partial-area, not citywide, so unmapped footprints remain gaps rather than fabricated buildings. Large Houston GIS performance and real-device browser behavior require runtime testing.
- Browser local storage is not shared persistence. The spatial transition ledger is separate from the building proposal export and is not a portable or authoritative world history.
- The local ledger's single-key write is a staging-only atomicity approximation. It is not multi-tab safe, authenticated, durable across browser data clearing, or a production WorldHeart adapter.
- The shared repository contract now requires an expected-origin compare inside commitTransitionAtomic, so a real adapter must reject stale movement/portal commits in the same transaction that appends history and updates current position.

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


## Local walking simulation preview

The builder now imports the isolated AO spatial movement module and adds a two-step walking preview:

1. Place the blue admin avatar on the road graph.
2. Select a building and its entrance.
3. The entrance must be usable and its road connector must be explicitly marked "Confirmed by admin".
4. Preview the candidate route in amber.
5. Inspect it, then explicitly click "Confirm route & walk" to approve that route for this local staging run.
6. The blue avatar advances along the route using the movement engine's elapsed-time integration and the selected walking speed.

This is a local, reversible staging assertion. The generated graph edges are marked accepted_for_staging only for the preview run; they are not source-verified road topology, persistent world state, or canon. The preview does not currently add building-footprint collision obstacles, simulate sidewalk width, or validate crossings. Reaching the entrance connector is not the same as entering a building. A portal must be explicitly bound to one cell in an Entrance hall room; the actor must be at that exterior threshold, and the road connector and interior binding must both be admin-confirmed. Entry/exit creates immutable enter/exit transition records and updates the local current address. Restricted entrances require the actor to possess the declared permission set.

The browser preview uses the same movement module as the deterministic unit tests. A static contract test extracts the module script and runs Node's syntax checker during CI.


## Exterior-to-interior transition and persistence staging

The builder now uses the shared spatial resolver for exterior coordinates and floor-local interior addresses. A portal binds a building entrance to one measured interior grid cell in an Entrance hall room. The binding records building, entrance, floor, room, row/column, cell size, access state and the admin confirmation provenance. The resolver keeps the physical exterior threshold linked to the interior address while treating the interior as a separate simulation space.

The local workflow is:

1. Place the blue avatar on the road graph; this establishes a browser-local spatial baseline.
2. Walk the approved-for-staging route to the selected entrance. On arrival, the builder appends one walk event and updates the local current address.
3. Assign selected interior cells to a room whose type is Entrance hall.
4. Select the entrance and exactly one cell in that room, then bind it as the interior threshold.
5. Enter only while the avatar is at the entrance threshold, the connector is admin-confirmed, the access state is usable, and any restricted-access permissions are present.
6. Exit through the same bound threshold. The ledger records each transition and updates the current address.

spatial/ao-building-transitions.mjs provides portal validation, address resolution, stale-origin checks, a Kernel authorization seam and a browser-local staging adapter. The generic spatial repository passes expectedOriginAddressKey to the adapter; a production adapter must compare it atomically before appending the event and updating current state.

**Production boundary:** the repository does not yet expose a production Kernel authorization implementation or a WorldHeart-backed spatial adapter for this workflow. authorizeAndCommitSpatialTransition() requires a real kernel.authorizeSpatialTransition() implementation and a repository adapter. The Houston builder deliberately uses only localStorage and labels these records as staging-only. No Supabase migration is applied and no live AO world state is written.


## Interior navigation and floor transitions

The builder now includes a deterministic interior route engine in `spatial/ao-interior-navigation.mjs`.

- Each assigned room cell becomes a navigable node. Unassigned cells are not walkable.
- Orthogonally adjacent cells in the same room connect automatically.
- Crossing between different rooms is blocked unless an explicit door record connects the two sides. Door states are `open`, `restricted` (requires every listed actor permission), or `locked` (not routeable).
- A stair link is created only from one selected source cell in a Stairwell room to one explicitly identified destination cell in a Stairwell room on another floor. The administrator supplies a positive traversal duration in seconds. The action is an explicit staging confirmation.
- Route planning minimizes estimated elapsed seconds, using configured cell size / walking speed for room movement and the admin-entered duration for stairs.
- The admin selects one destination cell, previews the route, then explicitly confirms movement. Each completed cell crossing or stair transfer creates an immutable `walk` or `stairs` event and updates the browser-local current address through the same expected-origin commit contract.
- The actor must return to the bound entrance threshold before exiting. The builder does not silently teleport an actor back outdoors.

The stair duration is a planning input, not a measured universal stair speed. Floor elevations and vertical geometry remain unknown. The interior grid is still a 2D occupancy/navigation substrate: walls are represented by absent/unassigned cells and door links, not by surveyed wall solids; no continuous body collision, door swing, line-of-sight, or 3D movement is claimed. All interior events remain in the Houston browser-local staging ledger. This does not connect live Kernel or WorldHeart persistence.
