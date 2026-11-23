/**
 * AO skill learning/progression pipeline.
 * Uses the current F02 cumulative-XP proposal (25 * L * (L+1)); proposal status is retained.
 * Skills have levels, never Tiers. Learned XP persists if a core attribute is suppressed.
 */
export const AO_SKILL_DEFINITIONS = Object.freeze([
 ["SK01","Greatsword Proficiency","STR","Greatsword handling only"],
 ["SK02","Shortsword Proficiency","DEX","Shortsword handling only"],
 ["SK03","Longsword Proficiency","STR","Longsword handling only"],
 ["SK04","Rapier Proficiency","DEX","Rapier handling only"],
 ["SK05","Scimitar Proficiency","DEX","Scimitar handling only"],
 ["SK06","Katana Proficiency","DEX","Katana handling only"],
 ["SK07","Longbow Proficiency","STR","Longbow handling only"],
 ["SK08","Shortbow Proficiency","DEX","Shortbow handling only"],
 ["SK09","Recurve Bow Proficiency","DEX","Recurve Bow handling only"],
 ["SK10","Composite Bow Proficiency","STR","Composite Bow handling only"],
 ["SK11","Yumi Proficiency","DEX","Yumi handling only"],
 ["SK12","Athletics","STR","lifting, hauling, climbing"],
 ["SK13","Construction","STR","load-bearing assembly"],
 ["SK14","Endurance Training","CON","sustained exertion pacing"],
 ["SK15","Survival","WIS","shelter, route and exposure judgment"],
 ["SK16","Observation","WIS","sense-derived detection"],
 ["SK17","Diagnosis","WIS","condition inference from evidence"],
 ["SK18","Research","INT","validated model-building"],
 ["SK19","Engineering","INT","mechanism design"],
 ["SK20","Smithing","DEX","precision metal shaping"],
 ["SK21","Alchemy","INT","controlled substance transformation"],
 ["SK22","Stealth","DEX","concealment through movement"],
 ["SK23","Navigation","WIS","routes from acquired spatial evidence"],
 ["SK24","Negotiation","CHA","bargaining, no coerced decisions"],
 ["SK25","Leadership","CHA","coordination with consenting participants"],
 ["SK26","Performance","CHA","expression, signaling and audience response"],
 ["SK27","Affinity Control","ATT","learned symbolic connection; per-affinity specialization"],
 ["SK28","Ritual Design","INT","construction of permissioned symbolic patterns"],
 ["SK29","Medicine","WIS","treatment with proper materials"],
 ["SK30","Agriculture","WIS","ecological cultivation"],
 ["SK31","Trade","INT","valuation, ledgers and logistics"],
 ["SK32","Craft Appraisal","INT","evidence-based material and quality assessment"],
 ["SK33","Evasion","DEX","body displacement within reaction window"],
 ["SK34","Shield","STR","shield handling and coverage"]
].map(([id,name,core,scope])=>Object.freeze({id,name,core,scope})));
const clone = value => structuredClone(value);
const fail = reason => ({ok:false,reason});
export function cumulativeSkillXp(level) {
  if (!Number.isInteger(level) || level < 0) throw new Error("skill level must be a nonnegative integer");
  return 25 * level * (level + 1);
}
export function createSkillRegistry(definitions = AO_SKILL_DEFINITIONS) {
  const skills = {};
  for (const d of definitions) {
    if (!d?.id || !d?.name || !["STR","DEX","CON","INT","WIS","CHA","ATT"].includes(d.core)) throw new Error("invalid skill definition");
    if (skills[d.id]) throw new Error("duplicate skill id: " + d.id);
    skills[d.id] = clone(d);
  }
  return skills;
}
export function skillProgress(entity, skillId, registry = createSkillRegistry()) {
  const definition = registry[skillId];
  if (!definition) return fail("unknown_skill");
  const record = entity.skills?.[skillId] || { xp:0, learnedLevel:0 };
  const learnedLevel = Math.max(0, record.learnedLevel || 0);
  const core = entity.stats?.[definition.core] ?? entity.baseAttributes?.[definition.core];
  if (!Number.isFinite(core)) return fail("core_attribute_missing");
  return {ok:true,skillId,core:definition.core,xp:record.xp || 0,learnedLevel,
    effectiveLevel:Math.min(learnedLevel,Math.max(0,Math.floor(core))),
    nextLevelXp:cumulativeSkillXp(learnedLevel+1),currentLevelXp:cumulativeSkillXp(learnedLevel)};
}
export function awardSkillExperience(field, {actorId,skillId,xp,eventId,sourceId=null,contextTags=[]} = {}, registry = createSkillRegistry()) {
  const actor = field.entities?.[actorId], definition = registry[skillId];
  if (!actor || actor.alive === false) return {...fail("learner_unavailable"),field};
  if (!definition) return {...fail("unknown_skill"),field};
  if (!Number.isInteger(xp) || xp <= 0 || !eventId) return {...fail("positive_xp_and_event_id_required"),field};
  if ((field.ledger || []).some(e=>e.id===eventId)) return {...fail("duplicate_learning_event"),field};
  const next = clone(field), learner = next.entities[actorId];
  const current = learner.skills?.[skillId] || {xp:0,learnedLevel:0,events:[]};
  const updated = {...current,xp:current.xp+xp,events:[...(current.events||[]),eventId]};
  while (updated.xp >= cumulativeSkillXp(updated.learnedLevel+1)) updated.learnedLevel++;
  learner.skills = {...learner.skills,[skillId]:updated};
  next.entities[actorId]=learner;
  next.ledger=[...(next.ledger||[]),{id:eventId,type:"skill_experience_awarded",actorId,skillId,xp,sourceId,contextTags:[...contextTags],learnedLevel:updated.learnedLevel}];
  next.version=(next.version||0)+1;
  return {ok:true,field:next,progress:skillProgress(learner,skillId,registry)};
}
export function resolveSkillCheck(entity, skillId, {roll=0,difficulty=0,synergyBonus=0}={}, registry=createSkillRegistry()) {
  const progress=skillProgress(entity,skillId,registry);
  if(!progress.ok)return progress;
  if(!Number.isFinite(roll)||!Number.isFinite(difficulty)||!Number.isFinite(synergyBonus))return fail("invalid_check_input");
  const total=roll+progress.effectiveLevel+synergyBonus;
  return {ok:true,skillId,roll,skillLevel:progress.effectiveLevel,synergyBonus,total,difficulty,success:total>=difficulty};
}
