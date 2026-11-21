# AO WorldHeart shared agent gateway — experimental integration

## Current deployment
- Supabase project: `hixbtiuibtyiqrtacver` (`ao-grand-meridian-experiment`).
- Shared MCP endpoint: `https://hixbtiuibtyiqrtacver.supabase.co/functions/v1/ao-chatgpt-mcp`.
- Transport/auth: Streamable HTTP MCP with Supabase OAuth 2.1 / dynamic client registration.
- Human review console: `https://hixbtiuibtyiqrtacver.supabase.co/functions/v1/ao-worldheart-review`.
- ChatGPT plugin: private `ao-worldheart`, version 0.1.8. It reuses the same MCP endpoint; another agent connects to that endpoint rather than creating another database.

## MCP capabilities added
Read: `list_grand_meridian_buildings`, `inspect_grand_meridian_building`, `list_grand_meridian_building_elements`.
Propose-only: `propose_grand_meridian_building_change`, `list_my_grand_meridian_proposals`.
Existing scene, Envoy, movement, interaction, entity-inspection, and event-history tools remain available. Proposals are stored in `exp_world_proposals`, separate from `exp_entities`, `exp_world_state`, and the append-only `exp_event_ledger`.

## Human approval boundary
The first authenticated user may explicitly claim the one-time owner role through the review console. Only that owner can approve or reject. MCP exposes no approval tool. The review console calls `exp_review_and_commit_world_proposal`; approval checks the expected world revision, applies the experimental entity change, appends the committed event, and updates the proposal in one transaction. Rejection leaves world state and committed history untouched. Stale proposals are not force-applied.

## Agent connection
Any MCP-capable agent may connect to the same endpoint using Streamable HTTP and Supabase OAuth DCR with `openid`, `email`, and `profile`. Do not share service-role keys or bearer tokens. Each client authenticates through OAuth. The review console is a separate browser flow and is not an MCP tool.

## Important limits
- This is the isolated Grand Meridian experiment, not the main AO world.
- `exp_worlds.world_config.kernel_rules_enabled` remains false. The database proposal executor is experimental and is not the complete AO Kernel.
- The experiment has a building entity and separate entrance, door, interior-space, stairway, and other records. Some have no explicit building relationship; inspection labels footprint overlaps as spatial candidates only.
- The building currently has no structured cell-based floor plan in this experiment.
- The separate Houston builder and PRs #54/#55 remain staging code; they are not automatically connected to this Supabase schema.
- OAuth must be tested by a real user sign-in and authenticated MCP tool call before the client connection is called end-to-end verified.


## Follow-up hardening

Migration `20261121191414_harden_world_proposal_target_requirements` adds a table constraint requiring every non-`building.create` proposal to reference an existing target entity, and requiring `building.create` to have no target. This prevents orphan room/door/stair/entrance elements or NPC assignments from reaching the commit function.

GitHub Actions now runs `deno check` against both Edge Functions on relevant pull requests.
