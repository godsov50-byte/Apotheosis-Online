# Formula reference — current AO-PROP-0.3 documentation

All 116 formulas are proposed local mechanics, not canonical AO coefficients. Every entry below copies its two exact input/expected-output vectors from current data/formulas.json. Argument order is the inspected executable signature, not an inferred variable order. Strings such as "3/2" represent exact rational values through the verifier's recursive conversion; null means no result/contact where the function defines it. Lists/dictionaries are full structured outputs, not abbreviated scores. False and UNKNOWN have distinct meanings.

Reproduce all 232 examples with `python3 documentation_verify.py`. The complete current-tree suite also runs with `python3 run_tests.py`; it validates the exact original24 snapshot separately from current intended documents and unchanged sources/historical archives. Actual run counts/times are retained in tests/summary.json; no historical count is reused as a new result.

The [992 correction review](sources/correction-review-992/CORRECTION-REVIEW.md) confirmed F01–F07/F09/F10 PASS (56 independent checks) against bundle SHA256 `557df39c191716a7ad96499147fa5e19257b87d2a0fe761b5dcff31342f0c1b8`. F08 was OPEN in that frozen checkpoint and is now an executed general-benefit proposal (F102–F103 plus paid inspect/charge/reaction operations). F104–F116 cover I07–I10. None of these numbers are canon.

## Global scope and authority

Hard prerequisites, type/permission/identity checks and conservation are not waived by a favorable numeric result. Ordinary actors have no universal practitioner-Tier equals technique-Tier gate; manifestations have their explicitly sourced body-Tier BASE restriction. Kernel authority is not a character pool. Exact Tier1/Tier2 input sheets remain UNKNOWN. F72/F73 player-life arithmetic is NOT APPLICABLE to Azimah by default.

<a id="f01"></a>

## F01 — Effective attribute

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(1, base + permanent + temporary)
```

**Executable and argument order:** `reference_math.effective_attribute(base, permanent=0, temporary=0)`.

**Variable meanings, units and output:** base/permanent/temporary: score points; output current effective score

**Bounds and missing/invalid inputs:** Permanent base used for advancement; equipment/current score only execution. Base integer>=1. Signed adjustments allowed. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Suppress negative scores at1; never turn temporary bonuses into base growth.

### F01 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    2,
    -5
  ],
  "expected": 17
}
```

### F01 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    0,
    -20
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartII", "exact_quote": "Attributes develop independently. Do not assume that characters receive a fixed pool of points that must be distributed.", "source_status": "WORKING DESIGN", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f02"></a>

## F02 — Skill cumulative XP

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
25 L (L+1)
```

**Executable and argument order:** `reference_math.cumulative_xp(level)`.

**Variable meanings, units and output:** L: nonnegative integer learned level; output cumulative qualifyingXP

**Bounds and missing/invalid inputs:** Reject negative, boolean, fractional levels. XP unique per genuine event; cap normal advancement by base core. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No XP from repeated state replay or cross-skill feedback.

### F02 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1
  ],
  "expected": 50
}
```

### F02 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20
  ],
  "expected": 10500
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIII", "exact_quote": "The current working rule is that a skill normally cannot exceed its associated core ability score.", "source_status": "WORKING DESIGN", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f03"></a>

## F03 — Qualifying learning

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
floor(20 min(2,D/max(1,L)) Q H)
```

**Executable and argument order:** `reference_math.learning_xp(difficulty, level, quality=1, qualifying=True, failure=False)`.

**Variable meanings, units and output:** D: challenge level; L: current level; Q∈{0,0.5,1} feedback quality; H=0.5 qualifying failure else1; outputXP

**Bounds and missing/invalid inputs:** Ineligible event output0; D,L nonnegative. Feedback and meaningful risk/difficulty required. Recovery and repetition ledger limit one credit per challenge/learning interval. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Self-inflicted harmless failures and accomplice repeated farming excluded.

### F03 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    10,
    1,
    true,
    false
  ],
  "expected": 20
}
```

### F03 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    10,
    1,
    true,
    true
  ],
  "expected": 20
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIII", "exact_quote": "Skill advancement should contribute to development of the associated core attribute and may create synergy bonuses for related skills.", "source_status": "WORKING DESIGN", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f04"></a>

## F04 — Effective skill

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(currentCore,max(0,learned+temporary))
```

**Executable and argument order:** `reference_math.skill_effective(learned, core, temporary=0)`.

**Variable meanings, units and output:** learned/core/temporary: level points; output effective level

**Bounds and missing/invalid inputs:** Learned retained when core falls. Temporary cannot provide mastery, learning or prerequisites. Missing core rejects. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Core suppression does not erase history; restoration not new XP.

### F04 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    30,
    20,
    0
  ],
  "expected": 20
}
```

### F04 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    5,
    40,
    3
  ],
  "expected": 8
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIII", "exact_quote": "The current working rule is that a skill normally cannot exceed its associated core ability score.", "source_status": "WORKING DESIGN", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f05"></a>

## F05 — Scoped synergy

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(floor(targetEffective/5),Σfloor(sourceEffective/10))
```

**Executable and argument order:** `reference_math.synergy(target, sources)`.

**Variable meanings, units and output:** effective skill levels; output flat contest-score bonus, only on listed directed scope

**Bounds and missing/invalid inputs:** No recursive synergy input, no proficiency/level transfer. Empty sources0. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Snapshot raw effective levels once; cap20% target effective, not20% success probability.

### F05 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    [
      30,
      40
    ]
  ],
  "expected": 4
}
```

### F05 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    5,
    [
      10
    ]
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIII", "exact_quote": "Do not give every skill an arbitrary bonus to every other skill.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f06"></a>

## F06 — Core development credit

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
externalQualifyingXP / [1000(1+floor(baseCore/20))]
```

**Executable and argument order:** `reference_math.attribute_growth_credit(qualifying_xp, current)`.

**Variable meanings, units and output:** XP: unique real training evidence; baseCore: permanent score; output fractional growth-credit points

**Bounds and missing/invalid inputs:** Each full credit permits +1 permanent score after recovery and physiological review; recompute denominator after increase. Retain fraction. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No synergyXP or temporary changes; advancement event itself generates no new learningXP.

### F06 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2000,
    20
  ],
  "expected": 1
}
```

### F06 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    3000,
    40
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIII", "exact_quote": "Skill advancement should contribute to development of the associated core attribute and may create synergy bonuses for related skills.", "source_status": "WORKING DESIGN", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f07"></a>

## F07 — AP maximum

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
5 CON
```

**Executable and argument order:** `reference_math.ap_max(constitution)`.

**Variable meanings, units and output:** CON: effective Constitution; output AP units

**Bounds and missing/invalid inputs:** Pool caps recalculated; falling max clamps surplus, raising max does not refill. No stamina second pool. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No equipment swap refill or AP supercharge.

### F07 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20
  ],
  "expected": 100
}
```

### F07 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    30
  ],
  "expected": 150
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "d7a3d8b52f98457f8106b133cc6e640b", "section": "AP, EA, Damage Reduction, and Status Effects / Action Points", "exact_quote": "Terms such as stamina, vigor, effort, momentum, or action reserve are not separate resource pools in this model; AP is the shared action resource.", "source_status": "WORKING DESIGN", "date_raw": "UNKNOWN", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f08"></a>

## F08 — Per-affinity EA maximum

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
8 ATT + 4 min(ATT,M)
```

**Executable and argument order:** `reference_math.ea_max(attunement, affinity_mastery)`.

**Variable meanings, units and output:** ATT: effective Attunement; M: learned affinity-control level for that affinity; outputEA

**Bounds and missing/invalid inputs:** Each acquired domain separate pool. M≥0. Unknown affinity ownership rejects use. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Broad ownership no passive defenses; total regeneration shared budget.

### F08 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    20
  ],
  "expected": 240
}
```

### F08 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    30,
    10
  ],
  "expected": 280
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "d7a3d8b52f98457f8106b133cc6e640b", "section": "Elemental Affinities, Reserves, and Channel Capacity", "exact_quote": "Each accessible affinity has its own separate reserve pool rather than all elemental use drawing from one undifferentiated pool.", "source_status": "WORKING DESIGN", "date_raw": "UNKNOWN", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f09"></a>

## F09 — Concurrent channels

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(4,1+floor(ATT/40))
```

**Executable and argument order:** `reference_math.channel_capacity(attunement)`.

**Variable meanings, units and output:** ATT: effective Attunement; output integer simultaneously drawn domains

**Bounds and missing/invalid inputs:** Affinities owned/accessed not limited by channel count. Switch2AP and1second proposed, not a free passive swap. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No disconnected domains count as active defense.

### F09 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20
  ],
  "expected": 1
}
```

### F09 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80
  ],
  "expected": 3
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "d7a3d8b52f98457f8106b133cc6e640b", "section": "Simultaneous channel capacity", "exact_quote": "Affinity access and simultaneous use are different.", "source_status": "WORKING DESIGN", "date_raw": "UNKNOWN", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f10"></a>

## F10 — Resource recovery

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(maximum,current+rate × seconds × conditionFactor)
```

**Executable and argument order:** `reference_math.recovery(current, maximum, rate, seconds, condition_factor=Fraction(1, 1))`.

**Variable meanings, units and output:** current/maximum: resource units; rate:units/world-second; seconds nonnegative integer; factor0..1

**Bounds and missing/invalid inputs:** At rest AP rateCON/100, totalEA rateATT/200 distributed over chosen pools with shares summing≤1. Sleeping multiplies rate4; combat factor0. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No recovery while channel spending same reserve in same interval; injury factors clamp to0..1.

### F10 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    100,
    "1/5",
    10,
    1
  ],
  "expected": 2
}
```

### F10 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    95,
    100,
    1,
    10,
    1
  ],
  "expected": 100
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartVI / Resource accounting rules", "exact_quote": "Preparation, activation, connection, sustaining, and effect resolution are distinct events.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f11"></a>

## F11 — Technique mode costs

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
8 × 2^(9-T) × mode
```

**Executable and argument order:** `reference_math.technique_cost(t, mode=1)`.

**Variable meanings, units and output:** T: techniqueTier0..9; mode1/2/3: base/enhanced/surge; output totalEA benchmark

**Bounds and missing/invalid inputs:** Catalogue must replace benchmark with specific phase costs. Mode2/3 only explicitly supported. Fixed effect envelope; no new powers. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** One activation one daily use, not mode uses. Stated benchmark includes connection1EA on success.

### F11 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9,
    1
  ],
  "expected": 8
}
```

### F11 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    7,
    3
  ],
  "expected": 96
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartV / Technique cost levels", "exact_quote": "A triple-cost execution is not automatically three separate daily uses.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f12"></a>

## F12 — Stored capacity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(100+Q) × 2^(9-craftingTier)
```

**Executable and argument order:** `reference_math.stored_capacity(crafting_tier, quality)`.

**Variable meanings, units and output:** Q: quality0..100; craftingTier0..9; outputEA capacity

**Bounds and missing/invalid inputs:** Storage requires per-affinity compartments, actual charged amounts, payer attribution; transfer efficiency80% proposal. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Cannot generate energy:100EA charged ->80 stored; removing/reinserting never refills.

### F12 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9,
    50
  ],
  "expected": 150
}
```

### F12 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    7,
    100
  ],
  "expected": 800
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartVI / Resource accounting rules", "exact_quote": "Preparation, activation, connection, sustaining, and effect resolution are distinct events.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f13"></a>

## F13 — Daily technique benchmark

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(1,10-(9-T))
```

**Executable and argument order:** `reference_math.daily_limit(t)`.

**Variable meanings, units and output:** T: techniqueTier0..9; output activation count/world day

**Bounds and missing/invalid inputs:** Clock mapping and exact day boundary UNRESOLVED. Fixed world bucket in fixtures only; all identity variants share family counter. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Object/proxy/surge do not reset count; failed connection no activation, attempt fee retained.

### F13 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9
  ],
  "expected": 10
}
```

### F13 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartV / Technique cost levels", "exact_quote": "A triple-cost execution is not automatically three separate daily uses.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f14"></a>

## F14 — Modifier stack

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp((base+Σflat) × ΠrelativeFactor,lo,hi)
```

**Executable and argument order:** `reference_math.stack(base, flat, relative, lo=0, hi=1000000000)`.

**Variable meanings, units and output:** flat: output units; factor dimensionless nonnegative; lo/hi domain bounds; output adjusted quantity

**Bounds and missing/invalid inputs:** Flat then relative then cap is PROPOSAL order. All applicable unique modifiers stack except explicit exclusivity. Negative modifier as signed flat orfactor<1. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Same source-instance counted once; chain multiplicative effects can dominate; bound explicit per output.

### F14 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    [
      10,
      -20
    ],
    [
      "6/5",
      "1/2"
    ],
    0,
    1000
  ],
  "expected": 54
}
```

### F14 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    [
      -20
    ],
    [
      2
    ],
    0,
    1000
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIX", "exact_quote": "All applicable modifiers stack by default unless an explicit rule establishes otherwise.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f15"></a>

## F15 — Contested chance

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp(0.5+(attackScore-defenseScore)/100,0.05,0.95)
```

**Executable and argument order:** `reference_math.probability(attack, defense)`.

**Variable meanings, units and output:** attackScore/defenseScore nonnegative contest points; output probability

**Bounds and missing/invalid inputs:** Only after physical possibility and prerequisites. Certain rule-defined events bypass roll. Difference not ratio. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Impossible actions produce reject not5%; probability cap does not remove immunity.

### F15 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    60,
    40
  ],
  "expected": "7/10"
}
```

### F15 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    100
  ],
  "expected": "1/20"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXI", "exact_quote": "Physical possibility must be evaluated before probability.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f16"></a>

## F16 — Melee envelope

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
distance ≤ arm + weapon + targetRadius AND unobstructed
```

**Executable and argument order:** `reference_math.reach_possible(distance, arm, weapon, target_radius, blocked=False)`.

**Variable meanings, units and output:** all lengths meters nonnegative; output possibility boolean

**Bounds and missing/invalid inputs:** Broad-phase only; authoritative swept geometry must also intersect facing/height/coverage. Missing geometry rejects. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Cannot roll through walls or hit across bounding-box false positives.

### F16 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    0.7,
    1,
    0.4,
    false
  ],
  "expected": true
}
```

### F16 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    3,
    0.7,
    1,
    0.4,
    false
  ],
  "expected": false
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXI", "exact_quote": "Physical possibility must be evaluated before probability.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f17"></a>

## F17 — Reaction feasibility

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
detected AND space AND consent AND latency+execution≤arrivalTime
```

**Executable and argument order:** `reference_math.reaction_possible(detected, travel_time, latency, execution_time, space=True, consent=False)`.

**Variable meanings, units and output:** times world-seconds; outputboolean

**Bounds and missing/invalid inputs:** Detection not evasion. Explicit preauthorization covers triggers; no consent means no active spend. Readied/prepared timings separate. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No instant response from offline narration or posting order.

### F17 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    true,
    1,
    0.2,
    0.5,
    true,
    true
  ],
  "expected": true
}
```

### F17 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    true,
    0.2,
    0.2,
    0.5,
    true,
    true
  ],
  "expected": false
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXI", "exact_quote": "Physical possibility must be evaluated before probability.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f18"></a>

## F18 — Kinetic energy

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
0.5 mass × speed²
```

**Executable and argument order:** `reference_math.kinetic_energy(mass, speed)`.

**Variable meanings, units and output:** masskg, speedm/s; outputJ

**Bounds and missing/invalid inputs:** Contact speed and effective mass from geometry/weapon profile; no arbitrary entire-world mass. Negative rejects. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Repeated collision cannot manufacture momentum or refund spending.

### F18 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    10
  ],
  "expected": 100
}
```

### F18 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    4,
    5
  ],
  "expected": 50
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXI", "exact_quote": "Physical possibility must be evaluated before probability.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f19"></a>

## F19 — Physical injury benchmark

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
energyJ × conditionPercent / 1000
```

**Executable and argument order:** `reference_math.raw_physical_damage(energy, condition=100)`.

**Variable meanings, units and output:** energy≥0; condition0..100; outputinjury units before armor

**Bounds and missing/invalid inputs:** 100condition gives energy/10. Local anatomy conversion still requires calibration, not a universal death threshold. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Damage fixture only; no claim of final biomechanical realism.

### F19 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    100
  ],
  "expected": 10
}
```

### F19 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    50
  ],
  "expected": 5
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXI", "exact_quote": "Physical possibility must be evaluated before probability.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f20"></a>

## F20 — Mixed damage

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(0,ordinary×(1-resistance)-DR)+contactTruePortion
```

**Executable and argument order:** `reference_math.mixed_damage(ordinary, true, resistance, dr, contact=True, invulnerable=False, true_contact=False)`.

**Variable meanings, units and output:** ordinary/true/DR injury units; resistance fraction0..1; outputinjury units

**Bounds and missing/invalid inputs:** No contact→0; invulnerability blocks ordinary direct damage unless another defined environmental rule applies. True portion requires physical true-contact; gas co-location insufficient. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Only True portion bypasses mitigation; ordinary part never inherits bypass.

### F20 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    20,
    "1/2",
    10,
    true,
    false,
    true
  ],
  "expected": 60
}
```

### F20 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    20,
    "1/2",
    10,
    true,
    true,
    true
  ],
  "expected": 20
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartV / True Damage", "exact_quote": "Only the True Damage portion bypasses mitigation.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f21"></a>

## F21 — Armor condition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
pristineDR × condition/100
```

**Executable and argument order:** `reference_math.armor_dr(pristine, condition)`.

**Variable meanings, units and output:** DR: injury units; condition0..100; outputcurrentDR

**Bounds and missing/invalid inputs:** Coverage tested per struck region. Quality/rarity not current condition. Missing condition rejects. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Broken armor cannot keep pristine mitigation.

### F21 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    50
  ],
  "expected": 10
}
```

### F21 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    0
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartX / Crafting and rarity calculations", "exact_quote": "Preserve the restriction that an original custom creation or Heirloom can establish a standard that later crafters cannot simply surpass at the same crafting tier.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f22"></a>

## F22 — Binding compatibility

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp(base+Σbonus-Σpenalty+(quality-50)/10,0,100)
```

**Executable and argument order:** `reference_math.compatibility(base, bonuses, penalties, quality, forbidden=False)`.

**Variable meanings, units and output:** all terms compatibility score; quality0..100; outputscore or forbidden

**Bounds and missing/invalid inputs:** Forbidden pair returns invalid, not0% chance. Threshold60 fixture. Rarity not a universal compatibility buff. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** High skill never bypasses exclusion authority.

### F22 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    50,
    [
      10
    ],
    [
      5
    ],
    100,
    false
  ],
  "expected": 60
}
```

### F22 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    50,
    [
      10
    ],
    [
      5
    ],
    50,
    true
  ],
  "expected": null
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartX / Crafting and rarity calculations", "exact_quote": "Preserve the restriction that an original custom creation or Heirloom can establish a standard that later crafters cannot simply surpass at the same crafting tier.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f23"></a>

## F23 — Rarity lottery weights

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
b=min(20,floor(skill/5)+floor(quality/10)); [60-b+(b mod 2),25,10+floor(b/2),4+floor(b/2),1]
```

**Explicit proposal correction PC-F23:** the parity term is now present in data, prose and executable semantics. The uncorrected expression totals100−(b mod2); allocating the one-unit integer remainder to ordinal0 preserves all other weights and exact total100. The first ordinal receives the remainder. At b19 the corrected vector is `[42,25,19,13,1]`. This retains the pre-existing explicitly described normalization behavior, not automatic deference to code or a new canon distribution.

**Executable and argument order:** `reference_math.rarity_weights(skill, quality)`.

**Variable meanings, units and output:** skill: nonnegative integer crafting-skill level; quality: integer0..100; b: capped integer bonus0..20; output: five nonnegative integer lottery weights totaling100 for proposed ordinal rarities0..4.

**Bounds and missing/invalid inputs:** Integer skill>=0 and quality0..100; bool/float/negative inputs reject. The uncorrected expression totals100-(b mod2); allocate its odd one-unit remainder to ordinal0, preserving all other weights and exact total100. Generation applies explicit rarity floor/ceiling separately; unknown canonical names/maps remain UNKNOWN.

**Exploit defense and separate gates:** Seed fixed at creation event, not reveal; forbidden output ceiling wins.

### F23 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    95,
    0
  ],
  "expected": [
    42,
    25,
    19,
    13,
    1
  ]
}
```

### F23 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    50,
    100
  ],
  "expected": [
    40,
    25,
    20,
    14,
    1
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartX / Crafting and rarity calculations", "exact_quote": "Preserve the restriction that an original custom creation or Heirloom can establish a standard that later crafters cannot simply surpass at the same crafting tier.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f24"></a>

## F24 — Production quantity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(floor(material/materialPerUnit),floor(laborSeconds/secondsPerUnit),capacity)
```

**Executable and argument order:** `reference_math.output_quantity(materials, material_per_unit, labor_seconds, seconds_per_unit, capacity)`.

**Variable meanings, units and output:** materialunits, laborseconds, capacityunits; outputfinishedunits

**Bounds and missing/invalid inputs:** Consume exact inputs for output; waste explicit; failures keep scrap not free rerolls. Positive denominators. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Mass production shares batch seed+different item slots, cannot each claim original ceiling-setting uniqueness.

### F24 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    4,
    1000,
    50,
    100
  ],
  "expected": 20
}
```

### F24 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    4,
    1000,
    50,
    100
  ],
  "expected": 5
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartX / Crafting and rarity calculations", "exact_quote": "Preserve the restriction that an original custom creation or Heirloom can establish a standard that later crafters cannot simply surpass at the same crafting tier.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f25"></a>

## F25 — Property treasury

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
treasury + income - upkeep
```

**Executable and argument order:** `reference_math.property_balance(income, upkeep, treasury)`.

**Variable meanings, units and output:** all in-world currency subunits; output signed balance

**Bounds and missing/invalid inputs:** Negative means arrears and eligibility evaluation, not real-world charge or generated credit. No Crown/USD conversion. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** Transfers debit and credit same quantity; no upkeep avoidance by disconnect.

### F25 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    30,
    100
  ],
  "expected": 90
}
```

### F25 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    30,
    0
  ],
  "expected": -20
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartVI / Resource accounting rules", "exact_quote": "Preparation, activation, connection, sustaining, and effect resolution are distinct events.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f26"></a>

## F26 — Influenced probability

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp(baseP×(1+I/100),0,0.95)
```

**Executable and argument order:** `reference_math.influence_probability(base, influence)`.

**Variable meanings, units and output:** baseP0..1; influenceI -100..100; outputprobability

**Bounds and missing/invalid inputs:** I26 is26% relative, not26percentage points. Frequency and quantity separate. Exposure, reach, transport required. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No infinite growth from counting nested organizations same source twice.

### F26 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/10",
    26
  ],
  "expected": "63/500"
}
```

### F26 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "4/5",
    50
  ],
  "expected": "19/20"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXII", "exact_quote": "Influence changes probabilities and conditions; it does not guarantee an event.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f27"></a>

## F27 — Population accounting

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
N=S+W+R; realization transfers one existing unit
```

**Executable and argument order:** `reference_math.population_total(statistical, weighted, realized)`.

**Variable meanings, units and output:** S statistical/W weighted/R realized nonnegative integer inhabitants; outputtotal

**Bounds and missing/invalid inputs:** Deaths subtract1 once, births add1 once, transitions preserveN. Household links from existing cohort only. Missing required input: reject with RULE_INPUT_MISSING; do not guess.

**Exploit defense and separate gates:** No free population, assets or supplies on realization.

### F27 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    5,
    2
  ],
  "expected": 107
}
```

### F27 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    99,
    5,
    3
  ],
  "expected": 107
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartXIII", "exact_quote": "Realization does not create population. It increases the detail of an existing represented inhabitant.", "source_status": "CREATOR CONSTRAINT", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f28"></a>

## F28 — Contest score

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
floor(attribute/2) + effectiveSkill + scopedSynergy
```

**Executable and argument order:** `reference_math.contest_score(attribute, effective_skill, scoped_synergy=0)`.

**Variable meanings, units and output:** attribute score>=1; effectiveSkill and scopedSynergy nonnegative points; output contest points

**Bounds and missing/invalid inputs:** Uses F04 and F05 outputs. No skill/attribute substitution for hard prerequisites; missing inputs reject. Context modifiers apply F14 afterwards.

**Exploit defense and separate gates:** No recursion; synergy not added twice; attribute dominance reviewed in scenario1/2.

### F28 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    10,
    0
  ],
  "expected": 15
}
```

### F28 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    2,
    0
  ],
  "expected": 42
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartIII", "exact_quote": "The current working rule is that a skill normally cannot exceed its associated core ability score.", "source_status": "WORKING DESIGN", "date_raw": "2026-11-07", "time_zone": "UNSPECIFIED unless creator date only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f29"></a>

## F29 — Eligible opportunity selection

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
Select first cumulative eligible weight exceeding draw, in STR DEX CON INT WIS CHA ATT order
```

**Executable and argument order:** `independent_model.opportunity(weights, eligible, draw)`.

**Variable meanings, units and output:** Weights map each of STR/DEX/CON/INT/WIS/CHA/ATT to a nonnegative integer opportunity weight. eligible is the allowed ID set; draw is an integer below the eligible weight sum. Output is an attribute ID, not a gained point.

**Bounds and missing/invalid inputs:** No eligible weight or out-of-range draw rejects. Archetype biases opportunities only. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Independent growth; no guaranteed +1, no transfer of a point pool.

### F29 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    {
      "STR": 35,
      "DEX": 20,
      "CON": 25,
      "INT": 5,
      "WIS": 5,
      "CHA": 5,
      "ATT": 5
    },
    [
      "STR",
      "DEX",
      "CON",
      "INT",
      "WIS",
      "CHA",
      "ATT"
    ],
    0
  ],
  "expected": "STR"
}
```

### F29 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    {
      "STR": 5,
      "DEX": 5,
      "CON": 5,
      "INT": 35,
      "WIS": 25,
      "CHA": 10,
      "ATT": 15
    },
    [
      "STR",
      "DEX",
      "CON",
      "INT",
      "WIS",
      "CHA",
      "ATT"
    ],
    20
  ],
  "expected": "INT"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f30"></a>

## F30 — Training recovery requirement

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
60 × strain
```

**Executable and argument order:** `independent_model.training_recovery(strain)`.

**Variable meanings, units and output:** strain is nonnegative exact workload; output is world seconds of required recovery.

**Bounds and missing/invalid inputs:** Negative/float/bool input rejects; 0 strain yields0, but meaningless challenge cannot grant XP. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Pending core credit cannot be released before recovery; splitting sessions retains total strain.

### F30 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1
  ],
  "expected": 60
}
```

### F30 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "3/2"
  ],
  "expected": 90
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f31"></a>

## F31 — Sequential core development bank

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
While bank≥1000(1+floor(base/20)), subtract cost then base+=1, bounded by configured physiological ceiling
```

**Executable and argument order:** `independent_model.growth_bank(base, bank_xp, ceiling, recovered=True)`.

**Variable meanings, units and output:** base is a positive permanent score; bank is unique external training XP; ceiling is the configured maximum score; recovered is a required recovery fact. Output is [new score, unspent XP, gained points].

**Bounds and missing/invalid inputs:** Unknown physiological profile blocks permanent change; unrecovered keeps bank. Recompute cost after every increase. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** 39→40 crosses cost2000→3000; bank5000 gives2 gains, not2.5 or3. No XP on level-up.

### F31 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    2000,
    100,
    true
  ],
  "expected": [
    21,
    0,
    1
  ]
}
```

### F31 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    39,
    5000,
    100,
    true
  ],
  "expected": [
    41,
    0,
    2
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f32"></a>

## F32 — Natural maturation increment

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
floor(1+(adultTarget−1)min(1,endAge/maturity)) − same(startAge)
```

**Executable and argument order:** `independent_model.natural_delta(age_start, age_end, maturity, adult_target)`.

**Variable meanings, units and output:** start/end are nondecreasing ages in consistent world-year units; maturity is positive age at adulthood; adultTarget is a configured positive score. Output is a nonnegative maturation increment, not a new skill.

**Bounds and missing/invalid inputs:** Reversed time/unknown profile rejects; adult age produces no additional maturation. Imported adults do not retroactively earn XP. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** One persistent age cursor; reloading or clock rollback cannot regrant maturation.

### F32 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    20,
    20,
    10
  ],
  "expected": 9
}
```

### F32 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    20,
    20,
    10
  ],
  "expected": 5
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f33"></a>

## F33 — Unique committed history count

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
Cardinality of unique evidence keys after typed filters and committed-source restriction
```

**Executable and argument order:** `independent_model.history_count(events, filters, unique_by='event_id')`.

**Variable meanings, units and output:** events are immutable evidence records; filters are typed allowlisted field conditions; unique_by selects a stable deduplication key. Output is a count, or UNKNOWN when the predicate cannot be established.

**Bounds and missing/invalid inputs:** No arbitrary code/eval. Missing filtered fields/evidence key yields UNKNOWN, not0. Testimony not committed action evidence. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Aliases of one challenge count once. Unknown propagates through NOT instead of unlocking rewards.

### F33 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
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
}
```

### F33 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
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
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f34"></a>

## F34 — Configured world-day index

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
floor((worldSeconds−epoch)/dayLength)
```

**Executable and argument order:** `independent_model.day_index(world_seconds, epoch, day_length)`.

**Variable meanings, units and output:** worldSeconds and epoch are nonnegative world-second integers; dayLength is an explicitly configured positive number of world seconds. Output is the integer day bucket; no real-time ratio is chosen.

**Bounds and missing/invalid inputs:** Before epoch/UNKNOWN length rejects. 86400 is a local fixture, NOT chosen real-time ratio. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Object swapping, disconnects, Tiervariants and aliases do not change immutable identity/family bucket.

### F34 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    86399,
    0,
    86400
  ],
  "expected": 0
}
```

### F34 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    86400,
    0,
    86400
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f35"></a>

## F35 — Injury recovery factor

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(100−severity)/100
```

**Executable and argument order:** `independent_model.injury_factor(severity)`.

**Variable meanings, units and output:** severity is an integer from0 to100 injury points. Output is a dimensionless recovery multiplier from0 to1.

**Bounds and missing/invalid inputs:** Out-of-range rejects; severity100 gives0 ordinary recovery unless a separate treatment rule changes condition. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Healing does not refill AP/EA retroactively; attributes and resources remain separate.

### F35 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    25
  ],
  "expected": "3/4"
}
```

### F35 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f36"></a>

## F36 — Facility serviced recovery rate

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
baseRate × [1+(grade/4)(condition/100)min(1,capacity/occupants)]
```

**Executable and argument order:** `independent_model.facility_rate(base_rate, grade, condition_pct, occupants, capacity, fuel_active=True)`.

**Variable meanings, units and output:** base_rate is resource units/world second; grade0–4, condition0–100, occupants≥0 and capacity>0 configure actual service. fuel_active is a boolean. Output is serviced replenishment rate, not capacity.

**Bounds and missing/invalid inputs:** No occupants/fuel returns baseRate; invalid grade rejects. Occupancy assignment permits one actual bed, not every bed in every city. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** At grade4 maximum bonus100% before separately explicit rate caps; overcrowding dilutes benefit, no free duplicated service.

### F36 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/5",
    2,
    100,
    2,
    4,
    true
  ],
  "expected": "3/10"
}
```

### F36 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/5",
    4,
    50,
    8,
    4,
    true
  ],
  "expected": "1/4"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f37"></a>

## F37 — Payable interval integration

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
If drain>0: paidTime=min(dt,current/drain); end=current−drain×paidTime. Else end=min(max,current+regen×dt)
```

**Executable and argument order:** `independent_model.integrate_pool(current, maximum, regen, drain, seconds)`.

**Variable meanings, units and output:** current/maximum are resource units; regen/drain are units/world second; seconds is elapsed world time. Output is [end reserve, payable duration, spent units]. Active drain disallows same-pool regeneration.

**Bounds and missing/invalid inputs:** Exact rationals; no negative values; current≤max; no same-pool recovery while spending. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** A5EA reserve sustaining2EA/s lasts2.5s, not10s with negative balance or hidden infinite regen.

### F37 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    100,
    0,
    2,
    10
  ],
  "expected": [
    80,
    10,
    20
  ]
}
```

### F37 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    5,
    100,
    100,
    2,
    10
  ],
  "expected": [
    0,
    "5/2",
    5
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f38"></a>

## F38 — Conserving storage transfer

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
credit=min(remainingCapacity,available×efficiency); debit=credit/efficiency; loss=debit−credit
```

**Executable and argument order:** `independent_model.charge_transfer(available, remaining_capacity, efficiency=Fraction(4, 5))`.

**Variable meanings, units and output:** available and remaining_capacity are resource units; efficiency is an exact fraction in(0,1]. Output [debit, stored credit, loss] conserves the input.

**Bounds and missing/invalid inputs:** Compartment domain and living owner authorization verified separately. Floats/negatives reject. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** No power on insertion/removal. Capacity40 accepts50source at80%, not all100 with disappearing/duplicated remainder.

### F38 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    80,
    "4/5"
  ],
  "expected": [
    100,
    80,
    20
  ]
}
```

### F38 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    40,
    "4/5"
  ],
  "expected": [
    50,
    40,
    10
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f39"></a>

## F39 — Proposed advancement ritual profile

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
n=9−targetTier; AP=20+2n; EA=8×2^n; materialUnits=10(n+1); seconds=60×2^n
```

**Executable and argument order:** `independent_model.ritual_profile(target_tier)`.

**Variable meanings, units and output:** target Tier is an integer0–9. Output is a separate quote for AP units, EA units, material units and world seconds; it does not confer eligibility or permission.

**Bounds and missing/invalid inputs:** Tier9 initialization separate from advancement; nextTier must exactly current−1. Supported Heirloom attestation policy required. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Ritual duration is not additional free recovery/sustain; reserved phases and supplies explicitly quoted.

### F39 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    8
  ],
  "expected": {
    "ap": 22,
    "ea": 16,
    "materials": 20,
    "seconds": 120
  }
}
```

### F39 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0
  ],
  "expected": {
    "ap": 38,
    "ea": 4096,
    "materials": 100,
    "seconds": 30720
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f40"></a>

## F40 — Homogeneous material mass

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
density × occupiedMaterialVolume
```

**Executable and argument order:** `independent_model.material_mass(density, volume)`.

**Variable meanings, units and output:** density is kg/m³ of occupied material; volume is actual material volume in m³. Output is kg. A bounding container volume is not automatically solid material.

**Bounds and missing/invalid inputs:** Nonnegative exact inputs; unknown material profile rejects. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Containers do not duplicate child mass; destroyed material persists as scrap/loss ledger.

### F40 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    7800,
    "1/1000"
  ],
  "expected": "39/5"
}
```

### F40 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    700,
    "1/500"
  ],
  "expected": "7/5"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f41"></a>

## F41 — Rectangular envelope volume

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
dx × dy × dz
```

**Executable and argument order:** `independent_model.box_volume(dimensions)`.

**Variable meanings, units and output:** Three positive envelope dimensions are measured in meters. Output is m³.

**Bounds and missing/invalid inputs:** Zero/negative/wrong dimension rejects. Other shapes require approved profile; not guessed. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** A large item cannot fit merely because mass fits; apertures, orientation, volume and payload checked.

### F41 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1,
      2,
      3
    ]
  ],
  "expected": 6
}
```

### F41 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      "1/10",
      "1/5",
      "3/10"
    ]
  ],
  "expected": "3/500"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f42"></a>

## F42 — Connector working load rating

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
stressPa × areaM² × (0.5+quality/200) × condition/100 ÷ safetyFactor
```

**Executable and argument order:** `independent_model.connector_rating(stress_pa, area_m2, quality, condition_pct, safety=2)`.

**Variable meanings, units and output:** stress is pascals, area m², quality and condition percentages0–100, safety factor≥1. Output is newtons of rated load.

**Bounds and missing/invalid inputs:** Required mating geometry and material thermal/exclusion rules independent; invalid safety/condition rejects. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** High rarity cannot override load failure. Condition50 halves load; recursive descendant mass included.

### F42 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    40000000,
    "1/10000",
    100,
    100,
    2
  ],
  "expected": 2000
}
```

### F42 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    40000000,
    "1/10000",
    100,
    50,
    2
  ],
  "expected": 1000
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f43"></a>

## F43 — Static plus prescribed acceleration load

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
mass × (gravity+acceleration)
```

**Executable and argument order:** `independent_model.load_force(mass, gravity=Fraction(981, 100), acceleration=0)`.

**Variable meanings, units and output:** mass is kg; gravity and prescribed acceleration are nonnegative m/s². Output is newtons under the declared conservative load axis.

**Bounds and missing/invalid inputs:** Proposed gravity9.81m/s² fixture, not discovered AO constant. Other vector loads require explicit decomposition. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Attached descendant mass counted, not zero inventory mass. No reusing detached connector benefit.

### F43 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    "981/100",
    0
  ],
  "expected": "981/10"
}
```

### F43 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    "981/100",
    1
  ],
  "expected": "1081/50"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f44"></a>

## F44 — Original capability-envelope partial order

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
Every numerical axis candidate≤original AND candidate.authorityOps⊆original.authorityOps
```

**Executable and argument order:** `independent_model.envelope_within(candidate, original)`.

**Variable meanings, units and output:** candidate/original contain energy J, range m, duration seconds, target count, information depth and authority-operation sets. Output is a componentwise/subset boolean, or UNKNOWN for absent required axes.

**Bounds and missing/invalid inputs:** All six axes mandatory and typed; UNKNOWN blocks. This does not grant replication of Agent/conscious identity. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Lower damage cannot buy excessive range/authority. SamecraftTier original ceiling applies to every axis, not rarity alone.

### F44 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    {
      "energy_j": 100,
      "range_m": 10,
      "duration_s": 60,
      "targets": 2,
      "information_depth": 1,
      "authority_ops": [
        "inspect"
      ]
    },
    {
      "energy_j": 100,
      "range_m": 10,
      "duration_s": 60,
      "targets": 2,
      "information_depth": 1,
      "authority_ops": [
        "inspect",
        "seal"
      ]
    }
  ],
  "expected": true
}
```

### F44 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    {
      "energy_j": 1,
      "range_m": 11,
      "duration_s": 60,
      "targets": 2,
      "information_depth": 1,
      "authority_ops": [
        "inspect"
      ]
    },
    {
      "energy_j": 100,
      "range_m": 10,
      "duration_s": 60,
      "targets": 2,
      "information_depth": 1,
      "authority_ops": [
        "inspect",
        "seal"
      ]
    }
  ],
  "expected": false
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f45"></a>

## F45 — Continuous translated-box first contact

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
Intersect slab entry/exit intervals for each relative axis; entry=max(0,nearX,nearY,nearZ)
```

**Executable and argument order:** `formula_functions.sweep_input(a, v, b, w, dt)`.

**Variable meanings, units and output:** Two axis-aligned boxes use low/high3D meter coordinates; velocities are m/s and interval is seconds. Output is first contact time or null. The wrapper accepts box dictionaries and constructs AABBs.

**Bounds and missing/invalid inputs:** Finite positive box extents; linear translation only. Curves/rotation/deformable contact outside model require subdivided approved path. Exact touching counts. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Tunneling through thin walls prevented; earliest obstacle wins tie. No probability makes nonintersection hit.

### F45 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    {
      "low": [
        0,
        0,
        0
      ],
      "high": [
        1,
        1,
        1
      ]
    },
    [
      2,
      0,
      0
    ],
    {
      "low": [
        3,
        0,
        0
      ],
      "high": [
        4,
        1,
        1
      ]
    },
    [
      0,
      0,
      0
    ],
    2
  ],
  "expected": 1
}
```

### F45 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    {
      "low": [
        0,
        0,
        0
      ],
      "high": [
        1,
        1,
        1
      ]
    },
    [
      2,
      0,
      0
    ],
    {
      "low": [
        3,
        2,
        0
      ],
      "high": [
        4,
        3,
        1
      ]
    },
    [
      0,
      0,
      0
    ],
    2
  ],
  "expected": null
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f46"></a>

## F46 — Ordinary front-cone facing test

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
dot≥0 AND (halfCone90 OR 2dot²≥|forward|²|direction|²)
```

**Executable and argument order:** `independent_model.facing_allowed(forward, direction, half_angle=45)`.

**Variable meanings, units and output:** forward and direction are nonzero horizontal vectors; half-cone is45 or90 degrees. Output is a facing boolean for that declared cone.

**Bounds and missing/invalid inputs:** Other angles/zero vectors raise outside-domain/inputerror; vertical-only strikes need explicit profile. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Behind-body hit cannot borrow a front-facing block or attack; turn requires time and separate orientation segment.

### F46 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1,
      0
    ],
    [
      1,
      1
    ],
    45
  ],
  "expected": true
}
```

### F46 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1,
      0
    ],
    [
      -1,
      0
    ],
    45
  ],
  "expected": false
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f47"></a>

## F47 — Ordinary comfortable carry capacity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
5 × Strength
```

**Executable and argument order:** `independent_model.carry_capacity(strength)`.

**Variable meanings, units and output:** Strength is a positive effective score. Output is comfortable carried kg, not universal lifting permission.

**Bounds and missing/invalid inputs:** Supernatural/vehicle/drag profiles separate; missing body attributes UNKNOWN. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Weight remains real and cumulative through containers; no inventory-only exemption.

### F47 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20
  ],
  "expected": 100
}
```

### F47 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    30
  ],
  "expected": 150
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f48"></a>

## F48 — Ordinary movement profile speed

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(6,(1+DEX/20)×(2 if running else1)) × min(1,carryCapacity/max(1,load)) × terrain
```

**Executable and argument order:** `independent_model.move_speed(dexterity, strength, load_kg, terrain=1, running=False)`.

**Variable meanings, units and output:** Dexterity/Strength are positive scores, load is nonnegative kg, terrain is a fraction0–1 and running is boolean. Output is movement m/s under a bounded ordinary profile.

**Bounds and missing/invalid inputs:** Ordinary profile limited6m/s; impossible path still rejects. Supernatural profile requires exact technique/rule. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Highstats do not grant teleport/obstacle clipping; acceleration and APcost separately validated.

### F48 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    20,
    50,
    1,
    false
  ],
  "expected": 2
}
```

### F48 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    20,
    200,
    "1/2",
    true
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f49"></a>

## F49 — Acceleration-limited speed

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(profileCap,initialSpeed+acceleration×seconds)
```

**Executable and argument order:** `independent_model.available_velocity(initial, acceleration, seconds, profile_cap)`.

**Variable meanings, units and output:** initial speed and cap are m/s; acceleration is m/s²; elapsed time is seconds. Output is bounded attainable speed.

**Bounds and missing/invalid inputs:** Initial beyondselectedcap rejects rather than inventing deceleration; exact values only. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Narrated speed not accepted as achieved velocity; contact energy uses actual state/profile.

### F49 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    2,
    3,
    5
  ],
  "expected": 5
}
```

### F49 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    1,
    2,
    6
  ],
  "expected": 3
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f50"></a>

## F50 — Armor penetration work barrier

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
stressPa × contactAreaM² × thicknessM × condition/100
```

**Executable and argument order:** `independent_model.penetration_energy(stress_pa, contact_area, thickness, condition_pct=100)`.

**Variable meanings, units and output:** stress is Pa, contact area m², thickness m and condition percentage0–100. Output is an operational armor barrier in J.

**Bounds and missing/invalid inputs:** Simplified balance model, not fracture mechanics. Covered anatomical region only; missing material profile rejects. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Helmet does not protect foot. TrueDamage bypasses mitigation only its component, never wall geometry.

### F50 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    400000000,
    "1/10000",
    "1/500",
    100
  ],
  "expected": 80
}
```

### F50 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    400000000,
    "1/10000",
    "1/500",
    50
  ],
  "expected": 40
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f51"></a>

## F51 — Authorized block/deflection energy

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
absorbed=min(E×normalFraction,blockCapacity); remaining=E−absorbed
```

**Executable and argument order:** `independent_model.defense_energy(energy, block_capacity, deflection_normal_fraction, ready, covered, consent, window_ok)`.

**Variable meanings, units and output:** incident energy and block capacity are J; normal fraction0–1 and readiness/coverage/consent/window are required facts. Output is [remaining energy, absorbed energy].

**Bounds and missing/invalid inputs:** Any missing condition means no active defense; passive armor separate. Capacity finite per action/profile. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Detection not automatic spending. Deflection cannot reflect more energy than incoming; shield receives absorbed load.

### F51 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    30,
    1,
    true,
    true,
    true,
    true
  ],
  "expected": [
    70,
    30
  ]
}
```

### F51 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    80,
    "1/2",
    true,
    true,
    true,
    true
  ],
  "expected": [
    50,
    50
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f52"></a>

## F52 — Local injury severity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(100,ceil(100×damage/tissueTolerance))
```

**Executable and argument order:** `independent_model.local_injury(damage, tolerance)`.

**Variable meanings, units and output:** damage and positive tissue tolerance share injury units. Output is ceiled severity points capped at100.

**Bounds and missing/invalid inputs:** Tissue profile fantasy-calibrated; not medical realism. Death/limb loss requires explicit anatomy/vitality rule. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** No universalHP overwrite; regions, missingparts, bleeding and impairments preserved.

### F52 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    100
  ],
  "expected": 20
}
```

### F52 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    60,
    50
  ],
  "expected": 100
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f53"></a>

## F53 — Resting injury healing

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(0,severity−CON/10000×seconds×nutrition); missingpart retainsseverity
```

**Executable and argument order:** `independent_model.heal_injury(severity, constitution, seconds, nutrition=1, missing_part=False)`.

**Variable meanings, units and output:** severity is0–100 points; Constitution positive; seconds elapsed world time; nutrition fraction0–1; missing-part boolean. Output is remaining severity, not regeneration of missing tissue.

**Bounds and missing/invalid inputs:** Ordinary healing cannot regrow missingpart; no active combat recovery underthisprofile. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Offline rest consumes realfood/water and elapsedtime; maximum-resource increase does not refill currentpool.

### F53 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    40,
    20,
    10000,
    1,
    false
  ],
  "expected": 20
}
```

### F53 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    40,
    20,
    10000,
    1,
    true
  ],
  "expected": 40
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f54"></a>

## F54 — Period-aggregated progressive tax

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
0.1min(max(income−100,0),900)+0.2max(income−1000,0)
```

**Executable and argument order:** `independent_model.progressive_tax(income)`.

**Variable meanings, units and output:** income is nonnegative total taxable in-world currency units for one defined period. Output is exact tax under the proposed marginal brackets.

**Bounds and missing/invalid inputs:** Minorunit rounding only on aggregateperioddues, noteachtransaction; no Crowns/USD/payment assumption. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Splitting income into microtransactions preserves totalperiodtax; cumulativeassessment tracked.

### F54 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    500
  ],
  "expected": 40
}
```

### F54 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1500
  ],
  "expected": 190
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f55"></a>

## F55 — Explicit simple debt interest

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
principal × periodRate × elapsedPeriods
```

**Executable and argument order:** `independent_model.debt_interest(principal, rate_per_period, elapsed_periods)`.

**Variable meanings, units and output:** principal is in-world currency units; rate is fraction per declared period; elapsed periods can be rational. Output is simple interest units, not collection permission.

**Bounds and missing/invalid inputs:** No implicit compounding; negative rejects. Epoch/periodrate explicitlyconfigured. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Disconnect does not skip interest/upkeep; duplicateperiod application idempotent attransaction layer.

### F55 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1000,
    "1/100",
    2
  ],
  "expected": 20
}
```

### F55 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    500,
    "1/20",
    "1/2"
  ],
  "expected": "25/2"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f56"></a>

## F56 — Opportunity frequency accumulator

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
n=floor(rate×dt+carry); newCarry=rate×dt+carry−n
```

**Executable and argument order:** `independent_model.opportunity_count(rate_per_second, seconds, carry=0)`.

**Variable meanings, units and output:** rate is opportunities/world second, dt is seconds, carry is a fraction in[0,1). Output [integer opportunities, new fractional carry] makes time chunking equivalent.

**Bounds and missing/invalid inputs:** Stable opportunity indices persisted; deterministic draw independentofcallerstepsize. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Polling persecond vsperday yieldssameopportunitycount, notextravisitors.

### F56 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/10",
    25,
    0
  ],
  "expected": [
    2,
    "1/2"
  ]
}
```

### F56 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/10",
    10,
    "1/2"
  ],
  "expected": [
    1,
    "1/2"
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f57"></a>

## F57 — Conserving event quantity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(availableStock,transportCapacity,demand,sourcePopulation ifapplicable)
```

**Executable and argument order:** `independent_model.event_quantity(stock, transport, demand, source_population=None)`.

**Variable meanings, units and output:** Stock, transport, demand and optional source population are nonnegative integer units/persons. Output is actual transferable quantity, not success probability.

**Bounds and missing/invalid inputs:** Probability and frequency independent; sourcepopulation explicit for travelers. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Attraction cannotspawngoodsorpeople. Failedopportunity doesnotconsumequantity.

### F57 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    3,
    20,
    null
  ],
  "expected": 3
}
```

### F57 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    30,
    20,
    2
  ],
  "expected": 2
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f58"></a>

## F58 — Information route delay

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
distance/speed + relayDelay
```

**Executable and argument order:** `independent_model.travel_delay(distance, speed, relay_delay=0)`.

**Variable meanings, units and output:** Distance is m, positive speed m/s, relay delay seconds. Output is arrival-delay seconds, not immediate knowledge.

**Bounds and missing/invalid inputs:** Realpathrequired; deliveryrecheckspermissionandbodythought/locationrestriction. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** No worldwideawarenessoncommit; intercepted/revokedpermissionpreventsdisclosureatdelivery.

### F58 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1000,
    5,
    10
  ],
  "expected": 210
}
```

### F58 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    1,
    2
  ],
  "expected": 2
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f59"></a>

## F59 — Causal pressure retention

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp(previous×retention^periods+sum(uniqueCausalContributions),−100,100)
```

**Executable and argument order:** `independent_model.retained_pressure(previous, retention, periods, causes)`.

**Variable meanings, units and output:** Previous pressure and unique contributions are bounded pressure points; retention fraction0–1; periods integer0–10000. Output is bounded retained pressure, not authority.

**Bounds and missing/invalid inputs:** Conflictingsame-causevaluesreject; greaterhorizonoutsideprofile requireschunkedexactintegration. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Onecausereferencedbycity/nation/orgcountsone; retentionnotguaranteedpopulationorquantity.

### F59 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    "1/2",
    2,
    [
      [
        "road",
        10
      ],
      [
        "road",
        10
      ]
    ]
  ],
  "expected": 30
}
```

### F59 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    -50,
    1,
    0,
    [
      [
        "war",
        -60
      ]
    ]
  ],
  "expected": -100
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f60"></a>

## F60 — Frozen latent attribute draw

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
low+draw, drawuniforminteger0..high−low atweightedidentitycreation
```

**Executable and argument order:** `independent_model.latent_attribute(low, high, draw)`.

**Variable meanings, units and output:** low/high are configured positive score limits; draw is a bounded integer offset fixed at identity creation. Output is a frozen initial attribute score.

**Bounds and missing/invalid inputs:** Allocationseedandidentitypersist; not rerolledonrealization. Archetypeopportunityweightsdonotdeterminefinalattributes. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** No samplerusedforAzimahsource-backedreferences; no newpopulation created.

### F60 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    18,
    22,
    2
  ],
  "expected": 20
}
```

### F60 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    30,
    20
  ],
  "expected": 30
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f61"></a>

## F61 — Exact labor-cycle integration

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
96 potential300s tasks per8hwork; each1AP+4material→1goods;16hrest; food1/water3 per86400scycle
```

**Executable and argument order:** `formula_functions.work_input(days, materials)`.

**Variable meanings, units and output:** The vector wrapper accepts elapsed ordinary fixture days and initial material units; it initializes food10/water30. Output is the full work-cycle state, not just a goods count. This uses an explicit86400-second fixture day, not canonical calendar conversion.

**Bounds and missing/invalid inputs:** 86400s is laborcyclefixture notcanoncalendar. Exhaustion/stocksstopwork; nutritioninsufficientrequiresdeprivationprofile. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Bulk and stepwisetime integration same results; no offlinespawn/freeAP/materials.

### F61 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    1000
  ],
  "expected": {
    "goods": 96,
    "materials": 616,
    "ap": 100,
    "food": 9,
    "water": 27
  }
}
```

### F61 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    1000
  ],
  "expected": {
    "goods": 192,
    "materials": 232,
    "ap": 100,
    "food": 8,
    "water": 24
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f62"></a>

## F62 — Evidence-gated skill mastery stage

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
Highest stage meeting learnedlevel, qualifyinguses, distinctcontexts
```

**Executable and argument order:** `independent_model.skill_stage(learned, qualifying_uses, contexts)`.

**Variable meanings, units and output:** Learned level, qualifying use count and distinct context count select the highest supported skill stage; temporary bonuses do not count.

**Bounds and missing/invalid inputs:** Temporaryeffectivelevel/synergydoesnotcountlearnedstage; suppressedskill retainslearnedhistory. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Boostingscore80without300uses/5contexts doesnotfabricatemasterstatus.

### F62 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    300,
    5
  ],
  "expected": "master"
}
```

### F62 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    10,
    2
  ],
  "expected": "practiced"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f63"></a>

## F63 — Technique execution mastery stage

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
Stage1:10attempt/8success/2contexts;2:50/45/3;3:200/190/5; else0
```

**Executable and argument order:** `independent_model.technique_mastery(qualifying, successes, contexts)`.

**Variable meanings, units and output:** Committed qualifying attempts, successes and distinct contexts select technique stage0–3. Output is an execution-mastery stage, not permission to skip prerequisites.

**Bounds and missing/invalid inputs:** Successes≤attempts; acquisitionseparate; onlyrealcanonicaltechniquefamilieswhenrosteravailable. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Harmlessrepetition,aliases,temporarybonusesandobjectproxiesdonotforgepersonalpracticeevidence.

### F63 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    200,
    190,
    5
  ],
  "expected": 3
}
```

### F63 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    50,
    45,
    3
  ],
  "expected": 2
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f64"></a>

## F64 — Action-scoped directed skill synergy

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
F05 over unique listedraw-effectivesources whose requiredTags⊆actualActionTags
```

**Executable and argument order:** `independent_model.scoped_synergy(target_id, effective, edges, action_tags)`.

**Variable meanings, units and output:** Target skill ID, raw effective source levels, directed edge records and actual action tags determine a flat contest-score bonus; duplicate source edges do not add credit.

**Bounds and missing/invalid inputs:** Allunlistedpairs0; learnedmastery/prerequisitesunaffected. Tagsassignedbyregisteredactionprofile,notclientadjectives. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Cycle-freeevaluationbyimmutablelevelsnapshot; multi-affinityspecialtiesdonotmultiplyoneedge.

### F64 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "SK19",
    {
      "SK18": 30,
      "SK19": 20
    },
    [
      {
        "source": "SK18",
        "target": "SK19",
        "required_tags": [
          "knowledge.validated_models"
        ]
      }
    ],
    [
      "knowledge.validated_models"
    ]
  ],
  "expected": 3
}
```

### F64 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "SK19",
    {
      "SK18": 30,
      "SK19": 20
    },
    [
      {
        "source": "SK18",
        "target": "SK19",
        "required_tags": [
          "knowledge.validated_models"
        ]
      }
    ],
    []
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f65"></a>

## F65 — Institution capability stage

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
formed=validcharter+2members; operational=alsoasset≥1,stock≥10,treasury≥100; recognized=alsojurisdictionattestation
```

**Executable and argument order:** `independent_model.organization_stage(charter, members, assets, stock, treasury, recognition)`.

**Variable meanings, units and output:** Charter/recognition are boolean authority facts; members/assets/stock are integer counts; treasury is currency. Output is unformed, formed, operational or recognized under the proposed thresholds.

**Bounds and missing/invalid inputs:** AdministrativecapabilitiesnotcombatTiers; nomechanicsorrecognizedauthorityfromlabelalone. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Assets,personsandinstitutionalrecognitioncannotbeconjuredbyTier/title/wealth.

### F65 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    true,
    2,
    1,
    10,
    100,
    false
  ],
  "expected": "operational"
}
```

### F65 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    true,
    2,
    1,
    10,
    100,
    true
  ],
  "expected": "recognized"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f66"></a>

## F66 — Defined wound bleeding rate

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
severity/1000
```

**Executable and argument order:** `independent_model.bleeding_rate(severity)`.

**Variable meanings, units and output:** Severity is an existing wound’s integer0–100 points. Output is injury units/world second; the formula cannot create a wound or determine canonical death.

**Bounds and missing/invalid inputs:** No wound/no bleeding yields0inWound.advance; duration endsontreatment. MissingprofileUNKNOWN. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** Cannothealaregionwhileignoringongoingloss; activebandagingrequiresMedicine10,dressing1,reachandconsent.

### F66 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20
  ],
  "expected": "1/50"
}
```

### F66 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100
  ],
  "expected": "1/10"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f67"></a>

## F67 — Budgeted sensible heat requirement

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
mass × heatCapacity × positiveTemperatureDelta
```

**Executable and argument order:** `independent_model.heat_requirement(mass, heat_capacity, delta_k)`.

**Variable meanings, units and output:** Mass is kg, specific heat J/kg/K and positive temperature change K. Output is required sensible heat J, not a source of energy.

**Bounds and missing/invalid inputs:** Onlyboundednophasetransitionprofile; cooling/endbeyondservice limit outside-domain. Exactheatbudgetdebited. Missing source-required policy returns UNKNOWN or rejects; no guessed canonical input.

**Exploit defense and separate gates:** No infiniteburning/craftingheatafterfueldepletion; no freeheatfromrarity.

### F67 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    500,
    10
  ],
  "expected": 10000
}
```

### F67 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    4200,
    5
  ],
  "expected": 21000
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source_id": "t99u", "section": "PartsII–XVI; see document dependencies", "exact_quote": "The goal is a complete proposed working design, not an unauthorized declaration of new AO canon.", "source_status": "CREATOR INSTRUCTION", "date_raw": "2026-11-07"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f68"></a>

## F68 — Ordinary-body restoring impulse capacity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
mass × g × halfSupportWidth / bodyHeight × responseWindow
```

**Executable and argument order:** `independent_model.balance_capacity(mass, half_support_width, height, window)`.

**Variable meanings, units and output:** Mass kg, half-support width m, body height m and response window seconds set restoring impulse capacity in N·s. Gravity9.81m/s² is a proposed fixture constant.

**Bounds and missing/invalid inputs:** PROPOSAL bounded profile only; nonnegative exact inputs, positive mass/height/toughness; missing actual body details UNKNOWN.

**Exploit defense and separate gates:** No arbitrary contact velocity, free durability restoration or offline resource multiplication.

### F68 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    "1/5",
    "17/10",
    "1/2"
  ],
  "expected": "3924/85"
}
```

### F68 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    "1/2",
    2,
    1
  ],
  "expected": "981/4"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. No specific canonical numerical source is asserted for this formula.

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f69"></a>

## F69 — Equipment work-to-condition wear

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(0, condition − ceil(absorbedJ / toughnessJPerPoint))
```

**Executable and argument order:** `independent_model.equipment_wear(absorbed_j, joules_per_condition_point, condition_pct)`.

**Variable meanings, units and output:** Absorbed work J, positive toughness J/condition-point and current condition percentage determine remaining condition0–100.

**Bounds and missing/invalid inputs:** PROPOSAL bounded profile only; nonnegative exact inputs, positive mass/height/toughness; missing actual body details UNKNOWN.

**Exploit defense and separate gates:** No arbitrary contact velocity, free durability restoration or offline resource multiplication.

### F69 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    100,
    100
  ],
  "expected": 99
}
```

### F69 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    250,
    100,
    50
  ],
  "expected": 47
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. No specific canonical numerical source is asserted for this formula.

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f70"></a>

## F70 — Time-integrated deprivation severity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(100, initialSeverity + 20 × (foodDeficitDays + waterDeficitDays))
```

**Executable and argument order:** `independent_model.deprivation(severity, food_deficit_days, water_deficit_days)`.

**Variable meanings, units and output:** Initial severity points and food/water deficit days produce capped severity0–100. Deficit days use the named86400-second ordinary fixture, not an inferred world calendar.

**Bounds and missing/invalid inputs:** PROPOSAL bounded profile only; nonnegative exact inputs, positive mass/height/toughness; missing actual body details UNKNOWN.

**Exploit defense and separate gates:** No arbitrary contact velocity, free durability restoration or offline resource multiplication.

### F70 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    1,
    1
  ],
  "expected": 40
}
```

### F70 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    90,
    1,
    0
  ],
  "expected": 100
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. No specific canonical numerical source is asserted for this formula.

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f71"></a>

## F71 — Per-affinity unique acquired family count

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
|{canonicalFamily(f): f acquired AND affinity in registeredProfile(f).affinities}|
```

**Executable and argument order:** `formula_functions.affinity_count_input(affinity, acquired, family_domains, aliases, policy)`.

**Variable meanings, units and output:** Affinity ID, acquired families/aliases, a complete actual family-to-affinity map, alias map and declared policy produce a unique matching-family count. Unknown associations/quotas cannot pass.

**Bounds and missing/invalid inputs:** Unknown maps, graph completeness, aliases, thresholds or counting policy block; all thresholds positive typed integers. No generic total replaces per-affinity quota.

**Exploit defense and separate gates:** Unique canonical identity, typed explicit policy and fail-closed UNKNOWN. All supplied numeric profiles synthetic proposals, not canon.

### F71 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "A",
    [
      "a",
      "a-alias",
      "b"
    ],
    {
      "a": [
        "A"
      ],
      "b": [
        "B"
      ]
    },
    {
      "a-alias": "a"
    },
    "per_affinity_unique_family"
  ],
  "expected": 1
}
```

### F71 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "A",
    [
      "c",
      "c",
      "d"
    ],
    {
      "c": [
        "A",
        "B"
      ],
      "d": [
        "A"
      ]
    },
    {},
    "per_affinity_unique_family"
  ],
  "expected": 2
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/chatgpt-bounded-retrieval/first-pass-excerpts.md", "lines": "12;27", "creator_url": "https://chatgpt.com/c/6aeeab61-31d4-83ea-820e-b7ba9572ce3a", "status": "Creator qualitative affinity-associated technique prerequisite, not numeric quotas or counting policy"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f72"></a>

## F72 — Explicit policy life debit

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(0,currentLives − declaredDeathCost)
```

**Executable and argument order:** `profile_mechanics.remaining_lives(lives, death_cost)`.

**Variable meanings, units and output:** Current lives is a nonnegative integer; declared death cost is a positive integer. Output is remaining lives after explicit policy debit. Committed death provenance is required separately.

**Bounds and missing/invalid inputs:** Three lives is creator direction; cost1 is an explicitly proposed fixture policy, not four lives or automatic respawn. UNKNOWN policy blocks; floats/bools/negative costs reject.

**Exploit defense and separate gates:** Unique canonical identity, typed explicit policy and fail-closed UNKNOWN. All supplied numeric profiles synthetic proposals, not canon.

### F72 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    3,
    1
  ],
  "expected": 2
}
```

### F72 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    1
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/chatgpt-bounded-retrieval/first-pass-excerpts.md", "lines": "74", "creator_url": "https://chatgpt.com/c/6aeee403-c518-83e9-af82-6c0906965367", "status": "Creator three-life/body/equipment/reacquisition direction; trailing and one, restoration cap, timing and disposition UNKNOWN. Formula policy values PROPOSAL."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. Player-life use is NOT APPLICABLE to Azimah by default. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f73"></a>

## F73 — Bounded explicit life restoration

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
currentLives + declaredRestoreAmount, only if result ≤ explicitRestorationCap
```

**Executable and argument order:** `profile_mechanics.restored_lives(lives, amount, cap)`.

**Variable meanings, units and output:** Current lives≥0, restore amount≥1 and explicit cap≥1 are integers. Output is restored lives only when the sum is within cap; overflow rejects rather than clamps. Actual matching-corpse recovery is separate.

**Bounds and missing/invalid inputs:** No canonical cap or consumption rule inferred. UNKNOWN cap/disposition blocks. No remote title-only restoration; no healing conversion; no automatic NPC/Agent/Azimah applicability.

**Exploit defense and separate gates:** Unique canonical identity, typed explicit policy and fail-closed UNKNOWN. All supplied numeric profiles synthetic proposals, not canon.

### F73 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    1,
    3
  ],
  "expected": 3
}
```

### F73 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    1,
    3
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/chatgpt-bounded-retrieval/first-pass-excerpts.md", "lines": "74", "creator_url": "https://chatgpt.com/c/6aeee403-c518-83e9-af82-6c0906965367", "status": "Creator three-life/body/equipment/reacquisition direction; trailing and one, restoration cap, timing and disposition UNKNOWN. Formula policy values PROPOSAL."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. Player-life use is NOT APPLICABLE to Azimah by default. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f74"></a>

## F74 — Bounded conceptual change predicate

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
minimum≤current≤maximum AND minimum≤new≤maximum AND |new−current|≤maxDelta
```

**Executable and argument order:** `profile_mechanics.bounded_authority_change(current, new, minimum, maximum, max_delta)`.

**Variable meanings, units and output:** Current/proposed values and min/max bounds are exact quantities in the rule’s declared units; maxDelta is nonnegative in the same units. Output is a bounded-change predicate, not an authority grant.

**Bounds and missing/invalid inputs:** Unknown bounds or non-exact numbers reject; current/new stay within declared envelope. Does not authorize Kernel mutation, arbitrary authority, alteration of committed history, or a canonical named Agent.

**Exploit defense and separate gates:** Unique canonical identity, typed explicit policy and fail-closed UNKNOWN. All supplied numeric profiles synthetic proposals, not canon.

### F74 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    4,
    0,
    10,
    2
  ],
  "expected": true
}
```

### F74 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    5,
    0,
    10,
    2
  ],
  "expected": false
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/chatgpt-bounded-retrieval/first-pass-excerpts.md", "lines": "70", "creator_url": "https://chatgpt.com/c/6aeee403-c518-83e9-af82-6c0906965367", "status": "Creator differentiated bounded authority and embodiment direction; all numeric bounds/range/counters PROPOSAL. Latest t99 single assigned Tier prevails."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f75"></a>

## F75 — Declared3D authority range predicate

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
sum((origin[i]−target[i])² for i=0..2) ≤ maximumRange²
```

**Executable and argument order:** `profile_mechanics.within_profile_range(origin, target, maximum)`.

**Variable meanings, units and output:** Origin/target are exact3D meter coordinates and maximumRange is nonnegative meters. Output includes equality at the spherical range boundary. Actual concept/type/region/custody gates remain separate.

**Bounds and missing/invalid inputs:** UNKNOWN position/range blocks. Floats/bools, missing dimensions and negative range reject. Predicate alone creates no contact, visibility, permission or real support physics.

**Exploit defense and separate gates:** No region-tag-only remote authority; actual target coordinates must satisfy the explicit profile envelope.

### F75 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      0,
      0,
      0
    ],
    [
      3,
      4,
      0
    ],
    5
  ],
  "expected": true
}
```

### F75 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      0,
      0,
      0
    ],
    [
      3,
      4,
      1
    ],
    5
  ],
  "expected": false
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/chatgpt-bounded-retrieval/first-pass-excerpts.md", "lines": "70", "creator_url": "https://chatgpt.com/c/6aeee403-c518-83e9-af82-6c0906965367", "status": "Creator differentiated bounded authority and embodiment direction; all numeric bounds/range/counters PROPOSAL. Latest t99 single assigned Tier prevails."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f76"></a>

## F76 — Spendable resource after reservation

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
available = balance − held
```

**Executable and argument order:** `lifecycle_mechanics.available_after_reservation(balance, held)`.

**Variable meanings, units and output:** balance and held are nonnegative exact quantities in the same AP or per-affinity EA compartment; output available uses that same unit. No cross-domain aggregation.

**Bounds and missing/invalid inputs:** held≤balance; negatives, floats, bools, UNKNOWN and missing values reject. Zero availability is legal; spending remains separately checked.

**Exploit defense and separate gates:** Reserve actual finite pools, occupy capacity during escrow, never allow rest/charging to refill reserved capacity.

### F76 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    7
  ],
  "expected": 13
}
```

### F76 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    8,
    8
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "194–198,237–268,315–376,678–690", "status": "Creator qualitative distinctions; all new rates, composition/counting/disposition policies are PROPOSAL. t100 body restrictions retained."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f77"></a>

## F77 — Ordered phase deadline

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
deadline = start + sum(durations)
```

**Executable and argument order:** `lifecycle_mechanics.phase_deadline(start, durations)`.

**Variable meanings, units and output:** start and each duration are exact nonnegative world seconds; output is absolute world seconds. The integrated lifecycle uses integer-second ticks and integer profile durations.

**Bounds and missing/invalid inputs:** Explicit duration sequence required. Negative/missing/non-numeric values reject. Pure arithmetic permits empty sequence; an activation profile independently requires positive funded preparation and total phase time.

**Exploit defense and separate gates:** Deadlines are absolute, not daily-reset counters. Crossing a day never clears cooldown.

### F77 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    [
      2,
      1,
      1
    ]
  ],
  "expected": 104
}
```

### F77 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    86399,
    [
      2,
      3
    ]
  ],
  "expected": 86404
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "194–198,237–268,315–376,678–690", "status": "Creator qualitative distinctions; all new rates, composition/counting/disposition policies are PROPOSAL. t100 body restrictions retained."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f78"></a>

## F78 — Owned weakness and active defense composition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
resolved = damage × product(ownedWeakness) × max(minimumRetained, product(activeRetained))
```

**Executable and argument order:** `lifecycle_mechanics.composed_defense(damage, weakness_factors, active_retained, minimum_retained)`.

**Variable meanings, units and output:** damage is nonnegative injury units. ownedWeakness lists dimensionless factors≥1 for every owned affinity; activeRetained lists factors in (0,1] for only currently active accessible channels. minimumRetained∈(0,1] is dimensionless; output injury units. Empty products equal1.

**Bounds and missing/invalid inputs:** Incomplete registered maps or UNKNOWN rules block. Nonpositive active factors, factors above1, weakness below1, negative damage and invalid minimum reject. No guessed neutral absent edge.

**Exploit defense and separate gates:** Positive retained floor prevents free immunity; all owned weaknesses persist regardless of draw, channel and access checks precede arithmetic. This multiplier policy is a proposal, not a recovered triangle.

### F78 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    [
      "3/2"
    ],
    [
      "1/2",
      "1/2"
    ],
    "1/10"
  ],
  "expected": "75/2"
}
```

### F78 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    [],
    [
      "1/10",
      "1/10"
    ],
    "1/10"
  ],
  "expected": 10
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "194–198,237–268,315–376,678–690", "status": "Creator qualitative distinctions; all new rates, composition/counting/disposition policies are PROPOSAL. t100 body restrictions retained."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f79"></a>

## F79 — Conserving physical material partition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(output, scrap) = (requestedOutput, totalInput − requestedOutput)
```

**Executable and argument order:** `lifecycle_mechanics.material_partition(total, output)`.

**Variable meanings, units and output:** totalInput and requestedOutput are nonnegative exact kilograms; returns output kg and scrap kg. Failure requests zero output. Transactional craft separately requires positive physical output on success.

**Bounds and missing/invalid inputs:** requestedOutput≤totalInput; negative/missing/UNKNOWN quantities and non-exact values reject. Input identities must independently be distinct actual owned unconsumed leaves.

**Exploit defense and separate gates:** Tombstone consumed input identities, preserve actual work/scrap objects and provenance; no refund resurrects sacrificed technique or conscious person.

### F79 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    6,
    4
  ],
  "expected": [
    4,
    2
  ]
}
```

### F79 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    6,
    0
  ],
  "expected": [
    0,
    6
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "194–198,237–268,315–376,678–690", "status": "Creator qualitative distinctions; all new rates, composition/counting/disposition policies are PROPOSAL. t100 body restrictions retained."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f80"></a>

## F80 — Funded interval cost

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
cost = rate × elapsedSeconds
```

**Executable and argument order:** `lifecycle_mechanics.interval_cost(rate, seconds)`.

**Variable meanings, units and output:** rate is nonnegative AP/s for craft or EA/s in one specified affinity for sustain; elapsedSeconds is nonnegative world seconds. Output AP or that domain EA, never a fungible mixed resource.

**Bounds and missing/invalid inputs:** Negative/float/bool/missing/UNKNOWN inputs reject. Zero elapsed gives zero charge; registered craft requires positive rate/time, sustain source domains are explicitly listed.

**Exploit defense and separate gates:** Use actual continuous committed interval exactly once; cap at expiry, preserve paid work on cancellation and reserve maximum duration up front.

### F80 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "3/2",
    4
  ],
  "expected": 6
}
```

### F80 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    0
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "194–198,237–268,315–376,678–690", "status": "Creator qualitative distinctions; all new rates, composition/counting/disposition policies are PROPOSAL. t100 body restrictions retained."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f81"></a>

## F81 — Finite ordinary-action quote

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(AP, seconds) = (units × APperUnit, units × secondsPerUnit)
```

**Executable and argument order:** `lifecycle_mechanics.ordinary_quote(units, ap_per_unit, seconds_per_unit)`.

**Variable meanings, units and output:** units is positive integer distance-meters for bounded axis movement, or one operation for handle/recover/break. APperUnit and secondsPerUnit are positive exact units; output is total AP and elapsed world seconds.

**Bounds and missing/invalid inputs:** Nonpositive units/cost/timing, float/bool count and UNKNOWN reject. Integrated profiles use integer-second durations. Movement requires one horizontal axis and integer distance; no unsupported diagonal/path/support claim.

**Exploit defense and separate gates:** Debit finite AP and advance authoritative time; no free ordinary action, remote recovery, repeated projectile duplication or ownership conversion by handling.

### F81 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    3,
    2,
    1
  ],
  "expected": [
    6,
    3
  ]
}
```

### F81 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    "3/2",
    2
  ],
  "expected": [
    "3/2",
    2
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "194–198,237–268,315–376,678–690", "status": "Creator qualitative distinctions; all new rates, composition/counting/disposition policies are PROPOSAL. t100 body restrictions retained."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f82"></a>

## F82 — Stable scheduled-event initiative order

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
key = (at, phase, −score, stableID)
```

**Executable and argument order:** `temporal_mechanics.initiative_key(at, phase, score, stable_id)`.

**Variable meanings, units and output:** at is an integer world second; phase integer0..9; score is nonnegative effective initiative (existing F28 from actual effective Dexterity/skill plus explicit profile bias); stableID is a unique persistent action ID. Output total-order tuple, lowest first.

**Bounds and missing/invalid inputs:** Negative/noninteger times, invalid phase, UNKNOWN score and missing stable identity reject. Ties use stable IDs, not thread arrival or dictionary insertion. One actor cannot reserve incompatible simultaneous actions.

**Exploit defense and separate gates:** Revocations/expiry and paid detection precede action completions; physical readiness is additionally checked at actual exact contact time. No favorable initiative grants physical possibility.

### F82 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    3,
    20,
    "B"
  ],
  "expected": [
    10,
    3,
    -20,
    "B"
  ]
}
```

### F82 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    3,
    25,
    "A"
  ],
  "expected": [
    10,
    3,
    -25,
    "A"
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f83"></a>

## F83 — Finite slowed action work estimate

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
ticks = ceil(work × timeFactor)
```

**Executable and argument order:** `temporal_mechanics.reaction_ticks(work, time_factor)`.

**Variable meanings, units and output:** work is nonnegative exact work-seconds; timeFactor is exact seconds/work-second in[1,10]; output integer world seconds. Runtime integrates work by1/timeFactor each tick and recomputes when timed effects change; estimate assumes factor constant.

**Bounds and missing/invalid inputs:** Negative work, factor outside[1,10], floats/bools/missing/UNKNOWN reject. Zero arithmetic result is legal only for explicit zero phases; actual action/resource profiles still require effort.

**Exploit defense and separate gates:** Slowdown changes completion scheduling, not only descriptive movement speed. Interrupted work cannot commit an early effect or obtain free activation.

### F83 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    "3/2"
  ],
  "expected": 3
}
```

### F83 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    2
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f84"></a>

## F84 — Finite resistance and delivered dose partition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(effectiveDose, remainingResistance) = (dose − min(dose,resistance), resistance − min(dose,resistance))
```

**Executable and argument order:** `temporal_mechanics.dose_partition(dose, resistance)`.

**Variable meanings, units and output:** dose/resistance use the same explicit synthetic dose units. Outputs residual delivered dose and remaining finite resistance budget. A fixture reagent unit has explicit kg/unit; this is not real toxicology or an affinity resistance map.

**Bounds and missing/invalid inputs:** Negative/non-exact/missing/UNKNOWN values reject. Zero effective dose is legal only through a known finite consumed resistance budget; absent resistance never defaults to zero or immunity.

**Exploit defense and separate gates:** Consume actual held source dose/mass, bind causal application once, preserve spent matter and ingredient provenance. No perpetual per-attempt resistance reset.

### F84 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    5,
    2
  ],
  "expected": [
    3,
    0
  ]
}
```

### F84 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    3
  ],
  "expected": [
    0,
    2
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f85"></a>

## F85 — End-exclusive finite status interval

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
injury = dose × rate × max(0,min(end,finish) − max(start,begin))
```

**Executable and argument order:** `temporal_mechanics.status_interval(dose, rate, start, end, begin, finish)`.

**Variable meanings, units and output:** dose is exact nonnegative synthetic dose units; rate is severity-points/(dose-unit×world-second); all interval endpoints are integer world seconds. Output nonnegative severity-points before F87 boundary policy. Active interval[start,end).

**Bounds and missing/invalid inputs:** Reversed/negative/noninteger endpoints or UNKNOWN profile/dose/rate reject. No damage occurs after exact expiry. Existing source-specific rates/fuel physics remain unverified.

**Exploit defense and separate gates:** Integrate actual overlap once, deduplicate causal attempts, sum distinct sources, cap finite duration and dose. Cure changes future dose only, not committed past injury.

### F85 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    3,
    10,
    14,
    11,
    13
  ],
  "expected": 12
}
```

### F85 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    2,
    1,
    5,
    5,
    6
  ],
  "expected": 0
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f86"></a>

## F86 — Scoped synthetic slow-source time factor

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
timeFactor = min(10,1 + sum(dose[i] × coefficient[i]))
```

**Executable and argument order:** `temporal_mechanics.status_time_factor(doses, coefficients)`.

**Variable meanings, units and output:** Each dose is nonnegative exact units; each coefficient is nonnegative reciprocal-dose; resulting dimensionless time factor is seconds/work-second. This additive status policy is an explicit scoped exception; numeric grants otherwise retain default stacking.

**Bounds and missing/invalid inputs:** Mismatched arrays, negative/non-exact/UNKNOWN values reject. Empty sources give1. Missing canonical profiles never become empty sources; actual active source records are required.

**Exploit defense and separate gates:** Temporary source expiry/treatment changes work progress at the next exact boundary. Cap10 prevents unbounded duration growth; paralysis is a distinct prohibition, not infinite slow.

### F86 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1,
      2
    ],
    [
      1,
      "1/2"
    ]
  ],
  "expected": 3
}
```

### F86 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      20
    ],
    [
      1
    ]
  ],
  "expected": 10
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f87"></a>

## F87 — Damage/healing boundary without retrospective life recovery

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
afterDamage=min(100,severity+damage); result=100 if afterDamage=100 else max(0,afterDamage−healing)
```

**Executable and argument order:** `temporal_mechanics.injury_boundary(severity, damage, healing)`.

**Variable meanings, units and output:** severity/damage/healing are exact severity-points; starting severity is[0,100]. Output[0,100].100 is incapacitation requiring explicit death/recovery policy, not an automatic player-life debit.

**Bounds and missing/invalid inputs:** Negative/missing/non-exact/UNKNOWN values and starting severity>100 reject. Healing cannot undo an already committed100 threshold or restore a missing identity/life.

**Exploit defense and separate gates:** Tick order is explicit: elapsed status injury, control/expiry/application/treatment/healing, reaction/ordinary completion, then swept contact effects. No implied universal real-time physiology or resurrection.

### F87 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    99,
    2,
    10
  ],
  "expected": 100
}
```

### F87 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    2,
    3
  ],
  "expected": 9
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f88"></a>

## F88 — Explicit replacement before scoped stacking and cap

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
chosenBase = replacement if supplied else base; result = clamp((chosenBase + sum(flats)) × product(factors),minimum,maximum)
```

**Executable and argument order:** `temporal_mechanics.replaced_operand(base, replacement, flats, factors, minimum, maximum)`.

**Variable meanings, units and output:** base/replacement/flats use the operand’s declared units; factors are nonnegative dimensionless. null explicitly means no replacement. Runtime selects applicable distinct sources/exclusions first; replacement selection is explicit priority then stable operator ID. Exact arithmetic is (chosenBase+sum(flats))*product(factors).

**Bounds and missing/invalid inputs:** UNKNOWN replacement or bounds, negative factors, reversed bounds and non-exact quantities reject. Caps apply after replacement and stacking, never before a later negative flat.

**Exploit defense and separate gates:** Suppress suspends active grant; nullify neutralizes only numeric contribution; revoke ends ownership; replacement does not erase other sources or history. Same actual causal source cannot stack through aliases.

### F88 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    20,
    [
      2
    ],
    [
      1
    ],
    0,
    100
  ],
  "expected": 22
}
```

### F88 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    null,
    [
      3
    ],
    [
      2
    ],
    0,
    25
  ],
  "expected": 25
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "237–268,315–376,498–560,694–754", "status": "Creator qualitative accounting/reaction/modifier requirements; all new ordering/rates/thresholds are proposals."}
- {"source": "sources/creator-affinity-deferral-2026-11-07-1238-CST.md", "status": "Exact parent relay; affinity roster/weakness/resistance remain creator-directed UNKNOWN."}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f89"></a>

## F89 — Crafting grade, not rarity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
grade = min(9−craftTier,max(0,startGrade + weakestMaterialGrade + creationDelta))
```

**Executable and argument order:** `production_mechanics.grade_result(start, material, craft_tier, modifier)`.

**Variable meanings, units and output:** startGrade/materialGrade are integer grade ordinals0..9; craftTier integer0..9 with0 most advanced; creationDelta signed integer−9..9 derived from distinct registered paid-cast modifiers. Output grade ordinal0..9−craftTier. No character-Tier execution gate is implied.

**Bounds and missing/invalid inputs:** UNKNOWN/noninteger/bool/out-of-range values reject. Starting/material/creation contributions are separate; final crafting-tier ceiling applies after all additions.

**Exploit defense and separate gates:** Only registered modifier identities with actual once-used paid cast may supply nonzero delta; grade never supplies conceptual authority.

### F89 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    2,
    0,
    0
  ],
  "expected": 4
}
```

### F89 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9,
    9,
    8,
    9
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f90"></a>

## F90 — Manufactured quality independent of rarity/condition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
quality = min(qualityCeiling,max(0,floor((materialQuality + cappedCraftSkill)/2) − flaw))
```

**Executable and argument order:** `production_mechanics.quality_result(material_quality, skill, ceiling, flaw)`.

**Variable meanings, units and output:** materialQuality exact0..100 points from F98; craftSkill integer0..100 after explicit clipping of learned Craft; qualityCeiling/flaw integer0..100. Output integer quality points. Permanent skill and material provenance, not temporary numeric buffs, drive this fixture.

**Bounds and missing/invalid inputs:** Unknown quantities, negative/out-of-bound quality/skill/ceiling/flaw, floats/bools reject. Quality is not grade, natural rarity or current wear.

**Exploit defense and separate gates:** Output cap also includes attained Tier benefit ceiling. Repair never raises quality; recycling uses raw grade/quality lineage, not manufactured grade as a new free raw grade.

### F90 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    100,
    95,
    0
  ],
  "expected": 90
}
```

### F90 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "67/2",
    40,
    100,
    1
  ],
  "expected": 35
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f91"></a>

## F91 — Known rarity floor/ceiling interval

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
floor = max(baseFloor,materialFloor,modifierFloor); ceiling = min(recipeCeiling,grade//2); require floor≤ceiling
```

**Executable and argument order:** `production_mechanics.rarity_interval(base_floor, material_floor, modifier_floor, ceiling, grade)`.

**Variable meanings, units and output:** All rarity inputs integer ordinals0..4; grade integer0..9. Output inclusive final rarity interval; known same-craft-tier original rarity can further lower ceiling. Natural draw remains separate.

**Bounds and missing/invalid inputs:** Unknown/noninteger/out-of-range inputs or floor>ceiling reject; do not silently raise a ceiling or lower a promised floor.

**Exploit defense and separate gates:** Clamp natural outcome to this interval; final ceiling wins. Original ceilings and envelope bounds survive rarity/quality changes and replicas.

### F91 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    1,
    0,
    4,
    6
  ],
  "expected": [
    1,
    3
  ]
}
```

### F91 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    0,
    0,
    4,
    0
  ],
  "expected": [
    0,
    0
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f92"></a>

## F92 — Conserving finite batch quote

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(outputMass,work,workAP) = (quantity×massPer,quantity×workPer,quantity×workPer×APRate×efficiency)
```

**Executable and argument order:** `production_mechanics.production_quote(quantity, mass_per, work_per, rate, efficiency)`.

**Variable meanings, units and output:** quantity integer1..8; massPer positive kg/unit; workPer positive work-seconds/unit; APRate positive AP/work-second; efficiency exact1/2..1. Outputs kg, work-seconds, AP. Preparation AP is separate. Work progresses1/slowFactor per clock tick.

**Bounds and missing/invalid inputs:** Zero/negative/UNKNOWN costs/materials/work, fractional/bool/out-of-bound quantities, efficiency outside[1/2,1], floats reject. Ordinary single versus batch multiple is typed by mode.

**Exploit defense and separate gates:** Reserve every AP/EA unit and every limited-run slot atomically; actual consumed inputs must cover condition-limited usable mass. No free quantity/time or partial-output cancellation.

### F92 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    2,
    2,
    1,
    "4/5"
  ],
  "expected": [
    4,
    4,
    "16/5"
  ]
}
```

### F92 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    "1/10",
    3,
    2,
    1
  ],
  "expected": [
    "1/10",
    3,
    6
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f93"></a>

## F93 — Finite ordinary repair and persistent ceiling attrition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
newCeiling=oldCeiling−1; require newCeiling>condition; repaired=min(newCeiling,condition+restoration)
```

**Executable and argument order:** `production_mechanics.repair_result(condition, ceiling, restoration)`.

**Variable meanings, units and output:** condition integer0..100; old repair ceiling integer1..100; restoration integer1..100 points. Output repaired condition and permanently reduced repair ceiling. Quality/grade/rarity are unchanged.

**Bounds and missing/invalid inputs:** Invalid/UNKNOWN/bool/fractional values, condition>ceiling or no actual restorative room reject. Heirloom identity/Agent authority cannot pass ordinary repair.

**Exploit defense and separate gates:** Real paid work, consumed finite material and tool wear remain; repair material becomes spent matter. Conscious break ends identity; new reassembly is a new entity. No infinite perfect-repair loop.

### F93 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    50,
    100,
    20
  ],
  "expected": [
    70,
    99
  ]
}
```

### F93 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    90,
    95,
    20
  ],
  "expected": [
    94,
    94
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f94"></a>

## F94 — No-fill reserve transition and explicit overflow sink

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(after,overflow) = (min(current,newMaximum),max(0,current−newMaximum))
```

**Executable and argument order:** `production_mechanics.pool_transition(current, old_max, new_max, policy)`.

**Variable meanings, units and output:** current/oldMaximum/newMaximum use same exact AP or per-affinity EA units; maxima positive, current0..oldMaximum. policy must explicitly be preserve_absolute_no_fill_fixture. Output spendable after-current and recorded sink; no free proportional filling.

**Bounds and missing/invalid inputs:** Unknown/unregistered policy, zero maxima, negative/current>oldMaximum, floats/bools reject. All actor compartments must be declared; active channels must fit both ATT and unlocked channel bound.

**Exploit defense and separate gates:** Complete ritual debits/refunds only its own escrow before maxima transition; overflow recorded. AP fixture maximum≤100; no supercharge, extra affinity access or new daily reset.

### F94 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    100,
    150,
    "preserve_absolute_no_fill_fixture"
  ],
  "expected": [
    80,
    0
  ]
}
```

### F94 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    80,
    100,
    60,
    "preserve_absolute_no_fill_fixture"
  ],
  "expected": [
    60,
    20
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f95"></a>

## F95 — Ten differentiated cumulative production-specialization benefit contracts

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
benefits = explicitRegisteredTable[tier], tier∈{9,…,0}
```

**Executable and argument order:** `production_mechanics.benefit_limits(tier)`.

**Variable meanings, units and output:** Outputs typed batch/output cap, channel bound, quality cap, blueprint/replica/limited/original permissions, positive wear/AP factors. T9 foundational1 output/channel/quality60;T8 batch2;T7 channel bound2;T6 quality75;T5 blueprint;T4 replica;T3 edition;T2 wear3/4;T1 work AP4/5;T0 original/8 outputs/quality95. This is one explicit proposed specialization, not universal canon or automatic skills/authority.

**Bounds and missing/invalid inputs:** Unknown/fractional/bool/out-of-range Tier rejects. Full table must match registered profile; incomplete/unknown benefits block advancement. Roles and actual sheets are separate.

**Exploit defense and separate gates:** Only actual committed advancement appends permanent grant provenance; initialization is labeled fixture baseline. Permissions still require recipes/tools/materials/skill; channel bound never overrides ATT. No conceptual Agent operations granted.

### F95 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9
  ],
  "expected": {
    "batch_cap": 1,
    "channel_bound": 1,
    "quality_cap": 60,
    "blueprint": false,
    "replica": false,
    "limited": false,
    "wear_factor": 1,
    "work_AP_factor": 1,
    "original": false
  }
}
```

### F95 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0
  ],
  "expected": {
    "batch_cap": 8,
    "channel_bound": 2,
    "quality_cap": 95,
    "blueprint": true,
    "replica": true,
    "limited": true,
    "wear_factor": "3/4",
    "work_AP_factor": "4/5",
    "original": true
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f96"></a>

## F96 — Declared Tier fixture EA maximum, not fill

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
maximumEA = base×2^(9−tier) + headroom
```

**Executable and argument order:** `production_mechanics.tier_reserve_cap(tier, base, headroom)`.

**Variable meanings, units and output:** tier integer0..9; base positive exact EA; headroom nonnegative exact EA. Output maximum EA for each explicitly named accessible fixture domain. The8EA base/92 headroom are synthetic; actual capacities UNKNOWN.

**Bounds and missing/invalid inputs:** Unknown/negative/non-exact values, nonpositive base, invalid Tier, floats/bools reject. AP is not changed by this equation.

**Exploit defense and separate gates:** Current EA is reconciled with F94 rather than reset to maximum. This yields distinct2140/1116 fixture maxima forT1/T2, not actual Azimah acceptance.

### F96 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9,
    8,
    92
  ],
  "expected": 100
}
```

### F96 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    1,
    8,
    92
  ],
  "expected": 2140
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f97"></a>

## F97 — Typed production compatibility after hard operator checks

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
score = clamp(base + sum(bonuses) − sum(penalties) + (quality−50)/10 + 2×rarity,0,100)
```

**Executable and argument order:** `production_mechanics.production_compatibility(base, bonuses, penalties, quality, rarity)`.

**Variable meanings, units and output:** base/bonuses/penalties nonnegative exact compatibility points; quality integer0..100; rarity ordinal0..4. Output exact0..100 points; this fixture requires≥60. Numeric stacking occurs only after hard requires/forbids/special conditions and known material service temperature. Bonuses/penalties include each selected typed tag plus each registered intrinsic material-profile contribution once per profile ID, never once per alias/input fragment.

**Bounds and missing/invalid inputs:** UNKNOWN/invalid points/quality/rarity reject. Hard conflict never becomes a high-score success; conduit affinity binding remains UNKNOWN rather than neutral.

**Exploit defense and separate gates:** Distinct tags applied once in stable identity order. Rarity-dependent failure is evaluated after paid irreversible preparation, not a free lottery probe. All15-tag subsets and grade/floor/ceiling boundaries are exercised.

### F97 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    60,
    [
      8,
      2
    ],
    [
      5
    ],
    90,
    2
  ],
  "expected": 73
}
```

### F97 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    90,
    [
      20
    ],
    [
      0
    ],
    100,
    4
  ],
  "expected": 100
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f98"></a>

## F98 — Physical-mass-weighted material quality

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
quality = sum(mass[i]×quality[i])/sum(mass[i])
```

**Executable and argument order:** `production_mechanics.blend_quality(masses, qualities)`.

**Variable meanings, units and output:** masses exact positive kg; qualities exact0..100 points; same nonempty array length. Output exact material quality points. Uses actual owned held physical input masses, never inventory counters or manufactured-grade labels.

**Bounds and missing/invalid inputs:** Missing/UNKNOWN/mismatched/empty arrays, zero/negative mass, invalid quality, floats/bools reject. Input identities must be distinct nonliving unencumbered leaves, minimum0.1kg in this finite recipe domain.

**Exploit defense and separate gates:** Consumed identities become zero-mass tombstones and one conserving WIP identity. Scrap retains raw lineage/grade with degraded quality and location; root-lot draw cannot change by renaming requests/outputs.

### F98 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      3,
      1
    ],
    [
      80,
      40
    ]
  ],
  "expected": 70
}
```

### F98 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1,
      1
    ],
    [
      33,
      34
    ]
  ],
  "expected": "67/2"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f99"></a>

## F99 — Condition/quality-limited intrinsic quantity

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
usable = base×quality/100×condition/100
```

**Executable and argument order:** `production_mechanics.condition_scaled(base, quality, condition)`.

**Variable meanings, units and output:** base is a nonnegative exact extensive quantity. Two explicitly authorized contexts: intrinsic energy inJ, or usable manufacturing input mass inkg with quality=100. quality/condition are separate integer points0..100. Output retains base units; never a conceptual authority multiplier.

**Bounds and missing/invalid inputs:** UNKNOWN/negative/non-exact base or fractional/out-of-bound quality/condition, floats/bools reject. A worn material can fail usable yield while all residual physical mass remains scrap.

**Exploit defense and separate gates:** Original invariant compares intrinsic pristine capability after quality, not only rarity. External movement/work energy is separate physics, not an imported IP feat. Blueprint template does not give the document its original capability.

### F99 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    90,
    50
  ],
  "expected": "9/2"
}
```

### F99 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    6,
    100,
    50
  ],
  "expected": 3
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f100"></a>

## F100 — Bounded deterministic physical-root lottery bucket

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
limit=2^64−(2^64 mod100); hash(seed,index,nonce) first64bits; reject value≥limit; else draw=value mod100
```

**Executable and argument order:** `production_mechanics.lot_draw(seed, index)`.

**Variable meanings, units and output:** seed nonempty known string≤128 characters; index integer0..7; nonce0..31 bounded. Output integer bucket0..99. SHA256 canonical encoding is existing m.digest; uniform-hash assumption yields unbiased bucket mapping. Deterministic fixtures are NOT a live secure entropy/commit-reveal system.

**Bounds and missing/invalid inputs:** Missing/UNKNOWN/oversized seed, invalid index/bool/fraction reject; exhausted bounded rejection loop rejects without favorable fallback. No client-selected root identities or draw flag.

**Exploit defense and separate gates:** Seed binds trusted consumed material roots/design/craftTier, never request/output names or retry number. Cancelled failed lots pay prep, retain lineage and cannot freely reroll. Fresh physical composition costs finite stock and minimum ingredient mass.

### F100 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "fixture-lot",
    0
  ],
  "expected": 2
}
```

### F100 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "fixture-lot",
    1
  ],
  "expected": 29
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "380–419;570–690;849–864", "status": "Creator qualitative requirements, not numerical approval"}
- {"source": "sources/t100u-creator-instruction.md", "lines": "94–163", "status": "Separate Creator/Kernel versus bounded bodies; actual sheets UNKNOWN"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f101"></a>

## F101 — Separated ordinary/True Damage after qualified physical contact

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
D_after = D_ordinary × retained_ordinary + D_true
```

**Executable and argument order:** `temporal_mechanics.mixed_defense_components(ordinary, truth, retained)`.

**Variable meanings, units and output:** D_ordinary and D_true are separate nonnegative exact damage units AFTER contact and registered TrueContactProfile qualification. retained_ordinary is the actual paid active-affinity ward factor in[0,1]. Output is exact damage units. Source truth is not inferred from names. Physical block/deflection can prevent contact or reduce ordinary energy before this equation; True Damage never receives the later ordinary-only factor.

**Bounds and missing/invalid inputs:** UNKNOWN/negative/nonrational/bool/float operands or retained factor outside[0,1] reject. A positive projectile True portion requires an explicitly registered bounded technique/round/region/contact property and permission; no property means admission rejection, not accepted zero damage.

**Exploit defense and separate gates:** Registered technique/round provenance, maximum True portion, actual swept torso contact and minimum relative speed qualify the True component. Missing contact cannot grant damage; raw mixed components remain separate through paid ward application. No technique name/rarity supplies conceptual authority.

### F101 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    40,
    10,
    "1/4"
  ],
  "expected": 20
}
```

### F101 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    60,
    5,
    "1/2"
  ],
  "expected": 35
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "288–299;927–947", "status": "Creator qualitative mixed-component/contact requirements, not approval of synthetic values"}
- {"source": "sources/semantic-audit-2026-11-07/SEMANTIC-AUDIT.md", "lines": "97–109", "status": "Independent diagnostic evidence, NOT authorization or canon"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f102"></a>

## F102 — Selected general-capability load

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
L = sum(w_i)
```

**Executable and argument order:** `benefit_contracts.selection_load(weights)`.

**Variable meanings, units and output:** weights are positive integer capability loads in[1,4]; at most32 selected capabilities. Output is entitlement-load units, NOT attribute or stat points.

**Bounds and missing/invalid inputs:** Empty/non-sequence weights, length outside1–32, non-integer or load outside1–4 reject.

**Exploit defense and separate gates:** Load never grants automatic damage or AP multipliers; slot/load ceilings are applied by F103 and advancement qualification.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F102 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1,
      2
    ]
  ],
  "expected": 3
}
```

### F102 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    [
      1
    ]
  ],
  "expected": 1
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "340–358; required general Tier-benefit contract", "status": "Creator qualitative benefit requirements, not approval of synthetic load numbers"}
- {"source": "sources/correction-review-992/CORRECTION-REVIEW.md", "lines": "whole independent review", "status": "F01–F07/F09/F10 PASS at 992 checkpoint; F08 was OPEN there and is closed here only as an executed proposal, not canon"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f103"></a>

## F103 — Finite general Tier-benefit limits

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
limits(T) = registered (slots, load, inspect_fields, transfer_EA, transfer_domains, channel_bound, reactions)
```

**Executable and argument order:** `benefit_contracts.general_limits(tier)`.

**Variable meanings, units and output:** T is practitioner Tier 9→0. Output is the finite public-service contract for that Tier: selection slots/load, measurable inspect fields, transferable EA/domains, production-compatible channel bound, and allowed reaction categories.

**Bounds and missing/invalid inputs:** Tier outside0–9 or an unregistered Tier rejects. No silent default row.

**Exploit defense and separate gates:** This is a typed access/operation ceiling table, not imported canonical capabilities or a uniform stat multiplier. Production specialization remains a distinct provider.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F103 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9
  ],
  "expected": {
    "slots": 1,
    "load": 1,
    "inspect_fields": 1,
    "transfer_EA": 0,
    "transfer_domains": 0,
    "channel_bound": 1,
    "reactions": []
  }
}
```

### F103 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0
  ],
  "expected": {
    "slots": 8,
    "load": 8,
    "inspect_fields": 3,
    "transfer_EA": 64,
    "transfer_domains": 4,
    "channel_bound": 4,
    "reactions": [
      "Detect",
      "Evade",
      "Readied",
      "Prepared",
      "Counter",
      "Triggered"
    ]
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "340–358", "status": "Creator requirement for meaningful nonuniform Tier benefits, not approval of these row values"}
- {"source": "sources/correction-review-992/CORRECTION-REVIEW.md", "lines": "whole independent review", "status": "F01–F07/F09/F10 PASS at 992 checkpoint; F08 was OPEN there and is closed here only as an executed proposal, not canon"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f104"></a>

## F104 — Unique causal learning budget

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
floor(base × quality × environment × feedback / ((1+learned/20)×(1+strain/5)))
```

**Executable and argument order:** `development_mechanics.learning_budget(base, quality, environment, learned, strain, feedback)`.

**Variable meanings, units and output:** base is a positive integer practice unit; quality/feedback in[0,1], environment in[0,2], learned and strain nonnegative. Output is one integer XP budget for the causal event, not per-skill separate grants.

**Bounds and missing/invalid inputs:** base outside1–1000, unknown/negative/nonrational coefficients, quality>1, environment>2 or feedback>1 reject.

**Exploit defense and separate gates:** Repeating an event identity awards nothing; this budget is later partitioned by F105 so one event cannot mint a second total.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F104 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    1,
    1,
    0,
    0,
    1
  ],
  "expected": 100
}
```

### F104 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    1,
    2,
    20,
    5,
    1
  ],
  "expected": 50
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "70–153;849–864", "status": "Creator qualitative development requirements, not approval of these coefficients"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f105"></a>

## F105 — Exact integer allocation of one shared budget

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
each share = floor(total×w/sum w); leftover units go to largest remainders, then stable identity order
```

**Executable and argument order:** `development_mechanics.integer_allocation(total, weights)`.

**Variable meanings, units and output:** total is a nonnegative integer XP/credit budget; weights are positive integers keyed by skill or attribute identity. Output shares are integers that sum exactly to total.

**Bounds and missing/invalid inputs:** total outside0–10000, empty/non-dict weights, non-ident keys or weights outside1–1000 reject.

**Exploit defense and separate gates:** No second profile may allocate the same causal event; leftover assignment is deterministic and cannot be shopped by renaming after the fact.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F105 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    83,
    {
      "SK12": 1,
      "SK23": 1
    }
  ],
  "expected": {
    "SK12": 42,
    "SK23": 41
  }
}
```

### F105 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    100,
    {
      "A": 3,
      "B": 1
    }
  ],
  "expected": {
    "A": 75,
    "B": 25
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "70–153;849–864", "status": "Creator requirement that one event has one budget, not approval of these shares"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f106"></a>

## F106 — Physiological strain recovery

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
max(0, strain − dt×(1−injury/100)/60)
```

**Executable and argument order:** `development_mechanics.physiological_recovery(strain, seconds, injury)`.

**Variable meanings, units and output:** strain and injury are nonnegative rationals, injury in[0,100], dt is actual rest seconds. Output is remaining strain units after only an actual rest interval.

**Bounds and missing/invalid inputs:** Unknown/negative/nonrational inputs or injury>100 reject. Rest during incompatible paid work is a separate operational rejection.

**Exploit defense and separate gates:** Recovery is not granted by skipping time, display-only rest, or overlapping training; no automatic daily attribute refill.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F106 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    2,
    60,
    50
  ],
  "expected": "3/2"
}
```

### F106 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    5,
    300,
    0
  ],
  "expected": "0/1"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "70–153", "status": "Creator recovery/strain direction, not approval of the 60-second unit"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f107"></a>

## F107 — Development credit distinct from spendable XP

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
work × relevance × environment / (1+strain/5)
```

**Executable and argument order:** `development_mechanics.development_credit(work, relevance, environment, strain)`.

**Variable meanings, units and output:** work is nonnegative paid-work units; relevance in[0,1]; environment in[0,2]; strain nonnegative. Output is development-credit units, NOT spendable external XP.

**Bounds and missing/invalid inputs:** Unknown/negative/nonrational inputs, relevance>1 or environment>2 reject.

**Exploit defense and separate gates:** Credits cannot be converted into a second XP total or used to bypass unique-cause allocation.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F107 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    1,
    1,
    0
  ],
  "expected": "10/1"
}
```

### F107 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    1,
    2,
    0
  ],
  "expected": "20/1"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "849–864", "status": "Creator distinction among growth kinds, not approval of coefficients"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f108"></a>

## F108 — External attribute point cost, recomputed after each gain

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
rate × (1 + floor(base/20))
```

**Executable and argument order:** `development_mechanics.external_attribute_cost(base, rate)`.

**Variable meanings, units and output:** base is the current permanent attribute before the next point; rate is a positive integer external-XP cost unit. Output is external XP charged for that next independent point.

**Bounds and missing/invalid inputs:** base <1 or non-integer, rate outside1–10000 reject.

**Exploit defense and separate gates:** Allocation is sequential, issuer-conserving, and blocked until required recovery; a temporary modifier cannot lower this cost or raise permanent attainment.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F108 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    19,
    2000
  ],
  "expected": 2000
}
```

### F108 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    2000
  ],
  "expected": 4000
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "70–153;849–864", "status": "Creator rejection of fixed point pools, not approval of rate 2000"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f109"></a>

## F109 — Bounded effective skill contribution

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
min(maximum, min(learned, current_core) + allowed_temporary) then cap
```

**Executable and argument order:** `development_mechanics.bounded_skill_contribution(learned, current_core, temporary, maximum)`.

**Variable meanings, units and output:** learned, current_core, temporary and maximum are nonnegative integers. Output is the contribution actually usable, never above the declared maximum or the current core when the rule so binds.

**Bounds and missing/invalid inputs:** Non-integer or negative operands reject in the executable helper.

**Exploit defense and separate gates:** Temporary bonuses and uncapped learned scores cannot manufacture attainment or exceed the declared maximum.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F109 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    5,
    50,
    100
  ],
  "expected": 5
}
```

### F109 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    200,
    500,
    100,
    100
  ],
  "expected": 100
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "119–168", "status": "Creator effective-skill bounds, not approval of these caps"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f110"></a>

## F110 — Finite conserved trade wallets

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
(buyer − price×quantity, seller + price×quantity)
```

**Executable and argument order:** `autonomy_mechanics.finite_trade(wallet_buyer, wallet_seller, price, quantity)`.

**Variable meanings, units and output:** wallets and price are nonnegative rationals; quantity is an integer in1–8. Output is the post-trade buyer and seller currency pair; the sum is conserved.

**Bounds and missing/invalid inputs:** Nonpositive price, quantity outside1–8, unknown/negative wallets, or buyer funds below price×quantity reject.

**Exploit defense and separate gates:** A finite good cannot be sold twice; mistaken observer prices do not change the registered offer.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F110 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    10,
    3,
    1
  ],
  "expected": [
    "17/1",
    "13/1"
  ]
}
```

### F110 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    8,
    2,
    "1/2",
    2
  ],
  "expected": [
    "7/1",
    "3/1"
  ]
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "807–839", "status": "Creator finite NPC trade/work requirements, not approval of these prices"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f111"></a>

## F111 — Bounded signed relationship

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp(previous + delta, −maximum, maximum)
```

**Executable and argument order:** `autonomy_mechanics.bounded_relationship(previous, delta, maximum)`.

**Variable meanings, units and output:** previous and delta are signed integers; maximum is a positive integer bound in1–100. Output is a signed relation unit, not mind control or guaranteed behavior.

**Bounds and missing/invalid inputs:** Non-integer previous/delta, maximum outside1–100, or inputs whose absolute value already exceeds maximum reject.

**Exploit defense and separate gates:** Relationship changes never rewrite Kernel truth, legal judgment, or institutional membership by themselves.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F111 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    2,
    10
  ],
  "expected": 2
}
```

### F111 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    9,
    5,
    10
  ],
  "expected": 10
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "807–839", "status": "Creator interpersonal influence without compulsion"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f112"></a>

## F112 — Unique causal influence partition

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
each scope receives magnitude × share; sum(shares) ≤ 1
```

**Executable and argument order:** `influence_mechanics.unique_influence_contribution(magnitude, shares)`.

**Variable meanings, units and output:** magnitude is a signed-capable rational; shares map the eight declared scopes to positive shares at most1. Output is influence units by uniquely partitioned scope, never multiplied through memberships.

**Bounds and missing/invalid inputs:** Unknown scope, empty shares, nonpositive/ >1 share, unknown/nonrational magnitude, or total shares >1 reject.

**Exploit defense and separate gates:** The same causal event cannot be counted again at another scope; expulsion and membership are checked operationally at application.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F112 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    {
      "city": "1/2",
      "national": "1/2"
    }
  ],
  "expected": {
    "city": "5/1",
    "national": "5/1"
  }
}
```

### F112 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    8,
    {
      "organizational": 1
    }
  ],
  "expected": {
    "organizational": "8/1"
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "758–803", "status": "Creator eight-scope ownership/aggregation, not approval of these magnitudes"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f113"></a>

## F113 — Composed opportunity by distinct mode

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
probability: clamp(base×(1+influence/100),0,95/100); frequency: base×(1+influence/100) as a rate; quantity: same probability factor, still capped by remaining stock
```

**Executable and argument order:** `influence_mechanics.composed_opportunity(base_probability, influence, mode)`.

**Variable meanings, units and output:** base_probability in[0,1]; influence in[−100,100]; mode is probability, frequency, or quantity. Output is a probability or rate, never a guaranteed event count.

**Bounds and missing/invalid inputs:** Unknown mode, base outside[0,1], influence outside[−100,100], or unknown/nonrational inputs reject.

**Exploit defense and separate gates:** Favorable probability cannot create stock; frequency mode does not emit floor(|influence|) events.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F113 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/2",
    0,
    "probability"
  ],
  "expected": "1/2"
}
```

### F113 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "1/2",
    100,
    "frequency"
  ],
  "expected": "1/1"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "758–803", "status": "Creator probability vs quantity/frequency distinction"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f114"></a>

## F114 — Dimension-isolated retained gravity pressure

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
clamp(previous × retention^periods + unique causes on that gravity dimension, −100, 100)
```

**Executable and argument order:** `influence_mechanics.gravity_pressure(previous, retention, periods, causes, dimension)`.

**Variable meanings, units and output:** previous in[−100,100]; retention in[0,1]; periods a nonnegative integer ≤10000; causes are unique (id,value) or (id,value,dimension) rows; dimension is attraction, repulsion, reach, or retention. Output is signed pressure on that dimension only.

**Bounds and missing/invalid inputs:** Unknown dimension, out-of-bound previous/retention, excessive periods, conflicting values for one cause, or unknown/nonrational inputs reject.

**Exploit defense and separate gates:** City and nation opposing modifiers are netted separately by compose_opposing; one cause cannot contribute conflicting values.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F114 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    0,
    1,
    0,
    [
      [
        "a",
        10
      ]
    ],
    "attraction"
  ],
  "expected": "10/1"
}
```

### F114 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    20,
    "1/2",
    1,
    [
      [
        "b",
        5
      ]
    ],
    "retention"
  ],
  "expected": "15/1"
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "758–803", "status": "Creator gravity/retention requirements, not approval of these pressures"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f115"></a>

## F115 — Numerical correction or build impact

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
delta = after − before; per_unit = delta / workload_units
```

**Executable and argument order:** `calibration_mechanics.correction_impact(before, after, workload_units)`.

**Variable meanings, units and output:** before/after are exact rationals in the same proposed unit; workload_units is a positive rational size of the compared work. Output is the exact delta and per-unit effect, not a canonical balance target.

**Bounds and missing/invalid inputs:** Unknown/nonrational inputs or nonpositive workload_units reject.

**Exploit defense and separate gates:** Builds are not forced equal; this reports measured synthetic effect of a correction or allocation choice.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F115 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    10,
    8,
    2
  ],
  "expected": {
    "delta": "-2/1",
    "per_unit": "-1/1"
  }
}
```

### F115 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    "45/2",
    25,
    1
  ],
  "expected": {
    "delta": "5/2",
    "per_unit": "5/2"
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "843–921", "status": "Creator requirement to report correction/build impact, not approval of these sample deltas"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

<a id="f116"></a>

## F116 — Cinematic presentation bound on already-elapsed local time

**Status: PROPOSAL.**

Equation as recorded in the current dataset:

```text
accept if intensity ≤ class max and world_seconds ≤ class max
```

**Executable and argument order:** `calibration_mechanics.cinematic_scale_bound(intensity, world_seconds, class_name)`.

**Variable meanings, units and output:** intensity is an integer 1–20; world_seconds are already-elapsed local seconds >0; class is intimate, street, gate_ceremony, industrial_district, or horizon. Output confirms the declared qualitative class. No imported God Eater/Fate feats, no invented km² or travel rates.

**Bounds and missing/invalid inputs:** Unknown class, intensity outside1–20, nonpositive/unknown duration, or a request exceeding the declared class reject.

**Exploit defense and separate gates:** Presentation class cannot add damage, AP, geography, or substitute for unresolved physical events.

**Two-vector bounds (I10):** Each formula has two executed input/output vectors plus explicit rejection bounds; they are synthetic proposal numbers, not canonical coefficients.

### F116 fixed example 1

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    4,
    20,
    "intimate"
  ],
  "expected": {
    "class": "intimate",
    "intensity": 4,
    "world_seconds": "20/1",
    "accepted": true
  }
}
```

### F116 fixed example 2

Arguments are positional, in the signature order above. Expected output is exact.

```json
{
  "inputs": [
    12,
    600,
    "gate_ceremony"
  ],
  "expected": {
    "class": "gate_ceremony",
    "intensity": 12,
    "world_seconds": "600/1",
    "accepted": true
  }
}
```

### Attribution and reference acceptance

All new mathematics/profile values here are PROPOSALS, not established AO statistics. Recorded qualitative source constraints (not numerical approval):

- {"source": "sources/t99u-creator-instruction-verbatim.md", "lines": "843–921", "status": "Creator cinematic-calibration request; t104/t105 qualitative setting only"}

Original Creator/Kernel validates this rule without becoming its finite character subject. Actual Tier1/Tier2 numerical inputs remain UNKNOWN; synthetic vectors above do not establish either body. See [three-role validation](docs/19-azimah-cross-system-validation.md) and the [full matrix](data/azimah-validation.json) for this formula’s separate role record.

