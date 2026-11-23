# AO Chess Engine — Layers 1–13

A dependency-free browser/Node ESM reference engine. It is a prototype and is **not** the authoritative AO Kernel or a WorldHeart/Supabase persistence integration.

- **Layer 1:** entities, stats, classes, grid and movement.
- **Layer 2:** skill checks and synergy modifiers.
- **Layer 3:** affinity, DR, resistance, penetration, Break, reactions and LOS.
- **Layer 4:** learned techniques, prerequisites, costs, cooldowns, uses and effects.
- **Layer 5:** Kernel-style intent validation, action costs and event ledger.
- **Layer 6:** projectile records, launch, cell traversal, ticks, collisions and persistence state.
- **Layer 7:** ranged range and LOS gates.
- **Layer 8:** melee reach gate.
- **Layer 9:** grid occupancy, facing, zones/pathing hooks.
- **Layer 10:** resource pools, manual pickups, harvesting, crafting and recovery.
- **Layer 11:** limited perception and AI intent scoring.
- **Layer 12:** sourced encounters, deployment, objectives and delayed reinforcement records.
- **Layer 13:** rewards with provenance, item refinement, skill/technique progress and tier advancement gates.

The existing Chessboard UI continues to run its older local match rules. The new Engine Console is an isolated sandbox for exercising the new module; it does not yet replace the match's source of truth.

Run tests locally with Node: `node --test tests/engine.test.mjs`.

**Not complete:** full 3D volume/collision, all projectile trajectory types and interception rules, advanced aim/cover model, grappling/continuous-space melee, full reaction priority/formation/zone control, ecology simulation, persistent-world adapter, and canonical numeric balance. Values/charts are supplied as data rather than inferred as canon.


## Full Combat Simulation Expansion (additive module)

`combat-simulation.mjs` adds independent reusable resolution primitives for: 3D cell paths and trajectory families (straight/arc/zigzag/spiral/wave/guided/falling); entity volumes and overlap; facing/attack sectors; aim and cover math; damage packet layers; status stacking/ticks/action restrictions; reaction candidate priority and resource costs; formations and integrity/cohesion; spatial zones and contested control; body-part injury states; equipment durability/broken/destroyed states; melee-state transitions and grapple contests; terrain durability/destruction and passage; projectile traversal/target collision; resource transactions; skill XP and technique mastery; advancement gates; and a handler-driven combat-event pipeline.

This module is a rules utility expansion. It is not yet wired as the authoritative board match loop, and numerical values remain configurable/provisional. Tests are in `tests/combat-simulation.test.mjs`.
