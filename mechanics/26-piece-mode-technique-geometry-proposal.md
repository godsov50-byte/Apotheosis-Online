# AO Chess — Piece Mode, Movement, Facing, and Technique Geometry

**Status: PROPOSED / NOT CANON.** This document separates movement mode, facing, technique geometry, and technique availability. A combatant's active chess-piece mode governs movement-phase movement only. It does not automatically constrain a technique's pattern. However, an individual technique may explicitly require a particular piece mode, position, situation, or state before it can be used.

## Core distinctions

AO Chess treats these as four separate dimensions:

1. **Piece mode / movement pattern:** governs the combatant's movement during their movement phase.
2. **Facing:** determined after the movement phase, unless a technique or explicit rule automatically sets or changes ending facing.
3. **Technique geometry:** independently defines the technique's targeting shape, range, area, direction, path, and spatial restrictions.
4. **Technique availability / activation conditions:** defines whether the technique can be selected or activated in the current mode, position, situation, timing window, and state.

Do not infer one dimension from another. A technique's availability may depend on piece mode without its geometry inheriting that mode's movement pattern.

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

This table describes movement only. It does not prescribe the geometry of techniques or make every technique available in every mode.

## Facing

- Ending facing is determined after the movement phase according to AO Chess's facing rules.
- A technique may explicitly auto-set, turn, lock, or otherwise determine facing.
- If a technique does not automatically determine ending facing, it does not silently override the post-movement facing determination.
- Facing is an independent state and may affect technique availability or resolution only where a technique or rule specifies it.

## Technique geometry is independent

A technique defines its own legal geometry. Examples include (illustrative only):

- L-shaped targeting or attack pattern
- Straight-line or lane attack
- Diagonal attack
- Cross, square, cone, ring, or other area pattern
- Multi-target pattern
- Movement-linked pattern explicitly described by that technique

A combatant may move in Knight Mode and use a linear technique, or move in Pawn Mode and use an L-shaped technique, if the technique's own availability and execution rules permit it. The technique does not have to match the movement pattern of the current piece mode.

## Technique availability and conditions

A technique may be universally available or restricted by one or more explicit requirements. Requirements determine whether activation is legal; they do not, by themselves, determine the technique's geometry.

### 1. Piece-mode requirements

A technique may specify:
- One required mode (for example, Knight Mode only).
- A set of permitted modes (for example, Bishop or Queen Mode).
- Excluded modes (for example, unavailable in King Mode).
- Any mode, meaning no piece-mode restriction.

A mode requirement is an eligibility gate. It does not mean the technique uses that mode's movement pattern.

### 2. Situational requirements

A technique may require a battlefield or combat situation, such as:
- A target within a specified distance or range.
- A target in line of sight.
- A successful block, parry, evade, or other preceding event.
- An ally under threat or an enemy performing a particular action.
- A particular environmental condition, hazard, or battlefield state.
- A required resource, status, charge, or other explicitly defined condition.

### 3. Positional requirements

A technique may require a spatial relationship or grid position, such as:
- User adjacent to, behind, beside, or above/below a target.
- User and target on a specified diagonal or straight lane.
- User occupying a particular terrain cell, formation position, edge, or corner.
- An unobstructed path or a specified relationship to an ally, enemy, obstacle, or objective.

### 4. Facing requirements

A technique may require the user to:
- Face the target.
- Face away from the target.
- Face a specified direction or lane.
- Have a clear facing arc toward the target.

If no facing requirement is specified, do not invent one. If the technique explicitly changes ending facing, resolve that according to its own rule.

### 5. Movement requirements

A technique may require:
- No movement during the current movement phase.
- Movement of a minimum or maximum distance.
- Ending movement on a specified side, lane, or relationship to a target.
- Having moved through particular cells.
- Having used a specific movement mode or completed a particular movement action.

Movement requirements must be explicit and evaluated against the actual movement-phase record.

### 6. Target requirements

A technique may restrict valid targets by type, state, allegiance, size, condition, visibility, or other defined properties. Target eligibility is distinct from range and geometry.

### 7. Combined requirements

A technique may combine several conditions. For example, an illustrative technique might require Knight Mode, the user to finish movement behind a target, the target to be within range, and a valid line of sight. Its actual attack geometry is still whatever the technique definition specifies; it is not automatically L-shaped.

Requirements should be recorded as individually testable conditions. If multiple requirements apply, all mandatory requirements must be satisfied unless the technique explicitly defines alternatives (such as “A or B”).

## Suggested technique record structure

Illustrative schema only; field names and implementation may be refined:

```yaml
technique:
  mode_requirements:
    allowed: [Knight]
    excluded: []
  situation_requirements:
    - condition: target_in_range
  position_requirements:
    - condition: user_ends_behind_target
  facing_requirements:
    - condition: faces_target
  movement_requirements:
    - condition: completed_movement_phase
  target_requirements:
    - condition: valid_hostile_target
  geometry:
    pattern: technique_defined_pattern
    range: technique_defined_range
    area: technique_defined_area
  activation_timing: technique_defined_timing
  restrictions:
    - technique_defined_restriction
```

Omit categories that do not apply; do not populate them with invented defaults. Each condition must have a defined evaluation rule. This schema does not create new mechanics by itself.

## Resolution order (framework)

This is a conceptual sequence; exact timing windows and action economy remain separately defined:

1. Establish the combatant's current piece mode.
2. Resolve movement phase using that mode's movement pattern and applicable restrictions.
3. Determine ending facing after movement, unless an explicit effect sets facing.
4. Evaluate the technique's mode, situation, position, facing, movement, target, timing, and other activation requirements.
5. If the technique is legal, resolve its own geometry, targeting, and path.
6. Resolve effects and interactions through the appropriate combat systems.

If a mandatory requirement fails, the technique cannot be activated unless its definition provides an explicit alternative or exception. A failed requirement does not silently transform the technique or grant a substitute effect.

This sequence does not establish new AP costs, EA costs, attack limits, damage, cooldowns, or numerical effects.

## Explicit technique exceptions

A technique may include effects that alter movement, facing, or geometry—such as a displacement, pattern conversion, forced turn, facing lock, or movement extension—but these are explicit technique properties, not universal defaults. Their conditions, costs, limits, and outcomes must be defined individually.

## Examples

| Current mode | Movement phase | Technique condition / geometry | Valid interpretation |
|---|---|---|---|
| Knight | L-shaped move | Linear attack; no mode restriction | Move is Knight-pattern; attack follows its own line geometry |
| Pawn | Pawn-pattern move | L-shaped strike; no mode restriction | Pawn movement does not restrict the strike's L-shaped geometry |
| Rook | Horizontal/vertical move | Diagonal technique | Rook movement and diagonal technique remain separate |
| Bishop | Diagonal move | Cross-pattern area | Bishop movement does not force the technique into a diagonal-only area |
| Knight | L-shaped move | Technique requires Knight Mode | Mode requirement is satisfied; geometry remains technique-defined |
| Pawn | Pawn-pattern move | Technique requires Knight Mode | Technique is unavailable, even if its geometry could otherwise be executed |
| Any mode | Mode-defined move | Technique requires ending behind target | Position is checked after movement; geometry remains independent |
| Any mode | Mode-defined move | Technique auto-faces its target | Ending facing follows the explicit technique rule |
| Any mode | Mode-defined move | Technique has no facing override | Ending facing follows the ordinary post-movement facing rule |

## Non-goals and guardrails

- No universal technique-to-piece mapping is created.
- Techniques do not automatically inherit movement geometry, movement distance, or movement restrictions.
- A technique may nevertheless impose explicit piece-mode, positional, situational, facing, movement, target, or timing requirements.
- Piece mode does not automatically dictate facing.
- Technique geometry does not automatically change movement mode.
- A mode requirement controls availability, not attack shape.
- This proposal does not modify AP, EA, DR, resistance, penetration, Break, damage, Tier, uses, or cooldown systems.
- Exceptions and requirements must be explicit and documented; AI must not invent an override, condition, or permission.

**Design rule:** Movement pattern ≠ technique pattern ≠ facing ≠ technique availability.
