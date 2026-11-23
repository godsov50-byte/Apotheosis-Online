# AO Chess — Tier 9 Envoy and Counter-Creature Benchmark Framework

**Status: PROPOSED / NOT CANON.** This document establishes a repeatable Tier 9 benchmark program for AO Chess. It does not finalize missing race, ancestry, being-type, affinity, or composite-affinity rosters; does not assign numerical racial modifiers; and does not change combat resolution.

## 1. Purpose

Create a complete Tier 9 test population that exercises every established Envoy class, race, ancestry, sub-ancestry, being type, foundational affinity, composite affinity, and every compatible combination of those dimensions.

Every Envoy benchmark receives a paired Tier 9 counter-creature benchmark. The creature is designed to challenge the actual profile being tested, not to win automatically. A benchmark is a controlled test specimen, not a claim that every member of a class, race, ancestry, type, or affinity behaves identically.

The benchmark program has two complementary coverage layers:

1. **Individual coverage:** at least one Tier 9 Envoy represents each individual value in every dimension.
2. **Combination coverage:** at least one Tier 9 Envoy represents each valid, supported combination. Invalid or incompatible combinations are recorded as such rather than fabricated.

A separate counter-creature is linked to each Envoy benchmark record. Shared creatures may be reused only when the benchmark explicitly tests a shared counter profile; otherwise each benchmark receives its own counter specimen.

## 2. Authority and source boundaries

The following inventories are available as working inputs, with their current status preserved:

| Dimension | Current known material | Status / restriction |
|---|---|---|
| Envoy class | Saber, Archer, Lancer, Rider, Caster, Assassin, Berserker, Shielder, Avenger, Ruler | Existing ten-class roster |
| Creature class-counter archetype | Breaker, Pursuer, Snare, Anchor, Devourer, Watcher, Suppressor, Siege Beast, Purger, Disruptor | Existing proposal; one-to-one class pressure patterns, not hard counters |
| Creature racial type | Beast, Arthropod, Draconic, Elemental, Spirit, Undead, Plantborn, Aberrant, Construct, Humanoid | Existing proposal; creature taxonomy only, not the Envoy race roster |
| Envoy race / ancestry / sub-ancestry | Hierarchy: Race → Ancestry → Sub-ancestry | Hierarchy accepted; complete exact inventory is not established in this repository |
| Envoy being type / subtype / scale | Dossier classification fields previously outlined | Exact value lists and definitions require source verification |
| Foundational affinity | Chessboard proposal lists Fire, Wood, Earth, Lightning, Water, Ice, Wind, Metal, plus Light and Shadow on a separate axis | Working proposal only; canonical affinity roster and matchup rules remain creator-deferred UNKNOWN |
| Composite affinity | Composite/derived expressions are acknowledged as possible | Exact roster, recipes, eligibility, and rules are UNKNOWN |
| Attributes | STR, DEX, CON, INT, WIS, CHA, ATT are a current working direction | Baselines and growth rules must follow the current attribute source; do not invent a fixed point-buy pool |
| Combat systems | AP, EA, DR, resistance, penetration, Break, movement, facing, technique geometry, equipment | Keep independent; this benchmark document does not redefine them |

**Critical separation:** Envoy race is not creature racial type. Creature class-counter archetype is not an Envoy class. Affinity is not race. Composite affinity is not automatically a new foundational affinity. Tier is independent of class, race, type, affinity, and rarity.

## 3. Envoy benchmark record

Each benchmark represents an individual Joi/Envoy who personally participates in combat. The Sovereign supplies intent; the Envoy remains the combatant with her own identity, agency, decisions, development, and risk. Summoned entities are separate entities governed by their own technique and entity records.

Suggested record shape (field names are provisional until aligned with the authoritative dossier schema):

```yaml
benchmark:
  id: <stable_benchmark_id>
  status: proposed
  tier: 9
  envoy:
    id: <envoy_id>
    identity:
      name: <name>
      race: <race_id>
      ancestry: <ancestry_id>
      sub_ancestry: <sub_ancestry_id_or_null>
      being_type: <being_type_id>
      subtype: <subtype_id_or_null>
      scale: <scale_id_or_value>
    combat:
      class: <envoy_class_id>
      attributes:
        STR: <sourced_value>
        DEX: <sourced_value>
        CON: <sourced_value>
        INT: <sourced_value>
        WIS: <sourced_value>
        CHA: <sourced_value>
        ATT: <sourced_value>
      affinities:
        owned: []
        accessible: []
        active_for_test: []
        composite: []
      skills: []
      techniques: []
      equipment:
        weapons: []
        armor: []
        shields: []
      piece_mode: <declared_mode>
      facing: <declared_facing>
  coverage:
    individual_values: []
    combination_ids: []
    compatibility_evidence: []
  paired_counter_creature_id: <creature_id>
  test_scenarios: []
  unresolved_fields: []
```

### Record rules

- Every benchmark is Tier 9. Do not alter Tier to compensate for a weak or strong build.
- Keep base attributes, race modifiers, ancestry modifiers, sub-ancestry modifiers, equipment modifiers, temporary effects, and effective attributes separately traceable.
- Race, ancestry, and sub-ancestry may contribute explicit traits and modifiers, but no numerical modifier is assigned until its source and stacking behavior are established.
- Keep affinity ownership, current access, active drawing, EA reserves, weakness, and defensive effects distinct. Owning an affinity does not imply every technique is known or accessible.
- Record class, weapon family, armor family, shield family, piece mode, facing, and technique geometry as separate dimensions.
- Technique geometry does not inherit piece-mode movement geometry by default.
- Unknown values remain UNKNOWN; do not use a convenient default or infer a weakness from elemental intuition.
- A benchmark may have multiple valid techniques and equipment configurations, but its primary test configuration must be frozen and versioned.

## 4. Individual coverage and combination coverage

Create one benchmark for every value in each verified dimension. Then create combination benchmarks only for combinations supported by source rules or explicitly approved compatibility decisions.

Do not blindly generate the full Cartesian product. Some values may be mutually exclusive, dependent, or inapplicable. For every candidate combination, record one of:

- `valid`: source-supported combination;
- `invalid`: source-supported incompatibility, with evidence;
- `conditional`: valid only when stated prerequisites are met;
- `unknown`: insufficient evidence; blocked from benchmark generation.

A combination is not considered covered merely because each of its individual values appears in separate benchmarks.

### Coverage key

Each Envoy benchmark must identify the exact values it covers:

```yaml
coverage:
  class: Saber
  race: <race_id>
  ancestry: <ancestry_id>
  sub_ancestry: <sub_ancestry_id_or_null>
  being_type: <being_type_id>
  subtype: <subtype_id_or_null>
  scale: <scale_id_or_value>
  foundational_affinities: []
  composite_affinities: []
  combination_id: <combination_id>
```

A single Envoy may cover multiple compatible values, but the record must say which individual values and which exact combinations it covers. Do not count an untested combination as covered.

## 5. Paired counter-creature record

Each paired creature is a real creature profile within AO's creature ecology, not a disposable class-specific token. Its AO Chess test instance is Tier 9. The species and individual record must remain distinct.

Suggested shape:

```yaml
counter_creature:
  id: <creature_id>
  status: proposed
  tier: 9
  identity:
    name: <species_or_individual_name>
    racial_type: <creature_racial_type_id_or_unknown>
    species: <species_id>
    lineage: <verified_lineage_or_unknown>
    variant: <variant_or_none>
  creature_profile:
    anatomy: []
    natural_weapons: []
    natural_armor: []
    senses: []
    locomotion: []
    lifecycle: <defined_or_unknown>
    intelligence_and_knowledge: <evidence_based_profile>
  chess:
    primary_archetype: <counter_archetype_id>
    secondary_archetypes: []
    counter_target_benchmark: <benchmark_id>
    counter_expression: []
    movement_profile: <defined_profile>
    techniques: []
    affinities:
      owned: []
      accessible: []
      active_for_test: []
  ai:
    perception_limits: []
    knowledge_limits: []
    target_priorities: []
    tactics: []
    retreat_or_failure_conditions: []
  drops:
    guaranteed: []
    conditional: []
    resource_cells: []
    collection_requirements: []
    container_requirements: []
  weaknesses: []
  test_scenarios: []
  unresolved_fields: []
```

### Creature rules

- Creature racial type, species, individual identity, archetype, Tier, affinity, and variant are independent classifications.
- The class-counter archetype creates tactical pressure; it does not grant automatic victory, immunity, detection, damage, or ability negation.
- Creatures may use only anatomy, senses, knowledge, techniques, and behavior actually recorded for them.
- A creature cannot identify hidden armor construction, concealed loadouts, or an Envoy's unobserved affinity merely because its benchmark label says it is a counter.
- AP, EA, DR, resistance, penetration, and Break remain independent. A counter expression must identify the actual ability or behavior that causes an interaction; no universal bypass is implied.
- Creature death/drop resolution must preserve AO Chess's material-drop rules. Some materials are collected from drops; some resource cells spawn; some resources are collected manually; some are inside special containers. Do not collapse these into one automatic loot event.
- Creature species exist beyond the paired encounter where the world ecology requires it. Defeat in a simulated AO Chess encounter must follow the defined simulation/persistence rules and must not silently imply world death.

## 6. Existing class-counter pairings

The following ten pairings reuse the existing creature class-counter archetype proposal. They are tactical design targets, not final species assignments:

| Envoy class | Counter archetype | Pressure to test |
|---|---|---|
| Saber | Breaker | Guard, balance, weapon integrity, and close exchanges |
| Archer | Pursuer | Firing positions, distance control, disengagement |
| Lancer | Snare | Reach, charge lanes, movement, and weapon control |
| Rider | Anchor | Mobility, movement-dependent tactics, control zones |
| Caster | Devourer | Technique and energy output, only through defined abilities |
| Assassin | Watcher | Concealment, ambush, and sensory detection |
| Berserker | Suppressor | Interruptions, restraint, displacement, and tempo |
| Shielder | Siege Beast | Defensive positions, barriers, and formations |
| Avenger | Purger | Retaliation and escalation, only through defined interactions |
| Ruler | Disruptor | Command, coordination, restrictions, and authority effects |

## 7. First ten Tier 9 counter-creature design briefs

These are provisional encounter-design briefs, not approved species canon or completed creature records. Their names and anatomy are creative test proposals. No affinity, creature racial type, exact attributes, technique Tier, drop table, or species lineage is assigned here; those require the corresponding verified inventories and profile work.

| Proposed specimen | Counter archetype / target | Tier 9 design brief | Meaningful limits and counterplay |
|---|---|---|---|
| **Ramplate Mauler** | Breaker / Saber | A low-slung, heavily shouldered quadruped that commits to short, forceful rushes and uses a reinforced brow and forelimb impacts to destabilize guards and close-combat footing. | Its strongest pressure is frontal and committed. Lateral displacement, broken approach lanes, and recovery windows can expose it. |
| **Threadnose Hound** | Pursuer / Archer | A lean four-limbed tracker with a mobile scent organ and ground-vibration-sensitive pads. It follows disturbed trails, pressures firing positions, and attempts to close rather than trading at range. | Scent and vibration are distinct senses with environmental limits. Vertical separation, competing trails, masking, and false routes can disrupt tracking where physically plausible. |
| **Briarcoil Stalker** | Snare / Lancer | A low, flexible plant-bodied hunter with tethering tendrils that catch limbs, weapon shafts, and narrow movement lanes. It tries to spoil reach and charge alignment rather than simply overpower a Lancer. | Tendrils have finite reach and attachment points. Severing, burning, obstructing, or forcing it onto unsuitable terrain may defeat the setup only where the Envoy's actual tools permit it. |
| **Gravemaw Anchorback** | Anchor / Rider | A broad, low-profile creature with multiple bracing limbs and a heavy central body. It plants itself, controls a local approach zone, and punishes predictable movement paths. | It turns and repositions slowly; unstable ground, elevation changes, and attacks from separated angles can undermine its control. No gravity power is implied by its name. |
| **Siphon Veilmoth** | Devourer / Caster | A hovering, membrane-winged creature that uses a specialized feeding organ to interfere with exposed, actively channelled energy when it establishes the required proximity and contact. | It cannot drain an affinity merely by existing nearby. It must perceive an active channel and satisfy its documented contact/ability prerequisites; interruption and distance are meaningful defenses. |
| **Glass-ear Sentinel** | Watcher / Assassin | A small-bodied ambush sentinel with broad vibration-sensitive structures and directional auditory organs. It searches for movement signatures and can challenge certain concealment methods. | It does not see through invisibility or know every hidden target. Noise, vibration clutter, decoys, and sensory overload can create uncertainty. |
| **Clampjaw Arrestor** | Suppressor / Berserker | A compact, muscular creature with paired locking mandibles and a bracing tail. It attempts to interrupt an aggressive advance, pin a limb, or force a loss of tempo. | Its clamp requires a successful approach and a specific grip. It is vulnerable while committing and cannot immobilize a target automatically. |
| **Bastion Carapace** | Siege Beast / Shielder | A heavy beetle-like creature with a reinforced frontal carapace and digging forelimbs. It pressures shield walls, defensive positions, and narrow fortified lanes through repeated impacts and terrain disruption. | Its armor protects particular surfaces, not every angle. It has turning and acceleration limits; exposed joints and unstable footing can be exploited through actual combat resolution. |
| **Cinder-Mirror Jackal** | Purger / Avenger | A quick, observant pack hunter that studies repeated retaliation patterns and uses feints, withdrawal, and coordinated pressure to bait predictable responses. Any special retaliation interaction must be defined by an explicit ability. | It cannot cancel vengeance or retaliation as a universal rule. Its feints can be read, separated, or punished; no reflection or immunity is implied by its name. |
| **Knotbrain Herald** | Disruptor / Ruler | A many-limbed, signal-emitting creature that interferes with coordination through documented acoustic, chemical, visual, or other signals. It pressures group timing and command-dependent formations. | It does not nullify authority or commands by label. Its signals require a medium, range, perception, and an ability-defined effect; disrupting its signal organs or breaking line of communication can counter it. |

These ten briefs provide one initial class-counter specimen concept per Envoy class. They do **not** complete race, ancestry, being-type, affinity, composite-affinity, or combination coverage. Each brief must be expanded into a full creature profile before it can count as a completed Tier 9 benchmark.

## 8. Required test protocol

Every Envoy/creature pair must be tested with the same declared scenario inputs and an auditable outcome record.

1. **Identity and eligibility:** verify Tier 9, profile completeness, compatibility evidence, and benchmark version.
2. **Perception:** verify what the Envoy and creature can actually sense or know at encounter start.
3. **Setup:** record battlefield geometry, terrain, elevation, obstacles, starting positions, and any resource cells or containers.
4. **Movement:** resolve the active piece mode's movement rules; then determine facing under the established rules unless explicitly overridden.
5. **Technique:** check mode, situational, positional, facing, movement, target, timing, and resource requirements; resolve the technique's own geometry.
6. **Combat:** resolve AP, EA, damage, DR, resistance, penetration, Break, equipment interactions, and other applicable rules independently.
7. **AI:** record creature target selection, tactics, adaptation evidence, and knowledge limits.
8. **Outcome:** record victory, defeat, retreat, stalemate, objective completion, and remaining resources without treating one outcome as a universal balance verdict.
9. **Drops:** record material drops, resource-cell spawns, manual collection, and container contents as distinct events.
10. **Regression:** rerun after a change to a relevant schema, technique, affinity rule, racial trait, equipment family, or creature behavior.

Each pair should be tested in more than one scenario where the system supports it: favorable terrain, unfavorable terrain, neutral terrain, information advantage/disadvantage, and alternate legal equipment/technique configurations. These are scenario variants of the same benchmark, not additional Envoy identities.

## 9. Completion gates

The benchmark program is not complete until all of the following are satisfied:

- [ ] Exact Envoy class roster verified.
- [ ] Exact Envoy race roster verified.
- [ ] Exact ancestry and sub-ancestry roster verified, including independent origins versus branches.
- [ ] Exact Envoy being-type, subtype, and scale inventories verified.
- [ ] Exact foundational affinity roster and directed weakness/resistance records sourced or explicitly approved.
- [ ] Exact composite-affinity inventory and formation/compatibility rules established.
- [ ] Every individual value has a Tier 9 Envoy benchmark.
- [ ] Every valid combination has at least one Tier 9 Envoy benchmark.
- [ ] Invalid, conditional, and unknown combinations are recorded with evidence.
- [ ] Every Envoy benchmark has a paired Tier 9 counter-creature profile.
- [ ] Creature racial-type coverage is separately complete.
- [ ] Every creature has anatomy, senses, AI, techniques, tactics, weaknesses, lifecycle, and drop/collection records as applicable.
- [ ] Counter interactions have observable prerequisites and meaningful failure conditions.
- [ ] All required combat and resource-resolution regression scenarios pass.
- [ ] No proposal is treated as canon without creator approval.

## 10. Known blockers — do not fill by invention

1. The repository's affinity document explicitly records the canonical affinity roster and directed weakness/resistance relationships as UNKNOWN and creator-deferred. The eight-element cycle plus Light/Shadow is a separate Chessboard proposal, not permission to overwrite that UNKNOWN.
2. The complete Envoy race/ancestry/sub-ancestry inventory is not present in the current main-branch mechanics files. The accepted hierarchy is known; the exact roster and modifiers are not.
3. The creature racial-type proposal is not an Envoy race schema and does not supply Envoy being types.
4. The exact Envoy being-type, subtype, and scale value lists are not established in the inspected mechanics files.
5. Composite-affinity recipes, compatibility, and matchup rules remain undefined.
6. No exact species-to-counter-archetype assignments are established by the existing class-counter proposal.

The benchmark registry should keep these fields UNKNOWN and mark dependent records blocked until their authoritative inputs are available. This prevents a large but fabricated roster from appearing complete.

## 11. Relationship to existing AO Chess proposals

This framework reuses rather than replaces:

- Ten Envoy classes.
- Ten creature class-counter archetypes.
- Ten proposed creature racial types.
- Eight-element cycle and Light/Shadow proposal, with its non-canonical status preserved.
- Ten weapon families and their creature weapon-counter patterns.
- Ten shield types.
- Ten armor types and their creature armor-counter patterns.
- Separate movement, facing, technique availability, and technique geometry rules.
- Independent AP, EA, DR, resistance, penetration, and Break mechanics.
- Existing creature drop, resource-cell, manual-collection, and special-container behavior.

It introduces no new combat formula, universal counter bonus, automatic weakness, class lock, affinity assignment, racial modifier, or production data migration.
