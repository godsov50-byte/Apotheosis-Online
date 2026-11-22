# AO lightweight address-box projection

## Decision

Keep the Houston road pipeline, building entrance records, and interior-destination validation unchanged. Add a small address-box projection beside them; do not replace the builder's existing building or interior data.

## Minimal model

An address box is a lightweight addressable space derived from a building entrance. It carries:
- stable box ID and source building ID;
- optional address, type, footprint reference, and simple descriptive properties;
- exactly one door, referencing one existing entrance;
- an optional pedestrian-access reference.

The initial projection is one box per entrance record. This allows a building with multiple independent entrances/units to have multiple boxes without inventing unit counts. It does not generate room grids, cell occupancy, room partitions, furniture, stairs, or interior geometry.

## Door-to-pedestrian-graph rule

A door is not connected merely because an entrance is near a road or has a nearest-road projection. The optional pedestrian link must reference an explicit access point and an edge in the shape emitted by `buildPedestrianGraph`. The edge must have:
- `routingApproved: true`;
- a status of `source_verified`, `accepted_for_staging`, or `verified`;
- `modes` containing `"walk"`;
- the access-point ID matching one of the edge endpoints.

These values match the staging graph contract in the pedestrian-access builder. The endpoint check ensures the supplied access point is actually part of the referenced directed edge. An entrance without that evidence remains a valid address box with an unconnected door. The existing interior-destination validation remains separate and is not bypassed.

## Compatibility and safety

- Pure projection: source building and entrance records are not mutated.
- No changes to road acquisition, topology, rasterization, or PR #89.
- No writes to Kernel, WorldHeart, Supabase, or live AO state.
- The existing Houston builder remains the source of building and entrance proposals.
- An optional read-only address-box preview is available in the Houston staging builder; it projects current entrance records without changing them.
- The preview does not synthesize pedestrian links. The pedestrian graph must provide a matching approved edge before a door can be linked.
- This is a staging adapter, not a canonical import format.

## Validation

Run `node --test spatial/ao-address-box.test.mjs`. Tests cover builder-shaped building/entrance records, the one-door invariant, non-mutation, acceptance of pedestrian-graph output statuses, and rejection of unapproved or non-walkable links.
