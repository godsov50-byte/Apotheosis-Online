# AO Deterministic World Registry

Status: implementation foundation and migration artifact; not deployed or connected to the city console.

## Contract
Resolve an existing identity before creating an object. Names, addresses, coordinates, descriptions and images are attributes or references, never primary identity.

The registry separates permanent source identities, current authorized records, append-only revisions, versioned coordinate profiles, approved visual references, generation manifests, and evidence-backed correction proposals.

## Retrieval rules
1. Resolve exact identity or registered alias first.
2. If no identity exists, return not found; do not silently create a replacement.
3. Retrieve a defined revision or the current authorized revision.
4. Return provenance and coordinate profile/version with the record.
5. Reuse stored approved images for exact visual retrieval.
6. Lore and image generation declare source IDs/revisions and rule/template versions.
7. Missing or conflicting evidence remains explicit.
8. Detect corrections automatically if desired, but never apply them without review, Kernel authorization and WorldHeart commit.

## Reproducibility limits
Stable IDs, canonical serialization, versioned coordinate profiles and stored visual assets are exactly reproducible. Seeds and manifests improve generation repeatability but do not guarantee bit-for-bit identical output from a hosted AI model whose weights, sampler, infrastructure or model version changes. Exact image reuse retrieves the stored asset. Lore prose can vary while canon facts remain fixed; exact prose reproduction requires retaining the approved output and generation environment.

## Authority and security
The SQL migration denies browser roles and grants registry access only to service_role. It is a migration artifact and must be reviewed and applied in a controlled environment. A trusted server must authenticate administrators and route consequential writes through the Kernel. Never expose service-role credentials to the browser.

These spatial revision records do not replace WorldHeart's append-only committed world-event ledger. No browser code writes canonical world state directly.

## Files
- geography/consistency-registry.js: deterministic identity keys, canonical JSON, coordinate keys, exact lookup, correction proposal and generation manifest helpers.
- geography/database/migrations/20261121000300_ao_deterministic_registry.sql: identity aliases, immutable revisions, visual references, generation manifests and correction proposals/decisions.
- tests/spatial/consistency-registry.test.js: Node built-in tests.
