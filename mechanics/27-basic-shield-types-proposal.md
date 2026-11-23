# AO Chess — Ten Basic Shield Types

**Status: PROPOSED / NOT CANON.** This document establishes ten descriptive shield families for AO Chess. A shield type identifies its broad construction, coverage, and handling concept; it does not automatically grant numerical bonuses, damage reduction, block angles, AP costs, movement penalties, technique permissions, or class compatibility. Individual shields and techniques define their actual behavior.

## Classification principles

- Shields are defensive equipment by default, not one of the ten Envoy classes and not automatically a weapon family.
- A shield's type describes its construction and intended defensive use, not a universal stat package.
- Size, material, weight, grip, straps, coverage, reinforcement, and special properties should be recorded separately when known.
- A shield may have a primary type and limited secondary tags where its construction genuinely combines forms.
- A shield used to strike, bash, hook, or attack may have explicitly defined offensive properties; defensive classification alone does not grant those actions.
- Shield type remains independent of Envoy class, Tier, quality, rarity, affinity, and technique.
- Do not infer block direction, perfect-block windows, DR, resistance, Break, penetration, or counter effects from the type name.

## The ten proposed shield types

### 1. Buckler
A small, compact hand-held shield designed for close defense, redirection, and active parrying. It offers localized coverage rather than broad body protection.

**Identity:** compact and highly maneuverable; typically protects a limited area.

### 2. Targe
A compact-to-medium hand shield, commonly round or slightly convex, designed to protect the arm and upper body while remaining usable in close combat.

**Identity:** a hand shield with a strong close-quarters defensive role. Round targes and regional variants can be recorded as subtypes or tags.

### 3. Round Shield
A medium or large circular shield with broad, balanced coverage. It may be center-gripped or strapped, with the exact handling recorded on the item.

**Identity:** general-purpose circular coverage; construction and grip determine its handling.

### 4. Kite Shield
An elongated shield that narrows toward the lower end, designed to protect a substantial portion of the body, including the legs.

**Identity:** vertically extended coverage with a tapered profile.

### 5. Heater Shield
A compact-to-medium shield with a broad upper section and tapered lower point, suited to controlled body coverage.

**Identity:** shaped, comparatively compact body shield; distinguish from a longer kite form by proportions and intended coverage.

### 6. Tower Shield
A very large shield intended to provide extensive frontal or positional protection. It may be carried, braced, planted, or otherwise supported as its individual design allows.

**Identity:** maximum-coverage defensive barrier; any bracing, planting, or movement consequences must be explicitly defined.

### 7. Pavise
A large portable cover shield, often designed to be planted or supported to create temporary protection for its user or nearby allies.

**Identity:** deployable cover rather than merely a shield held continuously in a guard stance. Deployment and retrieval rules belong to the individual item or technique.

### 8. Scutum
A large body shield with a tall, often curved or semi-cylindrical profile, designed to protect a substantial portion of the wielder and potentially support coordinated defensive formations.

**Identity:** broad body coverage and formation-oriented construction. Formation benefits are not automatic.

### 9. Lantern Shield
A specialized hand shield incorporating additional defensive or utility features, such as a lantern-like projection, integrated guard, or secondary implement.

**Identity:** specialized hybrid defensive equipment. Any hook, spike, blade, light source, or offensive function must be explicitly recorded; the name alone grants no attack.

### 10. Gauntlet Shield
A shield integrated with a gauntlet, forearm guard, or arm-mounted frame, leaving the hand available or partially available according to its design.

**Identity:** body-mounted defense rather than a conventional hand-held shield. Exact hand use, grip access, and coverage are item-specific.

## Separate properties and tags

These are descriptive properties, not additional shield types:

- **Grip:** center-grip, hand-and-forearm grip, strapped, gauntlet-mounted, or other documented arrangement.
- **Coverage:** localized, arm, torso, full-body frontal, or other measured coverage.
- **Profile:** flat, convex, concave, curved, tapered, or segmented.
- **Construction:** wood, hide, metal, composite, magical material, or layered construction.
- **Deployment:** hand-held, arm-mounted, braced, planted, foldable, or deployable.
- **Special features:** reinforcement, viewing aperture, spikes, hooks, integrated light, or other item-specific features.

A shield can carry more than one descriptive tag, but its primary type should reflect its defining construction and use.

## Suggested record shape

```yaml
shield:
  type: Buckler
  subtype: []
  grip: item_defined
  coverage: item_defined
  profile: item_defined
  construction: item_defined
  deployment: item_defined
  special_features: []
  offensive_properties: []
  technique_compatibility: []
```

Illustrative only. Omit unknown fields rather than inventing values. Compatibility and special effects require explicit item or technique definitions.

## Open review items

1. Cross-check existing AO shield items and Heirloom records before assigning types.
2. Refine boundaries between Targe, Round Shield, and Buckler using actual item construction and dimensions.
3. Decide whether AO-specific magical or technological shields need subtypes or only descriptive tags.
4. Define any shield-specific combat rules separately from this taxonomy.

This proposal adds descriptive shield classifications only. It does not establish shield statistics or change combat mechanics or canon.
