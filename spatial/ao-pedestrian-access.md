# AO Pedestrian Access Connector Builder

Staging-only, deterministic graph builder for pedestrian route inputs.

- Includes only sidewalk/path records and entrance connectors with `routingApproved: true`, an accepted status, and explicit `walkAccess: true`.
- Maintains directed edges; reverse travel requires a separate record.
- Preserves provided geometry, IDs, length, optional speed cap, and provenance.
- Does not infer sidewalks from roads, crossings from intersections, entrances from building frontage, or access permissions from geometry.
- Does not route or persist. Its output can be handed to a Kernel-owned movement planner only after integration and review.

Run from repository root:

```bash
node --test spatial/ao-pedestrian-access.test.mjs
```

This is a staging helper, not a live AO integration.
