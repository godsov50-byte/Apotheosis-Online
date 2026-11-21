# AO Spatial Movement Kernel v0.1

**Status:** implemented as a deterministic, dependency-free staging module with unit tests. It is not connected to the live Kernel, WorldHeart, Supabase, or the Houston browser builder. No live-world state or database was changed.

## What this slice provides

- A directed navigation graph. Every edge must be explicitly marked routingApproved=true and have an accepted status. Raw GIS centerlines, inferred intersections, unverified sidewalks, and candidate connectors are excluded by default.
- Mode-specific route access, actor movement capabilities, permission gates, and edge speed limits.
- Dijkstra route planning by estimated travel time rather than edge count.
- Continuous 3D position interpolation along approved edge geometry. Positions are not snapped to the 1 m address cell.
- Swept-circle collision checks against static obstacles and currently occupied actor positions. A moving actor stops just before the first detected collision.
- An adapter hook (addressAtPosition) so the caller can resolve the returned position through the canonical spatial-address resolver without making this module the persistence authority.
- Movement result data (origin, destination, distance, elapsed time, route cursor, blocker, status) for a later Kernel/WorldHeart commit adapter.

## Movement time and AO calendar time

Movement baselines are metres per elapsed movement-simulation second. In the online server, this delta should be measured with a monotonic clock; the baseline therefore reflects real-world travel speed (e.g. 1.2 m/s walking). It must not be multiplied or divided by the AO calendar ratio.

The AO calendar runs independently: one AO day (86,400 AO seconds) elapses over three real days (259,200 elapsed real seconds). Therefore:

AO calendar seconds = elapsed real seconds / 3

For example, 3 real seconds of normal walking advances the character 3.6 m and advances the AO calendar by 1 AO second. This separation avoids making characters walk at one-third real-world speed simply because the fictional calendar is slower.

## Graph contract

Each node has a stable ID and metric {x,y,z} position. Each directed edge has:

- from, to, and optional polyline geometry;
- modes (for example walk, bicycle, urban_car);
- routingApproved=true;
- status (source_verified, accepted_for_staging, or verified);
- optional speedLimitMps, requiredPermissions, kind, and provenance.

A reverse direction requires a separate directed edge. This preserves one-way rules rather than inferring bidirectional access. Geometry and route approval are separate: a source road line does not prove a legal pedestrian or vehicle path.

## Route and collision behavior

planRoute() finds a minimum-time directed path for one movement mode and actor permission/capability set. It returns unreachable rather than inventing a connector. Edge speed limits cap the actor's configured speed.

resolveMovementStep() accepts the route cursor (edgeIndex, edgeProgressM) returned by the prior step. It advances over one or more edges for the supplied elapsed time. Static obstacles and other actors are treated as circles swept against each traversed segment. This is a conservative first collision model, not a full polygon/physics engine. Exact building, wall, door, road-surface and terrain geometry still needs to replace or refine these broad-phase circles.

## Intentionally not claimed

- No live Houston road graph is yet eligible for routing. Existing road-centerline data remains source evidence until intersections, grade separation, mode access, sidewalks/crossings, and edge approval are validated.
- No automatic address-to-door mapping or building interior route has been wired. Building entrances and interior grids remain admin-authored candidates until connected and verified.
- No vehicle traffic, lane-level dynamics, turn restrictions, pedestrian sidewalk model, elevation/terrain cost, water/flight movement, group formations, initiative, or battle movement engine.
- No live GPS input, anti-spoofing, chunk streaming, persistence adapter, or Supabase migration.
- Collision circles do not replace exact polygon/mesh collision. The route graph is not built from arbitrary GIS lines.

## Next integration gate

1. Convert a reviewed pilot network into explicitly approved directed edges.
2. Map address anchors to verified entrance connectors and interior doorway nodes.
3. Bind actor state and movement intents to Kernel validation.
4. Commit accepted positions and immutable movement events atomically through the existing WorldHeart/ledger model.
5. Add a route test from an address anchor, along a verified street/sidewalk, through a building entrance, into a floor/room, and into a battle instance.

All of these steps remain staging work until independently implemented and verified.
