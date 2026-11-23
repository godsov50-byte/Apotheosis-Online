/**
 * AO Chess equipment lifecycle pipeline.
 * Data-driven playtest engine; not canonical item balance or WorldHeart persistence.
 * Item category, power, rarity, and advancement eligibility are independent.
 */
const clone = value => structuredClone(value);
const num = (v, d = 0) => Number.isFinite(v) ? v : d;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ITEM_CATEGORIES = Object.freeze(["Regular Item", "Heirloom", "Conceptual Heirloom", "Cursed Conceptual Heirloom"]);
const key = p => `${p.x},${p.y},${p.z || 0}`;
const fail = (reason, extra = {}) => ({ ok: false, reason, ...extra });

export function createMaterialDefinition(definition) {
  if (!definition?.id || !definition?.name) throw new Error("material id and name required");
  return {
    id: definition.id, name: definition.name,
    grade: definition.grade ?? null,
    tags: [...(definition.tags || [])],
    properties: clone(definition.properties || {}),
    stackLimit: Math.max(1, num(definition.stackLimit, 99)),
    acquisition: [...(definition.acquisition || [])]
  };
}

export function createItemDefinition(definition) {
  if (!definition?.id || !definition?.name) throw new Error("item id and name required");
  const category = definition.category || "Regular Item";
  if (!ITEM_CATEGORIES.includes(category)) throw new Error("unknown AO item category");
  return {
    id: definition.id, name: definition.name, category,
    itemType: definition.itemType || "misc",
    rarity: definition.rarity ?? null,
    power: definition.power ?? null,
    advancementEligible: definition.advancementEligible === true,
    equipmentSlot: definition.equipmentSlot || null,
    compatibleClasses: [...(definition.compatibleClasses || [])],
    compatibleRaces: [...(definition.compatibleRaces || [])],
    requiredTier: definition.requiredTier ?? null,
    properties: clone(definition.properties || {}),
    modifiers: clone(definition.modifiers || {}),
    durability: definition.durability == null ? null : {
      current: num(definition.durability.current, definition.durability.max),
      max: num(definition.durability.max),
      integrity: num(definition.durability.integrity, 100)
    },
    tags: [...(definition.tags || [])]
  };
}

export function createEquipmentRegistry({ materials = [], items = [], recipes = [] } = {}) {
  const registry = { materials: {}, items: {}, recipes: {} };
  for (const d of materials) {
    const v = createMaterialDefinition(d);
    if (registry.materials[v.id]) throw new Error("duplicate material id: " + v.id);
    registry.materials[v.id] = v;
  }
  for (const d of items) {
    const v = createItemDefinition(d);
    if (registry.items[v.id]) throw new Error("duplicate item id: " + v.id);
    registry.items[v.id] = v;
  }
  for (const d of recipes) {
    const v = createCraftingRecipe(d);
    if (registry.recipes[v.id]) throw new Error("duplicate recipe id: " + v.id);
    registry.recipes[v.id] = v;
  }
  return registry;
}

export function createCraftingRecipe(definition) {
  if (!definition?.id || !definition?.name || !definition?.output?.itemId) throw new Error("recipe id, name and output itemId required");
  const ingredients = (definition.ingredients || []).map(x => ({ materialId: x.materialId, quantity: Math.max(1, Math.floor(num(x.quantity, 1))) }));
  if (!ingredients.length || ingredients.some(x => !x.materialId)) throw new Error("recipe requires material ingredients");
  return {
    id: definition.id, name: definition.name, kind: definition.kind || "craft",
    ingredients,
    output: { itemId: definition.output.itemId, quantity: Math.max(1, Math.floor(num(definition.output.quantity, 1))), propertyOverrides: clone(definition.output.propertyOverrides || {}), modifierOverrides: clone(definition.output.modifierOverrides || {}) },
    stationTags: [...(definition.stationTags || [])],
    toolTags: [...(definition.toolTags || [])],
    skill: definition.skill ? clone(definition.skill) : null,
    classRequirements: [...(definition.classRequirements || [])],
    raceRequirements: [...(definition.raceRequirements || [])],
    tierRequirement: definition.tierRequirement ?? null,
    knownByDefault: definition.knownByDefault === true,
    discovery: clone(definition.discovery || {}),
    duration: Math.max(0, num(definition.duration)),
    outputProvenance: definition.outputProvenance || "crafted"
  };
}

function addEvent(state, event) {
  const ledger = [...(state.ledger || []), { id: event.id || `equipment_${(state.ledger || []).length + 1}`, ...clone(event) }];
  return { ...state, ledger, version: num(state.version) + 1 };
}
function itemByInstance(owner, instanceId) {
  return (owner.inventory || []).find(item => item.instanceId === instanceId) || null;
}
function materialCount(owner, materialId) {
  return (owner.inventory || []).filter(x => x.kind === "material" && x.materialId === materialId).reduce((sum, x) => sum + num(x.quantity), 0);
}
function consumeMaterials(owner, ingredients) {
  const inventory = clone(owner.inventory || []);
  for (const ingredient of ingredients) {
    let remaining = ingredient.quantity;
    for (let i = 0; i < inventory.length && remaining > 0; i++) {
      const stack = inventory[i];
      if (stack.kind !== "material" || stack.materialId !== ingredient.materialId) continue;
      const take = Math.min(remaining, num(stack.quantity));
      stack.quantity -= take; remaining -= take;
    }
    if (remaining > 0) return null;
  }
  return inventory.filter(x => x.kind !== "material" || x.quantity > 0);
}
function ownsTool(owner, tags) {
  if (!tags.length) return true;
  const items = [...(owner.inventory || []), ...Object.values(owner.equipment || {})].filter(Boolean);
  return tags.every(tag => items.some(item => (item.tags || []).includes(tag) && item.state !== "broken" && item.state !== "destroyed"));
}
function hasStation(field, stationTags, actor) {
  if (!stationTags.length) return true;
  const station = field.stations?.[actor.stationId];
  return !!station && station.active !== false && stationTags.every(tag => (station.tags || []).includes(tag));
}
function recipeKnown(owner, recipe) {
  return recipe.knownByDefault || (owner.knownRecipes || []).includes(recipe.id);
}
function validateRecipe(field, intent, registry) {
  const actor = field.entities?.[intent.actorId], recipe = registry.recipes?.[intent.recipeId];
  if (!actor || actor.alive === false) return fail("crafter_unavailable");
  if (!recipe) return fail("unknown_recipe");
  if (!recipeKnown(actor, recipe)) return fail("recipe_not_known");
  if (actor.acted || field.acted?.[actor.id]) return fail("already_acted");
  if (actor.statuses?.some(s => s.blocksAll || s.blocks?.includes("craft"))) return fail("crafting_blocked");
  if (recipe.classRequirements.length && !recipe.classRequirements.includes(actor.class)) return fail("class_requirement");
  if (recipe.raceRequirements.length && !recipe.raceRequirements.includes(actor.race)) return fail("race_requirement");
  if (recipe.tierRequirement != null && num(actor.tier, Infinity) > recipe.tierRequirement) return fail("tier_requirement");
  if (recipe.skill) {
    const level = num(actor.skills?.[recipe.skill.id]?.level);
    if (level < num(recipe.skill.level)) return fail("crafting_skill_requirement", { required: recipe.skill.level, actual: level });
  }
  if (!hasStation(field, recipe.stationTags, actor)) return fail("required_station_missing");
  if (!ownsTool(actor, recipe.toolTags)) return fail("required_tool_missing");
  for (const ingredient of recipe.ingredients) {
    if (!registry.materials[ingredient.materialId]) return fail("unknown_recipe_material", { materialId: ingredient.materialId });
    const have = materialCount(actor, ingredient.materialId);
    if (have < ingredient.quantity) return fail("insufficient_material", { materialId: ingredient.materialId, required: ingredient.quantity, available: have });
  }
  if (!registry.items[recipe.output.itemId]) return fail("unknown_output_item");
  return { ok: true, actor: clone(actor), recipe: clone(recipe) };
}

function makeInstance(template, instanceId, provenance, overrides = {}) {
  const item = createItemDefinition({
    ...clone(template),
    properties: { ...clone(template.properties || {}), ...clone(overrides.propertyOverrides || {}) },
    modifiers: { ...clone(template.modifiers || {}), ...clone(overrides.modifierOverrides || {}) }
  });
  return {
    ...item, instanceId, kind: "equipment",
    provenance: clone(provenance),
    state: "intact",
    createdAt: provenance.createdAt ?? null,
    refinementHistory: []
  };
}

/** Crafting is atomic: no materials are consumed unless every validation succeeds. */
export function craftEquipment(field, intent, registry) {
  const checked = validateRecipe(field, intent, registry);
  if (!checked.ok) return { ...checked, field };
  const next = clone(field), actor = next.entities[intent.actorId], recipe = checked.recipe;
  const remaining = consumeMaterials(actor, recipe.ingredients);
  if (!remaining) return { ...fail("material_transaction_failed"), field };
  actor.inventory = remaining;
  const sequence = num(next.equipmentSequence) + 1;
  next.equipmentSequence = sequence;
  const template = registry.items[recipe.output.itemId], created = [];
  if (template.category === "Conceptual Heirloom" || template.category === "Cursed Conceptual Heirloom") {
    return { ...fail("conceptual_heirloom_requires_agent_origin"), field };
  }
  for (let i = 0; i < recipe.output.quantity; i++) {
    const instanceId = `item-${sequence}-${i + 1}`;
    const provenance = {
      kind: recipe.outputProvenance, recipeId: recipe.id, crafterId: actor.id,
      materials: clone(recipe.ingredients), createdAt: next.worldTime ?? null,
      stationId: actor.stationId || null
    };
    const item = makeInstance(template, instanceId, provenance, recipe.output);
    actor.inventory.push(item); created.push(item);
  }
  actor.acted = true;
  next.entities[actor.id] = actor;
  const committed = addEvent(next, { type: "equipment_crafted", actorId: actor.id, recipeId: recipe.id, consumed: recipe.ingredients, created: created.map(x => x.instanceId) });
  return { ok: true, field: committed, created, consumed: clone(recipe.ingredients) };
}

/** Resource drops may require manual collection; this function never auto-picks them up. */
export function createMaterialDrop({ id, materialId, quantity = 1, position, sourceId = null, requiresManualCollection = true, containerId = null, provenance = {} }) {
  if (!id || !materialId) throw new Error("drop id and materialId required");
  return { id, kind: "material_drop", materialId, quantity: Math.max(1, Math.floor(quantity)), position: clone(position), sourceId, requiresManualCollection, containerId, collected: false, provenance: clone(provenance) };
}

export function collectMaterialDrop(field, intent, registry) {
  const drop = field.drops?.[intent.dropId], actor = field.entities?.[intent.actorId];
  if (!actor || actor.alive === false) return { ...fail("collector_unavailable"), field };
  if (!drop || drop.collected) return { ...fail("drop_unavailable"), field };
  if (drop.containerId) return { ...fail("drop_inside_container"), field };
  if (drop.requiresManualCollection && intent.confirm !== true) return { ...fail("manual_collection_required"), field };
  if (!registry.materials[drop.materialId]) return { ...fail("unknown_material"), field };
  const reach = num(intent.collectionRange, 1);
  if (Math.max(Math.abs(actor.position.x - drop.position.x), Math.abs(actor.position.y - drop.position.y)) > reach) return { ...fail("drop_out_of_reach"), field };
  const next = clone(field), d = next.drops[drop.id], a = next.entities[actor.id];
  a.inventory.push({ kind: "material", materialId: d.materialId, quantity: d.quantity, provenance: { sourceId: d.sourceId, ...clone(d.provenance) } });
  d.collected = true; next.entities[a.id] = a; next.drops[d.id] = d;
  return { ok: true, field: addEvent(next, { type: "material_collected", actorId: a.id, dropId: d.id, materialId: d.materialId, quantity: d.quantity }) };
}

export function collectContainerMaterials(field, intent, registry) {
  const container = field.containers?.[intent.containerId], actor = field.entities?.[intent.actorId];
  if (!actor || actor.alive === false) return { ...fail("collector_unavailable"), field };
  if (!container || container.opened !== true) return { ...fail("container_not_open"), field };
  if (container.collected) return { ...fail("container_empty"), field };
  const reach = num(intent.collectionRange, 1);
  if (Math.max(Math.abs(actor.position.x - container.position.x), Math.abs(actor.position.y - container.position.y)) > reach) return { ...fail("container_out_of_reach"), field };
  const contents = container.contents || [];
  if (contents.some(x => !registry.materials[x.materialId])) return { ...fail("unknown_container_material"), field };
  const next = clone(field), c = next.containers[container.id], a = next.entities[actor.id];
  for (const content of contents) a.inventory.push({ kind: "material", materialId: content.materialId, quantity: content.quantity, provenance: { containerId: c.id, sourceId: c.sourceId || null } });
  c.collected = true; next.entities[a.id] = a; next.containers[c.id] = c;
  return { ok: true, field: addEvent(next, { type: "container_materials_collected", actorId: a.id, containerId: c.id, materials: contents }) };
}

/** Refinement is a separate recipe transaction and preserves the item's category/advancement flag. */
export function refineEquipment(field, intent, registry) {
  const actor = field.entities?.[intent.actorId], recipe = registry.recipes?.[intent.recipeId];
  if (!actor || actor.alive === false) return { ...fail("refiner_unavailable"), field };
  if (!recipe || recipe.kind !== "refine") return { ...fail("refinement_recipe_required"), field };
  const item = itemByInstance(actor, intent.instanceId);
  if (!item || item.state === "destroyed") return { ...fail("refinement_item_unavailable"), field };
  const checked = validateRecipe({ ...field, entities: { ...field.entities, [actor.id]: { ...actor, knownRecipes: [...new Set([...(actor.knownRecipes || []), recipe.id])], acted: false } } }, { actorId: actor.id, recipeId: recipe.id }, registry);
  if (!checked.ok) return { ...checked, field };
  if (!recipe.output.itemId || recipe.output.itemId !== item.id) return { ...fail("refinement_output_mismatch"), field };
  const next = clone(field), a = next.entities[actor.id], target = itemByInstance(a, intent.instanceId);
  const remaining = consumeMaterials(a, recipe.ingredients);
  if (!remaining) return { ...fail("material_transaction_failed"), field };
  a.inventory = remaining;
  const overrides = recipe.output;
  target.properties = { ...target.properties, ...clone(overrides.propertyOverrides || {}) };
  target.modifiers = { ...target.modifiers, ...clone(overrides.modifierOverrides || {}) };
  target.refinementHistory = [...(target.refinementHistory || []), { recipeId: recipe.id, crafterId: actor.id, materials: clone(recipe.ingredients), at: next.worldTime ?? null }];
  target.provenance = { ...target.provenance, refinedBy: [...(target.provenance?.refinedBy || []), actor.id] };
  a.acted = true; next.entities[a.id] = a;
  return { ok: true, field: addEvent(next, { type: "equipment_refined", actorId: a.id, instanceId: target.instanceId, recipeId: recipe.id }) , item: target };
}

export function validateEquipmentAction(entity, item, { action = "equip", slot = item?.equipmentSlot } = {}) {
  if (!item || item.kind !== "equipment" || item.state === "destroyed") return fail("equipment_unavailable");
  if (action === "equip") {
    if (!slot || !item.equipmentSlot || slot !== item.equipmentSlot) return fail("equipment_slot_mismatch");
    if (item.state === "broken") return fail("equipment_broken");
    if (item.compatibleClasses.length && !item.compatibleClasses.includes(entity.class)) return fail("class_incompatible");
    if (item.compatibleRaces.length && !item.compatibleRaces.includes(entity.race)) return fail("race_incompatible");
    if (item.requiredTier != null && num(entity.tier, Infinity) > item.requiredTier) return fail("tier_requirement");
  }
  return { ok: true };
}

export function equipEquipment(field, intent) {
  const entity = field.entities?.[intent.actorId];
  if (!entity || entity.alive === false) return { ...fail("entity_unavailable"), field };
  const item = itemByInstance(entity, intent.instanceId);
  const checked = validateEquipmentAction(entity, item, { action: "equip", slot: intent.slot });
  if (!checked.ok) return { ...checked, field };
  const next = clone(field), actor = next.entities[entity.id], equipped = itemByInstance(actor, item.instanceId);
  const priorId = actor.equipment?.[intent.slot]?.instanceId;
  actor.equipment = { ...(actor.equipment || {}), [intent.slot]: equipped };
  actor.inventory = actor.inventory.filter(x => x.instanceId !== equipped.instanceId && x.instanceId !== priorId);
  if (priorId) {
    const prior = Object.values(entity.equipment || {}).find(x => x.instanceId === priorId);
    if (prior) actor.inventory.push(prior);
  }
  next.entities[actor.id] = actor;
  return { ok: true, field: addEvent(next, { type: "equipment_equipped", actorId: actor.id, instanceId: item.instanceId, slot: intent.slot }) };
}

export function unequipEquipment(field, intent) {
  const entity = field.entities?.[intent.actorId], item = entity?.equipment?.[intent.slot];
  if (!entity || !item) return { ...fail("equipment_slot_empty"), field };
  const next = clone(field), actor = next.entities[entity.id], removed = actor.equipment[intent.slot];
  delete actor.equipment[intent.slot]; actor.inventory = [...(actor.inventory || []), removed]; next.entities[actor.id] = actor;
  return { ok: true, field: addEvent(next, { type: "equipment_unequipped", actorId: actor.id, instanceId: removed.instanceId, slot: intent.slot }) };
}

export function damageEquipmentInstance(item, { damage = 0, penetration = 0, break: breakAmount = 0, breakThreshold = 0 } = {}) {
  if (!item?.durability) return clone(item);
  const durability = clamp(item.durability.current - Math.max(0, damage - penetration), 0, item.durability.max);
  const integrity = clamp(num(item.durability.integrity, 100) - Math.max(0, breakAmount), 0, 100);
  const state = durability <= 0 ? "destroyed" : integrity <= breakThreshold || durability < item.durability.max * .25 ? "broken" : durability < item.durability.max ? "damaged" : "intact";
  return { ...clone(item), durability: { ...item.durability, current: durability, integrity }, state };
}

export function repairEquipment(field, intent, registry) {
  const actor = field.entities?.[intent.actorId], recipe = registry.recipes?.[intent.recipeId];
  if (!actor || !recipe || recipe.kind !== "repair") return { ...fail("repair_recipe_required"), field };
  if (!recipeKnown(actor, recipe)) return { ...fail("recipe_not_known"), field };
  if (actor.acted || field.acted?.[actor.id]) return { ...fail("already_acted"), field };
  if (recipe.skill && num(actor.skills?.[recipe.skill.id]?.level) < num(recipe.skill.level)) return { ...fail("crafting_skill_requirement"), field };
  if (!hasStation(field, recipe.stationTags, actor)) return { ...fail("required_station_missing"), field };
  if (!ownsTool(actor, recipe.toolTags)) return { ...fail("required_tool_missing"), field };
  if (recipe.ingredients.some(x => !registry.materials[x.materialId])) return { ...fail("unknown_recipe_material"), field };
  const item = itemByInstance(actor, intent.instanceId) || Object.values(actor.equipment || {}).find(x => x?.instanceId === intent.instanceId);
  if (!item || !item.durability || item.state === "destroyed") return { ...fail("repair_item_unavailable"), field };
  if (recipe.output.itemId !== item.id) return { ...fail("repair_output_mismatch"), field };
  const next = clone(field), a = next.entities[actor.id], remaining = consumeMaterials(a, recipe.ingredients);
  if (!remaining) return { ...fail("insufficient_material"), field };
  a.inventory = remaining;
  const target = itemByInstance(a, intent.instanceId) || Object.values(a.equipment || {}).find(x => x?.instanceId === intent.instanceId);
  target.durability = { ...target.durability, current: target.durability.max, integrity: 100 };
  target.state = "intact"; a.acted = true; next.entities[a.id] = a;
  return { ok: true, field: addEvent(next, { type: "equipment_repaired", actorId: a.id, instanceId: target.instanceId, recipeId: recipe.id }) };
}

export function aggregateEquipmentModifiers(entity) {
  const totals = {};
  for (const item of Object.values(entity.equipment || {})) {
    if (!item || item.state === "broken" || item.state === "destroyed") continue;
    for (const [key, value] of Object.entries(item.modifiers || {})) {
      if (typeof value === "number" && Number.isFinite(value)) totals[key] = (totals[key] || 0) + value;
    }
  }
  return totals;
}

export function transferEquipment(field, intent) {
  const from = field.entities?.[intent.fromId], to = field.entities?.[intent.toId];
  if (!from || !to || from.alive === false || to.alive === false) return { ...fail("transfer_entity_unavailable"), field };
  const item = itemByInstance(from, intent.instanceId);
  if (!item || item.kind !== "equipment") return { ...fail("transfer_item_unavailable"), field };
  const next = clone(field), source = next.entities[from.id], recipient = next.entities[to.id];
  const moved = itemByInstance(source, item.instanceId);
  source.inventory = source.inventory.filter(x => x.instanceId !== moved.instanceId);
  recipient.inventory.push(moved); next.entities[source.id] = source; next.entities[recipient.id] = recipient;
  return { ok: true, field: addEvent(next, { type: "equipment_transferred", fromId: from.id, toId: to.id, instanceId: moved.instanceId }) };
}

export { ITEM_CATEGORIES };
