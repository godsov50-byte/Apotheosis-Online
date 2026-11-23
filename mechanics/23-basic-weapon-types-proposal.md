# AO Chess — Ten Basic Weapon Types

**Status: PROPOSED / NOT CANON.** This is a foundational weapon taxonomy for AO Chess. The ten types describe broad weapon families and their typical combat interactions. They do not prescribe numeric bonuses, AP/EA costs, range, damage, or technique compatibility without separate rules.

## Design purpose

- A **weapon type** defines the broad weapon family and interaction profile.
- **Subtypes** distinguish variants within a family (e.g. short sword, longsword, curved sword).
- **Individual weapons** carry their own identity, quality, properties, elements, modifiers, and history.
- Weapon type is separate from Envoy class, creature race/archetype, Tier, quality, rarity, and affinity.
- Techniques may have weapon-type compatibility requirements or modifiers, but these must be explicitly defined. Type labels do not automatically grant bonuses.

## Proposed ten basic weapon types

| Weapon type | Core identity | Typical tactical profile |
|---|---|---|
| **Sword** | One-handed or versatile bladed weapon family. | Balanced melee, adaptable cuts and thrusts, varied guard and counterplay. |
| **Greatsword** | Large two-handed sword family. | Heavy commitment, sweeping or powerful attacks, space pressure, guard-breaking themes. |
| **Dagger** | Short blade family. | Close-range precision, rapid strikes, concealment, combo or opportunistic attacks. |
| **Spear** | Thrust-oriented pole weapon family. | Reach, linear attacks, approach control, anti-charge and lane pressure. |
| **Polearm** | Long hafted weapons with varied heads, excluding the spear-family classification where needed. | Wide arcs, reach, hooks, sweeps, and multi-direction space control. |
| **Axe** | Hand axes and larger axe families, excluding poleaxe subtypes classified under Polearm. | Cleaving, impact, destructive pressure, and concentrated strikes. |
| **Bow** | Flexible-limb projectile weapon family. | Ranged precision, trajectory, distance, and varied shot techniques. |
| **Crossbow** | Mechanically tensioned projectile weapon family. | Powerful aimed shots, loading/reloading tradeoffs, specialized bolts and firing modes. |
| **Staff** | Long rigid weapon, including channeling/focus staves. | Striking, leverage, defensive forms, and potential energy/technique focus. |
| **Gauntlet / Fist** | Hand-mounted weapons and unarmed combat implements. | Body-based combat, grappling, combinations, clinch control, and close contact. |

## Classification boundaries and subtypes

- Weapon families can have subtypes; this list is a top-level taxonomy, not a limit on weapon variety.
- Classification should use the weapon's defining construction and intended use. Hybrid designs may record a primary type plus a supported subtype or secondary type if needed.
- **Sword vs. Greatsword:** size/handling distinctions are part of the taxonomy; exact boundary criteria remain to be defined.
- **Spear vs. Polearm:** spear is primarily thrusting and spear-family; polearm covers other long hafted weapon families such as halberd, glaive, bill, and poleaxe. A specific taxonomy pass may refine edge cases.
- **Axe vs. Polearm:** hand/compact axes classify as Axe; pole-mounted axe-head weapons may classify as Polearm.
- **Gauntlet / Fist** includes martial weapon implements worn or held at the hands, but pure unarmed techniques may use the category without requiring equipment.
- Other families (e.g. whip, chain weapon, shield, thrown weapon) are not assigned yet; they may be subtypes, secondary types, equipment categories, or additional families after review. Shields remain defensive equipment and are not automatically a weapon type.

## Integration

Weapon types may be used in:
- technique compatibility;
- weapon-type damage modifier axes, when explicitly specified;
- chess movement, attack patterns, reach, and space control;
- equipment records and appraisal;
- NPC/creature loadouts and tactical decision-making.

Weapon type does **not** determine the wielder's class, attributes, elemental affinity, weapon quality, item rarity, or Tier.

## Example record

```yaml
weapon:
  type: Sword
  subtype: Longsword
  identity:
    name: <weapon_name>
    itemId: <item_id>
  properties: []
  techniqueCompatibility: []
```

Illustrative data only. Unknown fields remain unset rather than guessed.

## Review questions

1. Confirm the ten family names and scope.
2. Decide where whips, chains, thrown weapons, shields, and hybrid weapons belong.
3. Define precise family/subtype boundaries where overlaps exist.
4. Cross-check existing AO weapon and technique records before assigning types.

This proposal is a taxonomy only; no combat values or automatic bonuses are introduced.
