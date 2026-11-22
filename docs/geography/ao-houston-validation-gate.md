# Houston Spatial Build — Execution Gate

## Working rule
**Do not add spatial architecture unless a real build, test, or validation failure demonstrates the need.** Prioritize running the existing pipeline, inspecting real output, and fixing demonstrated defects over extending the design.

## Next milestone
Produce and validate the first Houston preview build from real source data. This is not a canonical AO world import.

## Run order
1. Execute the current preview-only orchestrator end-to-end.
2. Verify source acquisition completeness and stable source IDs; record snapshot timestamp, counts, and checksum.
3. Verify coordinate conversion output and manifest; inspect representative coordinates and axis/origin behavior.
4. Verify registry identity, metadata coverage, and missing geometry accounting.
5. Verify raster candidate output and limits; do not interpret centerline cells as walkable surfaces.
6. Verify endpoint topology v1 and distance-tolerant v2; record known limitations (internal crossings, grade separation, access, turns).
7. Visually inspect the output and compare against source geography.
8. Write a build validation report listing artifacts, observed counts, tests actually executed, visual findings, blockers, and next fixes.

## Acceptance criteria for a validated preview
- Pipeline stages execute in order and stop on failure.
- Source completeness gates pass and the acquired snapshot is internally consistent.
- Output manifests match the files they describe.
- Counts and checksums are recorded in the build summary.
- Geometry is valid enough for downstream staging and major anomalies are documented.
- No stage writes to Kernel, WorldHeart, Supabase, or authoritative AO state.
- Validation evidence distinguishes automated tests, runtime build results, and visual QA.

## What comes after validation
Road surfaces and intersection resolution are the next implementation areas, but should be driven by gaps found in the validated preview. Validate topology first; then surface geometry and intersection handling may iterate together as concrete conflicts emerge.

## Execution constraints
- Do not claim tests, data acquisition, build output, or browser QA unless actually executed and observed.
- If the environment cannot run the pipeline, document the exact limitation and continue with source-level review or reproducible local test setup—not speculative architecture.
- Keep work staged and reversible. No merge, deployment, or live-world import without explicit user approval.
