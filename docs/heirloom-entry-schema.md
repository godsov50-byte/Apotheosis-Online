# AO Heirloom Entry Schema

**Status:** Draft implementation schema / playtest documentation. This defines record structure only; it does not canonize numeric values, item powers, rarity, or balance rules.

Heirlooms are modular. Fields that do not apply to a particular item may be omitted or set to empty collections. Do not invent unknown provenance or appraisal data.

## Record sections

### 1. Identity (required)
- `itemId`: unique record identifier
- `name`: display name
- `category`: one of the current item categories: Regular Item, Heirloom, Conceptual Heirloom, or Cursed Conceptual Heirloom
- `itemType`: broad kind (weapon, armor, accessory, tool, etc.)
- `condition`: known physical/state condition

### 2. Classification (optional)
- `weaponType`, `armorType`, `equipmentSlot`
- `element`: item element, if any
- `quality`: object quality grade, if assigned. Supported grades, in ascending order: Standard, Masterwork, Perfected, Mythic, Fabled.
  - Quality describes craftsmanship/refinement, not rarity, power, Tier, or advancement eligibility.
  - A high-quality item is not automatically powerful or rare; a low-quality item can still have exceptional inherent effects.
- `tier`: only if the item/effect system explicitly uses tiers; never infer this from character Tier or item quality
- `tags`: search, filtering, and compatibility labels

### 3. Attributes (optional)
- `statModifiers`: additive modifiers keyed by supported core attribute (STR, DEX, CON, INT, WIS, CHA, ATT)
- Positive and negative values are supported
- These modifiers are equipment-derived; do not mutate base attributes or repeatedly stack them during recalculation
- Unsupported/derived keys (e.g., HP or AC) should not be accepted until the derived-stat rules are defined

### 4. Technique damage modifiers (optional; independent axes)
Each axis is recorded separately and only applies when its own condition is met:
- `elementalAxis`: element match and any target matchup conditions
- `weaponTypeAxis`: compatible technique weapon type
- `qualityAxis`: item quality contribution, if supported

These are independently evaluated and may stack. This schema does not prescribe percentages, formulas, rounding, or precedence. Keep damage reduction (DR), resistance, penetration, Break, AP, and EA separate; do not fold them into the item record's damage-axis values.

### 5. Elemental compatibility and backlash (optional; item-specific)
Elemental compatibility is independent from the damage-modifier axes. Elemental mismatch does **not** automatically cause harm.
- `elementalCompatibility`: optional behavior profile for elemental channeling through the item.
- `behavior`: one of the proposed profiles: `Neutral`, `Attuned`, `Incompatible`, `Volatile`, or `Adaptive`. Profiles describe behavior, not a universal penalty ladder.
- `compatibleElements` / `incompatibleElements`: optional explicit lists, if known and applicable.
- `mismatchOutcomes`: item-specific outcomes, with separately described levels:
  - `suppression`: minor mismatch; item elemental synergy may be unavailable or the channel may proceed without enhancement.
  - `instability`: active interference; possible effectiveness reduction, extra EA cost, or loss of control.
  - `backlash`: a forced or otherwise specified discharge that may harm the wielder, cause Break buildup, injury, or other explicitly described consequences.
- Only record triggers, severity, chance, costs, and consequences when the particular item's rules establish them. Do not infer numeric chances, damage, EA costs, or Break values.
- Other independent bonuses (weapon compatibility, quality, stat modifiers, and unrelated properties) are not automatically erased by an elemental mismatch.

### 6. Properties and effects (optional)
- `properties`: passive properties, conditional triggers, and restrictions
- `activeAbilities`: abilities the wielder may invoke
- `costs`: EA/AP or other costs, only when defined by the ability rules
- `uses`, `cooldown`, `duration`, `range`, `area`: ability-specific fields as applicable
- `compatibility`: compatible techniques, users, classes, weapon styles, or other supported targets

### 7. Ownership and binding (optional/unknown allowed)
- `ownerId`, `boundTo`, `bindingState`, `locationId`
- Use explicit unknown/null values when information is not available. Do not create an owner or binding restriction just to fill the field.

### 8. Origin, provenance, and history (optional)
- `creator`, `origin`, `creationDate`, `acquisitionMethod`
- `previousOwners`, `eventHistory`, `appraisal`, `sourceNotes`
- Track confirmed events only. Keep unverified appraisals marked unverified.

### 9. Presentation (optional)
- `description`, `appearance`, `lore`, `imageRef`

## Minimum display entry

A compact display should show:
1. Name and item category/type
2. Quality and element, if present
3. Current condition
4. Stat modifications, if any
5. Damage axes, if any
6. Elemental compatibility/backlash profile, if any
7. Properties and abilities, if any
8. Ownership/binding information, if known
9. Provenance/history, if known

Hide empty sections in player-facing displays. Do not imply that missing data means an item has no effect; it may mean the effect is undiscovered or unrecorded.

## Example record (illustrative only; not canon)

```json
{
  "itemId": "HEI-WPN-0001",
  "name": "Emberbound Greatsword",
  "category": "Heirloom",
  "itemType": "Weapon",
  "weaponType": "Greatsword",
  "element": "Fire",
  "quality": "Perfected",
  "condition": "Intact",
  "statModifiers": {
    "STR": 4,
    "ATT": 3
  },
  "techniqueDamage": {
    "elementalAxis": {
      "bonus": 0.10,
      "condition": "matching Fire technique; target matchup permits"
    },
    "weaponTypeAxis": {
      "bonus": 0.05,
      "condition": "compatible greatsword technique"
    },
    "qualityAxis": {
      "bonus": 0.04,
      "condition": "prototype Quality 3 value"
    }
  },
  "elementalCompatibility": {
    "behavior": "Incompatible",
    "incompatibleElements": ["Water"],
    "mismatchOutcomes": {
      "suppression": "Fire enhancement is unavailable for the Water technique",
      "instability": "Fire and Water energies interfere when actively channeled together",
      "backlash": "Only if the item-specific forced-channel trigger is met; consequence unspecified"
    }
  },
  "properties": [],
  "activeAbilities": [],
  "ownerId": null,
  "bindingState": "Unbound",
  "origin": null,
  "creator": null,
  "appraisal": {
    "status": "Unverified",
    "notes": null
  }
}
```
Example bonuses and compatibility details are placeholders only, not approved AO numeric or item canon.

## Record integrity rules
- Preserve base character attributes; compute effective attributes from base plus equipped modifiers.
- Keep all three technique-damage axes independent; only combine them at resolution when their respective conditions are true.
- Elemental compatibility/backlash is a separate item-specific profile; mismatches do not automatically cause damage.
- A Heirloom may have no stat modifiers, no element, no damage axis, no compatibility profile, and/or no active ability.
- Do not force a uniform ability package onto every item.
- Do not fill unknown facts with invented lore.
- Item category, quality, power, rarity, advancement eligibility, and binding are distinct fields; one must not imply another.
- Cursed Conceptual Heirlooms are the cursed item category currently supported. Do not create an ordinary “Cursed Heirloom” category.
