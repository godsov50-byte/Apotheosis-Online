# AO Play MCP

Remote MCP tool server prototype for Apotheosis Online. Initial tools are read-oriented and action submission is intentionally disabled until Kernel execution and transactional authorization exist.

## Tools
- `ao_world`: world records and state
- `ao_map`: regions and chunks
- `ao_locate`: entity search
- `ao_inspect`: entity detail
- `ao_action`: safe pending stub (not world-mutating)

## Deploy prerequisites
1. Create a Cloudflare account (free plan is user sign-up; this repo cannot create an account or accept terms on your behalf).
2. Set Worker secrets `AO_MCP_TOKEN` and `SUPABASE_KEY`.
3. Install dependencies, run `wrangler deploy`, then verify via MCP Inspector.
4. Use a private, authenticated endpoint only. Do not use a service-role key in any client; if used server-side, scope and rotate it and ensure the bearer secret is strong.

This code is a scaffold and has not yet been deployed or runtime-tested. Authentication/session design, Supabase access policies, kernel execution and queued actions remain to be hardened before live gameplay.
