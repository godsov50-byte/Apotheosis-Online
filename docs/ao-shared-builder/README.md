# AO Shared Builder

Private collaborative world-building sandbox for Apotheosis Online (AO).

**Live prototype:** https://hixbtiuibtyiqrtacver.supabase.co/functions/v1/ao-shared-builder

This is a separate sandbox database layer and Edge Function. It does not write into the Grand Meridian experimental world or the main AO world.

## Current features
- Invite-code-gated access, owner/builder/viewer roles
- Sign in / account creation using Supabase Auth
- Shared persistent 48×48 spatial grid
- Place locations, buildings, NPCs, items, roads, terrain, and props
- Inspect entities and edit names, descriptions, parent/container, position, JSON properties/state
- Building inspector renders multiple floor and room lists
- Destination travel to location/building entities
- One-cell movement using arrow keys/WASD and mobile controls
- Append-only activity feed for creations, edits, travel, and steps
- Owner can create 1–10 use builder/viewer invites; invitations expire in 30 days
- Optimistic entity versioning and parent/position checks
- Screenshot/print layout

## Prototype limitations
- No full pathfinding, wall/door collision, elevation, movement costs, combat, crafting, inventory transactions, or real-time synchronization.
- Travel currently moves to a saved destination's coordinates; routes and journey simulation will be implemented later.
- Buildings have editable JSON interior/floor/room data, but no walkable interior map editor yet.
- NPCs are data-driven display entities, not autonomous simulation agents.
- Users refresh to see shared changes.
- Account creation may require email confirmation depending on Supabase Auth configuration.

## Database
Tables are in the existing AO Supabase project under ao_builder_*. Client roles have deny-all RLS policies; all data access is server-side through the Edge Function using service credentials. The main project and Grand Meridian experiment remain separate.

Migrations in supabase/migrations/ are source copies of the migrations applied to the connected database. Before applying them to another environment, review ordering and environment IDs.

## Invite flow
1. Open the live prototype.
2. Create an account/sign in.
3. Enter the one-time owner invite code (delivered privately to the project owner).
4. Owner uses the Invite panel to create builder/viewer codes.
5. Send generated invite codes privately.

Invite codes are secrets; do not commit them or post them publicly.
