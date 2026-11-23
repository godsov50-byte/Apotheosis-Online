import test from "node:test";
import assert from "node:assert/strict";
import * as Drops from "../engine/drop-resource-pipeline.mjs";
import * as Progression from "../engine/technique-fragment-pipeline.mjs";

const registry = {
  materials: { hide: { id: "hide" } },
  items: {},
  techniqueFragments: {
    ember: { id: "ember", name: "Ember Essence-Knowledge", traits: ["fire", "beast", "combustion"], essence: { traits: ["fire", "beast"], potency: 72 }, knowledge: { traits: ["combustion", "heat-shaping"], potency: 68 } },
    scale: { id: "scale", name: "Drake Scale Memory", traits: ["dragon", "defense"], essence: { traits: ["dragon"], potency: 90 }, knowledge: { traits: ["defense"], potency: 35 } }
  }
};
const techniques = {
  flame: {
    id: "flame", name: "Flame Art", tier: 9,
    progression: {
      learningCosts: [{ fragmentId: "ember", quantity: 3, minimumQuality: 40, requiredTraits: ["fire"], requiredEssenceTraits: ["fire"], requiredKnowledgeTraits: ["combustion"], minimumEssencePotency: 60, minimumKnowledgePotency: 60 }],
      advancementCostsByCurrentTier: {
        "9": [{ fragmentId: "ember", quantity: 2 }],
        "8": [{ fragmentId: "ember", quantity: 3, minimumQuality: 50 }]
      }
    }
  }
};

test("creature defeat can independently drop technique fragments", () => {
  const result = Drops.resolveDefeatDrops({ drops: {}, ledger: [] }, {
    source: { id: "fire-beast", type: "creature_death", eventId: "death-9", essenceQuality: 15 },
    profile: { techniqueFragmentDrops: [{ fragmentId: "ember", chance: 1, min: 2, max: 2, budgetCostPerUnit: 1 }] },
    registry, position: { x: 2, y: 3 }, seed: "fragment-drop", rewardBudget: 2
  });
  assert.equal(result.ok, true);
  assert.equal(result.techniqueFragmentDrops.length, 1);
  assert.equal(result.techniqueFragmentDrops[0].quantity, 2);
  assert.equal(result.field.ledger.at(-1).techniqueFragmentQuantity, 2);
  assert.equal(result.techniqueFragmentDrops[0].provenance.sourceEventId, "death-9");
});

test("technique fragments collect as a distinct inventory type with provenance", () => {
  const result = Drops.resolveDefeatDrops({ drops: {}, entities: { e: { id: "e", alive: true, position: { x: 0, y: 0 }, inventory: [] } } }, {
    source: { id: "creature" },
    profile: { techniqueFragmentDrops: [{ fragmentId: "ember", chance: 1, min: 2, max: 2 }] },
    registry, position: { x: 0, y: 0 }, seed: "collect-frag"
  });
  const drop = result.techniqueFragmentDrops[0];
  const collected = Drops.collectBalancedDrop(result.field, { actorId: "e", dropId: drop.id, confirm: true }, registry);
  assert.equal(collected.ok, true);
  const stack = collected.field.entities.e.inventory[0];
  assert.equal(stack.kind, "technique_fragment");
  assert.equal(stack.fragmentId, "ember");
  assert.equal(stack.quantity, 2);
  assert.deepEqual(stack.essence.traits, ["fire", "beast"]);
  assert.deepEqual(stack.knowledge.traits, ["combustion", "heat-shaping"]);
  assert.equal(stack.provenance.sourceId, "creature");
});

test("fragments can teach a new technique and are consumed transactionally", () => {
  const field = { entities: { e: { id: "e", alive: true, techniques: [], inventory: [
    { kind: "technique_fragment", fragmentId: "ember", quantity: 2, quality: { score: 70 } },
    { kind: "technique_fragment", fragmentId: "ember", quantity: 2, quality: { score: 55 } }
  ] } }, ledger: [] };
  const result = Progression.learnTechniqueFromFragments(field, { actorId: "e", techniqueId: "flame" }, { techniques, fragmentDefinitions: registry.techniqueFragments });
  assert.equal(result.ok, true);
  assert.deepEqual(result.field.entities.e.techniques, ["flame"]);
  assert.equal(result.field.entities.e.inventory.length, 1);
  assert.equal(result.field.entities.e.inventory[0].quantity, 1);
  assert.equal(result.field.entities.e.techniqueTiers.flame, 9);
  assert.equal(field.entities.e.inventory[0].quantity, 2);
});

test("insufficient or incompatible fragments do not teach a technique", () => {
  const field = { entities: { e: { id: "e", alive: true, techniques: [], inventory: [
    { kind: "technique_fragment", fragmentId: "scale", quantity: 9, quality: { score: 99 } }
  ] } } };
  const result = Progression.learnTechniqueFromFragments(field, { actorId: "e", techniqueId: "flame" }, { techniques, fragmentDefinitions: registry.techniqueFragments });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "insufficient_technique_fragments");
  assert.deepEqual(field.entities.e.techniques, []);
  assert.equal(field.entities.e.inventory[0].quantity, 9);
});

test("fragments advance an owned technique from Tier 9 toward Tier 0", () => {
  const field = { entities: { e: { id: "e", alive: true, techniques: ["flame"], techniqueTiers: { flame: 9 }, inventory: [
    { kind: "technique_fragment", fragmentId: "ember", quantity: 3, quality: { score: 75 } }
  ] } }, ledger: [] };
  const result = Progression.advanceTechniqueTierFromFragments(field, { actorId: "e", techniqueId: "flame", targetTier: 8 }, { techniques, fragmentDefinitions: registry.techniqueFragments });
  assert.equal(result.ok, true);
  assert.equal(result.previousTier, 9);
  assert.equal(result.newTier, 8);
  assert.equal(result.field.entities.e.techniqueTiers.flame, 8);
  assert.equal(result.field.entities.e.inventory[0].quantity, 1);
  assert.equal(result.field.ledger.at(-1).type, "technique_tier_advanced_from_fragments");
});

test("Tier advancement cannot skip a Tier or exceed Tier 0", () => {
  const field = { entities: { e: { id: "e", alive: true, techniques: ["flame"], techniqueTiers: { flame: 9 }, inventory: [
    { kind: "technique_fragment", fragmentId: "ember", quantity: 9, quality: { score: 99 } }
  ] } } };
  const result = Progression.advanceTechniqueTierFromFragments(field, { actorId: "e", techniqueId: "flame", targetTier: 7 }, { techniques, fragmentDefinitions: registry.techniqueFragments });
  assert.equal(result.reason, "invalid_tier_step");
  assert.equal(field.entities.e.techniqueTiers.flame, 9);
});

test("balance simulation reports expected technique fragment yields and rates", () => {
  const result = Drops.simulateDropProfile({ source: { id: "fire-beast" }, profile: { techniqueFragmentDrops: [{ fragmentId: "ember", chance: 1, min: 2, max: 2 }] }, registry, trials: 20, seed: "fragment-preview" });
  assert.equal(result.ok, true);
  assert.equal(result.expectedTechniqueFragmentUnitsPerTrial, 2);
  assert.equal(result.techniqueFragmentDropRate, 1);
  assert.equal(result.fragmentsById.ember, 40);
});

test("fragment essence and knowledge must both match the technique", () => {
  const wrongKnowledge = {
    ...registry.techniqueFragments.ember,
    knowledge: { traits: ["armor"], potency: 95 }
  };
  const field = { entities: { e: { id: "e", alive: true, techniques: [], inventory: [
    { kind: "technique_fragment", fragmentId: "ember", quantity: 3, quality: { score: 90 } }
  ] } } };
  const result = Progression.learnTechniqueFromFragments(field, { actorId: "e", techniqueId: "flame" }, {
    techniques, fragmentDefinitions: { ...registry.techniqueFragments, ember: wrongKnowledge }
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "fragment_knowledge_requirement");
  assert.deepEqual(field.entities.e.techniques, []);
  assert.equal(field.entities.e.inventory[0].quantity, 3);
});
