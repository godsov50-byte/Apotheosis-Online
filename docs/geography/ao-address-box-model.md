# AO lightweight address-box projection

## Decision

Keep the Houston road pipeline, building entrance records, and entrance-destination validation unchanged. Add a small address-box projection beside them; do not replace the builder's existing building or interior data.

## Minimal model

An address box is a lightweight addressable space derived from a building entrance. It carries:
- stable box ID and source building ID;
- optional address, type, footprint reference, and simple descriptive properties;
- exactly one door, referencing one existing entrance;
- an optional pedestrian-access reference.

The initial projection is one box per entrance record. This allows a building with multiple independent entrances/units to have multiple boxes without inventing unit counts. It does not generate room grids, cell occupancy, room partitions, furniture, stairs, or interior geometry.

## Door-to-road rule

A door is not connected merely because an entrance is near a road or has a nearest-road projection. The optional pedestrian link is emitted only when an explicit pedestrian access point and edge are supplied and the edge has:
- `routingApproved: true`;
- `status: "accepted"`;
- `walkAccess: true`.

An entrance without that evidence remains a valid address box with an unconnected door. The existing entrance validation remains responsible for validating the interior destination; this projection does not bypass it.

## Compatibility and safety

- Pure projection: source building and entrance records are not mutated.
- No changes to road acquisition, topology, rasterization, or PR #89.
- No writes to Kernel, WorldHeart, Supabase, or live AO state.
- The existing Houston builder remains the source of building and entrance proposals.
- This is a staging adapter, not a canonical import format.

## Validation

Run `node --test spatial/ao-address-box.test.mjs`. Tests cover the builder-shaped building/entrance records, one-door invariant, non-mutation, and rejection of unapproved pedestrian links.
