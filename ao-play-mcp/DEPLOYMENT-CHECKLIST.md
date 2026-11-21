# AO Play Free Deployment Checklist

This setup targets a personal, low-traffic prototype and keeps services within free-tier limits where possible. Free-tier quotas and policies can change; check the vendor terms before deployment.

## Accounts (user must complete)

- [ ] GitHub: already connected to the AO repository.
- [ ] Cloudflare: create a free account at https://dash.cloudflare.com/sign-up
- [ ] Cloudflare Workers: choose Workers & Pages in the dashboard and authorize repository access if using Git deploy.
- [ ] ChatGPT: create the private plugin after the remote MCP endpoint is deployed and verified.

Account creation and verification require the account owner to enter their own email, complete verification, and accept provider terms. This repository automation cannot do that on the user's behalf.

## Architecture

- GitHub repository holds source.
- Cloudflare Worker hosts the remote Streamable HTTP MCP endpoint.
- Supabase project `ao-grand-meridian-experiment` holds AO data.
- AO Play MCP uses server-side secrets only; never put Supabase service-role keys or AO bearer tokens into a client/plugin.

## Deployment secrets

Set Worker secrets in Cloudflare (or with Wrangler after login):

- `AO_MCP_TOKEN`: a randomly generated long secret, shared only with the authenticated connector.
- `SUPABASE_URL`: project URL.
- `SUPABASE_KEY`: use a publishable/anon key only with read policies that intentionally allow the intended data; do not use a service-role key until the server authorization and write paths have been reviewed.

## Required hardening before playable write actions

- Authenticate the Sovereign/account and map it to an Envoy; never trust an arbitrary Envoy UUID sent by the client.
- Verify Supabase RLS and all grants on exposed tables.
- Validate actions in AO Kernel; connector must submit intent, not directly edit world-state rows.
- Commit accepted actions transactionally to the append-only event ledger and update derived state.
- Add idempotency keys, concurrency/revision checks, rate limiting, and request size limits.
- Keep the MCP endpoint private and require authentication.
- Run tests and MCP Inspector checks for world/map/entity reads and unauthorized requests.

## Playability milestones

1. [ ] Fix and verify server lifecycle/context handling in the current MCP Worker scaffold.
2. [ ] Deploy Worker and test authentication plus tool discovery.
3. [ ] Connect plugin to verified endpoint.
4. [ ] Add safe Kernel-backed movement and inspect actions.
5. [ ] Add road/building placement, then construction economy and persistent world simulation.
