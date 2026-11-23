# 11. Combat and Physical Resolution

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 1,2,3,4,5,8,9,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## Contact and physical feasibility precede chance

An action progresses through initiation, preparation, travel/detection, response, contact, defense, penetration, resistance/DR, injury and recovery. F16 is only a broad reach envelope. Exact fixture contact uses F45 translated axis-aligned boxes with relative motion; an in-range target is not automatically hit. Facing, height, intervening obstacles and swept target surfaces matter. F46 supports specific horizontal cones, not arbitrary posture or full rotational mesh physics.

Movement uses explicit comfortable load, terrain, profile speed and acceleration limits (F47–F49). A technique cannot roll through an obstacle or declare a longer arm. Actual weapon and target velocities determine relative contact speed; mismatched claimed speed or facing direction rejects. Detection and enough reaction time are necessary before any block calculation. F17/F51 additionally require readiness, consent, coverage and a legal response window; a high defense score does not invent an unseen response.

## Energy, defense, material work and injury

F18 supplies kinetic energy from effective contact mass and relative speed. F51 removes only the authorized absorbed component up to an explicit block capacity. F50 models an operational armor work barrier from stress, contact area, thickness and condition, not physically complete penetration. F20 applies the defined resistance/DR ordering and treats True Damage as a separately qualified contact property. Being a nearby gas or describing an attack as “true” does not establish actual contact or the effect property.

Coverage is local: a helmet does not protect a foot. F21 reduces DR with condition; F69 records work-to-condition wear. F52 bounds regional injury severity. F68 compares a conservative impulse fixture with restoring capacity to model a posture change; it is not a complete balance/support solver. A2kg effective weapon at10m/s has100J, while4kg at5m/s has50J: larger mass alone does not guarantee greater damage.

## Ongoing wounds and recovery

F66 gives a configured bleeding rate from a wound already established by contact. F53 decreases severity under Constitution, nutrition and elapsed rest, but preserves a missing-part condition; it does not grow a severed limb back or restore a player's life. F35 and F70 connect injury and deprivation to replenishment/ordinary action capability. Treatments require real access, material and permission, with committed results rather than narrative erasure of a wound event.

The thirteen-stage action framework rejects impossible geometry before any successful probability result can commit. Idempotent event payloads prevent reusing the same impact ID with larger energy. Existing tests cover specific translated-box, armor, posture, wear and recovery cases; they do not prove arbitrary fluid/contact physics, anatomical death thresholds or calibrated medical realism.

## Formula definitions and reproducible examples

[F15](../formula-reference.md#f15), [F16](../formula-reference.md#f16), [F17](../formula-reference.md#f17), [F18](../formula-reference.md#f18), [F19](../formula-reference.md#f19), [F20](../formula-reference.md#f20), [F21](../formula-reference.md#f21), [F28](../formula-reference.md#f28), [F35](../formula-reference.md#f35), [F43](../formula-reference.md#f43), [F45](../formula-reference.md#f45), [F46](../formula-reference.md#f46), [F47](../formula-reference.md#f47), [F48](../formula-reference.md#f48), [F49](../formula-reference.md#f49), [F50](../formula-reference.md#f50), [F51](../formula-reference.md#f51), [F52](../formula-reference.md#f52), [F53](../formula-reference.md#f53), [F66](../formula-reference.md#f66), [F68](../formula-reference.md#f68), [F69](../formula-reference.md#f69), [F70](../formula-reference.md#f70). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F15 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      60,
      40
    ],
    "expected": "7/10"
  },
  {
    "inputs": [
      0,
      100
    ],
    "expected": "1/20"
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Swept boxes, relative velocity, coverage, reaction consent, energy defense, regional injury, posture and equipment wear have fixed vectors and invalid/exploit tests. Full rotation/deformation/support physics and canonical injury/death scales are not modeled.

## Remaining acceptance gate

Review operational physical coefficients and canonical combat/effect profiles; recover actual body dimensions/equipment/techniques before numerical Azimah comparison. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — mixed defense and cinematic bound

F101 mixed ordinary/True composition from the 992 review stands. F116 bounds cinematic presentation of already-elapsed local time (intimate through horizon) without importing external feats or inventing geography. I08 ordinary NPC death is not the three-life player system.

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I01 (P0) — Typed technique/resource lifecycle and finite ordinary action profiles**: Bounded proposal acceptance is now covered by executable integrated workflows; see I01-I02-CHECKPOINT.md. Canonical records/policies remain UNKNOWN.
- **I03 (P1) — Initiative and six distinct reaction action lifecycles**: Bounded executable proposal acceptance is now covered; see I03-I04-CHECKPOINT.md. Source-specific profiles and actual body acceptance remain UNKNOWN.
- **I04 (P1) — Modifier operators and timed status/evidence integration**: Bounded executable proposal acceptance is now covered; see I03-I04-CHECKPOINT.md. Source-specific profiles and actual body acceptance remain UNKNOWN.
- **I08 (P1) — Unified autonomous NPC lifecycle across coarse/detail boundaries**: Specify finite policy-driven autonomous transitions and aggregation rules, not a production all-world AI. Keep ordinary NPC death separate from unestablished player-life applicability.
- **I10 (P1) — Interconnected numerical balance, interaction sweeps and correction impact**: Build bounded synthetic interacting workloads and compare distinct builds/corrections, without inventing canonical affinity/Agent/body sheets or forcing every build equal.
- **I11 (P1) — Mandatory per-subject three-role coverage and operation-complete trace register**: Expand coverage registry and legal/invalid stage traces for each newly specified source-independent operation; justify UNKNOWN/not-applicable individually, not blanket template acceptance.

See the [full saved-directive audit](../DIRECTIVE-COVERAGE-AUDIT.md). These gaps are separate from canonical-source access and creator-policy approval. No broad new implementation was launched in this narrow consistency pass.

## I01/I02 current executable proposal integration

The typed lifecycle now integrates actual derived gates, timed preparation/connection/activation/sustain, AP/per-affinity EA escrow, stored-object phase payer, finite physical ammunition and F69 tool wear. Finite ordinary action profiles charge AP/time; absolute cooldown survives day boundaries. No full effect library, collision/occlusion/path or reaction scheduler is claimed. See [current mechanism definitions, bounds and exploit defenses](../I01-I02-CHECKPOINT.md), [synthetic typed profiles](../data/lifecycle-profiles.json), [18 new13-stage pairs](../data/kernel-traces-lifecycle.json) and [18 tailored role records](../data/azimah-lifecycle-boundaries.json). All18 overall remain IN PROGRESS; no actual body values or named rosters inferred.

## I03/I04 current executable temporal integration

Six distinct funded Detect/Evade/Counter/Readied/Prepared/Triggered workflows now use actual sensing/paths, stable initiative, revocable event-bound consent, qualified technique reservations and physical contact/defense. Four finite synthetic statuses, physical treatment/healing, scoped suppress/nullify/revoke/replace operators and actual-history eligibility/acquisition now affect real scheduled action times/prohibitions and derived prerequisites. All are bounded PROPOSALS, not full arbitrary physics, canonical profiles or actual body acceptance. See [definitions and concrete accounting](../I03-I04-CHECKPOINT.md), [typed profiles](../data/temporal-profiles.json), [21 new13-stage legal/invalid pairs](../data/kernel-traces-temporal.json) and [63 tailored role records](../data/azimah-temporal-boundaries.json).

Setting compatibility only: God Eater/Fate are cinematic motion/impact/power-difference references, not imported lore/feat thresholds. Industrial/urban/nearly-modern gate/dungeon context coexists with mystical/ceremonial/locally indigenous cultures and pre20th-century-inspired garments. Focus is ONE Pangaea-sized/shaped continent in a far larger world, not the whole world; Hunter×Hunter is a scale reference only. Local100m fixture coordinates are not planetary/continental dimensions. No area/gravity/travel rates, art/style/map changes or numerical IP abilities inferred. Broad calibration remains I10. [Exact t104/t105 parent relays](../sources/creator-setting-direction-2026-11-07-1256-1257-CST.md).

## Previous I05/I06 production and advancement checkpoint (acceptance corrected below)

[Detailed current checkpoint](../I05-I06-CHECKPOINT.md) explains the actual finite15-tag/12-recipe registry, distinct crafting Tier/grade/floor/ceiling/natural rarity/quality/condition, tools/facilities, real material identity and conserving WIP/output/scrap; batch/edition/original/blueprint/replica/repair modes and protected three-family Heirloom contracts. Typed authority and original envelopes do not come from rarity or descriptive tags. See [registry](../data/production-registries.json) and [new formulasF89–F100](../formula-reference.md#f89).

Actual ordinary advancement now reserves/consumes paid material/AP/per-affinity EA/work, uses permanent attributes, attained unique-family quotas/mastery/prerequisites and reviewed committed history, checks a physically granted fixed-assigned-Tier Agent token and equipped instrument, retains spent costs on failure/cancel, and commits Tier/benefits exactly once. [Nine one-step profiles](../data/advancement-profiles.json) and [ten distinct benefit contracts](../data/production-benefits.json) are explicit PROPOSALS. No universal ordinary technique-Tier gate or auto stat/skill gain; capacities change without filling or artificial AP. Existing F07/F08 define permanent-stat potential; these fixtures add lower unlock ceilings and ordinary AP cap100, not a silent global rewrite. Body Tier transitions remain UNKNOWN-blocked.

Previous I05/I06 checkpoint totals100 formulas/200 unique exact examples;87 legal/invalid trace pairs;156 executed tailored role records;170×3=510 bookkeeping rows, NOT510 actual-body tests. [19 new13-stage pairs](../data/kernel-traces-production.json) and [57 tailored roles](../data/azimah-production-boundaries.json) execute/reject specific workflows. All710 prior named tests remain; fresh results are in documentation-verification.json. I07–I11 now have executed proposal evidence; canon remains unfinished; all18 overall IN PROGRESS.

## Current semantic correction acceptance

**IN PROGRESS / PROPOSAL.** [Current corrective checkpoint](../SEMANTIC-CORRECTION-CHECKPOINT.md) supersedes earlier collective I01–I06 closure: F01–F07/F09/F10 have executable corrections; **F08 generic nonmanufacturing Tier-benefit contract now has an executed proposal (not canon)**. I07–I11 now have executed proposal evidence (see Current finish); canon remains unfinished. No source gate or numerical review substitutes for that work. Current101 formulas/202 unique examples,96 legal/invalid13-stage pairs and183 tailored executed role records;180×3=540 matrix cells are bookkeeping, NOT actual body acceptance. Affinity maps remain creator-deferred UNKNOWN; exact Azimah sheets stay UNKNOWN. Source/canon stores and existing creator captures are unchanged.
