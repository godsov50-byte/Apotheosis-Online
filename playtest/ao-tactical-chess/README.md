# AO Tactical Chess Playtest

A standalone, browser-based 8×8 tactical combat prototype. This is a board game/playtest only; it does not connect to the persistent AO world, Supabase, WorldHeart, or the production Kernel.

## Open locally

Open `index.html` in a modern browser. No build step, package install, API key, or backend is required.

After the feature branch is merged, the Pages workflow publishes the board at:

`/tactical-chess/`

## Included

- 8×8 board with portrait-and-name Envoy tokens. Token frame colors separately encode Class, Archetype, and Natural Affinity; combat statistics remain in the selected-unit dossier.
- Two sides with 16 character units each; all ten basic classes represented.
- Askar Venn on b8 as a Berserker, Anti-Divine, Tier 5, with Knight movement and Divine Pursuit.
- Select/move controls using King, Queen, Rook, Bishop, Knight, and Pawn movement patterns.
- Board movement, basic attacks, and technique use routed through the Layer 1–5 engine bridge; techniques validate ownership, chess motion, AP/EA costs and uses before damage resolution.
- Switchable movement pattern and manual facing rotation.
- Class baseline HP, AC, attack bonus, and weapon damage die (provisional playtest values).
- Character dossier with Race, Class, Tier, Archetype, Chess Motion, Natural Affinity, combat statistics, equipment slots, techniques and triggers.
- d20 attack rolls against AC, weapon damage dice, HP, knockback, and a prototype guard-counter reaction.
- Technique mode with AP, EA, daily-use tracking, and a simple Anti-Divine interaction against a marked Divine Humanoid target.
- T1 Chronicle entries after movement, facing changes, configuration changes, combat, triggers, and turn changes.

## Controls

1. Select one of your side's tokens.
2. Click a highlighted square to move or attack an opposing token.
3. Use **↻ Face** to rotate the selected token.
4. Use **⇄ Pattern** to cycle its movement pattern. Divine Pursuit becomes dormant unless Askar has Knight movement.
5. Toggle **Technique: Off/On**, then select an opposing unit on a legal attack square to spend technique resources.
6. Use **Save match** to store the current match in browser-local storage; **Load match** restores that save on the same browser/device. **End turn** passes control to the other side. **Reset match** clears the local save and restores the opening setup.

## Explicit playtest limitations

- Class stat numbers, damage bonuses, technique costs, and trigger odds are temporary test values, not approved AO canon or balance.
- The match is local and two-player on one device; there is no network multiplayer, account system, cloud persistence, or AI opponent. Local save/load is browser-only and device-specific.
- Capture/defeat only removes a token from this match. It does not mean the character dies in the AO world. Attackers only move into a defeated target's square; they hold their current position if the target survives.
- The elemental-affinity roster and weakness/resistance chart remain unassigned; technique records display affinity without inventing the canonical chart.
- Movement, basic attacks, and technique attacks use the engine bridge. Conditional triggers remain lightweight local logic; creature drops, inventory, crafting, and fragment-based learning/Tier advancement remain separate modules and are not yet one integrated encounter transaction.
- The current trigger handling is intentionally small and illustrative. It is not a complete reaction-priority or chain-resolution engine.
- T1 text is generated from the prototype's local resolved action. It is not a call to Azimah and does not write authoritative world history.
- Chess-pattern movement is the prototype's tactical movement model, not the full continuous-space AO spatial engine.

All changes are isolated on the feature branch until reviewed and merged.


## AO Chess engine sandbox — Layers 1–13

The page includes an Engine Console sandbox for the new reference engine. It can initialize an independent field, launch/advance a projectile toward a blocking wall, run perception/AI, and advance a world tick. The core module lives at `engine/ao-chess-engine.mjs`; regression tests are in `tests/engine.test.mjs` and encounter records have a JSON schema at `../../schemas/ao-chess-encounter.schema.json`.


**Important:** the existing board match still uses its original local rules. The sandbox does not yet replace that match loop or connect to WorldHeart/Supabase. The engine is a working prototype with incomplete advanced physics and rules; see its README for boundaries.


## Portrait identity tokens

The board surface renders each unit as a portrait above its name. It does not put class letters, HP strips, facing arrows, or numeric combat statistics on the token surface. The portrait frame has three independent visual channels: outer frame for Class, inner trim for Archetype, and accent ring for Natural Affinity. Selecting a unit still opens the full dossier with statistics, Race, Chess Motion, facing, and combat configuration.

Unit records accept an optional `portraitUrl` for a character-specific portrait. Until portrait artwork is supplied, the playtest uses a generated neutral portrait silhouette as a fallback. The current class/archetype/affinity color values are provisional UI palette values, not canon. Unassigned natural affinities use a neutral accent rather than an invented elemental assignment.
