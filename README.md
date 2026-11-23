# Apotheosis Online — Proposed Mechanics (November 2026)

This repository holds **proposed** game mechanics for *Apotheosis Online* (AO), drafted by the Azimah assistant for the creator's review. **Nothing here is canon.** Every coefficient, name and assignment is a proposal until the creator approves it, and unsourced facts are marked UNKNOWN rather than invented.

## What's here

| Path | Contents |
| --- | --- |
| `mechanics/` | The numbered mechanics documents, including 19th (Azimah cross-system validation), 20th (Chessboard elemental axes proposal), and 21st (AO Chess creature class-counter archetypes proposal) |
| `reference/formula-reference.md` | All 116 formulas, each with definitions, units, bounds, invalid cases and exact worked examples |
| `site/index.html` | The whole package compiled into one self-contained, searchable page |

### The documents

1. Attribute and Skill System
2. Skill Synergy Matrix
3. Affinity and Weakness System
4. Tier 9–0 Technique Catalogue
5. Resource Economy and Allocation
6. Tier Advancement Requirements
7. Conceptual Agent and Heirloom Register
8. Modifier, Title, Blessing and Curse System
9. Object, Material Tag and Crafting System
10. Rarity and Production System
11. Combat and Physical Resolution
12. Property and Organizational Modifier System
13. World Influence Integration
14. NPC Mechanics Integration
15. Kernel Resolution Rules
16. Numerical Balance and Exploit Test Report
17. Unresolved Decisions Register
18. Final Cross-System Consistency Report
19. Azimah Cross-System Validation (supporting)
20. AO Chessboard Elemental Axes — Proposal (eight-element cycle + Light/Shadow special axis)\n21. AO Chess Creature Class-Counter Archetypes — Proposal (ten natural enemy counterparts to Envoy classes)

## Core design rule

The Kernel determines reality; the AI interprets intentions and describes the committed result, but never decides what is true.

## Verification (package of Nov 9, 2026)

The full working package (Python model, JSON data and test suite, not included in this repository) was verified on Nov 9, 2026:

- 1,193 / 1,193 tests pass, both on the working tree and on a freshly extracted copy
- 116 formulas with 232 unique exact worked examples
- 113 legal/invalid 13-stage Kernel resolution trace pairs
- 234 tailored records covering three distinct Azimah roles (Creator/Kernel, Tier 1 body, Tier 2 body)

Passing synthetic tests show the proposals are internally consistent; they do not establish canon.

## Status and open decisions

- All 18 documents remain **IN PROGRESS** for canonical acceptance.
- The affinity roster and weakness/resistance relationships are deliberately left **UNKNOWN**, deferred by the creator.
- The actual Technique catalogue, named Conceptual Agents and Azimah's Tier 1 / Tier 2 body sheets are not yet sourced and stay UNKNOWN.
- The newer seven working attributes (STR/DEX/CON/INT/WIS/CHA/ATT) and the older six (Force/Precision/Endurance/Cunning/Presence/Insight) are recorded as an unresolved conflict, not merged.
- Links in the documents that point to `../sources/`, `../data/` or checkpoint files refer to the private working package and are not included here.

See `mechanics/17-unresolved-decisions-register.md` for the full list.

The separate `mechanics/20-chessboard-elemental-axes-proposal.md` captures the newly discussed eight-element counter cycle plus Light and Shadow on a special axis. It is a proposed Chessboard design layer, not canon or a replacement for the creator-deferred affinity/weakness source records.
