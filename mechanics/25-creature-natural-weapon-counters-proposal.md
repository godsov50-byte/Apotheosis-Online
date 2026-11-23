# AO Chess — Creature Natural Counters to Weapon Types

**Status: PROPOSED / NOT CANON.** This document defines a complementary creature counter framework: natural enemy patterns designed to pressure the tactical strengths and use-patterns of AO Chess's ten basic weapon types. These weapon-counter identities are distinct from the existing creature archetypes that counter Envoy classes.

## Design principles

- **Weapon counter:** a creature's natural tactical pattern for challenging a particular weapon family.
- Countering a weapon means pressuring its strengths, positioning, attack rhythm, handling, reach, or practical use—not automatically disabling or negating it.
- This framework is independent from Envoy-class counters. A creature may have a class-counter archetype, a weapon-counter archetype, both, or neither.
- Counter relationships are design cues, not automatic bonuses, immunities, damage reductions, guaranteed disarms, or hard outcomes.
- Counter effects must be expressed through species traits, anatomy, movement, AI decisions, and defined abilities.
- The same counter type may be realized differently by different species. No blanket effects are assumed.
- Weapon subtypes can change the matchup; counter labels are broad and do not guarantee every subtype is equally vulnerable.
- Resolution still uses the established independent AO combat systems: AP, EA, DR, resistance, penetration, Break, attributes, techniques, movement, terrain, and position.

## Proposed natural-enemy pairings

| Creature weapon-counter pattern | Natural enemy of | Counter concept |
|---|---|---|
| **Guardbreaker** | Sword | Challenges balanced sword play through layered defenses, shifting guard angles, feints, armor, or pressure that makes clean exchanges difficult. |
| **Dancer / Evader** | Greatsword | Uses fast repositioning, narrow approach angles, baiting, or disruption of committed swings to exploit recovery windows where rules/abilities permit. |
| **Close Pressurer** | Dagger | Denies the short blade's preferred close-range precision by crowding, maintaining contact, controlling hands, or forcing awkward engagement distance. |
| **Lane Dodger** | Spear | Breaks straight thrust lanes, sidesteps or changes elevation, enters around linear reach, or attacks from offset angles. |
| **Hook-Resistant / Low Profile** | Polearm | Avoids hooks, sweeps, leverage, and wide control through low profile, flexible movement, anchoring, or anatomy resistant to control. |
| **Impact Shifter** | Axe | Redirects or absorbs committed cleaving/impact lines through mobility, resilient anatomy, deflection traits, or unusual body structure. |
| **Linebreaker** | Bow | Closes, obscures, breaks sight lines, changes elevation, splits approach vectors, or creates pressure that disrupts sustained ranged aiming. |
| **Reload Punisher** | Crossbow | Exploits loading/reloading windows, rushes or forces movement, attacks from angles, or disrupts a stable firing setup where applicable. |
| **Disarmer** | Staff | Challenges staff leverage, reach, channeling posture, or grip through grappling, limb control, disruption, or close-range pressure. |
| **Kiter / Range Denier** | Gauntlet / Fist | Avoids clinch range, controls distance, uses terrain or reach to deny hand-to-hand contact, or punishes approach paths. |

*Names and pairings are working proposals; alternate naming may be reviewed to keep the roster stylistically consistent.*

## How counters manifest

A creature's counter profile may use one or more of these methods, only when supported by its species or ability record:

- **Range denial:** prevents comfortable engagement distance or controls approach/retreat.
- **Angle manipulation:** changes facing, attacks from off-axis, or makes a weapon's preferred attack line difficult.
- **Tempo disruption:** interrupts setup, recovery, charging, aiming, or sustained pressure.
- **Grip / limb interference:** challenges the wielder's ability to maintain weapon control; disarm is not automatic.
- **Space control:** uses terrain, movement, reach, or area effects to limit tactical options.
- **Sight-line disruption:** cover, concealment, obstruction, movement, or perception mechanics challenge ranged weapons.
- **Commitment exploitation:** forces movement, changes targets, or pressures attacks that require deliberate commitment.
- **Anatomical mismatch:** the creature's shape, mobility, or body structure changes how conventional weapon attacks interact; this does not imply immunity.

## Creature profile integration (illustrative)

```yaml
chess:
  creatureWeaponCounters:
    primary: <counter_pattern>
    targets:
      - <weapon_type>
    methods:
      - <species_trait_or_ability_id>
    limits:
      - <documented_limit_or_condition>
```

Example structure only. Do not invent species assignments, counter abilities, limitations, or mechanics.

## Relationship to existing creature class-counter archetypes

Class-counter archetypes and weapon-counter patterns are separate dimensions. A creature may be, for example, a **Pursuer** (class-counter pattern associated with Archer) and a **Linebreaker** (weapon-counter pattern against Bow). This combination is illustrative only and does not imply automatic assignment or ability effects.

- Class-counter archetype informs pressure against Envoy class combat assumptions.
- Weapon-counter pattern informs pressure against weapon-family combat assumptions.
- Creature racial type/species informs nature, anatomy, ecology, and available traits.
- Tier, element, rarity, and variant remain independent.

## Encounter and AI use

The counter profile may guide creature AI in identifying an equipped weapon or observed fighting pattern, selecting tactics, choosing approach vectors, adapting after repeated attacks, and using grid terrain. Detection and adaptation require appropriate senses, knowledge, or abilities; creatures do not automatically know hidden loadouts or techniques.

Counters should create tactical puzzles and choices—not remove a player's ability to use their weapon. Different creatures should have different counter methods, costs, vulnerabilities, tells, and failure conditions so players can learn and adapt.

## Review questions

1. Confirm or rename the ten weapon-counter patterns and pairings.
2. Cross-check whether any proposed patterns duplicate existing creature class-counter archetypes too closely; keep the two frameworks distinct.
3. Define weapon recognition and adaptation limits at the creature/AI level.
4. Review unresolved weapon families (whips, chains, dedicated thrown weapons, shields, hybrids) after their classifications are established.
5. Cross-check existing AO creature/species records before assigning any weapon counters.

This proposal establishes conceptual counter patterns only. It adds no universal numerical effects, creature assignments, or canon.
