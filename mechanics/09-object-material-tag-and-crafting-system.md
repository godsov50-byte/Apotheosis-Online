# 09. Object, Material, Tag and Crafting System

**Overall status: IN PROGRESS.** Current source-independent working proposal; not canon or production Kernel. Numerical proposals and synthetic fixtures cannot establish unknown source records.

## Assumptions and dependencies

Dependencies: 1,3,4,5,7,10,11,12,14,15. Exact arithmetic uses world time and declared units. Required UNKNOWN facts/policies block; do not silently substitute defaults. Latest t99 working direction and t100 role/body restrictions prevail while older conflicting records remain attributed.

## Physical objects and materials

An object has persistent identity, dimensions, material mass, condition, owner, physical relation and provenance. Legal title is not position or possession. A sword owned by a merchant may physically lie on a corpse; neither fact automatically changes the other. Container interiors, apertures, closed state and payload limits are explicit. Parent relations cannot form cycles. Equipment contributes mass to the carrying subtree, and connector checks include upstream attachments rather than checking only the newest joint.

F40/F41 separate occupied material volume from a bounding envelope. A hollow box is not solid material filling every interior cubic meter. F42/F43 compare a rated connector load with actual mass and declared acceleration. F67 budgets sensible heating energy; a conductive tag cannot supply unlimited heat, and these operational fixtures are not complete thermodynamics or measured material engineering.

## World anchoring and on/in relations

AnchoredWorld adds world/terrain/structure roots with bounded rectangular frames, an explicit ON plane or IN volume, and traceable ancestry for every object. Coordinates are not inventory slots and are not a full support/collision solver. Physical transfer requires a living actor, movement permission, actual reach to source and destination, and access through an open source container. A matching owner string or co-located coordinate does not prove an actor physically holds a corpse or Heirloom; physically_held follows the actual parent ancestry.

## Envoy death, body-object conversion and equipment

PlayerLife requires an explicit player_envoy type. Committed death evidence binds the Sovereign, active body and time. A death transaction converts that same physical body to a corpse object, marks it nonliving, preserves equipment parent relations, ownership, location and total mass, and applies only an explicit life-debit policy. It does not spawn replacement gear or automatically respawn. The creator's three-life direction is preserved; the trailing “and one” remains ambiguous, not a fourth life.

A replacement binding may select only an already existing authorized body under an explicit timing/zero-life policy. Corpse reacquisition requires matching corpse provenance and actual possession by the active living body. Recovery is single-use and payload-bound; owning the corpse remotely, moving a foreign body or replaying a request cannot restore another life. F73 rejects overflow above a declared cap rather than silently clamping. The fixture's cost1, restore1, cap3, delay10s and retain-inert disposition are proposals; canonical values and corpse consumption remain UNKNOWN. Healing wounds is not life recovery, and no automatic NPC/Agent/Azimah enrollment is allowed.

## Crafting and compatibility

F22 evaluates an explicitly configured binding profile and can declare incompatibility. Tags encode properties/constraints, not unrestricted concept authority. Crafting consumes actual materials, labor and capacity; originals, replicas, stored-charge objects and Heirlooms retain distinct identities. F44 requires each capability axis and authority operation of a replica to fit the original; a clever tag combination cannot exceed a restricted original's conceptual envelope.

## Proposed operational materials

The12 profiles are authored fixtures, not measured material realism or a canonical substance list. Density and barrier stress refer only to their declared model roles; using an evocative material name does not import real-world or magical properties.

| ID/name | Density kg/m³ | Barrier stress Pa | Heat capacity J/kg/K | Tags |
| --- | --- | --- | --- | --- |
| steel | 7800 | 400000000 | 500 | material.metal, conductive, form.rigid |
| iron | 7800 | 180000000 | 450 | material.metal, conductive, form.rigid |
| copper | 8900 | 70000000 | 385 | material.metal, conductive, form.rigid |
| wood | 700 | 40000000 | 1700 | material.organic, combustible, form.rigid |
| fiber | 200 | 20000000 | 1300 | material.organic, combustible, form.flexible |
| leather | 900 | 15000000 | 1500 | material.organic, form.flexible |
| glass | 2500 | 50000000 | 800 | material.brittle, transparent, form.rigid |
| ceramic | 2400 | 80000000 | 850 | material.brittle, insulating, form.rigid |
| basalt | 3000 | 100000000 | 800 | material.stone, form.rigid |
| water | 1000 | 0 | 4200 | material.fluid, form.fluid |
| carbon | 1800 | 100000000 | 700 | material.carbon, conductive, form.rigid |
| fixture crystal | 2700 | 120000000 | 900 | material.crystal, form.rigid |

## Formula definitions and reproducible examples

[F12](../formula-reference.md#f12), [F22](../formula-reference.md#f22), [F38](../formula-reference.md#f38), [F40](../formula-reference.md#f40), [F41](../formula-reference.md#f41), [F42](../formula-reference.md#f42), [F43](../formula-reference.md#f43), [F44](../formula-reference.md#f44), [F47](../formula-reference.md#f47), [F67](../formula-reference.md#f67), [F69](../formula-reference.md#f69), [F72](../formula-reference.md#f72), [F73](../formula-reference.md#f73), [F75](../formula-reference.md#f75). Each linked entry supplies callable argument order, meanings, bounds and exactly two tested input/output vectors.

A representative pair from F12 (PROPOSAL, not a canonical body):

```json
[
  {
    "inputs": [
      9,
      50
    ],
    "expected": 150
  },
  {
    "inputs": [
      7,
      100
    ],
    "expected": 800
  }
]
```

## Three separate Azimah references

Original Creator/Kernel: validates and commits only registered authorized rules; no ordinary finite character pool. Tier1 body: actual values UNKNOWN; only qualified body-Tier BASE interventions, no direct commit. Tier2 body: below Tier1, actual values independently UNKNOWN; the same authority boundary with its own sourced prerequisites, not a presumed upgrade or inherited sheet. Neither body gains shared thoughts/locations, artificial AP or unbounded teleport. Player-life rules do not apply automatically. See [supporting19](19-azimah-cross-system-validation.md) for precise applicability and valid/invalid role cases.

## Tested versus not modeled

Conserving object graphs, apertures/closed extraction, upstream load, anchored physical transfers and equipment-preserving corpse transactions are tested. Anchors are not full support physics; canonical life/crafting profiles remain unresolved.

## Remaining acceptance gate

Recover actual material/tag/recipe and Heirloom policies; resolve life debit/restoration/timing/disposition and replacement-body acquisition without inventing slots or remote possession. Overall IN PROGRESS; a passing synthetic fixture is not canonical acceptance.

## Current finish — F08 and I07–I11

## Current finish — materials in the I11 matrix

All12 fixture materials now have individually justified three-role bookkeeping rows. Names still do not import unstated magical or real-world properties. F10 mass-weighted salvage (F98) remains the corrective production path.

## Source provenance

Primary creator instructions: [t99](../sources/t99u-creator-instruction-verbatim.md), [t100](../sources/t100u-creator-instruction.md). Complete recovered archive bodies: [attributes/resolution](../sources/recovery/primary/cb94b0611cbb41b0820626ad48ca73c4.content.md), [measurement/character model](../sources/recovery/primary/738f882f6c7d40dea451a0c7a09b786a.content.md). New creator/assistant labels and scope correction: [source audit](../sources/chatgpt-source-audit.json), [first-pass exact excerpts](../sources/chatgpt-bounded-retrieval/first-pass-excerpts.md). Raw assistant text remains unapproved unless separately established.

## Independently unfinished requested work

- **I02 (P0) — Three distinct Heirloom-family creation/destruction transactions**: Bounded proposal acceptance is now covered by executable integrated workflows; see I01-I02-CHECKPOINT.md. Canonical records/policies remain UNKNOWN.
- **I05 (P1) — Crafting tag operators, grades and complete object production contract**: Earlier bounded acceptance claim is superseded by the semantic correction checkpoint. I06/general-benefit F08 remains independent OPEN, separate from canonical profiles/policies.
- **I10 (P1) — Interconnected numerical balance, interaction sweeps and correction impact**: Build bounded synthetic interacting workloads and compare distinct builds/corrections, without inventing canonical affinity/Agent/body sheets or forcing every build equal.
- **I11 (P1) — Mandatory per-subject three-role coverage and operation-complete trace register**: Expand coverage registry and legal/invalid stage traces for each newly specified source-independent operation; justify UNKNOWN/not-applicable individually, not blanket template acceptance.

See the [full saved-directive audit](../DIRECTIVE-COVERAGE-AUDIT.md). These gaps are separate from canonical-source access and creator-policy approval. No broad new implementation was launched in this narrow consistency pass.

## I01/I02 current executable proposal integration

Three distinct physical work/destruction workflows now execute: irreversible acquired technique-family sacrifice even through failed work; conscious identity ending and new-identity fragment reassembly; single Agent/token/fixed assigned Tier creation and existing custody/slay/gift rules. F79/F80 conserve mass and paid work; unknown real authorities/rarity/dispositions remain blocked. See [current mechanism definitions, bounds and exploit defenses](../I01-I02-CHECKPOINT.md), [synthetic typed profiles](../data/lifecycle-profiles.json), [18 new13-stage pairs](../data/kernel-traces-lifecycle.json) and [18 tailored role records](../data/azimah-lifecycle-boundaries.json). All18 overall remain IN PROGRESS; no actual body values or named rosters inferred.

## I03/I04 current executable temporal integration

Six distinct funded Detect/Evade/Counter/Readied/Prepared/Triggered workflows now use actual sensing/paths, stable initiative, revocable event-bound consent, qualified technique reservations and physical contact/defense. Four finite synthetic statuses, physical treatment/healing, scoped suppress/nullify/revoke/replace operators and actual-history eligibility/acquisition now affect real scheduled action times/prohibitions and derived prerequisites. All are bounded PROPOSALS, not full arbitrary physics, canonical profiles or actual body acceptance. See [definitions and concrete accounting](../I03-I04-CHECKPOINT.md), [typed profiles](../data/temporal-profiles.json), [21 new13-stage legal/invalid pairs](../data/kernel-traces-temporal.json) and [63 tailored role records](../data/azimah-temporal-boundaries.json).

## Previous I05/I06 production and advancement checkpoint (acceptance corrected below)

[Detailed current checkpoint](../I05-I06-CHECKPOINT.md) explains the actual finite15-tag/12-recipe registry, distinct crafting Tier/grade/floor/ceiling/natural rarity/quality/condition, tools/facilities, real material identity and conserving WIP/output/scrap; batch/edition/original/blueprint/replica/repair modes and protected three-family Heirloom contracts. Typed authority and original envelopes do not come from rarity or descriptive tags. See [registry](../data/production-registries.json) and [new formulasF89–F100](../formula-reference.md#f89).

Actual ordinary advancement now reserves/consumes paid material/AP/per-affinity EA/work, uses permanent attributes, attained unique-family quotas/mastery/prerequisites and reviewed committed history, checks a physically granted fixed-assigned-Tier Agent token and equipped instrument, retains spent costs on failure/cancel, and commits Tier/benefits exactly once. [Nine one-step profiles](../data/advancement-profiles.json) and [ten distinct benefit contracts](../data/production-benefits.json) are explicit PROPOSALS. No universal ordinary technique-Tier gate or auto stat/skill gain; capacities change without filling or artificial AP. Existing F07/F08 define permanent-stat potential; these fixtures add lower unlock ceilings and ordinary AP cap100, not a silent global rewrite. Body Tier transitions remain UNKNOWN-blocked.

Previous I05/I06 checkpoint totals100 formulas/200 unique exact examples;87 legal/invalid trace pairs;156 executed tailored role records;170×3=510 bookkeeping rows, NOT510 actual-body tests. [19 new13-stage pairs](../data/kernel-traces-production.json) and [57 tailored roles](../data/azimah-production-boundaries.json) execute/reject specific workflows. All710 prior named tests remain; fresh results are in documentation-verification.json. I07–I11 now have executed proposal evidence; canon remains unfinished; all18 overall IN PROGRESS.

Finite production supports explicit nonliving category contracts, not arbitrary vehicles/organism factories/industrial throughput physics. Intrinsic original envelopes do not cap separately supplied external kinetic work; combined build/energy calibration remains I10. Cinematic/industrial/mystical setting notes remain qualitative; no imported IP feats or map/art changes.

## Existing material profiles versus new tag operators

All12 prior profiles above remain unchanged and are accepted by an explicit typed adapter. Native density/heat/service/binding fields retain their defined meanings; binding bonuses/penalties deduplicate per material profile. Legacy labels not assigned a new operator remain descriptors, not secret optics/ignition/fluid/affinity powers. Unknown labels or unknown batch grade/quality/floor policy block. Current registered metal recipes do not become universal wood/water/organism recipes merely because a material is adapted. See production-registries.json existing_material_profile_bridge.

## Current semantic correction acceptance

**IN PROGRESS / PROPOSAL.** [Current corrective checkpoint](../SEMANTIC-CORRECTION-CHECKPOINT.md) supersedes earlier collective I01–I06 closure: F01–F07/F09/F10 have executable corrections; **F08 generic nonmanufacturing Tier-benefit contract now has an executed proposal (not canon)**. I07–I11 now have executed proposal evidence (see Current finish); canon remains unfinished. No source gate or numerical review substitutes for that work. Current101 formulas/202 unique examples,96 legal/invalid13-stage pairs and183 tailored executed role records;180×3=540 matrix cells are bookkeeping, NOT actual body acceptance. Affinity maps remain creator-deferred UNKNOWN; exact Azimah sheets stay UNKNOWN. Source/canon stores and existing creator captures are unchanged.
