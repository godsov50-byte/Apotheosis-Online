# AO Chess — Encounter Director & Battlefield Simulation Proposal

**Status: PROPOSED / PLAYTEST IMPLEMENTATION ONLY. Not canon.** This document specifies encounter-level lifecycle and simulation rules. It does not change the Kernel, combat formulas, creature identities, population numbers, reward tables, or the live Chessboard prototype.

## 1. Purpose and boundaries

Encounters arise from persistent world conditions, existing entities, factions, populations, objectives, and events—not from arbitrary difficulty scaling. The Encounter Director manages encounter structure, lifecycle, participant assembly, deployment, objectives, waves, reinforcement scheduling, and resolution criteria.

Authority remains separated:
- **World simulation:** authoritative world conditions, populations, faction activity, ecological processes, and causes.
- **Encounter Director:** encounter-level orchestration and requests (candidate evaluation, composition references, deployment, objectives, reinforcement schedules, waves, lifecycle).
- **Combat AI:** bounded intentions using each participant's permitted knowledge and capabilities.
- **AO Kernel:** validates actions, resources, spatial rules, timing, effects, damage, Break, interactions, and committed combat outcomes.
- **WorldHeart:** persists current state and append-only committed event history.
- **Narration:** describes only committed facts and information available to the chosen perceiver.

The Director cannot independently set HP, damage, inventory, terrain, drops, or combat outcomes. It must request changes through their authoritative systems.

## 2. Encounter origins

Each encounter must retain a source/origin record. Possible origins include creature or population activity, patrols, dungeon residents, faction conflicts, resource disturbance, calamity, player-triggered events, ambushes, escorts, rescues, assassinations, defenses, tournaments, summoning events, investigations, quests, and emergent interactions.

Origin details may be hidden from participants, but the authority record must preserve cause and evidence. An unrelated enemy may not be added solely to increase difficulty.

## 3. Encounter lifecycle

Proposed states: Dormant, Candidate, Evaluating, Registered, Preparing, Active, Escalating, Paused, Suspended, Resolved, Failed, Terminated, Persisting.

Transitions are event-driven and validated. An encounter can be resolved while its consequences persist (damaged terrain, fires, remains, captures, resource drops, territory changes, unresolved threats). Lifecycle state is distinct from individual combat state and turn/action phase.

## 4. Composition and scale

Composition uses valid references to existing or legitimately generated entities, populations, faction rosters, nests, patrols, defenders, reserves, summons, or other permitted sources. Composition fields are independent: participants, roles, factions, population sources, objectives, environment, resources, conditions, reserves, and intelligence.

Scale may be Individual, Pair/Skirmish, Group, Army/Battle, or Siege/Strategic Conflict. Scale describes scope, not Tier. It may change as participants or events join, but only through valid causes.

The Director may not spawn unrelated species or entities, grant techniques/equipment, alter Tier or stats, or create resources without a valid source.

## 5. Difficulty and threat estimation

Difficulty is an estimate relative to a specified participant or group, not a fact or a balancing lever. Suggested labels are Trivial, Easy, Moderate, Challenging, Severe, Overwhelming, and Unknown. Factors may include Tier, capabilities, techniques, equipment, count, coordination, terrain, objectives, resource state, fatigue, injuries, surprise, escape conditions, and uncertainty.

Adaptive selection may choose among valid encounter variants and deployment options. It cannot silently change combat stats, resources, techniques, committed outcomes, drop probabilities, or grant invulnerability. Escalation must be traceable to an existing rule or world event.

## 6. Deployment and spawn

Deployment describes how an entity enters the battlefield; spawning describes a permitted creation/presence process. Distinguish Generation, Spawning, Deployment, Summoning, Reproduction, Respawning, Migration, and population regrowth.

Deployment/spawn validation includes source eligibility, valid coordinates, terrain compatibility, footprint, occupancy/capacity, elevation and spatial volume, traversability, collision, hazards, entry restrictions, and any explicitly defined protection. No entity may appear in a blocked or occupied space unless a rule explicitly allows it. Spawn protection is not universal.

Suggested zones: player entry, enemy entry, neutral, reserve, objective, hazard, restricted, and concealed deployment. Zones may be hidden from combatants.

## 7. Reinforcements and escalation

Reinforcements require a legitimate source and cause: alarm, patrol response, gate breach, missing patrol, objective change, resource disturbance, scheduled arrival, faction mobilization, creature response, calamity, communication, or player-created response.

Lifecycle: Trigger → Detect → Decide → Mobilize → Travel → Arrival → Deployment → Engagement. Travel time is real simulation state; reinforcements cannot teleport without an authorized capability. Routes can be blocked, delayed, intercepted, diverted, or disrupted.

Escalation can be numerical, threat, environmental, objective, spatial, faction, calamity, time, resource, or information-based. An encounter can escalate without new enemies (e.g. flooding, bridge collapse, smoke, visibility change, objective instability).

## 8. Waves

Wave patterns may be Sequential, Timed, Conditional, Reinforcement, Escalating, Mixed, Endless, Survival, or Boss-with-Support. Wave triggers can depend on previous wave completion, objectives, alarm, time, cell entry, entity death, structure state, ritual, resource collection, or encounter rules.

Wave transitions may offer no break, a pause, deployment delay, recovery, objective update, terrain change, resource drops, or withdrawal. Recovery is only permitted if the recovery system explicitly allows it; wave transitions do not automatically refill HP, AP, EA, stamina, charges, cooldowns, or equipment.

## 9. Objectives

Objective types include Elimination, Capture, Defense, Survival, Extraction, Escort, Destroy, Disable, Activate, Interrupt, Rescue, Investigate, Escape, Reach, Occupy, Hold, Delay, Prevent, Deliver, Recover, Seal, Unseal, Purge, Hunt, and Track.

Objective visibility is independent from state. Suggested states: Hidden, Unknown, Available, Discovered, Active, Contested, Progressing, Paused, Completed, Failed, Destroyed, Expired.

Objectives may require presence, interaction, eligible entity, technique, resource, duration, multiple participants, sequence, control of cells, uninterrupted process, or enemy absence. Capture/control rules are objective-specific; contested states and progress decay/reset must be explicitly defined.

## 10. Environment and hazards

Environment can create or alter encounters through fire, flooding, storms, avalanche, landslide, earthquake, collapse, toxic gas, darkness, corruption, magical instability, temperature, resource instability, spatial distortion, or weather.

Environment changes are resolved by the Kernel/environment system and committed by WorldHeart. Director monitoring may trigger objectives, escalation, route changes, or spawn/reinforcement rules. Terrain and hazards are spatial truth, not narrative decoration.

## 11. Ecology and populations

Creature encounters draw from persistent populations when their source is ecological. Population records may include species/being identity, population count, age/lifecycle distribution, Tier distribution, habitat, territory, nest/settlement, social structure, food/resources, predators/prey, reproduction, migration, mortality, conditions, seasonality, pressure, threats, and history.

Activities include hunting, foraging, resting, territorial defense, migration, investigation, scavenging, social behavior, nesting, and retreat, subject to actual creature anatomy, senses, intelligence, needs, and capability. Combat may cause population decline, territory vacancy, imbalance, migration, competition, local extinction, or recovery. No instant replenishment merely to maintain encounter density.

## 12. Adaptive difficulty without cheating

Allowed: select among existing variants; choose valid spawn sites; configure objectives within defined bounds; draw from eligible populations/rosters; react to player actions; choose tactics and formations; schedule legitimate responses; escalate/de-escalate through valid triggers.

Prohibited: secretly raise stats/Tier; grant unearned abilities; invent resources/equipment; rewrite outcomes; guarantee hits or defeat; grant hidden invulnerability; spawn entities without a source; alter committed drops or reward odds to compensate for success.

The world reacts to player actions; it does not secretly rebalance itself around the player.

## 13. Persistence, absence, interruption, and re-entry

Distinguish Active Tactical Combat, Ongoing Battle, Suspended Encounter, Abandoned Encounter, Dormant Encounter, Persistent Threat, and Recurring Encounter. Leaving/disconnecting does not freeze enemies or grant invulnerability. Behavior on absence must follow the entity's approved autonomy, conditional orders, reaction policy, and world scheduling.

An entity may continue under approved AI, follow an existing order, guard, retreat, become vulnerable, be defeated, captured, leave, or be suspended only where supported. Encounter persistence is distinct from an entity's local visibility.

## 14. Resolution and rewards

Resolution conditions include designated defeat, objective completion/failure, escape, capture, withdrawal, surrender, timeout, termination, threat removal, battlefield inaccessibility, or other valid conditions.

Outcome labels: Victory, Defeat, Partial Victory, Partial Defeat, Draw, Retreat, Escape, Surrender, Capture, Stalemate, Interrupted. Outcomes can coexist at different levels (individual retreat while faction victory occurs).

Rewards must originate from encounter sources, objectives, creature drops, world economy, or valid progression systems: materials, equipment, heirlooms, resource cells, currency, experience, skills, techniques/discoveries, reputation, territory, access, or information. The Director cannot invent rewards. Preserve distinctions between remains/drops, independently spawned resource cells, contained resources, harvested materials, and collected inventory.

## 15. Respawn and encounter recycling

Separate Entity Respawn, Population Regrowth, Encounter Reset, Dungeon Reset, Wave Regeneration, Summon Reuse, Reconstruction, and Revival. Each process requires eligible source, trigger, delay, location, state restoration, memory/equipment/resource behavior, drop handling, population limits, cost, restrictions, and history. Respawn does not automatically imply full restoration or identical memory/loadout.

## 16. Integration requirements

- Encounter lifecycle is not combat-round or AP/action-phase lifecycle.
- Director requests are validated; it cannot bypass Kernel.
- Composition uses source references; generated entities require an authorized generation process.
- Spawn/deployment use spatial validation.
- Reinforcement travel uses world movement/time.
- Objectives use explicit evaluation rules and visible/hidden state.
- Waves do not imply automatic recovery.
- Ecology and resource accounting prevent duplication.
- Off-screen simulation follows time, costs, limits, and deterministic replay requirements.
- Chronicle records causal links, source, trigger, decisions, arrival, outcome, drops, collection, terrain changes, and participants.
- T1 narration is perceiver-scoped and does not invent events.

## 17. Open decisions (intentionally unresolved)

No universal spawn frequency, population number, reinforcement distance, difficulty formula, objective-control duration, wave break length, simulation cadence, encounter budget, respawn timer, recovery rate, or numerical threat threshold is established here. These remain UNKNOWN until sourced or explicitly decided.

## 18. Validation checklist

- [ ] Encounter source and origin are retained.
- [ ] Composition references legitimate sources/entities.
- [ ] No unsupported spawn or occupied/blocked deployment.
- [ ] Reinforcements require causal triggers and travel.
- [ ] Waves obey explicit trigger and transition rules.
- [ ] Objectives distinguish visibility, state, progress, and control.
- [ ] Environmental changes resolve and persist.
- [ ] Population losses and regrowth are accounted for.
- [ ] Adaptive selection cannot modify entity stats or outcomes.
- [ ] Disconnect/absence follows autonomy rules, not invulnerability.
- [ ] Drops, resource cells, containers, harvest, and collection remain distinct.
- [ ] Respawn/reset/revival processes are not conflated.
- [ ] Replay and event history preserve causality.

**Acceptance boundary:** proposal and local playtest support only. Not canon and not connected to persistent world runtime.
