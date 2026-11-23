/**
 * AO Chess technique fragment progression.
 * Fragments carry creature essence and technique knowledge; they are not techniques.
 * Learning and tier advancement are explicit, validated, transactional actions.
 * Technique Tier 9 is the lowest and Tier 0 the highest; advancement moves 9 -> 8 -> ... -> 0.
 * Costs and requirements are data supplied by technique definitions, not canon defaults.
 */
const clone = value => structuredClone(value);
const num = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const fail = (reason, extra = {}) => ({ ok: false, reason, ...extra });

function addLedger(field, event) {
  const ledger = [...(field.ledger || []), { id: event.id || `technique_progression_${(field.ledger || []).length + 1}`, ...clone(event) }];
  return { ...field, ledger, version: num(field.version) + 1 };
}
function fragmentStacks(entity, fragmentId) {
  return (entity.inventory || []).filter(item => item.kind === "technique_fragment" && item.fragmentId === fragmentId && num(item.quantity) > 0);
}
function validateFragmentCosts(entity, costs, fragmentDefinitions) {
  for (const cost of costs || []) {
    const definition = fragmentDefinitions?.[cost.fragmentId];
    if (!definition) return fail("unknown_required_fragment", { fragmentId: cost.fragmentId });
    const stacks = fragmentStacks(entity, cost.fragmentId);
    const available = stacks.reduce((sum, stack) => sum + num(stack.quantity), 0);
    if (available < num(cost.quantity)) return fail("insufficient_technique_fragments", { fragmentId: cost.fragmentId, required: cost.quantity, available });
    if (cost.minimumQuality != null) {
      const qualified = stacks.filter(stack => num(stack.quality?.score) >= cost.minimumQuality).reduce((sum, stack) => sum + num(stack.quantity), 0);
      if (qualified < num(cost.quantity)) return fail("fragment_quality_requirement", { fragmentId: cost.fragmentId, required: cost.quantity, available: qualified, minimumQuality: cost.minimumQuality });
    }
    if (cost.requiredTraits?.length && !cost.requiredTraits.every(trait => (definition.traits || []).includes(trait))) {
      return fail("fragment_trait_requirement", { fragmentId: cost.fragmentId, requiredTraits: cost.requiredTraits });
    }
  }
  return { ok: true };
}
function consumeFragmentCosts(entity, costs) {
  let inventory = clone(entity.inventory || []);
  for (const cost of costs || []) {
    let remaining = num(cost.quantity);
    inventory = inventory.map(stack => {
      if (stack.kind !== "technique_fragment" || stack.fragmentId !== cost.fragmentId || remaining <= 0) return stack;
      const take = Math.min(num(stack.quantity), remaining);
      remaining -= take;
      return { ...stack, quantity: num(stack.quantity) - take };
    }).filter(stack => num(stack.quantity) > 0);
  }
  return inventory;
}
function validateLearningRequirements(entity, technique) {
  const requirements = technique.progression?.learningRequirements || {};
  if (requirements.class?.length && !requirements.class.includes(entity.class)) return fail("learning_class_requirement");
  if (requirements.archetype?.length && !requirements.archetype.includes(entity.archetype)) return fail("learning_archetype_requirement");
  if (requirements.affinity?.length && !requirements.affinity.some(value => (entity.ea?.affinities || entity.affinities || []).includes(value))) return fail("learning_affinity_requirement");
  if ((requirements.prerequisites || []).some(id => !(entity.techniques || []).includes(id))) return fail("learning_prerequisite_missing");
  for (const requirement of requirements.skills || []) {
    if (num(entity.skills?.[requirement.id]?.level) < num(requirement.level)) return fail("learning_skill_requirement", { skill: requirement.id, required: requirement.level });
  }
  return { ok: true };
}

/** Learn a new technique by assimilating its defined essence/knowledge fragment costs. */
export function learnTechniqueFromFragments(field, intent, { techniques = {}, fragmentDefinitions = {} } = {}) {
  const entity = field.entities?.[intent.actorId], technique = techniques[intent.techniqueId];
  if (!entity || entity.alive === false) return { ...fail("learner_unavailable"), field };
  if (!technique) return { ...fail("unknown_technique"), field };
  if ((entity.techniques || []).includes(technique.id)) return { ...fail("technique_already_learned"), field };
  if (entity.acted || field.acted?.[entity.id]) return { ...fail("already_acted"), field };
  const requirements = validateLearningRequirements(entity, technique);
  if (!requirements.ok) return { ...requirements, field };
  const costs = technique.progression?.learningCosts;
  if (!Array.isArray(costs) || !costs.length) return { ...fail("learning_fragment_costs_undefined"), field };
  const validation = validateFragmentCosts(entity, costs, fragmentDefinitions);
  if (!validation.ok) return { ...validation, field };
  const next = clone(field), learner = next.entities[entity.id];
  learner.inventory = consumeFragmentCosts(learner, costs);
  learner.techniques = [...(learner.techniques || []), technique.id];
  learner.techniqueTiers = { ...(learner.techniqueTiers || {}) };
  if (Number.isInteger(technique.tier) && technique.tier >= 0 && technique.tier <= 9) learner.techniqueTiers[technique.id] = technique.tier;
  next.entities[learner.id] = learner;
  const committed = addLedger(next, {
    type: "technique_learned_from_fragments", actorId: learner.id,
    techniqueId: technique.id, techniqueTier: learner.techniqueTiers[technique.id] ?? null,
    fragmentCosts: clone(costs)
  });
  return { ok: true, field: committed, techniqueId: technique.id, tier: learner.techniqueTiers[technique.id] ?? null };
}

/** Advance one technique Tier toward Tier 0, consuming the exact tier-specific costs. */
export function advanceTechniqueTierFromFragments(field, intent, { techniques = {}, fragmentDefinitions = {} } = {}) {
  const entity = field.entities?.[intent.actorId], technique = techniques[intent.techniqueId];
  if (!entity || entity.alive === false) return { ...fail("learner_unavailable"), field };
  if (!technique) return { ...fail("unknown_technique"), field };
  if (!(entity.techniques || []).includes(technique.id)) return { ...fail("technique_not_learned"), field };
  if (entity.acted || field.acted?.[entity.id]) return { ...fail("already_acted"), field };
  const currentTier = entity.techniqueTiers?.[technique.id] ?? technique.tier;
  if (!Number.isInteger(currentTier) || currentTier < 0 || currentTier > 9) return { ...fail("technique_tier_unresolved"), field };
  if (currentTier === 0) return { ...fail("technique_at_highest_tier"), field };
  const nextTier = currentTier - 1;
  if (intent.targetTier != null && intent.targetTier !== nextTier) return { ...fail("invalid_tier_step", { currentTier, allowedNextTier: nextTier }), field };
  const costsByTier = technique.progression?.advancementCostsByCurrentTier || {};
  const costs = costsByTier[String(currentTier)];
  if (!Array.isArray(costs) || !costs.length) return { ...fail("advancement_fragment_costs_undefined", { currentTier }), field };
  const validation = validateFragmentCosts(entity, costs, fragmentDefinitions);
  if (!validation.ok) return { ...validation, field };
  const next = clone(field), learner = next.entities[entity.id];
  learner.inventory = consumeFragmentCosts(learner, costs);
  learner.techniqueTiers = { ...(learner.techniqueTiers || {}), [technique.id]: nextTier };
  next.entities[learner.id] = learner;
  const committed = addLedger(next, {
    type: "technique_tier_advanced_from_fragments", actorId: learner.id,
    techniqueId: technique.id, previousTier: currentTier, newTier: nextTier,
    fragmentCosts: clone(costs)
  });
  return { ok: true, field: committed, techniqueId: technique.id, previousTier: currentTier, newTier: nextTier };
}
