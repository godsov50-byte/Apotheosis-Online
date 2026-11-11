# 01. Attribute and Skill System

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 2,5,6,8,11,14,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## Attribute meaning and independent development

The latest t99 working direction uses Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma and Attunement. Baseline10, approximately20 for an average Tier9 and potentially30 for an exceptional Tier9 are creator working directions, not a fixed distributable point pool. The older six Force/Precision/Endurance/Cunning/Presence/Insight are retained in complete cb94/738f records, not silently converted. Definitions below and every new coefficient are PROPOSALS.

Strength measures force and load bearing, not proficiency. Dexterity measures coordination and control, not knowledge. Constitution supports sustained exertion and resilience, not immunity. Intelligence concerns reasoning and structured learning, not access to truth. Wisdom concerns attention and judgment under incomplete evidence, not omniscience. Charisma concerns expression and interpersonal influence, not compulsory obedience. Attunement concerns affinity access/control capacity, not ownership of concepts or permission to use every technique. Current effective scores may change with injury or equipment; permanent growth and advancement eligibility do not inherit temporary bonuses.

## Learning, suppression and meaningful practice

A learned skill retains its earned XP when its associated core is suppressed. Effective use is capped by the current core through F04. F02 gives cumulative XP; F03 awards qualifying practice with challenge and feedback, including reduced qualifying-failure credit. Repeating an event ID awards nothing. Novelty, recovery and time-window checks precede credit, so hitting an inert target forever is not a growth engine. A temporary score increase may improve current execution but never manufactures historical XP or mastery evidence.

F29 selects an eligible training opportunity, not an immediate attribute increase. Archetype weights influence available opportunities rather than assigning a fixed sum of scores. F30 requires recovery from strain. F31 spends an external XP bank sequentially and recomputes its cost after each point, respecting a configured physiological ceiling. F32 models a bounded species maturation increment; an adult receives no perpetual age bonus. Species curves and initial latent ranges are configured proposals, not recovered AO biology.

## Worked interaction and exploit boundary

A character with core10 and learned skill80 uses effective skill10. Its simple F28 contest benchmark is floor(10/2)+10=15. Core80 with skill2 instead scores42: raw attributes can matter without granting the missing technique pattern. Neither benchmark bypasses hard acquisition, tool, affinity or permission gates. Mastery stages additionally require qualifying uses and distinct contexts (F62); a title, synergy bonus or borrowed tool cannot satisfy that evidence requirement.

## Proposed skill inventory

These34 named skill proposals are not an affinity or Conceptual Agent roster. Each has its own core and scope; common learning/mastery rules above do not make the skills interchangeable.

| ID | Skill proposal | Associated core | Actual scope |
| --- | --- | --- | --- |
| SK01 | Greatsword Proficiency | STR | Greatsword handling only; no other weapon proficiency granted |
| SK02 | Shortsword Proficiency | DEX | Shortsword handling only; no other weapon proficiency granted |
| SK03 | Longsword Proficiency | STR | Longsword handling only; no other weapon proficiency granted |
| SK04 | Rapier Proficiency | DEX | Rapier handling only; no other weapon proficiency granted |
| SK05 | Scimitar Proficiency | DEX | Scimitar handling only; no other weapon proficiency granted |
| SK06 | Katana Proficiency | DEX | Katana handling only; no other weapon proficiency granted |
| SK07 | Longbow Proficiency | STR | Longbow handling only; no other weapon proficiency granted |
| SK08 | Shortbow Proficiency | DEX | Shortbow handling only; no other weapon proficiency granted |
| SK09 | Recurve Bow Proficiency | DEX | Recurve Bow handling only; no other weapon proficiency granted |
| SK10 | Composite Bow Proficiency | STR | Composite Bow handling only; no other weapon proficiency granted |
| SK11 | Yumi Proficiency | DEX | Yumi handling only; no other weapon proficiency granted |
| SK12 | Athletics | STR | lifting, hauling, climbing |
| SK13 | Construction | STR | load-bearing assembly |
| SK14 | Endurance Training | CON | sustained exertion pacing |
| SK15 | Survival | WIS | shelter, route and exposure judgment |
| SK16 | Observation | WIS | sense-derived detection |
| SK17 | Diagnosis | WIS | condition inference from evidence |
| SK18 | Research | INT | validated model-building |
| SK19 | Engineering | INT | mechanism design |
| SK20 | Smithing | DEX | precision metal shaping |
| SK21 | Alchemy | INT | controlled substance transformation |
| SK22 | Stealth | DEX | concealment through movement |
| SK23 | Navigation | WIS | routes from acquired spatial evidence |
| SK24 | Negotiation | CHA | bargaining, no coerced decisions |
| SK25 | Leadership | CHA | coordination with consenting participants |
| SK26 | Performance | CHA | expression, signaling and audience response |
| SK27 | Affinity Control | ATT | learned symbolic connection; per affinity specialization |
| SK28 | Ritual Design | INT | construction of permissioned symbolic patterns |
| SK29 | Medicine | WIS | treatment with proper materials |
| SK30 | Agriculture | WIS | ecological cultivation |
| SK31 | Trade | INT | valuation, ledgers and logistics |
| SK32 | Craft Appraisal | INT | evidence-based material and quality assessment |
| SK33 | Evasion | DEX | body displacement within reaction window |
| SK34 | Shield | STR | shield handling and coverage |

## Formula definitions and reproducible examples

[F01](../formula-reference.md#f01), [F02](../formula-reference.md#f02), [F03](../formula-reference.md#f03), [F04](../formula-reference.md#f04), [F06](../formula-reference.md#f06), [F28](../formula-reference.md#f28), [F29](../formula-reference.md#f29), [F30](../formula-reference.md#f30), [F31](../formula-reference.md#f31), [F32](../formula-reference.md#f32), [F47](../formula-reference.md#f47), [F60](../formula-reference.md#f60), [F62](../formula-reference.md#f62). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F01 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      20,
      2,
      -5
    ],
    "expected": 17
  },
  {
    "inputs": [
      10,
      0,
      -20
    ],
    "expected": 1
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Executable growth banks, learning bounds, suppression, opportunity sampling and frozen latent attributes. Not a complete developmental physiology or calibrated population distribution.

## Remaining acceptance gate

Review growth coefficients/species profiles and recover exact Azimah reference inputs; never substitute an archetype fixture for either body. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — I07 development tables

Per-attribute and per-skill growth now have executable F104–F109 rules: one causal learning budget, exact integer allocation of that shared budget, physiological recovery only over actual rest, development credit kept distinct from spendable XP, issuer-conserving external costs recomputed after each point, and a hard contribution cap. Tests cover all34 skills, mid-session environment change, missing-environment interrupt, unique failure/cancel, shared-event one-budget allocation, banked/suppressed cores, temporary-modifier non-attainment, rest/work exclusion, and eligibility suppress/revoke. Archetype weights remain opportunity parameters, not guaranteed gains. Exact Azimah growth sheets remain UNKNOWN.

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I04 (P1) — Modifier operators and timed status/evidence integration**: Bounded executable proposal acceptance is now covered; see I03-I04-CHECKPOINT.md. Source-specific profiles and actual body acceptance remain UNKNOWN.
- **I06 (P1) — Advancement acquisition transaction and differentiated Tier benefits**: Earlier bounded acceptance claim is superseded by the semantic correction checkpoint. I06/general-benefit F08 remains independent OPEN, separate from canonical profiles/policies.
- **I07 (P1) — Complete per-attribute/per-skill development and numeric allocation tables**: Finish explicit per-attribute/per-skill calculation tables and external-XP allocation rules, without fixed point pools or double-counting skill-credit loops; distinguish distribution parameters from guaranteed gains.
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
