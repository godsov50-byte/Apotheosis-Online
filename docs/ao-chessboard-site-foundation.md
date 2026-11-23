# AO Chessboard Site Foundation

**Status:** implementation foundation / proposed site structure  
**Scope:** AO Chessboard only. This document does not establish new game mechanics or canon.

## 1. Existing deployment arrangement

Keep the current repository and GitHub Pages deployment arrangement:

- Repository: godsov50-byte/Apotheosis-Online
- Main site entry: site/index.html, currently assembled from geography/ao-city-console.html by the Pages workflow.
- Chessboard source: playtest/ao-tactical-chess/index.html
- Published Chessboard route: /tactical-chess/, assembled by the existing Pages workflow.
- The chess playtest remains isolated from Supabase, WorldHeart, persistent world state, and the production Kernel until an explicit integration phase.

Do not replace the main site entry, create a second repository, or introduce a new domain as part of this work.

## 2. Product boundary

The Chessboard is the tactical encounter interface for AO. It presents the spatial and mechanical state of an encounter. It is not a separate game world or a replacement for the underlying spatial model.

The board and the T1 narration surface are two views of the same resolved event stream:

- **Board:** positions, geometry, movement, facing, legal options, objects, resources, hazards, combat state, and current tactical state.
- **T1 overlay:** immediate contextual prompts, action selection, technique selection, trigger/reaction decisions, and Kernel resolution feedback.
- **Chronicle:** the session's complete event history rendered as a coherent story after or during play.

The Kernel remains the authority for legal actions and outcomes. Azimah interprets and narrates committed results; she does not independently decide what happened.

## 3. Chessboard site navigation

The tactical route should grow into a single responsive workspace with these primary destinations:

1. **Battlefield** — the interactive tactical board and current encounter.
2. **Envoys** — roster, selection, dossiers, race/ancestry/class details, attributes, skills, techniques, affinities, and equipment.
3. **Session** — encounter setup, participants, sides, Envoy assignment, turn state, AP allocation, and reaction policy.
4. **Chronicle** — event timeline and completed encounter story, with character-perspective and battlefield views.
5. **Inventory** — carried items, equipment, consumables, collected materials, and eligible storage.
6. **Field Objects** — drops, resource cells, containers, harvestable objects, hazards, and interactable terrain.
7. **Codex** — rules and reference material exposed to the current participant, without revealing restricted or hidden information.
8. **Settings** — display, accessibility, board presentation, narration layout, and participant reaction preferences.

Navigation should be responsive and compact on phones. The Battlefield remains the primary destination; the other views should not obscure it during active tactical decisions.

## 4. Battlefield workspace

The Battlefield view should provide:

- Responsive grid/spatial board with selectable Envoys, readable coordinates, facing, movement patterns, HP/state indicators, terrain, and object markers.
- Selection and inspection of Envoys, enemies, allies, objects, containers, resource cells, and relevant terrain.
- Context-sensitive legal movement and action previews supplied by the resolution layer.
- A compact tactical status area for side/turn, round, AP pool/allocation, and each selected Envoy's relevant EA reserves.
- Contextual action panel for movement, attacks, techniques, skills, interactions, equipment use, and eligible ally actions.
- Reaction/interrupt overlay that pauses at the authoritative trigger checkpoint and shows the pending action, trigger, eligible responder, and permitted responses.
- A second-screen narration layout on wide displays and a switchable/sheet-based narration view on mobile.
- Clear separation between preview, pending intent, resolved result, and committed history.

Do not show hidden information merely because it exists in the underlying world state. The interface must respect the active participant's knowledge and permissions.

## 5. Envoy and roster experience

The Envoy experience should support:

- Roster browsing and selection.
- Dossier/profile inspection.
- Identity: name, title, race, ancestry, sub-ancestry, sex, and age.
- Classification: Tier, class, Archetype, nature/type, subtype, and scale.
- Attributes: STR, DEX, CON, INT, WIS, CHA, ATT.
- Combat values: HP, AP participation/allocation, EA reserves, AC, DR, Damage Resistance, Penetration, and Break.
- Skills, techniques, affinities, movement pattern, reactions, equipment, possessions, origin, affiliation, and chronicle.
- Race selection followed by ancestry and sub-ancestry choices, with inherited modifiers and traits previewed before confirmation.

Race, ancestry, sub-ancestry, natural class aptitude, and weapon proficiency must remain distinct data dimensions. The proposed ten-race roster and any unconfirmed race/ancestry combinations must remain visibly provisional until approved.

Do not generate a complete roster by blindly multiplying every class, Archetype, type, subtype, and scale combination. Only valid combinations should be represented.

## 6. Session experience

The Session view should support the intended encounter lifecycle:

1. Create or enter a session.
2. Configure encounter context and session options.
3. Invite/recognize participants and assign sides.
4. Assign Envoys and controller permissions.
5. Set AP allocation and reaction policy.
6. Start, pause, resume, or conclude the encounter.
7. Preserve unresolved actions and reaction checkpoints across disconnection.
8. Produce the completed event record and Chronicle.

Support asynchronous participation and hybrid reaction policies as the session model matures. A disconnected participant must not cause the system to invent actions, techniques, or resource spending unless the participant explicitly configured an automatic response.

One Sovereign controlling multiple Envoys does not receive additional AP merely from controlling more Envoys. Permissions must prevent one participant from spending another participant's resources without authorization.

## 7. Chronicle and event model

The Chronicle UI is a presentation of authoritative event records, not a source of truth.

Capture, where applicable:

- intents, validation outcomes, action order, positions, movement paths, facing, and movement-pattern changes;
- attacks, misses, damage, mitigation, Break, defeat, techniques, costs, effects, and reactions;
- ally interactions, teamwork, object interactions, resource drops, collection, containers, and environmental changes;
- participants, controllers, Envoys, locations, timestamps, causal links, and final encounter outcome.

The story renderer must not invent actions, dialogue, thoughts presented as fact, loot, injuries, achievements, outcomes, or knowledge outside a character's perspective. Distinguish established fact from interpretation, rumor, and limited perspective.

## 8. Battlefield material and object interactions

The UI must distinguish:

- material dropped after an enemy is slain;
- exposed resources that must be collected;
- resource cells that may spawn independently;
- resources held inside special containers;
- resources successfully collected and added to an Envoy's carried inventory or authorized storage.

A drop is not automatically collected. A container must be accessed before its contents can be retrieved. Resource cells and harvestable objects occupy spatial positions and may require movement, tools, skills, or an interaction. Do not silently turn a visible drop into inventory.

The interface may present actions such as Collect, Open, Extract, Harvest, Search, and Carry when the authoritative action model permits them. These labels are interface proposals, not finalized costs or universal action rules.

## 9. Visual and accessibility direction

Retain the current dark tactical visual language as the starting point and evolve it into the AO identity:

- dark, high-contrast surfaces with restrained gold and faction accents;
- readable board squares, tokens, facing, health, state, and object markers;
- distinctive Envoy portraits and consistent token/portrait/dossier identity;
- typography that separates tactical labels from in-world narration;
- keyboard and touch support, clear focus states, scalable text, and reduced-motion support;
- desktop split-screen narration and mobile compact narration panels.

Do not use color as the only signal for team, condition, legality, or danger.

## 10. Data and integration boundaries

Build the UI against explicit data contracts and a local/mock adapter first. Keep the boundary between client intent and authoritative resolution clear:

- The client submits player intent; it does not author T1 prose or decide outcomes.
- The Kernel validates and resolves actions.
- WorldHeart persists current world state and append-only committed history.
- Supabase provides persistence/authentication/RLS/communications, not game authority.
- Chronicle and narration consume committed event records.
- Hidden world truth and participant-visible knowledge remain separately permissioned.

The present prototype's temporary stats, odds, costs, and simplified combat/reaction logic remain playtest-only. Do not migrate those values into canonical records or production balance by copying them from the prototype.

No production database writes, authentication rollout, multiplayer service, or live-world integration is implied by this foundation document.

## 11. Delivery sequence

### Phase A — Site shell and navigation
- Preserve the existing /tactical-chess/ route.
- Establish responsive navigation and shared visual components.
- Separate the current board surface from roster, session, Chronicle, inventory, field objects, codex, and settings views.

### Phase B — Board interaction and dossiers
- Improve board selection, inspection, object markers, responsive layout, and contextual action panels.
- Build Envoy dossiers and the race/ancestry selection flow using explicitly provisional data.

### Phase C — Session and event simulation
- Add local session setup, side/Envoy assignment, AP/EA display, action queue, reaction checkpoints, and event capture.
- Keep the simulation local until the authoritative Kernel contract is ready.

### Phase D — Chronicle and battlefield economy
- Render a complete story from the captured event sequence.
- Add drops, collection, resource cells, containers, harvesting, and inventory movement.

### Phase E — Authoritative integration
- Define and review the Kernel API/event schema.
- Add authentication, permissions, persistence, asynchronous participation, and notifications.
- Test idempotency, ordering, replay, reconnect, privacy, and ledger consistency before connecting to the persistent world.

## 12. Acceptance criteria

The Chessboard site foundation is ready for integration when:

- the existing main site and /tactical-chess/ route remain intact;
- the tactical route works responsively on desktop and mobile;
- all primary Chessboard destinations are reachable without leaving the tactical workspace;
- board, dossier, session, inventory, field-object, and Chronicle views use consistent entity identifiers and data contracts;
- previews, intents, resolutions, and committed events are visibly distinct;
- a complete encounter can be replayed and rendered into a Chronicle from its event record;
- drops, resource cells, containers, and collected inventory are represented as distinct states;
- no temporary playtest value is silently promoted to AO canon;
- no client-side UI component can independently commit world truth.
