# AO Chess — Ten Creature Racial Types

**Status: PROPOSED / NOT CANON.** This draft establishes ten broad creature racial types for AO Chess. Racial type describes what kind of creature an entity fundamentally is—its origin/nature, body, innate traits, and biological or metaphysical possibilities. It is independent of Chess creature archetype, Envoy class, species, Tier, element, rarity, and variant.

## Design distinction

- **Racial type:** foundational creature kind (this document).
- **Species:** specific creature lineage within a racial type.
- **Creature archetype:** natural enemy combat pattern, paired to one of the ten Envoy classes in the separate archetype proposal.
- **Variant:** modifier such as regional, elite, alpha, mutated, elemental-adapted, ancient, rare, or boss.
- **Element/affinity:** independent attribute and rules axis; a racial type does not automatically grant an element or weakness.
- **Tier and rarity:** independent measures and must not be inferred from race.

A racial type does not prescribe a Chess archetype. Species within a race can exhibit different archetypes, and an individual may have secondary archetypes when supported by its profile.

## Proposed ten racial types

| Racial type | Core identity | Common design possibilities (not universal traits) |
|---|---|---|
| **Beast** | Animal-bodied life, including mammalian, reptilian, amphibian, and other non-arthropod animal lineages. | Senses, natural weapons, pack/herd behavior, adaptation, physical specialization. |
| **Arthropod** | Insects, arachnids, crustaceans, and other jointed-limb invertebrate lineages. | Exoskeleton, molts, swarm/colony behavior, venom, webs, specialized appendages. |
| **Draconic** | Dragon-descended or dragon-bodied lineages. | Scale structures, breath-like abilities, flight or locomotion adaptations, formidable innate traits. |
| **Elemental** | Entities whose bodies or existence are constituted by elemental substance or force. | Elemental body, environmental interaction, elemental shaping, unusual physical composition. |
| **Spirit** | Non-corporeal, semi-corporeal, or spirit-origin entities. | Manifestation, possession or inhabitation where defined, perception beyond ordinary senses, spirit-bound conditions. |
| **Undead** | Creatures sustained beyond ordinary life or animated through death-related states. | Persistence, altered vital systems, corpse-based traits, death-state interactions. |
| **Plantborn** | Plant-bodied, fungal, or rooted/rhizomorphic living lineages. | Growth, spores, vines, photosynthetic or nutrient acquisition, rooted or distributed bodies. |
| **Aberrant** | Creatures whose nature is anomalous, alien, distorted, or outside established natural lineages. | Unusual anatomy, sensory distortions, nonstandard life cycles, unpredictable but rules-defined traits. |
| **Construct** | Artificially made, assembled, forged, grown, or engineered creature entities. | Component bodies, built-in functions, alternative maintenance needs, creator-imprinted behavior. |
| **Humanoid** | Creature lineages with a predominantly humanoid body plan that are not simply classified as Envoys or human variants. | Manipulative hands, upright locomotion, tool use, social or cognitive specializations; none assumed by default. |

## Assignment and overlap rules

- Assign a primary racial type when evidence supports it; leave it unknown or unresolved rather than forcing a fit.
- The list is a broad working taxonomy, not a claim that every creature fits neatly or that hybrid/overlapping origins are impossible.
- If a creature genuinely combines origins, record its secondary type or mixed lineage only when its profile supports the relationship; do not infer hybrid status from appearance alone.
- A creature's race does not determine intelligence, alignment, hostility, Tier, rarity, size, elemental affinity, drops, or class-counter archetype.
- Racial traits should be written as explicit species or individual properties, not blanket bonuses applied to every member.
- Race-specific movement, anatomy, resource drops, growth, reproduction, and environmental interactions remain defined by the creature record and actual rules.
- The ten racial types are proposed categories for organizing the existing roster. They do not create new species, lore origins, or automatic mechanical effects.

## Creature profile integration example

```yaml
identity:
  racialType: Beast
  species: <species_id_or_name>
  lineage: unknown_or_defined
chess:
  creatureArchetypes:
    primary: <archetype>
    secondary: []
```

Illustrative structure only. Fields and values remain subject to review; do not fill unknown lineage or archetype details by assumption.

## Open review questions

1. Review whether the ten categories are distinct and useful against the existing AO creature roster.
2. Identify lineages that need a different racial type, overlap, or hybrid representation.
3. Confirm whether the racial-type list should remain exactly ten or be expandable.
4. Apply racial types only after cross-checking existing creature/species records.

This proposal is a classification layer only: no species assignments, racial bonuses, or canon changes are approved.
