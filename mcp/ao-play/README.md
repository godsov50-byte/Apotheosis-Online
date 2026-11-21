# AO Play MCP foundation

This is a **read-only + proposal-only** MCP endpoint foundation. It intentionally does not commit game state or allow arbitrary database writes.

## Tools
- `ao_world`: list worlds
- `ao_entities`: query entity records
- `ao_entity`: inspect an entity by key
- `ao_map`: region/chunk metadata
- `ao_action_proposal`: return an action proposal without committing it

## Deploy (free-tier candidate)
1. Create a free Cloudflare account at https://dash.cloudflare.com/ (account verification may be required).
2. Create a Worker, paste `src/worker.js`, or connect this repo.
3. Add Worker secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role key to a browser/client.
4. Deploy and test `GET /` and MCP `POST /mcp`.
5. Configure authentication before connecting ChatGPT. This prototype has no auth middleware; do **not** expose it publicly with secrets until protected.

Cloudflare Workers Free lists 100,000 requests/day but per-invocation CPU limits apply. See the official limits: https://developers.cloudflare.com/workers/platform/limits/

## Known safety boundary
The current server only reads worlds/entities/regions/chunks. `ao_action_proposal` does not write. Kernel validation, player identity/auth, durable event ledger writes, building/road creation, and real game-action commits are future milestones.
