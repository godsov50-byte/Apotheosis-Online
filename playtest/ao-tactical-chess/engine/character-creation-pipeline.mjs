/**
 * AO Chess character/racial creation pipeline.
 * Race records are supplied data: no lineage roster, rarity ladder, or balance values are invented here.
 * Character Tier, racial rarity, technique Tier, and equipment rarity remain independent.
 */
export const CORE_ATTRIBUTES = Object.freeze(["STR","DEX","CON","INT","WIS","CHA","ATT"]);
const clone = value => structuredClone(value);
const finite = (value, fallback = null) => Number.isFinite(value) ? value : fallback;
const fail = reason => ({ ok:false, reason });
function modifiers(source = {}) {
  const result = {};
  for (const key of CORE_ATTRIBUTES) {
    const value = source[key] ?? 0;
    if (!Number.isFinite(value)) throw new Error("invalid racial modifier: " + key);
    result[key] = value;
  }
  return result;
}
function addStats(base, ...layers) {
  const out = {};
  for (const key of CORE_ATTRIBUTES) out[key] = layers.reduce((sum, layer) => sum + (layer[key] || 0), base[key]);
  return out;
}
export function createRacialProfile(definition) {
  if (!definition?.id || !definition?.name) throw new Error("race id and name required");
  const rarityProfiles = {};
  for (const profile of definition.rarityProfiles || []) {
    if (!profile.rarityId || rarityProfiles[profile.rarityId]) throw new Error("unique racial rarityId required");
    rarityProfiles[profile.rarityId] = {
      attributeModifiers: modifiers(profile.attributeModifiers),
      hpFlat: finite(profile.hpFlat, 0),
      traits: [...(profile.traits || [])],
      racialTechniques: [...(profile.racialTechniques || [])]
    };
  }
  return {
    id: definition.id, name: definition.name,
    lineageId: definition.lineageId || null,
    racialType: definition.racialType || null,
    naturalAffinity: definition.naturalAffinity ?? null,
    attributeModifiers: modifiers(definition.attributeModifiers),
    hpFlat: finite(definition.hpFlat, 0),
    traits: [...(definition.traits || [])],
    racialTechniques: [...(definition.racialTechniques || [])],
    rarityProfiles
  };
}
export function createRacialRegistry(definitions = []) {
  const races = {};
  for (const definition of definitions) {
    const race = createRacialProfile(definition);
    if (races[race.id]) throw new Error("duplicate race id: " + race.id);
    races[race.id] = race;
  }
  return races;
}
/**
 * Creates an Envoy without a fixed point-buy pool.
 * baseAttributes are supplied by the approved entry package; vitality is an explicit,
 * versionable rule input: HP = base + effective CON * perConstitution + racial/rarity flat.
 */
export function createEnvoyFromCreation(input, registry) {
  if (!input?.id || !input?.name || !input?.side) return fail("identity_required");
  const race = registry?.[input.raceId];
  if (!race) return fail("unknown_race");
  const rarity = race.rarityProfiles[input.rarityId];
  if (!rarity) return fail("racial_rarity_not_available");
  const base = {};
  for (const key of CORE_ATTRIBUTES) {
    const value = input.baseAttributes?.[key];
    if (!Number.isInteger(value) || value < 1) return fail("complete_base_attributes_required");
    base[key] = value;
  }
  if (!input.vitality || !Number.isFinite(input.vitality.base) ||
      !Number.isFinite(input.vitality.perConstitution) ||
      !Number.isFinite(input.vitality.racialHpFlat ?? 0)) return fail("explicit_vitality_rule_required");
  const stats = addStats(base, race.attributeModifiers, rarity.attributeModifiers);
  const hp = Math.floor(input.vitality.base + stats.CON * input.vitality.perConstitution +
    input.vitality.racialHpFlat + race.hpFlat + rarity.hpFlat);
  if (!Number.isFinite(hp) || hp < 1) return fail("invalid_derived_hp");
  const characterTier = input.characterTier;
  if (!Number.isInteger(characterTier) || characterTier < 0 || characterTier > 9) return fail("character_tier_must_be_0_to_9");
  const envoy = {
    id: input.id, name: input.name, side: input.side,
    raceId: race.id, raceName: race.name, lineageId: race.lineageId,
    racialType: race.racialType, racialRarityId: input.rarityId,
    characterTier,
    naturalAffinity: race.naturalAffinity,
    baseAttributes: base,
    racialAttributeModifiers: clone(race.attributeModifiers),
    rarityAttributeModifiers: clone(rarity.attributeModifiers),
    stats,
    hp: { current: hp, max: hp, base: hp },
    ap: clone(input.ap || { current: 8, max: 8 }),
    ea: clone(input.ea || { current: 8, max: 8, affinities: race.naturalAffinity ? [race.naturalAffinity] : [] }),
    traits: [...new Set([...race.traits, ...rarity.traits, ...(input.traits || [])])],
    racialTechniques: [...new Set([...race.racialTechniques, ...rarity.racialTechniques])],
    skills: clone(input.skills || {}),
    techniques: clone(input.techniques || []),
    inventory: clone(input.inventory || []),
    equipment: clone(input.equipment || {}),
    statuses: [], injuries: [], alive: true,
    creation: { ruleVersion: input.ruleVersion || "ao-racial-creation-v1", vitality: clone(input.vitality) }
  };
  return { ok:true, entity:envoy, breakdown:{
    baseAttributes:base, racialModifiers:race.attributeModifiers, rarityModifiers:rarity.attributeModifiers,
    effectiveAttributes:stats, hp:{ base:input.vitality.base, constitution:stats.CON,
      perConstitution:input.vitality.perConstitution, racialFlat:input.vitality.racialHpFlat + race.hpFlat,
      rarityFlat:rarity.hpFlat, max:hp }
  }};
}
