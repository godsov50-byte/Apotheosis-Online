# AO Mock Kernel

A deterministic, in-memory reference fixture for contract integration tests.

## Run

Requires Node.js 20 or newer.

```sh
cd kernel-mock
npm test
```

No external runtime dependencies are required.

## Scope and limitations

This is not production authority and does not connect to Supabase/WorldHeart. It demonstrates the interface boundary, request validation, read-only perception, proposal-only plans, explicit outcomes, revisions, idempotency, long-running handles, and a simulated atomic commit. Production must replace in-memory maps with transactional persistence and Kernel-owned domain engines.
