# AO Chess — Ten Creature Class-Counter Archetypes

**Status: PROPOSED / NOT CANON.** This proposal defines ten creature archetypes as natural enemy counterparts to AO's ten Envoy classes. These are creature combat identities—not Envoy classes, species names, or guaranteed hard counters. They guide creature AI, encounter behavior, abilities, targeting, and tactical pressure. A creature may carry secondary archetypes; individual species and abilities determine how its counter relationship is expressed.

## Design principle

AO Chess has two distinct combat identity frameworks:

- **Envoy classes:** Saber, Archer, Lancer, Rider, Caster, Assassin, Berserker, Shielder, Avenger, Ruler.
- **Creature archetypes:** natural enemy patterns built to pressure the strengths and combat assumptions of each class.

A matchup is a design relationship, not an automatic win, immunity, damage bonus, or restriction. Resolution still depends on actual attributes, Tier, techniques, AP, EA, DR, resistance, penetration, Break, positioning, terrain, and defined ability rules.

## Proposed one-to-one roster

| Creature archetype | Natural enemy of | Counter concept |
|---|---|---|
| **Breaker** | Saber | Disrupts melee balance, guard, weapon integrity, and close-combat exchanges through impact and breaking pressure. |
| **Pursuer** | Archer | Tracks, closes distance, pressures firing positions, and punishes disengagement or prolonged ranged setup. |
| **Snare** | Lancer | Restricts movement, reach, charge lanes, and weapon control with binding, terrain, or entangling effects. |
| **Anchor** | Rider | Restricts mobility, creates control zones, grounds or impedes mobile targets, and punishes movement-dependent tactics. |
| **Devourer** | Caster | Feeds on, absorbs, interferes with, or disrupts energy and technique output where its abilities permit. |
| **Watcher** | Assassin | Detects hidden targets, ambushes, or concealment through specialized sensory or supernatural perception. |
| **Suppressor** | Berserker | Interrupts, restrains, immobilizes, displaces, or otherwise controls aggressive combatants. |
| **Siege Beast** | Shielder | Breaks defensive positions, barriers, formations, and fortified spaces through siege-oriented attacks. |
| **Purger** | Avenger | Disrupts retaliation, vengeance, or escalating response mechanics; exact interactions must be ability-defined. |
| **Disruptor** | Ruler | Interferes with authority, command, restrictions, coordination, or rule-based control effects. |

## Archetype scope and boundaries

- **Primary archetype:** the creature's dominant natural enemy pattern.
- **Secondary archetypes:** optional additional patterns; combinations should be earned by the species or individual profile, not assigned automatically.
- **Species identity:** anatomy, ecology, innate abilities, and behaviors remain creature-specific.
- **Variants:** elite, alpha, mutated, elemental, ancient, rare, or boss variants may alter how an archetype manifests; these labels do not automatically create new archetypes.
- **AI behavior:** archetypes inform target priorities, tactics, movement, reactions, and encounter composition without forcing all creatures of an archetype to behave identically.
- **Counter expression:** a Watcher may detect an Assassin by scent, vibration, thermal signature, or magic—its method and limitations must be recorded for that species.
- **No automatic counter outcome:** archetype labels do not grant universal bonuses, negations, guaranteed detection, hard locks, or class-specific immunity.

## Creature record integration

Creature profiles may include:

```yaml
chess:
  creatureArchetypes:
    primary: Breaker
    secondary: []
  naturalEnemyClass: Saber
  counterExpression:
    - behavior: disrupt_melee_guard
      source: species_ability_or_trait_id
      limitations: defined_per_creature
```

The example is illustrative. The schema is not a required finalized data contract. `naturalEnemyClass` may be derived from the primary archetype mapping instead of redundantly stored, and unknown fields should not be fabricated.

## Tactical usage

Archetypes can guide:
- creature AI priorities and target selection;
- ability and technique themes;
- tactical movement and positioning;
- encounter and group composition;
- class-counter scenarios and player learning;
- behavior descriptions in the T1 Chronicle.

They do **not** replace creature Tier, attributes, elemental affinity, innate techniques, movement rules, class rules, or independent combat mechanics.

## Open review questions

1. Confirm names and one-to-one class pairings.
2. Decide whether archetypes are a strict single-primary assignment or allow multiple equal-primary patterns.
3. Define actual counter mechanics, if any, at the ability/species level rather than making global archetype effects.
4. Cross-check the existing creature roster before assigning archetypes to species.
5. Establish whether each archetype also has an ecology/behavior signature outside combat.

No species assignments, numerical bonuses, or hard-counter effects are approved by this proposal.
