# AO Tactical Chess Playtest

A standalone, browser-based 8×8 tactical combat prototype. This is a board game/playtest only; it does not connect to the persistent AO world, Supabase, WorldHeart, or the production Kernel.

## Open locally

Open `index.html` in a modern browser. No build step, package install, API key, or backend is required.

After the feature branch is merged, the Pages workflow publishes the board at:

`/tactical-chess/`

## Included

- 8×8 board with character tokens, class marks, HP strips, and facing arrows.
- Two sides with 16 character units each; all ten basic classes represented.
- Askar Venn on b8 as a Berserker, Anti-Divine, Tier 5, with Knight movement and Divine Pursuit.
- Select/move controls using King, Queen, Rook, Bishop, Knight, and Pawn movement patterns.
- Switchable movement pattern and manual facing rotation.
- Class baseline HP, AC, attack bonus, and weapon damage die (provisional playtest values).
- Character dossier with class, Tier, Archetype, nature, affinity, AP/EA, equipment slots, technique and trigger.
- d20 attack rolls against AC, weapon damage dice, HP, knockback, and a prototype guard-counter reaction.
- Technique mode with AP, EA, daily-use tracking, and a simple Anti-Divine interaction against a marked Divine Humanoid target.
- T1 Chronicle entries after movement, facing changes, configuration changes, combat, triggers, and turn changes.

## Controls

1. Select one of your side's tokens.
2. Click a highlighted square to move or attack an opposing token.
3. Use **↻ Face** to rotate the selected token.
4. Use **⇄ Pattern** to cycle its movement pattern. Divine Pursuit becomes dormant unless Askar has Knight movement.
5. Toggle **Technique: Off/On**, then select an opposing unit on a legal attack square to spend technique resources.
6. Press **End turn** to pass control to the other side. **Reset match** restores the opening setup.

## Explicit playtest limitations

- Class stat numbers, damage bonuses, technique costs, and trigger odds are temporary test values, not approved AO canon or balance.
- The match is local and two-player on one device; there is no network multiplayer, account system, save persistence, or AI opponent.
- Capture/defeat only removes a token from this match. It does not mean the character dies in the AO world.
- The elemental-affinity roster and weakness/resistance chart remain unassigned; technique records display affinity without inventing the canonical chart.
- The current trigger handling is intentionally small and illustrative. It is not a complete reaction-priority or chain-resolution engine.
- T1 text is generated from the prototype's local resolved action. It is not a call to Azimah and does not write authoritative world history.
- Chess-pattern movement is the prototype's tactical movement model, not the full continuous-space AO spatial engine.

All changes are isolated on the feature branch until reviewed and merged.


## AO Chess engine sandbox — Layers 1–13

The page includes an Engine Console sandbox for the new reference engine. It can initialize an independent field, launch/advance a projectile toward a blocking wall, run perception/AI, and advance a world tick. The core module lives at `engine/ao-chess-engine.mjs`; regression tests are in `tests/engine.test.mjs` and encounter records have a JSON schema at `../../schemas/ao-chess-encounter.schema.json`.


**Important:** the existing board match still uses its original local rules. The sandbox does not yet replace that match loop or connect to WorldHeart/Supabase. The engine is a working prototype with incomplete advanced physics and rules; see its README for boundaries.
