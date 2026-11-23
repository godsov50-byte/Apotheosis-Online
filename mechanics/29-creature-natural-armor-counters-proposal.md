# AO Chess — Creature Natural Counters to Armor Types

**Status: PROPOSED / NOT CANON.** This document proposes ten natural creature counter-patterns that pressure the construction features of the ten basic AO Chess armor types. These are tactical and anatomical patterns, not universal damage bonuses, armor negation, or guaranteed outcomes.

## Design principles

- An **armor counter-pattern** describes how a creature's anatomy, behavior, movement, or natural abilities challenge a particular armor construction.
- A counter pressures a construction feature, coverage limitation, attachment, seam, joint, or material interaction. It does not automatically bypass DR, resistance, Break, or any other combat mechanic.
- The pattern is separate from creature class-counter archetypes and weapon-counter patterns. A creature may have any combination of these profiles, or none.
- Counter patterns are not species assignments. Different species may express the same pattern through different anatomy, instincts, or abilities.
- Armor subtype, material, craftsmanship, fit, backing layers, coverage, and maintenance can change a matchup. A counter label does not make every item of that armor type equally vulnerable.
- Creatures must have the relevant anatomy, senses, knowledge, positioning, and opportunity to exploit a feature. They do not automatically know hidden weak points or loadouts.
- All outcomes resolve through the established AO systems, including AP, EA, DR, resistance, penetration, Break, attributes, techniques, movement, facing, terrain, and position. These remain independent systems.

## Proposed natural counter-patterns

| Creature armor-counter pattern | Natural pressure against | Counter concept |
|---|---|---|
| **1. Textile Ripper** | Padded Armor | Uses tearing claws, hooked structures, shearing bites, or repeated pulling to damage textile layers, seams, and quilting. It challenges the integrity of the construction rather than negating cushioning automatically. |
| **2. Hide Piercer** | Leather Armor | Uses narrow fangs, pointed beaks, spines, or hardened claws to puncture or split leather, especially where the specific item is thin, stretched, or poorly reinforced. |
| **3. Rivet Dislodger** | Brigandine | Uses levering claws, hooked mandibles, or twisting pulls to catch edges and stress rivets, backing, or plate attachments. It must reach an actual exposed or vulnerable point. |
| **4. Scale Lifter** | Scale Armor | Uses hooks, backward-facing teeth, claws, or gripping appendages to catch scale edges and pull against their overlap or attachment direction. |
| **5. Lacing Severer** | Lamellar Armor | Uses cutting edges, narrow beaks, or repeated scraping to attack exposed laces, cords, and connections between lamellae. |
| **6. Crush Striker** | Mail Armor | Delivers concentrated blunt impacts, compression, or body-weight strikes that exploit the fact that linked rings do not form a rigid plate. This does not imply automatic ring failure or damage transfer. |
| **7. Gap Seeker** | Splint Armor | Uses narrow limbs, probing claws, flexible bodies, or precision bites to reach gaps between splints or attack exposed backing and attachment points. |
| **8. Limb Hunter** | Cuirass Armor | Avoids the protected torso and pressures uncovered or separately armored regions—such as limbs, shoulders, neck, or lower body—according to the actual cuirass wearer's coverage. |
| **9. Articulation Hunter** | Plate Armor | Tracks and attacks actual joints, articulation gaps, and transitions between plates, using flexible anatomy, precision strikes, or repeated pressure. It does not simply ignore plate protection. |
| **10. Adaptive Breacher** | Composite Armor | Changes its attack method or target after observing the specific armor assembly, seeking a documented transition between materials or construction systems. Adaptation requires time, perception, and a plausible method; it is not instant universal armor penetration. |

## How armor counters manifest

A creature's armor-counter profile may be expressed through one or more documented methods:

- **Tearing and shearing:** pulls, slices, or rips flexible layers, seams, or attachments.
- **Puncture:** concentrates force through a narrow point against a material or exposed area.
- **Levering and hooking:** catches edges, overlaps, rivets, laces, or exposed structures and applies pulling or twisting force.
- **Connection attack:** targets rings, laces, rivets, straps, backing, or other components that hold an armor assembly together.
- **Blunt compression:** applies concentrated impact or sustained pressure to challenge non-rigid constructions.
- **Gap exploitation:** identifies and attacks actual openings, joints, or transitions in coverage.
- **Coverage bypass:** chooses a body region not protected by the specific armor piece or set.
- **Observed adaptation:** changes target or method after learning the actual construction, within the creature's perception and intelligence limits.

These methods are descriptive categories. They do not prescribe damage types, hit-location rules, status effects, Break values, or automatic item destruction.

## Creature profile integration (illustrative)

```yaml
chess:
  creatureArmorCounters:
    primary: <counter_pattern>
    targets:
      - <armor_type>
    methods:
      - <documented_anatomy_trait_or_ability_id>
    target_features:
      - <observed_construction_feature>
    prerequisites:
      - <required_range_position_sense_or_condition>
    limits:
      - <documented_limit_or_failure_condition>
```

Illustrative structure only. Do not invent species assignments, abilities, prerequisites, or limits when creating actual creature records. Unknown fields should remain unspecified.

## Relationship to other creature counter frameworks

Keep these dimensions separate:

- **Class-counter archetype:** pressures assumptions or strengths associated with an Envoy class.
- **Weapon-counter pattern:** pressures the use, reach, handling, or attack rhythm of a weapon family.
- **Armor-counter pattern:** pressures construction, coverage, attachment, or protective geometry of armor.
- **Species and racial type:** define creature nature, anatomy, ecology, and available traits.
- **Tier, element, rarity, and variant:** remain independent classifications.

A creature may combine patterns, but no combination should be inferred merely from its name or species. For example, a creature that is a Textile Ripper is not automatically an Archer-counter or a Bow-counter.

## Encounter and AI use

Creature AI may use an armor-counter pattern only when it can perceive or reasonably infer the relevant armor feature. A creature may notice visible scales, rings, plates, or exposed joints; it should not know hidden construction, material composition, enchantments, or weak points without an appropriate sense, observation, prior knowledge, or ability.

Counter behavior should create tactical choices:
- Protect or reposition exposed regions.
- Change facing, distance, or terrain.
- Prevent the creature from establishing the required grip, angle, or contact.
- Use a different armor configuration or defensive technique where available.
- Exploit the creature's own approach pattern, tell, range, or vulnerability.

A counter should not make a player's armor useless. Its effectiveness depends on the creature's actual traits, the armor item, and the resolved combat situation.

## Review items

1. Cross-check these patterns against the existing ten armor types and actual AO armor/item records.
2. Check overlap with existing creature class-counter and weapon-counter patterns; shared tactics are allowed, but the classifications must remain distinct.
3. Review whether each pattern has a clear, observable method and a meaningful failure condition.
4. Keep item damage, armor degradation, hit location, coverage, DR, resistance, and Break rules unresolved unless separately defined and approved.
5. Do not assign any pattern to a creature species until its anatomy, behavior, and abilities support that assignment.

This proposal defines conceptual armor-counter patterns only. It creates no universal numerical effects, automatic armor bypass, species assignments, or canon.
