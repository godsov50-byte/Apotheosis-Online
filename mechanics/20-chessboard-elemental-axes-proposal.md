# AO Chessboard Elemental Axes — Proposal

**Status: PROPOSED / NOT CANON.** This is a new Chessboard-facing elemental framework based on the creator's current discussion. It does not overwrite or resolve the earlier source-access UNKNOWN affinity roster or resistance/weakness records.

## 1. Elemental axes

### Axis I — Eight-element cycle
The eight foundational cycle elements are Fire, Wood, Earth, Lightning, Water, Ice, Wind, and Metal. Each element has two advantageous matchups and two disadvantageous matchups, with the relationships forming a directed circular counter model.

Cycle order:
**Fire → Wood → Earth → Lightning → Water → Ice → Wind → Metal → (back to Fire).**

The direction is a counter-cycle ordering, not an assertion that one element is universally stronger.

### Axis II — Special duality
**Light and Shadow** are on their own special axis, outside the eight-element counter-cycle. Their polarity is not assigned automatic victory or defeat in every encounter. Light/Shadow techniques interact based on their defined properties; interactions with the eight cycle elements are technique-specific until defined.

## 2. Draft matchup mapping

For this first balanced cycle, each element is advantageous against the next two elements in the cycle and disadvantaged against the previous two. Each has six neutral cycle matchups.

Cycle order: Fire → Wood → Earth → Lightning → Water → Ice → Wind → Metal → Fire.

| Element | Advantageous against | Disadvantaged against |
|---|---|---|
| Fire | Wood, Earth | Wind, Metal |
| Wood | Earth, Lightning | Fire, Metal |
| Earth | Lightning, Water | Fire, Wood |
| Lightning | Water, Ice | Wood, Earth |
| Water | Ice, Wind | Earth, Lightning |
| Ice | Wind, Metal | Lightning, Water |
| Wind | Metal, Fire | Water, Ice |
| Metal | Fire, Wood | Ice, Wind |

**This mapping is a draft for review, not a recovered/canonical chart.** The relationship is a balanced circular model; thematic justification and exact gameplay effects remain open.

## 3. Matchup resolution boundaries

An elemental matchup may inform the effectiveness of a technique, but it does not independently guarantee a hit, damage multiplier, immunity, DR bypass, penetration, or Break.

Matchups are resolved alongside the existing independent AO Chessboard mechanics:
- AP
- EA
- DR
- damage resistance
- penetration
- Break
- Tier and technique properties
- proficiency, positioning, terrain, and other applicable conditions

No coefficients or automatic outcomes are assigned here.

## 4. Racial elemental affinity and development

Each race has a natural elemental affinity and a progression of elemental use/charge. Racial profiles may include innate racial techniques; race and ancestry differences can determine which abilities are available and how an element is expressed.

Keep separate:
- **Affinity:** elemental alignment/connection.
- **Progression:** development of elemental use and control.
- **Charge:** elemental buildup or charging behavior, to be specified by the mechanics.
- **Racial technique:** innate capability or technique.
- **EA:** spendable elemental energy, distinct from proficiency/progression and charge.

No race-to-element assignments, thresholds, technique counts, charge costs, or EA costs are specified in this proposal.

## 5. Composite and derived elements

Composite/derived elements may emerge through combinations, interactions, techniques, or special conditions. They are not added to the foundational roster by implication. Their recipes, classification, matchups, and eligibility require separate definition.

## 6. Implementation scope

This proposal is represented as a mechanics document and added to the repository's documentation website. The current repository is a proposed-mechanics documentation package; this change does **not** implement a production combat engine, canonical Kernel affinity rules, or numerical balance values.

## Open review items
1. Confirm the eight-element matchup cycle thematically.
2. Define how Light and Shadow affect each other, if they are opposed, complementary, or context-dependent.
3. Define Light/Shadow interactions with the eight elements.
4. Define actual combat modifiers and whether matchup advantage can be resisted, overridden, or negated.
5. Define racial affinity, charge, progression and racial-technique structures.
6. Define composite-element creation and counter relationships.
