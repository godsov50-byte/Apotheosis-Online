# 02. Skill Synergy Matrix

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 1,4,6,8,11,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## A directed, scoped network

Synergy means transferable capability in a particular action, not universal mutual bonuses. The34 proposed skills retain distinct IDs and cores. Each registered directed edge specifies a source, target and required action tags. Only raw effective source levels from applicable edges enter F64/F05. The target's bonus is capped by its own effective level, and each source is counted once. The full34×34 matrix has12 scoped edges; an empty cell means no registered synergy, not an undiscovered secret bonus.

## Resolution order

First derive each skill's effective level from learned XP, associated core and allowed temporary effects. Next choose the action's target skill and actual tags. Filter directed edges by those tags, canonicalize duplicate sources, then calculate the capped flat contribution. Finally add that contribution to the relevant contest score. Never feed a synergy-enhanced source back into another edge: the graph is not a recursively amplifying circuit. A source skill can help execution without becoming acquired knowledge of the target technique.

## Concrete valid and invalid use

Two raw sources at20 and30 produce floor(20/10)+floor(30/10)=5 potential points. If the target is20 its F05 ceiling is4, so the result is4, provided both registered scopes match the actual action. This is a synthetic arithmetic explanation, not authorization to add two new edges. An unlisted relationship, wrong action tag, repeated source or chain of temporary synergy gains does not yield additional credit. Context is a typed input derived from the actual proposal, not a player declaring every advantageous tag.

Mastery remains separate. A novice may benefit from another trained capability, but cannot use the bonus to cross a learned-level or historical-use threshold. Improvements in a source do not retroactively rewrite earlier action results. Edge revisions need a new rule version and review, with old committed history preserved.

## Registered proposed directed edges

| Source | Target | Required action tags | Capability rationale |
| --- | --- | --- | --- |
| Observation | Navigation | sense.landmarks | shared landmark attention |
| Observation | Diagnosis | sense.symptoms | observed symptoms |
| Research | Engineering | knowledge.validated_models | validated models |
| Engineering | Construction | structure.load_plan | structural load plans |
| Craft Appraisal | Smithing | material.tolerances | known material tolerances |
| Diagnosis | Medicine | medical.condition_identified | condition identification |
| Navigation | Trade | trade.route_known | route logistics |
| Negotiation | Trade | trade.bargaining | bargaining information |
| Leadership | Construction | crew.consents | consenting crew coordination |
| Survival | Agriculture | ecology.judgment | ecological judgment |
| Affinity Control | Ritual Design | symbol.connection_model | connection models |
| Athletics | Evasion | body.foot_placement | trained balance and foot placement |

## Formula definitions and reproducible examples

[F04](../formula-reference.md#f04), [F05](../formula-reference.md#f05), [F28](../formula-reference.md#f28), [F62](../formula-reference.md#f62), [F64](../formula-reference.md#f64). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F04 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      30,
      20,
      0
    ],
    "expected": 20
  },
  {
    "inputs": [
      5,
      40,
      3
    ],
    "expected": 8
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Directed edge filtering, deduplication, caps and non-recursion are tested. Coverage is a small proposed network, not every plausible professional interaction.

## Remaining acceptance gate

Review the12 proposed edges and action-tag taxonomy; expand only with explicit capability justification and tests, then compare sourced body skill lists. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — contribution cap and non-recursive synergy

F109 now sits beside F05/F64: a temporary or uncapped learned score cannot exceed the declared maximum or manufacture mastery evidence. Each of the34 proposed skills has its own I11 three-role bookkeeping row. The12 directed edges are unchanged; no recursive synergy loop was added.

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I07 (P1) — Complete per-attribute/per-skill development and numeric allocation tables**: Finish explicit per-attribute/per-skill calculation tables and external-XP allocation rules, without fixed point pools or double-counting skill-credit loops; distinguish distribution parameters from guaranteed gains.
- **I10 (P1) — Interconnected numerical balance, interaction sweeps and correction impact**: Build bounded synthetic interacting workloads and compare distinct builds/corrections, without inventing canonical affinity/Agent/body sheets or forcing every build equal.
- **I11 (P1) — Mandatory per-subject three-role coverage and operation-complete trace register**: Expand coverage registry and legal/invalid stage traces for each newly specified source-independent operation; justify UNKNOWN/not-applicable individually, not blanket template acceptance.

See the [full saved-directive audit](../DIRECTIVE-COVERAGE-AUDIT.md). These gaps are separate from canonical-source access and creator-policy approval. No broad new implementation was launched in this narrow consistency pass.

## Previous I05/I06 production and advancement checkpoint (acceptance corrected below)

[Detailed current checkpoint](../I05-I06-CHECKPOINT.md) explains the actual finite15-tag/12-recipe registry, distinct crafting Tier/grade/floor/ceiling/natural rarity/quality/condition, tools/facilities, real material identity and conserving WIP/output/scrap; batch/edition/original/blueprint/replica/repair modes and protected three-family Heirloom contracts. Typed authority and original envelopes do not come from rarity or descriptive tags. See [registry](../data/production-registries.json) and [new formulasF89–F100](../formula-reference.md#f89).

Actual ordinary advancement now reserves/consumes paid material/AP/per-affinity EA/work, uses permanent attributes, attained unique-family quotas/mastery/prerequisites and reviewed committed history, checks a physically granted fixed-assigned-Tier Agent token and equipped instrument, retains spent costs on failure/cancel, and commits Tier/benefits exactly once. [Nine one-step profiles](../data/advancement-profiles.json) and [ten distinct benefit contracts](../data/production-benefits.json) are explicit PROPOSALS. No universal ordinary technique-Tier gate or auto stat/skill gain; capacities change without filling or artificial AP. Existing F07/F08 define permanent-stat potential; these fixtures add lower unlock ceilings and ordinary AP cap100, not a silent global rewrite. Body Tier transitions remain UNKNOWN-blocked.

Previous I05/I06 checkpoint totals100 formulas/200 unique exact examples;87 legal/invalid trace pairs;156 executed tailored role records;170×3=510 bookkeeping rows, NOT510 actual-body tests. [19 new13-stage pairs](../data/kernel-traces-production.json) and [57 tailored roles](../data/azimah-production-boundaries.json) execute/reject specific workflows. All710 prior named tests remain; fresh results are in documentation-verification.json. I07–I11 now have executed proposal evidence; canon remains unfinished; all18 overall IN PROGRESS.

## Current semantic correction acceptance

**IN PROGRESS / PROPOSAL.** [Current corrective checkpoint](../SEMANTIC-CORRECTION-CHECKPOINT.md) supersedes earlier collective I01–I06 closure: F01–F07/F09/F10 have executable corrections; **F08 generic nonmanufacturing Tier-benefit contract now has an executed proposal (not canon)**. I07–I11 now have executed proposal evidence (see Current finish); canon remains unfinished. No source gate or numerical review substitutes for that work. Current101 formulas/202 unique examples,96 legal/invalid13-stage pairs and183 tailored executed role records;180×3=540 matrix cells are bookkeeping, NOT actual body acceptance. Affinity maps remain creator-deferred UNKNOWN; exact Azimah sheets stay UNKNOWN. Source/canon stores and existing creator captures are unchanged.
