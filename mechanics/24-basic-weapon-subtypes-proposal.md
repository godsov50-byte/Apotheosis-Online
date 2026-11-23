# AO Chess — Basic Weapon Subtypes

**Status: PROPOSED / NOT CANON.** This document expands the ten proposed basic weapon families into practical subtype groupings. Subtypes are descriptive classification aids, not automatic stat packages, AP/EA costs, attack ranges, damage values, technique permissions, or bonuses. Individual weapons and techniques define their actual behavior.

## Classification principles

- A **weapon type** is the broad family; a **subtype** narrows construction, handling, or intended use.
- Subtype names are examples and working groupings, not a final exhaustive catalog.
- Weapon construction and intended combat use take precedence over appearance alone.
- A weapon may have a primary type and, only where justified, a secondary tag for hybrid construction.
- Weapon type/subtype remains independent of Envoy class, Tier, quality, rarity, affinity, and technique.
- Do not invent compatibility, numerical modifiers, or movement/attack rules from subtype labels.

## Proposed subtype groupings

### 1. Sword
- Short sword
- Arming sword
- Longsword
- Bastard sword (boundary with Greatsword depends on size and handling)
- Saber / curved sword
- Rapier
- Katana-family blades (specific construction can refine assignment)

**Identity:** primarily hand-held bladed weapons designed for versatile cutting and/or thrusting. Exact classification for oversized or unusual blades is unresolved.

### 2. Greatsword
- Two-handed greatsword
- Zweihander / montante-style large sword
- Heavy cleaving sword
- Oversized fantasy greatsword

**Identity:** large sword forms designed primarily for two-handed handling and committed attacks. A long sword is not automatically a Greatsword; handling and construction matter.

### 3. Dagger
- Dagger
- Dirk
- Stiletto
- Knife
- Tanto-style short blade
- Parrying dagger

**Identity:** compact blade family. Utility knives may be recorded as tools rather than weapons unless weapon use is their defining function.

### 4. Spear
- Short spear
- Infantry spear
- Long spear
- Pike
- Javelin (thrown spear subtype; its classification as Spear is provisional)
- Trident

**Identity:** primarily thrust-oriented pole weapons. Thrown use may be a subtype/property, not a separate top-level family.

### 5. Polearm
- Halberd
- Glaive
- Naginata
- Bill / billhook
- Poleaxe
- Lucerne hammer
- War scythe (purpose-built weapon form)

**Identity:** long hafted weapons with heads or edges designed for varied cutting, hooking, striking, or leverage. Spear-family weapons remain classified as Spear unless review changes the boundary.

### 6. Axe
- Hatchet
- Hand axe
- Battle axe
- Bearded axe
- Double-headed axe
- Throwing axe (thrown-use subtype)

**Identity:** compact or hand-held axe family. Pole-mounted axe weapons such as poleaxes are classified under Polearm in this proposal.

### 7. Bow
- Short bow
- Longbow
- Recurve bow
- Composite bow
- Horse bow
- Heavy bow

**Identity:** flexible-limb projectile weapons. Subtype names may describe length, construction, or intended use and need not imply universal performance.

### 8. Crossbow
- Hand crossbow
- Light crossbow
- Heavy crossbow
- Repeating crossbow
- Cranequin / mechanically assisted crossbow variants

**Identity:** mechanically tensioned projectile weapons. Loading mechanism, bolt type, and firing mode may be recorded as separate properties.

### 9. Staff
- Quarterstaff
- Long staff
- Short staff
- Bo staff
- Channeling staff
- Focus staff

**Identity:** long rigid weapon or focus family. A staff's role as a weapon, casting focus, or both is individual-item-defined.

### 10. Gauntlet / Fist
- Combat gauntlets
- Knuckle-dusters / knuckle guards (classification subject to setting legality and world context)
- Claw gauntlets
- Armored fist
- Punching / striking implements
- Hand wraps (may be equipment or training gear rather than weapon)

**Identity:** hand-worn or hand-held implements for close combat. Pure unarmed techniques can use this family as a compatibility category without requiring an item.

## Not yet assigned to the ten families

These remain unresolved top-level classifications rather than being forced into the list:

- **Whips and flexible weapons:** whip, lash, flail-like flexible forms.
- **Chains:** chain weapon, chain-blade, hooked chain.
- **Thrown weapons:** dedicated throwing knives, darts, chakram, boomerang; distinguish from a weapon that can also be thrown.
- **Shields:** defensive equipment by default; weaponized shield forms may receive a secondary weapon tag or separate family later.
- **Hybrid weapons:** weapon construction may justify multiple tags, but primary type and subtype should remain clear.

## Future record shape (illustrative)

```yaml
weapon:
  type: Sword
  subtype: Longsword
  tags: []
  properties: []
  techniqueCompatibility: []
```

Illustrative only. Do not populate unknown properties or compatibility fields.

## Open review items

1. Refine subtype boundaries and remove redundant labels.
2. Decide top-level placement for whips, chains, dedicated thrown weapons, and weaponized shields.
3. Cross-check existing AO weapons, Heirloom records, and technique requirements before applying this taxonomy.
4. Decide whether AO's setting-specific weapon designs need additional subtype tags.

This document proposes descriptive subtype groupings only. It adds no mechanics and changes no canon.
