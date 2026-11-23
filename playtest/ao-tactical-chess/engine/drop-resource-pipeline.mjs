/**
 * AO Chess drop, reward and extraction balancing pipeline.
 * Playtest-only data-driven rules; no canon tables or universal balance values.
 *
 * Keep separate: remains/material drops, equipment drops, resource cells/nodes,
 * container contents, extracted drops, and collected inventory.
 */
const clone = value => structuredClone(value);
const num = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const fail = (reason, extra = {}) => ({ ok: false, reason, ...extra });

function hashSeed(seed) {
  const text = String(seed ?? "ao-chess");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededRandom(seed) {
  let state = hashSeed(seed) || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function intBetween(random, min, max) {
  const lo = Math.ceil(Math.min(min, max)), hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(random() * (hi - lo + 1));
}
function qualityRecord(random, {
  base = 50, source = 0, skill = 0, tool = 0, method = 0,
  variance = 0, penalty = 0, thresholds = [20, 40, 60, 80]
} = {}) {
  const spread = Math.max(0, num(variance));
  const noise = spread ? (random() * 2 - 1) * spread : 0;
  const score = clamp(Math.round(num(base) + num(source) + num(skill) + num(tool) + num(method) - num(penalty) + noise), 0, 100);
  const [worn, common, fine, superior] = thresholds;
  const grade = score < worn ? "poor" : score < common ? "worn" : score < fine ? "common" : score < superior ? "fine" : "exceptional";
  return { score, grade };
}
function addLedger(field, event) {
  const ledger = [...(field.ledger || []), { id: event.id || `drop_resource_${(field.ledger || []).length + 1}`, ...clone(event) }];
  return { ...field, ledger, version: num(field.version) + 1 };
}
function validateSource(source) {
  return !!source && typeof source.id === "string" && source.id.length > 0;
}

/** Create a single physical material drop. It remains on the field until collected. */
export function createBalancedMaterialDrop({
  id, materialId, quantity, position, sourceId, quality = { score: 50, grade: "common" },
  requiresManualCollection = true, containerId = null, provenance = {}
}) {
  if (!id || !materialId || !Number.isFinite(quantity) || quantity <= 0) throw new Error("valid drop id, materialId and positive quantity required");
  return {
    id, kind: "material_drop", materialId, quantity: Math.floor(quantity),
    quality: clone(quality), position: clone(position), sourceId: sourceId || null,
    requiresManualCollection, containerId, collected: false,
    provenance: clone(provenance)
  };
}

/**
 * Resolve defeat rewards from a source-linked profile.
 * Material entries roll independently, then share an optional material quantity budget.
 * Equipment chance/table is an independent roll and is never substituted for materials.
 */
export function resolveDefeatDrops(field, {
  source, profile, registry, position, seed,
  quality = {}, materialBudget = Infinity, rewardBudget = profile?.rewardBudget ?? Infinity, equipmentDropCap = 1
}) {
  if (!validateSource(source)) return { ...fail("reward_source_required"), field };
  if (!profile || !registry?.materials || !registry?.items) return { ...fail("reward_profile_or_registry_missing"), field };
  const random = seededRandom(seed ?? `${source.id}:${field.worldTime ?? field.version ?? 0}`);
  const next = clone(field), created = [];
  next.drops = { ...(next.drops || {}) };
  let materialsRemaining = Math.max(0, num(materialBudget, Infinity));
  let rewardBudgetRemaining = Math.max(0, num(rewardBudget, Infinity));
  let rewardBudgetSpent = 0;
  for (const entry of profile.materialDrops || []) {
    if (!registry.materials[entry.materialId]) return { ...fail("unknown_drop_material", { materialId: entry.materialId }), field };
    if (random() > clamp(num(entry.chance, 1), 0, 1)) continue;
    if (materialsRemaining <= 0) break;
    const rolled = intBetween(random, Math.max(1, num(entry.min, 1)), Math.max(1, num(entry.max, 1)));
    const unitCost = Math.max(0, num(entry.budgetCostPerUnit, 1));
    const affordable = unitCost > 0 ? Math.floor(rewardBudgetRemaining / unitCost) : rolled;
    const quantity = Math.min(rolled, materialsRemaining, affordable);
    if (quantity <= 0) break;
    const q = qualityRecord(random, {
      base: num(entry.qualityBase, 50), source: num(source.materialQuality),
      variance: num(entry.qualityVariance, quality.variance ?? 0),
      penalty: num(entry.qualityPenalty), thresholds: quality.thresholds
    });
    const id = `drop-${source.id}-${created.length + 1}`;
    const drop = createBalancedMaterialDrop({
      id, materialId: entry.materialId, quantity, position, sourceId: source.id,
      quality: q, requiresManualCollection: entry.requiresManualCollection !== false,
      containerId: entry.containerId || null,
      provenance: { originType: source.type || "defeat", profileId: profile.id || null, seed: String(seed ?? ""), sourceEventId: source.eventId || null }
    });
    next.drops[id] = drop; created.push(drop); materialsRemaining -= quantity;
    const materialCost = quantity * unitCost;
    rewardBudgetRemaining -= materialCost; rewardBudgetSpent += materialCost;
  }

  const equipment = profile.equipmentDrops || {};
  const equipmentCreated = [];
  const chance = clamp(num(equipment.chance), 0, 1);
  if (chance > 0 && random() <= chance) {
    const entries = (equipment.entries || []).filter(entry => registry.items[entry.itemId] && num(entry.weight, 1) > 0);
    const totalWeight = entries.reduce((sum, entry) => sum + num(entry.weight, 1), 0);
    const count = Math.min(Math.max(1, num(equipment.max, 1)), Math.max(1, num(equipmentDropCap, 1)));
    for (let i = 0; i < count && totalWeight > 0; i++) {
      let pick = random() * totalWeight, selected = entries.at(-1);
      for (const entry of entries) { pick -= num(entry.weight, 1); if (pick <= 0) { selected = entry; break; } }
      const q = qualityRecord(random, {
        base: num(selected.qualityBase, equipment.qualityBase ?? 50),
        source: num(source.equipmentQuality), variance: num(selected.qualityVariance, quality.variance ?? 0),
        penalty: num(selected.qualityPenalty), thresholds: quality.thresholds
      });
      const equipmentCost = Math.max(0, num(selected.budgetCost, 1));
      if (equipmentCost > rewardBudgetRemaining) break;
      const id = `equipment-drop-${source.id}-${i + 1}`;
      const drop = {
        id, kind: "equipment_drop", itemId: selected.itemId, quantity: 1,
        quality: q, position: clone(position), sourceId: source.id,
        requiresManualCollection: selected.requiresManualCollection !== false,
        collected: false,
        provenance: { originType: source.type || "defeat", profileId: profile.id || null, sourceEventId: source.eventId || null, seed: String(seed ?? "") }
      };
      next.drops[id] = drop; equipmentCreated.push(drop);
      rewardBudgetRemaining -= equipmentCost; rewardBudgetSpent += equipmentCost;
    }
  }
  const fragmentsCreated = [];
  for (const entry of profile.techniqueFragmentDrops || []) {
    if (!registry.techniqueFragments?.[entry.fragmentId]) return { ...fail("unknown_technique_fragment", { fragmentId: entry.fragmentId }), field };
    if (random() > clamp(num(entry.chance, 1), 0, 1)) continue;
    const rolled = intBetween(random, Math.max(1, num(entry.min, 1)), Math.max(1, num(entry.max, 1)));
    const unitCost = Math.max(0, num(entry.budgetCostPerUnit, 1));
    const affordable = unitCost > 0 ? Math.floor(rewardBudgetRemaining / unitCost) : rolled;
    const quantity = Math.min(rolled, affordable);
    if (quantity <= 0) continue;
    const q = qualityRecord(random, {
      base: num(entry.qualityBase, source.fragmentQuality ?? 50),
      source: num(source.essenceQuality), variance: num(entry.qualityVariance, quality.variance ?? 0),
      penalty: num(entry.qualityPenalty), thresholds: quality.thresholds
    });
    const id = `tech-fragment-drop-${source.id}-${fragmentsCreated.length + 1}`;
    const drop = {
      id, kind: "technique_fragment_drop", fragmentId: entry.fragmentId, quantity,
      quality: q, position: clone(position), sourceId: source.id,
      requiresManualCollection: entry.requiresManualCollection !== false,
      containerId: entry.containerId || null, collected: false,
      provenance: { originType: source.type || "creature_death", profileId: profile.id || null, sourceEventId: source.eventId || null, seed: String(seed ?? ""), essenceSource: source.essenceSource || source.type || "creature" }
    };
    next.drops[id] = drop; fragmentsCreated.push(drop);
    const fragmentCost = quantity * unitCost;
    rewardBudgetRemaining -= fragmentCost; rewardBudgetSpent += fragmentCost;
  }
  let committed = addLedger(next, {
    type: "defeat_drops_resolved", sourceId: source.id, sourceType: source.type || "defeat",
    materialDropIds: created.map(x => x.id), equipmentDropIds: equipmentCreated.map(x => x.id),
    techniqueFragmentDropIds: fragmentsCreated.map(x => x.id),
    materialQuantity: created.reduce((sum, x) => sum + x.quantity, 0),
    equipmentCount: equipmentCreated.length,
    techniqueFragmentQuantity: fragmentsCreated.reduce((sum, x) => sum + x.quantity, 0),
    rewardBudgetSpent, rewardBudgetRemaining, profileId: profile.id || null
  });
  return { ok: true, field: committed, materialDrops: created, equipmentDrops: equipmentCreated, techniqueFragmentDrops: fragmentsCreated, rewardBudgetSpent, rewardBudgetRemaining };
}

/** A resource node is a finite spatial source; it is not itself an inventory stack. */
export function createResourceNode(definition) {
  if (!definition?.id || !definition?.resourceId || !Number.isFinite(definition.quantity) || definition.quantity < 0) {
    throw new Error("resource node requires id, resourceId and non-negative quantity");
  }
  return {
    id: definition.id, resourceId: definition.resourceId,
    quantity: definition.quantity, maxQuantity: num(definition.maxQuantity, definition.quantity),
    position: clone(definition.position), quality: clamp(num(definition.quality, 50), 0, 100),
    sourceId: definition.sourceId || definition.id, state: definition.state || "available",
    tags: [...(definition.tags || [])], extractionHistory: []
  };
}

/**
 * Extraction is a finite-source transaction.
 * Yield inputs (baseYield, skillYield, toolYield, depletionLoss) and quality inputs
 * are explicit data. The result is a world drop, not automatic inventory collection.
 */
export function extractResource(field, intent, {
  resources = {}, methods = {}, maxSkillBonus = 0, quality = {}
} = {}) {
  const actor = field.entities?.[intent.actorId], node = field.resourceNodes?.[intent.nodeId];
  if (!actor || actor.alive === false) return { ...fail("extractor_unavailable"), field };
  if (!node || node.state === "depleted" || node.quantity <= 0) return { ...fail("resource_depleted"), field };
  if (actor.acted || field.acted?.[actor.id]) return { ...fail("already_acted"), field };
  if (actor.statuses?.some(s => s.blocksAll || s.blocks?.includes("extract"))) return { ...fail("extraction_blocked"), field };
  const resource = resources[node.resourceId];
  if (!resource) return { ...fail("unknown_resource_definition"), field };
  const method = methods[intent.methodId];
  if (!method) return { ...fail("unknown_extraction_method"), field };
  if (method.resourceTags?.length && !method.resourceTags.some(tag => (node.tags || []).includes(tag))) return { ...fail("method_incompatible_with_node"), field };
  if (method.skill) {
    const level = num(actor.skills?.[method.skill.id]?.level);
    if (level < num(method.skill.level)) return { ...fail("extraction_skill_requirement", { required: method.skill.level, actual: level }), field };
  }
  if (method.toolTags?.length) {
    const carried = [...(actor.inventory || []), ...Object.values(actor.equipment || {})].filter(Boolean);
    if (!method.toolTags.every(tag => carried.some(item => (item.tags || []).includes(tag) && item.state !== "broken" && item.state !== "destroyed"))) {
      return { ...fail("extraction_tool_requirement"), field };
    }
  }
  const reach = num(method.range, 1);
  if (actor.position && node.position && Math.max(Math.abs(actor.position.x - node.position.x), Math.abs(actor.position.y - node.position.y)) > reach) {
    return { ...fail("resource_out_of_reach"), field };
  }
  const skillLevel = method.skill ? num(actor.skills?.[method.skill.id]?.level) : 0;
  const skillYield = Math.min(Math.max(0, num(maxSkillBonus)), Math.max(0, skillLevel - num(method.skill?.level)) * num(method.yieldPerSkill));
  const tool = [...(actor.inventory || []), ...Object.values(actor.equipment || {})].find(item => (item.tags || []).some(tag => (method.toolTags || []).includes(tag)) && item.state !== "broken" && item.state !== "destroyed");
  const toolYield = num(tool?.extractionYield);
  const depletionRatio = node.maxQuantity > 0 ? 1 - node.quantity / node.maxQuantity : 1;
  const depletionLoss = depletionRatio * num(method.depletionLoss);
  const rawYield = num(method.baseYield, 1) + skillYield + toolYield - depletionLoss;
  const quantity = Math.min(node.quantity, Math.max(0, Math.floor(rawYield)));
  if (quantity <= 0) return { ...fail("no_extractable_yield"), field };
  const q = qualityRecord(seededRandom(intent.seed ?? `${node.id}:${node.extractionHistory.length}`), {
    base: node.quality, skill: skillLevel * num(method.qualityPerSkill),
    tool: num(tool?.extractionQuality), method: num(method.qualityModifier),
    penalty: num(method.qualityPenalty), variance: num(method.qualityVariance, quality.variance ?? 0),
    thresholds: quality.thresholds
  });
  const next = clone(field), updatedNode = next.resourceNodes[node.id];
  next.entities[actor.id] = { ...next.entities[actor.id], acted: true };
  updatedNode.quantity -= quantity;
  updatedNode.state = updatedNode.quantity <= 0 ? "depleted" : "available";
  const dropId = `extracted-${node.id}-${updatedNode.extractionHistory.length + 1}`;
  const drop = createBalancedMaterialDrop({
    id: dropId, materialId: resource.materialId || node.resourceId, quantity,
    position: node.position, sourceId: node.sourceId, quality: q,
    requiresManualCollection: method.requiresManualCollection !== false,
    provenance: { originType: "resource_extraction", nodeId: node.id, methodId: method.id, extractorId: actor.id }
  });
  updatedNode.extractionHistory.push({ dropId, extractorId: actor.id, methodId: method.id, quantity, quality: q, at: next.worldTime ?? null });
  next.resourceNodes[node.id] = updatedNode;
  next.drops = { ...(next.drops || {}), [dropId]: drop };
  const committed = addLedger(next, {
    type: "resource_extracted", nodeId: node.id, sourceId: node.sourceId,
    extractorId: actor.id, methodId: method.id, quantity, quality: q, dropId,
    remaining: updatedNode.quantity
  });
  return { ok: true, field: committed, drop, extracted: quantity, quality: q, remaining: updatedNode.quantity };
}


/** Collect a balanced material/equipment drop while preserving its quality and origin. */
export function collectBalancedDrop(field, intent, registry) {
  const drop = field.drops?.[intent.dropId], actor = field.entities?.[intent.actorId];
  if (!actor || actor.alive === false) return { ...fail("collector_unavailable"), field };
  if (!drop || drop.collected) return { ...fail("drop_unavailable"), field };
  const container = drop.containerId ? field.containers?.[drop.containerId] : null;
  if (drop.containerId && (!container || container.opened !== true)) return { ...fail("container_not_open"), field };
  if (drop.containerId && container.collected) return { ...fail("container_empty"), field };
  if (drop.requiresManualCollection && intent.confirm !== true) return { ...fail("manual_collection_required"), field };
  const collectionPosition = container?.position || drop.position;
  const reach = num(intent.collectionRange, 1);
  if (actor.position && collectionPosition && Math.max(Math.abs(actor.position.x - collectionPosition.x), Math.abs(actor.position.y - collectionPosition.y)) > reach) return { ...fail("drop_out_of_reach"), field };
  const next = clone(field), a = next.entities[actor.id], d = next.drops[drop.id];
  if (d.kind === "material_drop") {
    if (!registry?.materials?.[d.materialId]) return { ...fail("unknown_material"), field };
    a.inventory = [...(a.inventory || []), { kind: "material", materialId: d.materialId, quantity: d.quantity, quality: clone(d.quality), provenance: { sourceId: d.sourceId, ...clone(d.provenance || {}) } }];
  } else if (d.kind === "technique_fragment_drop") {
    const template = registry?.techniqueFragments?.[d.fragmentId];
    if (!template) return { ...fail("unknown_technique_fragment"), field };
    a.inventory = [...(a.inventory || []), {
      kind: "technique_fragment", fragmentId: d.fragmentId, quantity: d.quantity,
      quality: clone(d.quality), fragmentTraits: clone(template.traits || []),
      essence: clone(template.essence || {}), knowledge: clone(template.knowledge || {}),
      provenance: { sourceId: d.sourceId, ...clone(d.provenance || {}) }
    }];
  } else if (d.kind === "equipment_drop") {
    const template = registry?.items?.[d.itemId];
    if (!template) return { ...fail("unknown_equipment_item"), field };
    const sequence = num(next.equipmentSequence) + 1;
    next.equipmentSequence = sequence;
    const instance = {
      ...clone(template), instanceId: `drop-item-${sequence}`, kind: "equipment",
      quality: clone(d.quality), provenance: { sourceId: d.sourceId, originType: "equipment_drop", ...clone(d.provenance || {}) },
      state: "intact", refinementHistory: []
    };
    a.inventory = [...(a.inventory || []), instance];
  } else return { ...fail("unsupported_drop_kind"), field };
  d.collected = true;
  next.entities[a.id] = a; next.drops[d.id] = d;
  if (container) {
    const remainingDrops = Object.values(next.drops).some(item => item.containerId === container.id && !item.collected);
    next.containers[container.id] = { ...container, collected: !remainingDrops };
  }
  return { ok: true, field: addLedger(next, { type: "balanced_drop_collected", actorId: a.id, dropId: d.id, dropKind: d.kind, sourceId: d.sourceId, containerId: container?.id || null, quality: clone(d.quality) }) };
}

/** Deterministic preview helper; useful for encounter authoring and automated balance tests. */
export function simulateDropProfile({ source, profile, registry, trials = 1000, seed = "balance-preview", position = { x: 0, y: 0 }, quality = {} }) {
  const totals = { trials, materialUnits: 0, materialDrops: 0, equipmentDrops: 0, techniqueFragmentUnits: 0, techniqueFragmentDrops: 0, equipmentByItem: {}, fragmentsById: {}, qualityScores: [] };
  for (let i = 0; i < trials; i++) {
    const field = { drops: {}, ledger: [], version: 0 };
    const result = resolveDefeatDrops(field, { source, profile, registry, position, seed: `${seed}:${i}`, quality });
    if (!result.ok) return result;
    totals.materialUnits += result.materialDrops.reduce((sum, drop) => sum + drop.quantity, 0);
    totals.materialDrops += result.materialDrops.length;
    totals.equipmentDrops += result.equipmentDrops.length;
    totals.techniqueFragmentDrops += result.techniqueFragmentDrops.length;
    totals.techniqueFragmentUnits += result.techniqueFragmentDrops.reduce((sum, drop) => sum + drop.quantity, 0);
    for (const drop of result.equipmentDrops) totals.equipmentByItem[drop.itemId] = (totals.equipmentByItem[drop.itemId] || 0) + 1;
    for (const drop of result.techniqueFragmentDrops) totals.fragmentsById[drop.fragmentId] = (totals.fragmentsById[drop.fragmentId] || 0) + drop.quantity;
    totals.qualityScores.push(...result.materialDrops.map(x => x.quality.score), ...result.equipmentDrops.map(x => x.quality.score), ...result.techniqueFragmentDrops.map(x => x.quality.score));
  }
  const qualityCount = totals.qualityScores.length;
  totals.averageQuality = qualityCount ? totals.qualityScores.reduce((sum, score) => sum + score, 0) / qualityCount : null;
  delete totals.qualityScores;
  totals.expectedMaterialUnitsPerTrial = totals.materialUnits / trials;
  totals.equipmentDropRate = totals.equipmentDrops / trials;
  totals.techniqueFragmentDropRate = totals.techniqueFragmentDrops / trials;
  totals.expectedTechniqueFragmentUnitsPerTrial = totals.techniqueFragmentUnits / trials;
  return { ok: true, ...totals };
}
