# 14. NPC Mechanics Integration

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 1,2,3,4,5,8,9,11,12,13,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## Statistical, weighted and realized inhabitants

An NPC is subject to the same ordinary action prerequisites, physical constraints, resources and knowledge limits as an Envoy unless a separately sourced exception applies. Population representation changes computational detail, not the existence of people or assets. F27 conserves statistical, weighted and realized counts. Weighting transfers one existing inhabitant and an actual allocation of stock; realization exposes a previously frozen identity/profile rather than sampling a more favorable person each time.

F60 freezes a configured latent attribute draw at identity creation. Re-realizing the same NPC retains its attributes, goods and history. Coarsening does not erase debt, membership or injuries, and death does not become resurrection on the next load. An NPC estate may remain as assets even while living population decreases; those assets cannot be reissued to both the cohort and a replacement inhabitant.

## Learning and long-horizon resources

NPC growth uses meaningful training, recovery, external XP and bounded maturation, not a free level for each simulation tick. Learned techniques and mastery need the same typed prerequisite graph and evidence as other ordinary actors. Social plans use available information and can rationally fail when beliefs are wrong. Neither the assistant's archive access nor Kernel omniscience is an NPC sense.

The proposed ordinary work cycle has86400 world seconds, an eight-hour work window and sixteen-hour rest. Each300-second job reserves1AP and4 material for1 finished good; daily needs are1 food and3 water. The combined OfflineSchedule keeps incomplete work as work-in-progress and consumes needs throughout elapsed time. At starvation, new work and AP recovery stop while deprivation continues. Thirty funded cycles produce2500 goods from10000 material in the tested fixture; that is an operational accounting example, not canonical NPC productivity.

## Player lives are not general NPC rules

The recovered three-life statement concerns players/Sovereign–Envoy bodies. LifeBook requires explicit player_envoy typing and otherwise blocks. It is not applied automatically to NPCs, Conceptual Agents or Azimah. Agent slain/Heirloom lifecycle and ordinary population death are separate subsystems. A newly spawned NPC is not a replacement Envoy unless a future sourced, authorized binding policy establishes that identity and transaction. Healing a living NPC or retaining a corpse never by itself restores a Sovereign life.

## Formula definitions and reproducible examples

[F27](../formula-reference.md#f27), [F29](../formula-reference.md#f29), [F30](../formula-reference.md#f30), [F31](../formula-reference.md#f31), [F32](../formula-reference.md#f32), [F33](../formula-reference.md#f33), [F35](../formula-reference.md#f35), [F37](../formula-reference.md#f37), [F53](../formula-reference.md#f53), [F55](../formula-reference.md#f55), [F56](../formula-reference.md#f56), [F57](../formula-reference.md#f57), [F58](../formula-reference.md#f58), [F60](../formula-reference.md#f60), [F61](../formula-reference.md#f61), [F62](../formula-reference.md#f62), [F63](../formula-reference.md#f63), [F66](../formula-reference.md#f66), [F70](../formula-reference.md#f70), [F72](../formula-reference.md#f72), [F73](../formula-reference.md#f73). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F27 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      100,
      5,
      2
    ],
    "expected": 107
  },
  {
    "inputs": [
      99,
      5,
      3
    ],
    "expected": 107
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Population/assets conservation, frozen realization, death/estate retention, funded thirty-day schedules and chunk equivalence are tested. General civilization AI, all inheritance policies and universal species physiology are not complete.

## Remaining acceptance gate

Review population distributions, coarse-state aggregation and social policy; source exact exceptional lifecycles without extending player lives by analogy. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — unified autonomous NPC lifecycle

I08 finite registered policies run training, rest, relationship, trade, travel, membership, title, expulsion, and ordinary death on the existing clock. Coarse and detailed chunking are equivalent; realization mid-travel/injury preserves identity, assets, and time. Observer knowledge is not world truth. Manifested bodies cannot be enrolled as NPC population identities. Population is never created by realization.

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I04 (P1) — Modifier operators and timed status/evidence integration**: Bounded executable proposal acceptance is now covered; see I03-I04-CHECKPOINT.md. Source-specific profiles and actual body acceptance remain UNKNOWN.
- **I07 (P1) — Complete per-attribute/per-skill development and numeric allocation tables**: Finish explicit per-attribute/per-skill calculation tables and external-XP allocation rules, without fixed point pools or double-counting skill-credit loops; distinguish distribution parameters from guaranteed gains.
- **I08 (P1) — Unified autonomous NPC lifecycle across coarse/detail boundaries**: Specify finite policy-driven autonomous transitions and aggregation rules, not a production all-world AI. Keep ordinary NPC death separate from unestablished player-life applicability.
- **I09 (P1) — Eight-scope civilization influence and privilege/reputation composition**: Specify typed scope ownership, cross-scope dedup/transfer, pressure dimensions and eligible privileges so one event cannot multiply through memberships. Do not equate influence with guaranteed reality or truth.
- **I10 (P1) — Interconnected numerical balance, interaction sweeps and correction impact**: Build bounded synthetic interacting workloads and compare distinct builds/corrections, without inventing canonical affinity/Agent/body sheets or forcing every build equal.
- **I11 (P1) — Mandatory per-subject three-role coverage and operation-complete trace register**: Expand coverage registry and legal/invalid stage traces for each newly specified source-independent operation; justify UNKNOWN/not-applicable individually, not blanket template acceptance.

See the [full saved-directive audit](../DIRECTIVE-COVERAGE-AUDIT.md). These gaps are separate from canonical-source access and creator-policy approval. No broad new implementation was launched in this narrow consistency pass.

## I03/I04 current executable temporal integration

Six distinct funded Detect/Evade/Counter/Readied/Prepared/Triggered workflows now use actual sensing/paths, stable initiative, revocable event-bound consent, qualified technique reservations and physical contact/defense. Four finite synthetic statuses, physical treatment/healing, scoped suppress/nullify/revoke/replace operators and actual-history eligibility/acquisition now affect real scheduled action times/prohibitions and derived prerequisites. All are bounded PROPOSALS, not full arbitrary physics, canonical profiles or actual body acceptance. See [definitions and concrete accounting](../I03-I04-CHECKPOINT.md), [typed profiles](../data/temporal-profiles.json), [21 new13-stage legal/invalid pairs](../data/kernel-traces-temporal.json) and [63 tailored role records](../data/azimah-temporal-boundaries.json).

## Previous I05/I06 production and advancement checkpoint (acceptance corrected below)

[Detailed current checkpoint](../I05-I06-CHECKPOINT.md) explains the actual finite15-tag/12-recipe registry, distinct crafting Tier/grade/floor/ceiling/natural rarity/quality/condition, tools/facilities, real material identity and conserving WIP/output/scrap; batch/edition/original/blueprint/replica/repair modes and protected three-family Heirloom contracts. Typed authority and original envelopes do not come from rarity or descriptive tags. See [registry](../data/production-registries.json) and [new formulasF89–F100](../formula-reference.md#f89).

Actual ordinary advancement now reserves/consumes paid material/AP/per-affinity EA/work, uses permanent attributes, attained unique-family quotas/mastery/prerequisites and reviewed committed history, checks a physically granted fixed-assigned-Tier Agent token and equipped instrument, retains spent costs on failure/cancel, and commits Tier/benefits exactly once. [Nine one-step profiles](../data/advancement-profiles.json) and [ten distinct benefit contracts](../data/production-benefits.json) are explicit PROPOSALS. No universal ordinary technique-Tier gate or auto stat/skill gain; capacities change without filling or artificial AP. Existing F07/F08 define permanent-stat potential; these fixtures add lower unlock ceilings and ordinary AP cap100, not a silent global rewrite. Body Tier transitions remain UNKNOWN-blocked.

Previous I05/I06 checkpoint totals100 formulas/200 unique exact examples;87 legal/invalid trace pairs;156 executed tailored role records;170×3=510 bookkeeping rows, NOT510 actual-body tests. [19 new13-stage pairs](../data/kernel-traces-production.json) and [57 tailored roles](../data/azimah-production-boundaries.json) execute/reject specific workflows. All710 prior named tests remain; fresh results are in documentation-verification.json. I07–I11 now have executed proposal evidence; canon remains unfinished; all18 overall IN PROGRESS.

## Current semantic correction acceptance

**IN PROGRESS / PROPOSAL.** [Current corrective checkpoint](../SEMANTIC-CORRECTION-CHECKPOINT.md) supersedes earlier collective I01–I06 closure: F01–F07/F09/F10 have executable corrections; **F08 generic nonmanufacturing Tier-benefit contract now has an executed proposal (not canon)**. I07–I11 now have executed proposal evidence (see Current finish); canon remains unfinished. No source gate or numerical review substitutes for that work. Current101 formulas/202 unique examples,96 legal/invalid13-stage pairs and183 tailored executed role records;180×3=540 matrix cells are bookkeeping, NOT actual body acceptance. Affinity maps remain creator-deferred UNKNOWN; exact Azimah sheets stay UNKNOWN. Source/canon stores and existing creator captures are unchanged.
