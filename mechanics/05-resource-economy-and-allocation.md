# 05. Resource Economy and Allocation

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 1,3,4,6,9,11,12,14,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## Resource types, units and allocations

AP is the universal action resource; EA is separate and allocated to each accessible affinity. Do not invent a second generic mana or stamina reserve. Fatigue, injury and deprivation are conditions that influence permitted actions and recovery, not duplicate pools. F07 proposes AP maximum5×Constitution; F08 proposes per-affinity EA8×Attunement+4×min(Attunement, affinity control). Neither formula is an established canonical capacity. F09 limits simultaneously drawn domains independently of the number of owned pools.

The broad synthetic example with six pools at240EA has1440 totalEA but only one active channel atATT20. Recovery is a shared total budget allocated across domains, not a full independent regeneration stream for each owned affinity. A0.1EA/s total over60s returns6EA, not36. Replenishment caps at each maximum, uses explicit allocation shares and records its source; it is not an unaccounted transfer from an object or another actor.

## Preparation, stored charge, activation and sustain

A stored reservoir preserves per-domain quantities, capacity, provenance and owner. F38's transfer efficiency makes100EA available produce80 stored and20 loss at efficiency4/5; charging cannot create charge. Activation can spend a reservoir's EA while still charging the actor's AP and daily family usage. A second object or renamed family does not create another daily allowance. Sustain stops at the exact payable time from F37; a reserve cannot go negative or fund an entire interval after it has emptied.

Preparation charges only the explicitly committed preparation phase. Execution validates derived technique gates, consent, geometry and funds before the activation result. AP recovery is disabled during active spend/sustain in the defined interval model to prevent a same-pool infinite loop. F36 facilities require a declared serviced capacity and active fuel; overcrowding limits benefit. Injury recovery factor F35 and nutrition constraints reduce actual replenishment, not merely its display.

## World time, offline work and unknown reset policy

F34 needs an explicit positive world-day length and epoch. Complete a8fa says three world days per real day; complete738f says one AO day per three real days. Conflict C03 remains unresolved: no real-time conversion or guessed reset is selected. Azimah's shared-versus-body daily scope also remains UNKNOWN. Ordinary86400-second cycles used in work fixtures are named proposals, not a resolution of C03.

The combined OfflineSchedule reserves AP/material at task start, retains work-in-progress, consumes food/water over time and permits rest only when funded. Once nutrition fails, work and recovery stop while time/deprivation continue. Bulk and irregular step schedules are checked for identical state, rather than crediting a player for repeatedly reopening a simulation.

## Formula definitions and reproducible examples

[F07](../formula-reference.md#f07), [F08](../formula-reference.md#f08), [F09](../formula-reference.md#f09), [F10](../formula-reference.md#f10), [F11](../formula-reference.md#f11), [F12](../formula-reference.md#f12), [F13](../formula-reference.md#f13), [F34](../formula-reference.md#f34), [F35](../formula-reference.md#f35), [F36](../formula-reference.md#f36), [F37](../formula-reference.md#f37), [F38](../formula-reference.md#f38), [F61](../formula-reference.md#f61), [F66](../formula-reference.md#f66), [F70](../formula-reference.md#f70). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F07 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      20
    ],
    "expected": 100
  },
  {
    "inputs": [
      30
    ],
    "expected": 150
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Exact rational pool accounting, capacity, charge loss, last-use contention, interval depletion and funded offline schedule fixtures are tested. Production scheduling, canonical maxima and world calendar are not settled.

## Remaining acceptance gate

Resolve canonical capacities/rates/phase costs, calendar ratio/day length and Azimah daily attribution from exact sources or explicit creator policy. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — paid development and conserved trade

I07 training, rest, and external allocation spend the same AP/EA ledger as other paid work. I08 F110 conserves buyer and seller wallets; a finite good cannot be sold twice. Influence opportunity draws cannot mint stock (F113/F57). Canonical capacities, calendar C03, and daily attribution remain unresolved.

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I01 (P0) — Typed technique/resource lifecycle and finite ordinary action profiles**: Bounded proposal acceptance is now covered by executable integrated workflows; see I01-I02-CHECKPOINT.md. Canonical records/policies remain UNKNOWN.
- **I03 (P1) — Initiative and six distinct reaction action lifecycles**: Bounded executable proposal acceptance is now covered; see I03-I04-CHECKPOINT.md. Source-specific profiles and actual body acceptance remain UNKNOWN.
- **I06 (P1) — Advancement acquisition transaction and differentiated Tier benefits**: Earlier bounded acceptance claim is superseded by the semantic correction checkpoint. I06/general-benefit F08 remains independent OPEN, separate from canonical profiles/policies.
- **I07 (P1) — Complete per-attribute/per-skill development and numeric allocation tables**: Finish explicit per-attribute/per-skill calculation tables and external-XP allocation rules, without fixed point pools or double-counting skill-credit loops; distinguish distribution parameters from guaranteed gains.
- **I08 (P1) — Unified autonomous NPC lifecycle across coarse/detail boundaries**: Specify finite policy-driven autonomous transitions and aggregation rules, not a production all-world AI. Keep ordinary NPC death separate from unestablished player-life applicability.
- **I10 (P1) — Interconnected numerical balance, interaction sweeps and correction impact**: Build bounded synthetic interacting workloads and compare distinct builds/corrections, without inventing canonical affinity/Agent/body sheets or forcing every build equal.
- **I11 (P1) — Mandatory per-subject three-role coverage and operation-complete trace register**: Expand coverage registry and legal/invalid stage traces for each newly specified source-independent operation; justify UNKNOWN/not-applicable individually, not blanket template acceptance.

See the [full saved-directive audit](../DIRECTIVE-COVERAGE-AUDIT.md). These gaps are separate from canonical-source access and creator-policy approval. No broad new implementation was launched in this narrow consistency pass.

## I01/I02 current executable proposal integration

The typed lifecycle now integrates actual derived gates, timed preparation/connection/activation/sustain, AP/per-affinity EA escrow, stored-object phase payer, finite physical ammunition and F69 tool wear. Finite ordinary action profiles charge AP/time; absolute cooldown survives day boundaries. No full effect library, collision/occlusion/path or reaction scheduler is claimed. See [current mechanism definitions, bounds and exploit defenses](../I01-I02-CHECKPOINT.md), [synthetic typed profiles](../data/lifecycle-profiles.json), [18 new13-stage pairs](../data/kernel-traces-lifecycle.json) and [18 tailored role records](../data/azimah-lifecycle-boundaries.json). All18 overall remain IN PROGRESS; no actual body values or named rosters inferred.

## I03/I04 current executable temporal integration

Six distinct funded Detect/Evade/Counter/Readied/Prepared/Triggered workflows now use actual sensing/paths, stable initiative, revocable event-bound consent, qualified technique reservations and physical contact/defense. Four finite synthetic statuses, physical treatment/healing, scoped suppress/nullify/revoke/replace operators and actual-history eligibility/acquisition now affect real scheduled action times/prohibitions and derived prerequisites. All are bounded PROPOSALS, not full arbitrary physics, canonical profiles or actual body acceptance. See [definitions and concrete accounting](../I03-I04-CHECKPOINT.md), [typed profiles](../data/temporal-profiles.json), [21 new13-stage legal/invalid pairs](../data/kernel-traces-temporal.json) and [63 tailored role records](../data/azimah-temporal-boundaries.json).

## Previous I05/I06 production and advancement checkpoint (acceptance corrected below)

[Detailed current checkpoint](../I05-I06-CHECKPOINT.md) explains the actual finite15-tag/12-recipe registry, distinct crafting Tier/grade/floor/ceiling/natural rarity/quality/condition, tools/facilities, real material identity and conserving WIP/output/scrap; batch/edition/original/blueprint/replica/repair modes and protected three-family Heirloom contracts. Typed authority and original envelopes do not come from rarity or descriptive tags. See [registry](../data/production-registries.json) and [new formulasF89–F100](../formula-reference.md#f89).

Actual ordinary advancement now reserves/consumes paid material/AP/per-affinity EA/work, uses permanent attributes, attained unique-family quotas/mastery/prerequisites and reviewed committed history, checks a physically granted fixed-assigned-Tier Agent token and equipped instrument, retains spent costs on failure/cancel, and commits Tier/benefits exactly once. [Nine one-step profiles](../data/advancement-profiles.json) and [ten distinct benefit contracts](../data/production-benefits.json) are explicit PROPOSALS. No universal ordinary technique-Tier gate or auto stat/skill gain; capacities change without filling or artificial AP. Existing F07/F08 define permanent-stat potential; these fixtures add lower unlock ceilings and ordinary AP cap100, not a silent global rewrite. Body Tier transitions remain UNKNOWN-blocked.

Previous I05/I06 checkpoint totals100 formulas/200 unique exact examples;87 legal/invalid trace pairs;156 executed tailored role records;170×3=510 bookkeeping rows, NOT510 actual-body tests. [19 new13-stage pairs](../data/kernel-traces-production.json) and [57 tailored roles](../data/azimah-production-boundaries.json) execute/reject specific workflows. All710 prior named tests remain; fresh results are in documentation-verification.json. I07–I11 now have executed proposal evidence; canon remains unfinished; all18 overall IN PROGRESS.

## Current semantic correction acceptance

**IN PROGRESS / PROPOSAL.** [Current corrective checkpoint](../SEMANTIC-CORRECTION-CHECKPOINT.md) supersedes earlier collective I01–I06 closure: F01–F07/F09/F10 have executable corrections; **F08 generic nonmanufacturing Tier-benefit contract now has an executed proposal (not canon)**. I07–I11 now have executed proposal evidence (see Current finish); canon remains unfinished. No source gate or numerical review substitutes for that work. Current101 formulas/202 unique examples,96 legal/invalid13-stage pairs and183 tailored executed role records;180×3=540 matrix cells are bookkeeping, NOT actual body acceptance. Affinity maps remain creator-deferred UNKNOWN; exact Azimah sheets stay UNKNOWN. Source/canon stores and existing creator captures are unchanged.
