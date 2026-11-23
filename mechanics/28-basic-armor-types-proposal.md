# AO Chess — Ten Basic Armor Types

**Status: PROPOSED / NOT CANON.** This document proposes ten descriptive armor families for AO Chess. A type identifies a broad construction method or protective form. It does not automatically grant statistics, DR, resistance, Break protection, movement penalties, AP costs, technique permissions, or class compatibility. The actual item record determines its properties.

## Classification principles

- Armor type describes construction and protective form, not a universal performance package.
- Keep **type**, **coverage**, **material**, **weight**, **fit**, **flexibility**, **quality**, and **special properties** as distinct fields.
- A complete armor set may combine multiple types across different body regions. Record the actual pieces rather than forcing the whole set into one category.
- A primary type may be paired with secondary construction tags when an item genuinely combines methods.
- Armor type is independent of Envoy class, Tier, rarity, quality, affinity, and technique.
- Do not infer DR, resistance, penetration interaction, Break thresholds, weak points, or movement costs from the type name.
- Magical, conceptual, and technologically unusual armor still needs an explicit item definition; its power or rarity does not replace its construction classification.

## The ten proposed armor types

### 1. Padded Armor
Protective layers of cloth, felt, fiber, or similar material, quilted or layered to cushion impact and provide a wearable protective barrier.

**Identity:** textile-based protection. Thickness, layering, reinforcement, and coverage are item-specific.

### 2. Leather Armor
Armor made primarily from treated leather, which may be soft, layered, hardened, molded, or reinforced depending on its construction.

**Identity:** leather-based protective structure. Do not assume all leather armor is rigid or that every treated hide has the same properties.

### 3. Brigandine
A flexible garment or outer layer reinforced with many small metal plates fixed to its interior, commonly visible through their rivets.

**Identity:** concealed or semi-concealed small-plate reinforcement integrated into a wearable backing.

### 4. Scale Armor
Armor formed from overlapping scales attached to a backing of cloth, leather, or another supporting material.

**Identity:** individually attached overlapping scales. Scale shape, material, attachment, and overlap direction matter to the specific item.

### 5. Lamellar Armor
Armor assembled from rows of small plates or lamellae laced together, generally forming a protective structure without requiring each plate to be sewn to a continuous backing.

**Identity:** linked rows of plates. Lacing pattern, plate material, and coverage are separately recorded.

### 6. Mail Armor
Armor made from interlinked rings or other linked-ring construction, including different ring shapes, closures, and patterns.

**Identity:** linked-ring protection. Ring material, diameter, weave, closure quality, and backing layers remain item-specific.

### 7. Splint Armor
Armor using elongated rigid strips or splints attached to a flexible backing or arranged to protect particular body sections.

**Identity:** strip-based reinforcement. The placement, orientation, attachment, and body region protected must be documented.

### 8. Cuirass Armor
A rigid torso defense, commonly consisting of a breastplate and potentially a backplate, designed primarily to protect the chest and torso.

**Identity:** formed torso shell. A cuirass may be worn with separate arm, leg, shoulder, or neck defenses; those pieces are not implied by the cuirass itself.

### 9. Plate Armor
Armor built from shaped rigid plates covering multiple body regions, potentially articulated or connected to permit movement.

**Identity:** multi-region plate protection. The number of plates, articulation, joints, gaps, and coverage vary by suit and must be recorded.

### 10. Composite Armor
An integrated armor construction that deliberately combines two or more substantial protective systems—such as textile, leather, mail, scales, lamellae, or rigid plates—into one designed protective assembly.

**Identity:** a purpose-built combination whose defining structure cannot be adequately represented by one of the other primary types. Do not use this as a vague label for any armor that happens to contain multiple materials; record the actual components and their arrangement.

## Separate properties and tags

These are descriptive fields, not additional armor types:

- **Coverage:** head, neck, shoulders, arms, hands, torso, waist, thighs, shins, feet, or explicitly measured regions.
- **Material:** cloth, felt, leather, hide, iron, steel, bronze, bone, ceramic, composite material, magical material, or other documented substance.
- **Weight:** measured mass or an explicitly defined category, when known.
- **Flexibility:** flexible, semi-rigid, rigid, articulated, or item-defined.
- **Construction details:** quilting, lamination, riveting, lacing, ring weave, plate overlap, splint layout, joints, and backing.
- **Fit and suspension:** fitted, layered, strapped, belted, suspended, or other documented arrangement.
- **Openings and weak points:** joints, gaps, seams, exposed edges, viewing openings, and other actual vulnerabilities.
- **Special properties:** enchantments, integrated devices, environmental protection, or other explicitly defined effects.

A suit may contain multiple armor types—for example, a plate cuirass with mail at the joints and padded layers beneath it. Record each component and its body coverage instead of treating the entire suit as one uniform material or type.

## Suggested record shape

```yaml
armor:
  primary_type: Plate Armor
  secondary_types: []
  components:
    - type: Mail Armor
      coverage: joints
      material: item_defined
  coverage: item_defined
  material: item_defined
  weight: item_defined
  flexibility: item_defined
  fit_and_suspension: item_defined
  construction_details: []
  weak_points: []
  special_properties: []
  technique_compatibility: []
```

Illustrative only. Omit unknown fields rather than inventing values. If the armor is a set, represent its distinct pieces and coverage separately.

## Review items

1. Cross-check existing AO armor items, Heirlooms, and crafting/material records before assigning types.
2. Decide whether regional or fantastical armor forms are subtypes, component tags, or genuinely distinct primary types.
3. Keep armor classification separate from any later rules for coverage, hit location, DR, resistance, Break, mobility, or equipment restrictions.
4. Review whether the boundaries between cuirass, plate, and composite armor remain clear when actual AO equipment examples are classified.

This proposal adds descriptive armor classifications only. It does not establish armor statistics, change combat mechanics, or make these categories canon.
