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

The existing Chessboard UI continues to run its older local match rules. The Engine Console is an isolated sandbox; it does not yet replace the match's source of truth.

Run tests locally with Node: `node --test tests/*.test.mjs`.

## Technique pipeline

`technique-pipeline.mjs` provides a data-driven end-to-end action pipeline:

1. Technique definition and registry, including tier/category, class/archetype/affinity requirements, costs, uses, cooldown, target rules, geometry, chess motion, prerequisites and effects.
2. Learned-technique ownership plus offensive-technique and additional technique-slot assignment.
3. Intent validation: actor/action availability, status restrictions, learned/equipped state, requirements, target allegiance, AP, EA, uses, cooldown, range, line of sight and chess-motion legality.
4. Resolution on a cloned field: resource costs, damage packets, healing, statuses, resource changes, displacement, summons and terrain patches.
5. Append-only local combat event with outcome details; rejected intents leave the input field and resources unchanged.

AP and EA remain separate costs. Damage packets preserve independent DR, resistance, penetration, and Break handling; true damage is explicitly data-marked. The module does not invent technique balance values, affinity charts, or canon. Techniques supply their own values and effects.

Example:

```js
import { createTechniqueRegistry, resolveTechniqueIntent } from "./technique-pipeline.mjs";

const registry = createTechniqueRegistry([{
  id: "example-cut",
  name: "Example Cut",
  tier: 5,
  target: { type: "enemy" },
  geometry: { range: 1 },
  chessMotion: "King",
  cost: { ap: 2, ea: 1 },
  effects: [{ type: "damage", packets: [{ type: "physical", amount: 8 }] }]
}]);

const result = resolveTechniqueIntent(field, {
  actorId: "envoy-1",
  techniqueId: "example-cut",
  target: { entityId: "enemy-1" }
}, registry);
```

The pipeline module is currently a tested engine layer, **not yet wired into the existing board's Technique button or dossier controls**. The old UI technique shortcut remains a prototype path until the next integration step.

## Equipment lifecycle pipeline

`equipment-pipeline.mjs` implements data-driven materials, item definitions, recipe registries, material-drop and opened-container collection, craft validation and atomic material consumption, provenance-bearing item instances, refinement, equipment-slot validation, equip/unequip, durability/Break/destruction, repair, and transfers.

The four item categories are Regular Item, Heirloom, Conceptual Heirloom, and Cursed Conceptual Heirloom. Category, rarity, power, and advancement eligibility are separate fields; ordinary crafting/refinement preserves the template's category and advancement flag. The pipeline does not infer that a powerful or rare item is a Conceptual Heirloom or qualifies an Envoy for tier advancement.

Recipe data supplies materials, quantities, output, station/tool tags, crafting-skill requirements, class/race/tier requirements, and duration. A rejected craft does not consume materials. Material drops can require explicit manual collection; container contents require the container to be opened and collected. Every successful lifecycle operation appends a local event with source/recipe/item provenance.

This is a playtest module. It does not yet replace the existing board's inventory/equipment UI, and it is not a production Kernel/WorldHeart persistence integration. Numeric recipes, item stats, rarity, and balance remain supplied data rather than canon.

Example:

```js
import { createEquipmentRegistry, craftEquipment } from "./equipment-pipeline.mjs";

const registry = createEquipmentRegistry({
  materials: [{ id: "iron", name: "Iron" }],
  items: [{ id: "iron-blade", name: "Iron Blade", equipmentSlot: "weapon" }],
  recipes: [{
    id: "forge-blade", name: "Forge Blade", knownByDefault: true,
    ingredients: [{ materialId: "iron", quantity: 3 }],
    output: { itemId: "iron-blade" }
  }]
});

const result = craftEquipment(field, {
  actorId: "envoy-1", recipeId: "forge-blade"
}, registry);
```

## Other engine modules

`combat-simulation.mjs` adds independent reusable primitives for 3D cell paths and trajectory families, entity volumes, facing/attack sectors, aim and cover, damage packets, status stacking/ticks, reaction priority, formations, zones, body-part injury, equipment durability, melee states, terrain damage, projectile traversal, resource transactions, progression, and a handler-driven combat-event pipeline.

`regular-combat.mjs` adds match-sized utilities for zones, destructible terrain, localized body effects, formation support, grapples, and simple projectiles. These are standalone utilities pending match integration.

**Not complete:** full 3D volume/collision, every projectile trajectory/interception rule, advanced aim/cover, grappling/continuous-space melee, full reaction priority, ecology simulation, persistent-world adapter, canonical numerical balance, and full board UI integration. Values/charts are supplied as data rather than inferred as canon.
