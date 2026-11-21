# AO Play MCP (Supabase Edge Function)

**Current deployment is read-only.** It exposes safe world, map, locate, and inspect tools. The `ao_action` tool is a disabled stub until Kernel execution, intent validation, idempotency, authorization, and append-only ledger transactions are implemented.

## Endpoint
`https://hixbtiuibtyiqrtacver.supabase.co/functions/v1/ao-play`

## Required secrets (Supabase Dashboard → Edge Functions → Secrets)
- `AO_MCP_TOKEN`: long random bearer token for ChatGPT/MCP client auth.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key used server-side only. Never share it with the client or commit it.

## Deployment
The function requires `verify_jwt=false` because it uses its own `AO_MCP_TOKEN` bearer check. It fails closed with 503 until the AO token is configured and with 401 for invalid tokens. Deploy after secrets are set; do not enable gameplay writes yet.

## Tools
- `ao_world`: overview and state
- `ao_map`: regions and chunks for a world UUID
- `ao_locate`: entity lookup
- `ao_inspect`: full entity inspection by UUID
- `ao_action`: disabled intent stub (no writes)
