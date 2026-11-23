import test from "node:test";
import assert from "node:assert/strict";
import * as D from "../engine/drop-resource-pipeline.mjs";
const registry = {
  materials: { hide: { id: "hide" }, ore: { id: "ore" }, crystal: { id: "crystal" } },
  items: { blade: { id: "blade", name: "Blade", category: "Regular Item" }, charm: { id: "charm", name: "Charm", category: "Heirloom" } }
};
test("defeat rewards preserve independent material and equipment rolls with provenance", () => {
  const profile = { id: "wolf-profile", materialDrops: [{ materialId: "hide", chance: 1, min: 2, max: 4 }], equipmentDrops: { chance: 1, entries: [{ itemId: "blade", weight: 1 }] } };
  const field = { drops: {}, ledger: [], version: 0 };
  const result = D.resolveDefeatDrops(field, { source: { id: "wolf-1", type: "creature_death", eventId: "death-1" }, profile, registry, position: { x: 3, y: 4 }, seed: "stable" });
  assert.equal(result.ok, true); assert.equal(result.materialDrops.length, 1);
  assert.ok(result.materialDrops[0].quantity >= 2 && result.materialDrops[0].quantity <= 4);
  assert.equal(result.equipmentDrops.length, 1); assert.equal(result.materialDrops[0].provenance.sourceEventId, "death-1");
  assert.equal(result.equipmentDrops[0].kind, "equipment_drop"); assert.equal(result.field.ledger.at(-1).type, "defeat_drops_resolved");
  assert.equal(Object.keys(field.drops).length, 0);
});
test("material budget caps quantity without altering independent equipment chance", () => {
  const profile = { materialDrops: [{ materialId: "hide", chance: 1, min: 5, max: 5 }], equipmentDrops: { chance: 1, entries: [{ itemId: "blade", weight: 1 }] } };
  const result = D.resolveDefeatDrops({ drops: {} }, { source: { id: "beast" }, profile, registry, position: { x: 0, y: 0 }, seed: "budget", materialBudget: 2 });
  assert.equal(result.materialDrops[0].quantity, 2); assert.equal(result.equipmentDrops.length, 1);
});
test("seeded reward generation is reproducible", () => {
  const args = { source: { id: "same" }, profile: { materialDrops: [{ materialId: "ore", chance: 0.8, min: 1, max: 5 }] }, registry, position: { x: 1, y: 1 }, seed: "replay" };
  assert.deepEqual(D.resolveDefeatDrops({ drops: {} }, args).materialDrops, D.resolveDefeatDrops({ drops: {} }, args).materialDrops);
});
test("resource extraction depletes finite node and creates a world drop, not inventory", () => {
  const node = D.createResourceNode({ id: "vein", resourceId: "ore", quantity: 8, quality: 72, position: { x: 1, y: 0 } });
  const field = { entities: { miner: { id: "miner", alive: true, position: { x: 0, y: 0 }, skills: { mining: { level: 3 } }, inventory: [{ tags: ["pick"], extractionYield: 1, extractionQuality: 4 }] } }, resourceNodes: { vein: node }, drops: {}, ledger: [], version: 0 };
  const result = D.extractResource(field, { actorId: "miner", nodeId: "vein", methodId: "pickaxe", seed: "extract" }, {
    resources: { ore: { materialId: "ore" } }, methods: { pickaxe: { id: "pickaxe", skill: { id: "mining", level: 1 }, toolTags: ["pick"], baseYield: 2, yieldPerSkill: 1, qualityPerSkill: 1, range: 1 } }, maxSkillBonus: 2
  });
  assert.equal(result.ok, true); assert.equal(result.extracted, 5); assert.equal(result.remaining, 3);
  assert.equal(result.field.entities.miner.inventory.length, 1); assert.equal(result.drop.requiresManualCollection, true);
  assert.equal(result.field.ledger.at(-1).type, "resource_extracted");
});
test("depleted resource nodes cannot be extracted twice", () => {
  const node = D.createResourceNode({ id: "vein", resourceId: "ore", quantity: 1, position: { x: 0, y: 0 } });
  const field = { entities: { m: { id: "m", alive: true, position: { x: 0, y: 0 }, inventory: [] } }, resourceNodes: { vein: node }, drops: {} };
  const config = { resources: { ore: { materialId: "ore" } }, methods: { hand: { id: "hand", baseYield: 1 } } };
  const first = D.extractResource(field, { actorId: "m", nodeId: "vein", methodId: "hand" }, config);
  assert.equal(first.remaining, 0); assert.equal(first.field.resourceNodes.vein.state, "depleted");
  assert.equal(D.extractResource(first.field, { actorId: "m", nodeId: "vein", methodId: "hand" }, config).reason, "resource_depleted");
});
test("failed extraction leaves source and inventory untouched", () => {
  const node = D.createResourceNode({ id: "vein", resourceId: "ore", quantity: 4, position: { x: 0, y: 0 } });
  const field = { entities: { m: { id: "m", alive: true, position: { x: 0, y: 0 }, inventory: [], skills: { mining: { level: 0 } } } }, resourceNodes: { vein: node }, drops: {} };
  const result = D.extractResource(field, { actorId: "m", nodeId: "vein", methodId: "pick" }, { resources: { ore: { materialId: "ore" } }, methods: { pick: { id: "pick", skill: { id: "mining", level: 2 }, baseYield: 2 } } });
  assert.equal(result.reason, "extraction_skill_requirement"); assert.equal(field.resourceNodes.vein.quantity, 4); assert.equal(field.entities.m.inventory.length, 0);
});
test("quality and quantity are independent dimensions", () => {
  const low = D.createResourceNode({ id: "low", resourceId: "ore", quantity: 10, quality: 10, position: { x: 0, y: 0 } });
  const high = D.createResourceNode({ id: "high", resourceId: "ore", quantity: 2, quality: 95, position: { x: 0, y: 0 } });
  assert.ok(low.quantity > high.quantity); assert.ok(low.quality < high.quality);
});
test("balance preview reports expected yields and equipment rates", () => {
  const result = D.simulateDropProfile({ source: { id: "target" }, profile: { materialDrops: [{ materialId: "hide", chance: 1, min: 2, max: 2 }], equipmentDrops: { chance: 0.25, entries: [{ itemId: "blade", weight: 1 }] } }, registry, trials: 100, seed: "preview" });
  assert.equal(result.ok, true); assert.equal(result.expectedMaterialUnitsPerTrial, 2);
  assert.ok(result.equipmentDropRate > 0.1 && result.equipmentDropRate < 0.4);
});

test("collection preserves quality and provenance for both material and equipment drops", () => {
  const material = D.createBalancedMaterialDrop({ id: "m1", materialId: "ore", quantity: 3, position: { x: 0, y: 0 }, sourceId: "vein-1", quality: { score: 88, grade: "exceptional" }, provenance: { nodeId: "vein-1" } });
  const field = { entities: { miner: { id: "miner", alive: true, position: { x: 0, y: 0 }, inventory: [] } }, drops: { m1: material } };
  const picked = D.collectBalancedDrop(field, { actorId: "miner", dropId: "m1", confirm: true }, registry);
  assert.equal(picked.ok, true);
  assert.equal(picked.field.entities.miner.inventory[0].quality.score, 88);
  assert.equal(picked.field.entities.miner.inventory[0].provenance.nodeId, "vein-1");
  const equipmentField = { entities: { miner: { id: "miner", alive: true, position: { x: 0, y: 0 }, inventory: [] } }, drops: { e1: { id: "e1", kind: "equipment_drop", itemId: "charm", quantity: 1, quality: { score: 97, grade: "exceptional" }, position: { x: 0, y: 0 }, sourceId: "agent-1", collected: false, provenance: { eventId: "agent-death" } } } };
  const equipped = D.collectBalancedDrop(equipmentField, { actorId: "miner", dropId: "e1", confirm: true }, registry);
  assert.equal(equipped.ok, true);
  assert.equal(equipped.field.entities.miner.inventory[0].category, "Heirloom");
  assert.equal(equipped.field.entities.miner.inventory[0].quality.score, 97);
  assert.equal(equipped.field.entities.miner.inventory[0].provenance.eventId, "agent-death");
});
