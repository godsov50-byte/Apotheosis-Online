# AO Chess — Battlefield Intelligence and Creature Behavior Proposal

**Status: PROPOSED / NOT CANON.** This document defines a source-independent design framework for creature awareness, perception, decision-making, tactical behavior, territory, social coordination, ecological activity, memory, and adaptation. It does not create new creature species, grant universal intelligence, define unapproved numerical formulas, or authorize AI narration to determine world truth.

## 1. Purpose and system boundary

AO Chess battlefields are persistent spatial environments within the AO world. Creatures are inhabitants of that world, not disposable encounter scripts. They may hunt, flee, guard territory, gather resources, cooperate, compete, rest, investigate disturbances, and continue activity when no Sovereign or Envoy is present.

This proposal connects the creature anatomy and technique framework, creature racial types, class-counter archetypes, persistent terrain, resource cells, and the AO Kernel resolution contract.

The authority boundary is unchanged:

- The creature decision system produces bounded intents or action proposals.
- The AO Kernel validates requirements, permissions, spatial facts, timing, costs, and outcomes.
- The WorldHeart stores authoritative current state and append-only committed history.
- AI narration describes only authorized, committed, perceivable results.
- No AI component may invent hidden resources, capabilities, memories, relationships, or outcomes.

This is a behavior framework, not a replacement for the Kernel, creature dossier, spatial engine, or world simulation.

## 2. Separate the creature's identity from its behavior

A creature's behavior must not be inferred from one label. Keep these dimensions independent:

| Dimension | What it describes |
|---|---|
| Species / creature identity | The actual creature kind and individual identity |
| Racial type | Broad nature classification from the creature taxonomy |
| Anatomy | Body components, natural weapons, organs, senses, locomotion |
| Tier | Tier 0–9 position; Tier 0 is highest and Tier 9 lowest |
| Intelligence | Cognitive capacity and supported reasoning |
| Instinct profile | Inherited or innate behavioral tendencies |
| Temperament | Individual disposition and emotional response patterns |
| Social structure | Solitary, pair, pack, colony, herd, swarm, etc. |
| Territory profile | Home range, defended area, migration, or no fixed territory |
| Combat archetype | Tactical pressure pattern, not a guarantee of victory |
| Capabilities | Skills, techniques, senses, communication, and learned behavior |
| Experience | Individual and shared knowledge supported by history |

Creature racial type is not Envoy race. Creature class-counter archetype is not creature racial type, class, or Tier. Similar-looking creatures need not share intelligence, temperament, tactics, or ecology.

## 3. Awareness, perception, detection, and knowledge

These must be separate concepts.

- **Awareness:** The creature's current attentional state, such as calm, alert, suspicious, alarmed, engaged, or searching.
- **Perception:** Information the creature's functioning senses can receive under current conditions.
- **Detection:** A resolved event in which available evidence is sufficient for the creature to notice a stimulus.
- **Identification:** Determining what the detected stimulus is, to the extent supported by evidence.
- **Knowledge:** Information retained from perception, communication, learning, or prior experience.
- **Belief / suspicion:** An uncertain interpretation, which may be wrong.
- **Shared knowledge:** Information transferred through a valid communication or social mechanism.

A creature must not know an Envoy's identity, class, Tier, inventory, technique list, hidden anatomy, or intentions merely because the simulation knows those facts. It can only act on information available to that creature through its senses, prior experience, communication, or a specifically defined supernatural capability.

### 3.1 Sensory channels

A creature dossier may define any supported combination of:

- Vision: ordinary, low-light, thermal, ultraviolet, or other specifically defined modes.
- Hearing: ordinary sound, vibration, directional hearing, or specialized frequencies.
- Smell and chemical sensing.
- Touch and pressure.
- Ground vibration.
- Echolocation or other active sensing.
- Magical, elemental, spiritual, or other supernatural perception.
- Remote sensing through a linked entity, construct, or environmental network.

These are examples, not universal creature abilities. Each channel requires anatomical or supernatural support and has limitations.

### 3.2 Detection modifiers are contextual, not assumed numbers

Detection depends on the actual sensor, distance, occlusion, terrain, weather, movement, noise, concealment, target signature, creature attention, and relevant conditions. The exact formulas remain separately sourced or unresolved. Do not invent a universal detection radius or automatic detection rule.

### 3.3 Detection states

Suggested per-stimulus states:

1. Unknown — no established detection.
2. Suspected — indirect or ambiguous evidence.
3. Detected — stimulus noticed, identity uncertain.
4. Identified — recognized to the supported level.
5. Tracked — location or movement can be followed using current evidence.
6. Lost — prior track is no longer reliable.
7. Remembered — information retained as a past observation, not proof of current presence.

A creature can remember a target after losing its track. Remembering does not reveal the target's current location.

## 4. Intelligence and decision capacity

Intelligence should describe which kinds of decisions a creature can make, not merely provide a combat bonus.

Working capability bands for behavior design:

| Band | Behavioral capability |
|---|---|
| Reflexive | Immediate stimulus-response behavior |
| Instinctive | Innate routines such as feeding, fleeing, nesting, or defending |
| Conditioned | Learns associations through repeated experience |
| Tactical | Chooses among known combat options and responds to battlefield changes |
| Strategic | Plans around longer-term objectives, resources, routes, and risks |
| Social / collaborative | Coordinates with others using supported signals, roles, and shared knowledge |
| Reflective | Can reason about uncertain situations, deception, negotiation, or abstract goals |

These bands are descriptive capabilities, not a new Tier scale or a universal intelligence stat. A creature may combine capabilities from different bands. Species-level tendencies do not override individual variation, injury, development, or learned experience.

Do not grant every creature human-like planning, language, deception, or long-term memory.

## 5. Decision model

A creature's behavior should be produced from its actual profile and current state.

### 5.1 Decision inputs

A decision cycle may consider:

- Current needs: survival, food, water, rest, offspring, shelter, territory, social contact.
- Current awareness and detected stimuli.
- Threats and opportunities supported by available knowledge.
- Anatomy and component condition.
- Available movement and technique capabilities.
- AP, EA, stamina, charges, consumables, and other actual resources where applicable.
- Current injuries, conditions, fear, pain, fatigue, and other defined states.
- Terrain, cover, visibility, hazards, weather, and environmental changes.
- Territory, social relationships, pack/colony roles, and group signals.
- Past outcomes and learned experience.
- Current world orders or constraints from valid authority.

### 5.2 Decision cycle

1. **Update perception:** obtain information from functioning senses and valid shared signals.
2. **Update knowledge:** record observations, confidence, source, and age.
3. **Evaluate needs:** identify active survival, social, ecological, and tactical needs.
4. **Generate candidate intents:** include only actions the creature could plausibly attempt.
5. **Filter capabilities:** remove actions lacking anatomy, technique, equipment, access, resources, or prerequisites.
6. **Evaluate risk and benefit:** use the creature's intelligence, temperament, experience, and current needs.
7. **Select intent:** choose a bounded action proposal using the creature's behavior policy.
8. **Kernel validation:** resolve the proposal through normal action, spatial, resource, technique, and permission rules.
9. **Update after outcome:** learn only from information the creature could perceive or receive.
10. **Persist:** commit state changes and history through the normal world authority.

The decision system proposes actions; it does not directly edit HP, inventory, terrain, resource ownership, or world history.

### 5.3 Bounded choice and reproducibility

The behavior policy may use weighted choices to avoid identical behavior, but weights must be derived from explicit creature profile fields and current conditions. If stochastic selection is used, record the policy version and random seed or equivalent reproducibility evidence. A replay must not silently produce a different committed result.

No weighted preference can bypass a hard capability, action, resource, or authority gate.

## 6. Threat assessment and tactical behavior

Threat assessment is an estimate based on evidence, not omniscient access to an opponent's dossier.

Possible inputs include:

- Observed size, movement, posture, equipment, and visible components.
- Previously witnessed attacks or techniques.
- Damage the creature has personally observed.
- Allies' valid warning signals.
- Current distance, terrain, cover, escape routes, and numerical disadvantage.
- Its own health, injuries, component states, resources, and temperament.
- Whether the target is threatening territory, offspring, food, a nest, or another protected interest.

A creature may misjudge a threat, fail to recognize a technique, or continue a poor strategy. Its response should be consistent with its intelligence and available evidence.

### 6.1 Tactical action families

Candidate behavior families may include:

- Approach, pursue, flank, intercept, surround.
- Guard, block, counter, ambush, harass, or deny a route.
- Retreat, evade, hide, disengage, or seek cover.
- Call for aid, warn allies, regroup, or protect a vulnerable member.
- Feint, distract, bait, or deceive only if its intelligence and capabilities support it.
- Investigate, observe, wait, or reposition.
- Use a technique, natural weapon, environmental hazard, or object when valid.
- Harvest, collect, carry, or cache resources when supported.

These are candidate intents, not automatic actions or guaranteed success.

### 6.2 Class-counter archetypes remain pressure patterns

The ten proposed creature class-counter archetypes (Breaker, Pursuer, Snare, Anchor, Devourer, Watcher, Suppressor, Siege Beast, Purger, Disruptor) describe tactical pressure patterns. They do not guarantee that a creature recognizes or defeats its paired Envoy class.

A creature may exploit a counter pattern only when:
- its actual anatomy and capabilities support the action;
- it has detected or learned the relevant behavior;
- its current position and resources permit the action;
- the Kernel validates the action and resolves its result.

## 7. Survival, retreat, and persistence

Creatures should not universally fight to the death.

Possible response patterns include:

- Fight while defending a nest or territory.
- Withdraw when injured or outmatched.
- Flee immediately from a recognized predator.
- Retreat to allies or a defensible location.
- Hide, burrow, climb, fly, swim, or use another supported escape method.
- Protect offspring or vulnerable group members.
- Continue attacking because of fear, frenzy, conditioning, loyalty, or another defined trait.
- Surrender, negotiate, or seek aid only where intelligence and social behavior support it.

Retreat is not teleportation. Movement, terrain, pursuit, opportunity attacks, action timing, and technique requirements still apply.

Death, incapacitation, escape, surrender, and despawn are distinct outcomes. A creature must not be removed from the persistent world merely because it leaves the visible battlefield.

## 8. Social behavior and group coordination

Group behavior depends on actual social structure and communication capabilities.

Possible structures include solitary, bonded pair, family group, pack, herd, flock, colony, hive, swarm, troop, or organized faction. These are examples, not a mandatory universal taxonomy.

A group record may define:

- Membership and individual identities.
- Roles and leadership, if present.
- Kinship, bond, rivalry, and dominance relationships.
- Communication channels and signal meanings.
- Shared territory and resource access.
- Group memory and information-sharing limits.
- Coordination range and interruption conditions.
- Succession or dissolution behavior.

Coordination is not shared omniscience. A warning can communicate that danger exists without revealing the exact attacker identity or position. A pack member can relay an observed location, but the information can become stale as the target moves.

If a leader dies or is separated, the group does not automatically collapse or appoint a new leader unless its social rules support that outcome.

## 9. Territory, home ranges, and migration

Territory is a spatial relationship between a creature or group and a defined area. It is separate from ownership, national sovereignty, and player-controlled domain rights.

A territory profile may include:

- Territory identity and spatial boundaries.
- Core habitat, peripheral range, hunting grounds, nesting areas, and migration corridors.
- Defended resources and protected sites.
- Seasonal or life-stage changes.
- Known rivals, predators, prey, and tolerated visitors.
- Patrol or marking behavior.
- Boundary signals and response thresholds.

A creature may defend a nest but tolerate movement through a distant hunting range. A migrating creature may cross a region without claiming it. Territory boundaries can change through environmental damage, resource depletion, population pressure, conflict, or other committed causes.

Do not treat a creature's territory as a player-owned region or a Sovereign Domain.

## 10. Ecology and resource behavior

Creature behavior participates in the persistent ecosystem.

Supported activities may include:

- Hunting, scavenging, grazing, browsing, filtering, or other feeding.
- Drinking and seeking suitable water.
- Gathering nesting or construction materials.
- Building, repairing, or abandoning nests and dens.
- Caching food or valuables.
- Competing for or sharing resources.
- Avoiding predators or dangerous environmental conditions.
- Seasonal movement, dormancy, migration, mating, reproduction, and development where species records support them.
- Interacting with plants, fungi, microorganisms, prey, predators, parasites, and other creatures.

Ecological actions must have actual inputs and outputs. A creature cannot create food, materials, offspring, or resource deposits from nothing. Resource depletion, regeneration, carrying capacity, and spawn rules remain governed by the world resource systems, not improvised by creature AI.

### 10.1 Creature drops and resource cells

Preserve the existing distinction between:
- Attached living anatomical components.
- Harvestable remains and creature drops after death.
- Resource cells that spawn or are discovered independently.
- Resources stored inside special containers.
- Processed materials created through valid harvesting or crafting.

A creature's AI may collect or cache resources only if it has the capability, opportunity, and valid action. A death drop is not automatically added to a creature's inventory or harvested by the system.

## 11. Memory, learning, and adaptation

Memory must be bounded by the creature's actual cognitive and sensory capabilities.

A memory record may contain:
- Observed event or stimulus.
- Time and spatial context.
- Source: direct perception, communicated warning, inherited instinct, or other valid source.
- Confidence and uncertainty.
- Last confirmation time.
- Retention or decay policy.
- Behavioral consequence, if any.

### 11.1 Learning boundaries

Creatures may learn from:
- Their own observed successes and failures.
- Injuries and threats they experienced.
- Repeated environmental patterns.
- Socially transmitted information.
- Training or conditioning.
- Evolutionary or developmental mechanisms defined for their species.

They cannot learn a hidden technique merely because it was used outside their perception. They cannot identify an invisible attacker without a valid sensory or supernatural channel. They cannot infer exact damage formulas from witnessing an attack.

### 11.2 Adaptation

Keep these outcomes separate:
- Behavioral adjustment: changes a choice or tactic.
- Learned skill: improves a supported action through experience.
- Technique development: acquires or modifies a valid technique.
- Anatomical adaptation: changes a body component through an established process.
- Evolutionary change: population or lineage change over a valid timescale and mechanism.

Repeated combat does not automatically grant a new organ, immunity, affinity, technique, or Tier advancement. Adaptation requires a valid progression mechanism, resources, time, and world-state evidence. The component and technique rules in the related creature anatomy proposal remain in force.

## 12. Off-screen simulation and world ticks

Creatures continue their valid routines while no player is present, consistent with AO's persistent-world model and the established AO day duration of three real days.

Off-screen simulation must not imply that every creature receives unlimited detailed actions every moment. The simulation may use bounded scheduling, event-driven updates, or aggregated population activity, provided it preserves the same world rules and does not fabricate individual outcomes.

Requirements:
- Maintain each entity's last authoritative state and next eligible simulation window.
- Process critical events individually when they can affect player-visible state, scarce resources, death, territory, or irreversible changes.
- Aggregate low-impact routine activity only when the aggregate transition preserves resource accounting and relevant causality.
- Resolve competing claims on scarce resources transactionally.
- Preserve event ordering and deterministic replay for committed outcomes.
- Avoid granting extra actions or resource regeneration because an entity is off-screen.
- Respect time, travel, recovery, reproduction, and lifecycle constraints from their own systems.
- When an entity returns to a player's perceptible area, reveal only what the player or Envoy can actually perceive.

No specific tick frequency, population budget, or simulation cadence is established by this proposal.

## 13. Interaction with AO Chess combat systems

Creature AI must use the existing combat architecture without collapsing independent mechanics.

- AP and EA remain separate.
- DR, damage resistance, penetration, and Break remain separate.
- Technique Tier and creature Tier remain separate.
- Creature class-counter archetype and Envoy class remain separate.
- Natural weapons, natural armor, anatomy, and techniques remain distinct records.
- Component damage affects only capabilities that depend on the affected component.
- Technique requirements are validated at activation and at any required maintenance stage.
- Technique geometry is independent of piece-mode movement.
- Reactions and counters use their valid timing windows.
- A Pawn-to-King or other permitted piece-mode transition by an Envoy still ends that Envoy's entire action phase, as previously specified.
- Terrain, elevation, line of sight, line of effect, cover, hazards, and persistent environmental conditions remain authoritative spatial facts.
- A creature's behavior policy cannot bypass action-phase, movement, technique, equipment, or resource requirements.

## 14. Proposed creature behavior record

The following is a conceptual record shape. Exact field names and storage tables should be aligned with the authoritative creature dossier and world schema before implementation.

```yaml
creature_behavior:
  identity:
    creature_id: <stable_entity_id>
    species_id: <species_id>
    profile_version: <version>
    status: proposed

  cognition:
    intelligence_capabilities: []
    instinct_profile: []
    temperament: []
    memory_capacity: <sourced_or_unknown>
    learning_capabilities: []

  senses:
    channels: []
    current_component_states: []
    environmental_limitations: []

  awareness:
    state: calm
    detected_stimuli: []
    current_tracks: []
    last_perception_event: null

  knowledge:
    memories: []
    suspicions: []
    communicated_information: []
    confidence_and_provenance: []

  needs:
    survival: []
    feeding: []
    shelter: []
    social: []
    territory: []
    reproduction_or_lifecycle: []

  social:
    group_id: null
    role: null
    relationships: []
    communication_methods: []

  territory:
    territory_id: null
    home_range: []
    defended_sites: []
    migration_profile: null

  tactical:
    combat_archetype: null
    threat_assessments: []
    preferred_actions: []
    retreat_conditions: []
    known_counter_patterns: []

  ecology:
    feeding_methods: []
    resource_actions: []
    habitat_requirements: []
    lifecycle_rules: []

  adaptation:
    learned_behaviors: []
    skill_progression: []
    technique_progression: []
    anatomical_changes: []
    evidence_references: []

  simulation:
    last_authoritative_update: null
    next_eligible_update: null
    policy_version: null
    replay_seed: null

  chronicle:
    committed_events: []
```

## 15. Worked example — territorial pack hunter

This is an illustrative behavior test, not a new canonical species.

A pack hunter occupies a forest territory containing a den and a resource-rich hunting area. Its members have distinct sensory capabilities and social roles.

1. One scout detects movement through scent and ground vibration but cannot identify the intruder.
2. The scout returns and gives a valid warning signal.
3. Nearby pack members become alert; they receive only the information encoded by that signal.
4. A second member investigates from cover rather than immediately attacking.
5. The intruder attacks and injures one pack member's forelimb.
6. The injured member's pounce technique becomes unavailable only if that technique requires the damaged component and its component-state rules say so.
7. The pack evaluates the changed threat using what its members have perceived.
8. If the den is threatened, some members may defend while others protect the young or retreat.
9. If the intruder withdraws, the pack may track the last known direction, but it cannot know the intruder's new location after losing the trail.
10. After the encounter, the pack's memories, injuries, resource use, territory response, and any changed terrain are committed through the normal world systems.

This test should produce different outcomes for a solitary reflexive predator, a conditioned pack animal, and an intelligent strategic hunter without changing the underlying Kernel authority.

## 16. Validation and exploit tests

Before this framework is treated as implementable, test at least:

1. A creature cannot detect an entity outside all valid sensory channels and supernatural abilities.
2. Smoke, darkness, occlusion, water, noise, wind, and injury affect only the relevant sensory channels.
3. A detected stimulus does not automatically become an identified target.
4. A creature cannot act on hidden Envoy class, Tier, inventory, or technique information without a valid information source.
5. Shared warnings reveal only the information their signal can convey.
6. Stale memories do not reveal a target's current location.
7. A creature cannot select a technique whose mandatory component is unavailable.
8. An injury to one component does not disable unrelated techniques.
9. Retreat and pursuit obey actual movement, terrain, timing, and action rules.
10. A class-counter archetype does not guarantee detection, immunity, or victory.
11. Group coordination fails or degrades when communication is unavailable or disrupted, according to the group's profile.
12. Territory changes require committed spatial and causal evidence.
13. Resource gathering consumes or transfers actual resources and cannot duplicate them.
14. Off-screen simulation cannot bypass costs, time, action limits, or resource competition.
15. Replaying the same committed inputs and policy version reproduces the same outcome.
16. AI narration cannot commit a behavior result or disclose knowledge the perceiver lacks.
17. Creature death, escape, despawn, and removal from a local battlefield remain distinct state transitions.

## 17. Open decisions and non-decisions

This proposal intentionally does not decide:
- A universal intelligence score or numerical detection formula.
- A universal aggro radius, threat threshold, retreat percentage, or tactical weight.
- The final list of creature species, instincts, temperaments, or social structures.
- Whether every creature has memory or learning.
- Universal reproduction, migration, population, or ecological growth formulas.
- The world simulation tick frequency or performance budget.
- Whether any specific creature can communicate telepathically or through a supernatural network.
- Automatic adaptation, immunity, Tier advancement, or technique acquisition.
- New creature racial types, class-counter archetypes, affinities, or weakness relationships.

All such values require source evidence or explicit creator decisions. UNKNOWN remains UNKNOWN; it is not permission for the AI to improvise.

## 18. Acceptance checklist

- [ ] Align behavior records with the authoritative creature dossier and spatial entity schema.
- [ ] Source and validate sensory channels for each creature profile.
- [ ] Define intelligence and memory capabilities per species or individual where relevant.
- [ ] Define behavior policies and bounded candidate-action generation.
- [ ] Define social communication and information-transfer rules.
- [ ] Define territory and ecological resource accounting.
- [ ] Define off-screen scheduling and deterministic replay.
- [ ] Integrate behavior proposals with Kernel action validation.
- [ ] Add perception, tactical, ecology, persistence, and exploit test fixtures.
- [ ] Review all unresolved numerical and lifecycle decisions with the creator.

**Acceptance boundary:** This document is a working proposal. It does not modify canon, production runtime behavior, database schemas, or existing combat formulas.
