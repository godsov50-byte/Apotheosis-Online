# 06. Tier Advancement Requirements

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 1,2,3,4,5,7,8,14,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## Advancement is eligibility, not acquisition

Tier progresses from9 toward0; Tier2 is below Tier1. A lower numeral is not a universal linear damage multiplier. Proposed threshold rows below concern permanent specialist/support attributes, Attunement, learned skill, distinct affinities, technique families, mastery and conceptual evidence. Temporary equipment or modifiers never become permanent advancement credit. Passing a threshold check is not a committed Tier change, nor automatic acquisition of a technique or Heirloom.

## Per-affinity prerequisite proof

An aggregate count alone is insufficient. evaluate_tier and advancement_eligible require an explicit family-to-affinity catalogue, qualifying affinities actually owned by the candidate, a positive integer quota for every qualifying affinity and a declared counting policy. F71 canonicalizes aliases and deduplicates acquisitions before filtering by each affinity's real association. Under the proposed per_affinity_unique_family policy the same multi-affinity family can contribute once to each matching quota; that convention is not canon. Unknown canonical quotas or incomplete graph data block rather than passing.

For a synthetic candidate requiring one A-associated family, acquiring only a B-associated family fails even if total acquired count is one. Acquiring a and its alias still gives one A family, not two. Mastery aliases must agree, and learned mastery is not inferred from an inflated effective contest score. The complete per-affinity map and quotas remain UNKNOWN for actual AO progression.

## Evidence, Heirloom and transaction

Conceptual demonstrations come from unique committed evidence, with typed filters and actor attribution; rumors and replayed causal IDs do not supply extra demonstrations. The Heirloom authorization must identify this candidate and the relevant assigned Tier. Bounded attestation is a separately named fixture, not proof that the creator chose attestation instead of acquisition, consumption or custody.

F39 remains an older generic ritual QUOTE proposal, not the operative I06 profile or a learned technique/Heirloom-taking permission. The current AdvancementProfile explicitly supplies actual preparation/work/material/AP/per-domain EA/equipped-tool/custody/benefit policies. ProductionBook now executes these as full finite ritual transactions: reservation, preparation, timed work, failure/cancel, permanent Tier/benefit commitment and no-fill resource reconciliation. It is a local executable reference design, not a deployed production Kernel. Unknown canonical policies still block; completed preparation/work stays paid independently of an uncommitted Tier change.

## Proposed threshold rows, not actual character sheets

Every row still requires explicit per-affinity technique quotas/maps (canonical values UNKNOWN), conceptual evidence and the appropriate authorized Heirloom policy. Aggregate family counts below never replace F71.

| Target Tier | Specialist | Two supports each | ATT | Affinity breadth | Aggregate families | Mastered families | Learned skill | Conceptual evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 9 | 20 | 10 | 20 | 1 | 2 | 0 | 10 | 0 |
| 8 | 30 | 15 | 30 | 1 | 4 | 1 | 15 | 1 |
| 7 | 45 | 22 | 45 | 2 | 6 | 2 | 22 | 2 |
| 6 | 65 | 32 | 65 | 2 | 8 | 3 | 32 | 3 |
| 5 | 90 | 45 | 90 | 3 | 10 | 4 | 45 | 4 |
| 4 | 125 | 62 | 125 | 3 | 12 | 5 | 62 | 5 |
| 3 | 170 | 85 | 170 | 4 | 14 | 6 | 85 | 6 |
| 2 | 230 | 115 | 230 | 4 | 16 | 7 | 115 | 7 |
| 1 | 310 | 155 | 310 | 5 | 18 | 8 | 155 | 8 |
| 0 | 420 | 210 | 420 | 5 | 20 | 9 | 210 | 9 |

## Formula definitions and reproducible examples

[F33](../formula-reference.md#f33), [F39](../formula-reference.md#f39), [F62](../formula-reference.md#f62), [F63](../formula-reference.md#f63), [F71](../formula-reference.md#f71). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F33 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      [
        {
          "event_id": "e1",
          "challenge_id": "c1",
          "causal_id": "cause1",
          "source_kind": "kernel_committed",
          "actor": "fixture",
          "outcome": "success"
        },
        {
          "event_id": "e2",
          "challenge_id": "c1",
          "causal_id": "cause1",
          "source_kind": "kernel_committed",
          "actor": "fixture",
          "outcome": "success"
        },
        {
          "event_id": "e3",
          "challenge_id": "c2",
          "causal_id": "cause2",
          "source_kind": "kernel_committed",
          "actor": "fixture",
          "outcome": "success"
        },
        {
          "event_id": "claim",
          "challenge_id": "c3",
          "source_kind": "testimony",
          "actor": "fixture",
          "outcome": "success"
        }
      ],
      [
        {
          "field": "actor",
          "op": "eq",
          "value": "fixture"
        }
      ],
      "challenge_id"
    ],
    "expected": 2
  },
  {
    "inputs": [
      [
        {
          "event_id": "e1",
          "challenge_id": "c1",
          "causal_id": "cause1",
          "source_kind": "kernel_committed",
          "actor": "fixture",
          "outcome": "success"
        },
        {
          "event_id": "e2",
          "challenge_id": "c1",
          "causal_id": "cause1",
          "source_kind": "kernel_committed",
          "actor": "fixture",
          "outcome": "success"
        },
        {
          "event_id": "e3",
          "challenge_id": "c2",
          "causal_id": "cause2",
          "source_kind": "kernel_committed",
          "actor": "fixture",
          "outcome": "success"
        },
        {
          "event_id": "claim",
          "challenge_id": "c3",
          "source_kind": "testimony",
          "actor": "fixture",
          "outcome": "success"
        }
      ],
      [
        {
          "field": "actor",
          "op": "eq",
          "value": "other"
        }
      ],
      "challenge_id"
    ],
    "expected": 0
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Permanent versus temporary thresholds, no Tier skipping in the named profile, candidate-bound attestation, evidence dedup and actual per-affinity family quotas are tested. Table numbers are optional proposals; real prerequisite maps/custody remain unknown.

## Remaining acceptance gate

Recover final canonical affinity-specific technique requirements and Heirloom acquisition policy; review threshold/ritual proposals and source exact body references. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — F08 general Tier-benefit contract

The 992 checkpoint correctly left F08 OPEN. The current executable proposal closes that *design* gap, not canon. GeneralBook registers typed providers and BenefitPlan selections under F102 load and F103 finite Tier limits (slots, inspect fields, transfer EA/domains, channels, reaction categories). Production specialization remains one composable provider, not a generic substitute. Nine non-crafting advancements, inspect/charge/reaction operations, revocation, source withdrawal, current-ability vs entitlement, and qualification failures are tested. No automatic stat/AP grant, no invented canonical capability roster, and no universal practitioner/technique-Tier execution gate were added. Body Tier transitions remain UNKNOWN-blocked. See [benefit traces](../data/kernel-traces-benefits.json) and [roles](../data/azimah-benefit-boundaries.json).

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I06 (P1) — Advancement acquisition transaction and differentiated Tier benefits**: Earlier bounded acceptance claim is superseded by the semantic correction checkpoint. I06/general-benefit F08 remains independent OPEN, separate from canonical profiles/policies.
- **I07 (P1) — Complete per-attribute/per-skill development and numeric allocation tables**: Finish explicit per-attribute/per-skill calculation tables and external-XP allocation rules, without fixed point pools or double-counting skill-credit loops; distinguish distribution parameters from guaranteed gains.
- **I10 (P1) — Interconnected numerical balance, interaction sweeps and correction impact**: Build bounded synthetic interacting workloads and compare distinct builds/corrections, without inventing canonical affinity/Agent/body sheets or forcing every build equal.

See the [full saved-directive audit](../DIRECTIVE-COVERAGE-AUDIT.md). These gaps are separate from canonical-source access and creator-policy approval. No broad new implementation was launched in this narrow consistency pass.

Creator update12:38 CST: affinity roster and weakness/resistance relationships remain UNKNOWN by explicit deferral, not nonexistent/uncreated. Do not repeat the roster question/retrieval or infer neutral missing maps. [Exact parent-relayed statement](../sources/creator-affinity-deferral-2026-11-07-1238-CST.md). Synthetic A/B remain fixtures.

## Previous I05/I06 production and advancement checkpoint (acceptance corrected below)

[Detailed current checkpoint](../I05-I06-CHECKPOINT.md) explains the actual finite15-tag/12-recipe registry, distinct crafting Tier/grade/floor/ceiling/natural rarity/quality/condition, tools/facilities, real material identity and conserving WIP/output/scrap; batch/edition/original/blueprint/replica/repair modes and protected three-family Heirloom contracts. Typed authority and original envelopes do not come from rarity or descriptive tags. See [registry](../data/production-registries.json) and [new formulasF89–F100](../formula-reference.md#f89).

Actual ordinary advancement now reserves/consumes paid material/AP/per-affinity EA/work, uses permanent attributes, attained unique-family quotas/mastery/prerequisites and reviewed committed history, checks a physically granted fixed-assigned-Tier Agent token and equipped instrument, retains spent costs on failure/cancel, and commits Tier/benefits exactly once. [Nine one-step profiles](../data/advancement-profiles.json) and [ten distinct benefit contracts](../data/production-benefits.json) are explicit PROPOSALS. No universal ordinary technique-Tier gate or auto stat/skill gain; capacities change without filling or artificial AP. Existing F07/F08 define permanent-stat potential; these fixtures add lower unlock ceilings and ordinary AP cap100, not a silent global rewrite. Body Tier transitions remain UNKNOWN-blocked.

Previous I05/I06 checkpoint totals100 formulas/200 unique exact examples;87 legal/invalid trace pairs;156 executed tailored role records;170×3=510 bookkeeping rows, NOT510 actual-body tests. [19 new13-stage pairs](../data/kernel-traces-production.json) and [57 tailored roles](../data/azimah-production-boundaries.json) execute/reject specific workflows. All710 prior named tests remain; fresh results are in documentation-verification.json. I07–I11 now have executed proposal evidence; canon remains unfinished; all18 overall IN PROGRESS.

## Current semantic correction acceptance

**IN PROGRESS / PROPOSAL.** [Current corrective checkpoint](../SEMANTIC-CORRECTION-CHECKPOINT.md) supersedes earlier collective I01–I06 closure: F01–F07/F09/F10 have executable corrections; **F08 generic nonmanufacturing Tier-benefit contract now has an executed proposal (not canon)**. I07–I11 now have executed proposal evidence (see Current finish); canon remains unfinished. No source gate or numerical review substitutes for that work. Current101 formulas/202 unique examples,96 legal/invalid13-stage pairs and183 tailored executed role records;180×3=540 matrix cells are bookkeeping, NOT actual body acceptance. Affinity maps remain creator-deferred UNKNOWN; exact Azimah sheets stay UNKNOWN. Source/canon stores and existing creator captures are unchanged.
