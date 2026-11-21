# AO Spatial Addressing & Resolution v1

## Status

**Implemented as a standalone, dependency-free JavaScript resolver and persistence contract. Not yet wired into the live AO Kernel, WorldHeart, Supabase project, or Houston admin UI.** The SQL migration is a reviewed implementation proposal in this repository; it has not been applied to any database.

This package is the shared addressing foundation intended to replace disconnected coordinate schemes. It does not make GPS, the map, or a room grid the authority for world truth.

## Files

- \`spatial/ao-spatial-addressing.mjs\` — pure deterministic resolver, address validation, chunk records, transition records, and storage adapter contract.
- \`spatial/ao-spatial-addressing.test.mjs\` — Node built-in test suite.
- \`supabase/migrations/20261121000100_ao_spatial_addressing.sql\` — additive database schema proposal; not deployed.

Run tests from the repository root with:

\`\`\`bash
node --test spatial/ao-spatial-addressing.test.mjs
\`\`\`

Requires Node.js 18+ and no third-party JavaScript dependencies. A test-only Houston coordinate-frame example is provided at `spatial/examples/houston-test-region.json`; it is not an approved geographic boundary or production region registry.

## Address hierarchy

Every address has the same stable shape:

\`World → Region → Chunk → Tile → Cell → Position\`

AO's existing experimental world uses an XZ ground plane with Y vertical. This resolver follows that convention: X is east/west, Z is north/south, and Y is elevation/depth. Geographic longitude projects to X, latitude to Z, and GPS altitude to Y. This keeps the resolver compatible with the current AO movement model rather than introducing a competing Y-ground/Z-up convention.

The address also records:

- \`layer\`: ground, interior, underground, aerial, water, subsurface, or instance.
- \`spaceId\`: geographic region space, building/floor local space, underground site, or instance namespace.
- \`parentLocationId\`: containing building/site where applicable.
- \`floorId\` and \`roomId\`: interior references.
- \`instanceId\`: isolated simulation context.
- \`physicalAddressKey\` and \`exteriorAddressKey\`: links back to the underlying physical place.
- \`coordinateSource\` and optional WGS84 geographic source coordinates.
- \`grid\`: integer 3D chunk/tile/cell indices and the configured metric dimensions.

### Default 3D grid

| Level | Default dimension |
|---|---:|
| Chunk | 1,024 m × 1,024 m × 1,024 m |
| Tile | 64 m × 64 m × 64 m |
| Cell | 1 m × 1 m × 1 m |

These are engineering defaults, not AO canon. Configure them per world/region. X, Y and Z all participate in the identifiers, and the spatial layer is part of the chunk/tile/cell namespace. An aerial position 120 m above ground therefore resolves to a different layer namespace and vertical tile/cell on the Y axis from the ground position even when its horizontal coordinates match.

The identifiers use mathematical floor, including for negative coordinates, so positions west/south/below the region origin remain deterministic.

## Geographic coordinates and GPS

\`resolveGeographic()\` accepts WGS84 latitude/longitude and an optional altitude. It selects a region only when exactly one configured region bounds box contains the point, or uses an explicitly supplied \`regionId\`. It refuses uncovered or ambiguous coordinates instead of inventing a region.

Each region defines an origin and a local metric coordinate frame. Version 1 uses a local equirectangular approximation suitable for regional maps, not a single global projection. The resolver enforces a configurable maximum radius (250 km by default) to prevent silently stretching one local frame across a continent. Large worlds need multiple approved region frames and an explicit region-to-world transform strategy.

Altitude is stored as Y in metres, but its vertical datum must be supplied and governed by the integrating source. The resolver does not decide whether a device reports ellipsoid height, mean sea level, floor-relative height, or another datum. Unknown altitude should not be presented as verified elevation.

GPS is an input source, not an authority. Device readings can be inaccurate, spoofed, unavailable indoors, or stale. The Kernel must validate movement, speed, access, collision, permissions, and transition legality before committing a new entity address.

## Address-point entrance anchors and map signs

\`resolveAddressAnchor()\` turns a source address point into a stable AO entrance-anchor record and a presentation marker.

- The anchor retains the exact WGS84 address-point latitude/longitude and its source ID/version.
- The anchor is resolved through the configured geographic region into the same deterministic chunk, tile and cell hierarchy used by other world positions.
- The small location sign references that anchor and its spatial-address key. It does not create a second world position, collision body, or route origin.
- A visual offset such as 24 screen pixels upward is presentation-only. It never changes the stored coordinate or tile assignment.
- Two address points on opposite sides of a road remain separate anchors with their own source coordinates.
- A 2D address point does not provide surveyed elevation. The resolver uses the region's local vertical reference plane for indexing and explicitly marks the physical vertical position as unknown.

The anchor ID is stable for the AO address ID within its world and region. Source corrections should create a versioned coordinate/relocation record in the integrating persistence layer; this pure resolver does not silently mutate history or persist records.

Example:

\`\`\`js
const anchor = resolver.resolveAddressAnchor({
  addressId: "ao-address-100",
  sourceId: "COH_SiteAddresses:OBJECTID:100",
  sourceVersion: "source-snapshot-id",
  latitude: 29.761,
  longitude: -95.369,
  regionId: "houston-test"
});

// The marker points to anchor.spatialAddressKey.
// Its screen offset affects rendering only, never world coordinates.
\`\`\`

## Interiors and buildings

\`resolveInterior()\` creates a local coordinate namespace for a building and floor. It keeps the exterior address key as a reference and records the building/floor/room identity. The interior grid is not confused with the geographic road grid, but it remains attached to the building's physical location.

A building/entrance integration must explicitly map a verified entrance to an exterior address and an interior doorway/cell. The current Houston builder has proposed footprints, entrance points and floor grids; it does not yet export this module's canonical address contract. No entrance or floor mapping is silently inferred.

## Battle and other instances

\`resolveInstance()\` creates an isolated address namespace for a battle, private room, or other simulation instance while retaining a reference to the source address.

- \`sameSimulationSpace()\` distinguishes participants in different instances.
- \`samePhysicalPlace()\` can identify that an instance is anchored to the same physical place as its source.
- An instance can maintain its own occupancy, collision, visibility, initiative and local state without pretending it is a second geographic building.
- On instance exit, the Kernel resolves the intended return address and commits an \`instance-exit\` transition. The library does not choose a return point.

This supports both a private instance per party and shared physical encounters, provided the Kernel decides which entities share an instance.

## Aerial movement and teleportation

Aerial addresses use the same region/chunk/tile/cell hierarchy with \`layer: "aerial"\` and a Z coordinate. Z participates in 3D tile/cell identity. Ground and air remain separate layers even when their horizontal coordinates match.

Teleportation resolves the destination through the same resolver and creates a transition record containing immutable origin and destination addresses. This library does not authorize the teleport, check range/cost/anchors, or resolve arrival safety; those are Kernel rules.

## Persistence contract

\`createSpatialRepository(adapter)\` expects these adapter operations:

- \`getChunk(chunkId)\`
- \`putChunk(chunkRecord)\`
- \`getEntityAddress(entityId)\`
- \`commitTransitionAtomic({ event, destinationAddress, destinationChunk })\`

The atomic commit operation must append the transition ledger event and update the entity's current address in one database transaction. It must not accept a client-supplied event as authoritative without Kernel validation.

Chunks are retrieved by deterministic ID. Missing chunk metadata can be initialized; an unloaded chunk is not deleted. Persisted state and the append-only history are separate: chunk/entity records represent current derived state, while transition rows record committed history.

The connected AO account currently exposes two different database models: the invitation-demo project has an empty `ao_*` world schema, while the populated Grand Meridian experiment uses `exp_regions`, `exp_chunks`, `exp_entities`, `exp_event_ledger` and existing Kernel RPCs. The experimental world uses an XZ ground plane with Y vertical. This resolver follows that axis convention. A production adapter must extend the selected existing schema and reuse its append-only ledger/RLS rules; it must not create a parallel chunk/entity/ledger system. **No SQL migration has been included or applied in this first slice.**

## Authority boundary

1. GPS, map imports, admin geometry and player intent are inputs/proposals.
2. The Kernel resolves movement, access, occupancy, collision and transition legality.
3. WorldHeart commits current spatial state and append-only transition history.
4. Azimah narrates the committed result within the observer's permitted knowledge.

The module is deliberately not allowed to write directly to Supabase or decide world truth. No client can promote a candidate road, entrance, room, chunk, or teleport destination into canon.

## Not implemented by this first slice

- Live GPS device integration or anti-spoofing.
- Supabase adapter, schema migration, transaction RPC and live RLS integration test. These must be designed against the selected existing AO project schema rather than introduced as duplicate tables.
- Automatic conversion of the current Houston builder's local-storage JSON into canonical addresses.
- Verified street/sidewalk topology, pedestrian access, collision, doors, stairs, LOS, movement simulation, or combat initiative.
- Full globe projection and region-boundary transforms.
- Vertical datum normalization and surveyed floor elevations.
- Chunk streaming scheduler, cache eviction policy, background prefetch, and distributed cache invalidation.
- Automatic battle-instance creation/selection or teleport authorization.

Those are explicit integration stages, not capabilities claimed by this package.
