# AO Chess — Piece Mode, Movement, Facing, and Technique Geometry

**Status: PROPOSED / NOT CANON.** This document separates movement mode, facing, and technique geometry. A combatant's active chess-piece mode governs movement-phase movement only. It does not automatically constrain a technique's pattern.

## Core distinction

AO Chess treats these as three separate dimensions:

1. **Piece mode / movement pattern:** governs the combatant's movement during their movement phase.
2. **Facing:** determined after the movement phase, unless a technique or explicit rule automatically sets or changes ending facing.
3. **Technique geometry:** independently defined by the technique itself—its targeting shape, range, area, direction, path, and spatial restrictions.

Do not infer one dimension from another. In particular, do not make a technique inherit chess-piece movement geometry by default.

## Piece-mode movement

Piece mode defines the movement pattern used during the movement phase, subject to AO Chess rules and explicit exceptions.

| Piece mode | Movement pattern |
|---|---|
| King | One adjacent square in any direction |
| Queen | Horizontal, vertical, or diagonal movement |
| Rook | Horizontal or vertical movement |
| Bishop | Diagonal movement |
| Knight | L-shaped movement; jumps intervening pieces where the movement rules allow |
| Pawn | Forward movement according to pawn rules; attack/movement distinctions apply |

This table describes movement only. It does not prescribe the geometry of techniques.

## Facing

- Ending facing is determined after the movement phase according to AO Chess's facing rules.
- A technique may explicitly auto-set, turn, lock, or otherwise determine facing.
- If a technique does not automatically determine ending facing, it does not silently override the post-movement facing determination.
- Facing is an independent state and may affect technique resolution only where a technique or rule specifies it.

## Technique geometry is independent

A technique defines its own legal geometry. Examples include (illustrative only):

- L-shaped targeting or attack pattern
- Straight-line or lane attack
- Diagonal attack
- Cross, square, cone, ring, or other area pattern
- Multi-target pattern
- Movement-linked pattern explicitly described by that technique

A combatant may move in Knight Mode and use a linear technique, or move in Pawn Mode and use an L-shaped technique, if the technique's own rules permit it. The technique does not have to match the movement pattern of the current piece mode.

## Resolution order (framework)

This is a conceptual sequence; exact timing windows and action economy remain separately defined:

1. Establish the combatant's current piece mode.
2. Resolve movement phase using that mode's movement pattern and applicable restrictions.
3. Determine ending facing after movement, unless an explicit effect sets facing.
4. Resolve technique selection, legality, targeting, and geometry using the technique's own definition and any applicable AO rules.
5. Resolve effects and interactions through the appropriate combat systems.

This sequence does not establish new AP costs, EA costs, attack limits, damage, cooldowns, or numerical effects.

## Explicit technique exceptions

A technique may include effects that alter movement, facing, or geometry—such as a displacement, pattern conversion, forced turn, facing lock, or movement extension—but these are explicit technique properties, not universal defaults. Their conditions, costs, limits, and outcomes must be defined individually.

## Examples

| Current mode | Movement phase | Technique | Valid interpretation |
|---|---|---|---|
| Knight | L-shaped move | Straight-line attack | The move is Knight-pattern; attack follows its own line geometry |
| Pawn | Pawn-pattern move | L-shaped strike | Pawn movement does not restrict the strike's L-shaped geometry |
| Rook | Horizontal/vertical move | Diagonal technique | Rook movement and diagonal technique remain separate |
| Bishop | Diagonal move | Cross-pattern area | Bishop movement does not force the technique into a diagonal-only area |
| Any mode | Mode-defined move | Technique auto-faces its target | Ending facing follows the explicit technique rule |
| Any mode | Mode-defined move | Technique has no facing override | Ending facing follows the ordinary post-movement facing rule |

## Non-goals and guardrails

- No universal technique-to-piece mapping is created.
- Techniques do not automatically inherit movement geometry, movement distance, or movement restrictions.
- Piece mode does not automatically dictate facing.
- Technique geometry does not automatically change movement mode.
- This proposal does not modify AP, EA, DR, resistance, penetration, Break, damage, Tier, uses, or cooldown systems.
- Exceptions must be explicit and documented; AI must not invent an override.

**Design rule:** Movement pattern ≠ technique pattern ≠ facing.
