# AO Kernel–AI Interface Contract — Executable Artifacts v1

This directory turns the approved Version 1.0 boundary into machine-readable JSON Schema (Draft 2020-12).

## Authority rules

- The AI submits intent; it never writes world state.
- Perception is read-only.
- Plans are proposals only.
- The Kernel is the sole action authority.
- A world-changing operation is reported as committed only after its state changes and history record are persisted atomically.
- Request lifecycle, execution lifecycle, and final outcome are separate fields.

## Schemas

- `schemas/common.schema.json`: shared request/response definitions.
- `schemas/*.request.schema.json`: request-specific payloads.
- `schemas/response.schema.json`: authoritative response envelope.
- `schemas/event.schema.json`: committed event record.

All schemas use JSON Schema Draft 2020-12. The mock Kernel intentionally implements a small deterministic subset; it is a contract test fixture, not the production AO Kernel or a substitute for persistent WorldHeart storage.
