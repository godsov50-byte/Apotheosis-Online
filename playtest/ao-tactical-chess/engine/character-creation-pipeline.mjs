/**
 * AO Chess racial character creation.
 * Race -> Ancestry -> optional Sub-ancestry is preserved as separate source layers.
 * Racial rarity is independent from character Tier, technique Tier and item rarity.
 * No canonical roster, rarity names, weights, or balance values are supplied here.
 */
export const CORE_ATTRIBUTES = Object.freeze(["STR","DEX","CON","INT","WIS","CHA","ATT"]);
const ZERO_ATTRIBUTES = Object.freeze(Object.fromEntries(CORE_ATTRIBUTES.map(key=>[key,0])));
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
  for (const key of CORE_ATTRIBUTES) out[key] = layers.reduce((sum, layer) => sum + (layer?.[key] || 0), base[key]);
  return out;
}
function mergeModifierMaps(...sources) {
  const merge=(a,b)=>{
    const out={...a};
    for(const [key,value] of Object.entries(b||{})){
      if(Number.isFinite(value))out[key]=(Number.isFinite(out[key])?out[key]:0)+value;
      else if(value&&typeof value==="object"&&!Array.isArray(value))out[key]=merge(out[key]&&typeof out[key]==="object"?out[key]:{},value);
      else if(Array.isArray(value))out[key]=[...new Set([...(Array.isArray(out[key])?out[key]:[]),...value])];
      else out[key]=clone(value);
    }
    return out;
  };
  return sources.reduce((result,source)=>merge(result,source||{}),{});
}
function createSubAncestryProfile(definition) {
  if(!definition?.id||!definition?.name)throw new Error("sub-ancestry id and name required");
  return {id:definition.id,name:definition.name,attributeModifiers:modifiers(definition.attributeModifiers),
    hpFlat:finite(definition.hpFlat,0),modifiers:clone(definition.modifiers||{}),
    traits:[...(definition.traits||[])],racialTechniques:[...(definition.racialTechniques||[])],
    effects:clone(definition.effects||[])};
}
function createAncestryProfile(definition) {
  if(!definition?.id||!definition?.name)throw new Error("ancestry id and name required");
  const subAncestries={};
  for(const raw of definition.subAncestries||[]){
    const profile=createSubAncestryProfile(raw);
    if(subAncestries[profile.id])throw new Error("duplicate sub-ancestry id: "+profile.id);
    subAncestries[profile.id]=profile;
  }
  return {id:definition.id,name:definition.name,attributeModifiers:modifiers(definition.attributeModifiers),
    hpFlat:finite(definition.hpFlat,0),modifiers:clone(definition.modifiers||{}),
    traits:[...(definition.traits||[])],racialTechniques:[...(definition.racialTechniques||[])],
    effects:clone(definition.effects||[]),subAncestries};
}
export function createRacialProfile(definition) {
  if (!definition?.id || !definition?.name) throw new Error("race id and name required");
  const rarityProfiles = {};
  for (const profile of definition.rarityProfiles || []) {
    if (!profile.rarityId || rarityProfiles[profile.rarityId]) throw new Error("unique racial rarityId required");
    if(profile.weight!=null&&(!Number.isSafeInteger(profile.weight)||profile.weight<1))throw new Error("racial rarity weight must be a positive integer");
    rarityProfiles[profile.rarityId] = {
      rarityId:profile.rarityId,weight:profile.weight??null,
      attributeModifiers: modifiers(profile.attributeModifiers),
      hpFlat: finite(profile.hpFlat, 0),
      traits: [...(profile.traits || [])],
      modifiers: clone(profile.modifiers || {}),
      racialTechniques: [...(profile.racialTechniques || [])],
      effects:clone(profile.effects||[])
    };
  }
  const ancestries={};
  for(const raw of definition.ancestries||[]){
    const profile=createAncestryProfile(raw);
    if(ancestries[profile.id])throw new Error("duplicate ancestry id: "+profile.id);
    ancestries[profile.id]=profile;
  }
  return {
    id: definition.id, name: definition.name,
    lineageId: definition.lineageId || null,
    racialType: definition.racialType || null,
    naturalAffinity: definition.naturalAffinity ?? null,
    attributeModifiers: modifiers(definition.attributeModifiers),
    hpFlat: finite(definition.hpFlat, 0),
    modifiers: clone(definition.modifiers || {}),
    traits: [...(definition.traits || [])],
    racialTechniques: [...(definition.racialTechniques || [])],
    effects:clone(definition.effects||[]),
    ancestries,rarityProfiles
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
/** Deterministic rarity selection; the Kernel supplies a committed integer roll. */
export function resolveRacialRarity(race, roll) {
  const profiles=Object.values(race?.rarityProfiles||{});
  if(!profiles.length)return fail("racial_rarity_profiles_missing");
  if(profiles.some(profile=>!Number.isSafeInteger(profile.weight)||profile.weight<1))return fail("racial_rarity_weights_unconfigured");
  const total=profiles.reduce((sum,profile)=>sum+profile.weight,0);
  if(!Number.isSafeInteger(roll)||roll<0||roll>=total)return fail("racial_rarity_roll_out_of_range");
  let cursor=roll;
  for(const profile of profiles){if(cursor<profile.weight)return {ok:true,rarityId:profile.rarityId,profile,totalWeight:total};cursor-=profile.weight;}
  return fail("racial_rarity_resolution_failed");
}
/**
 * Base attributes are supplied by the approved entry package, not point-buy.
 * HP = vitality.base + effective CON * vitality.perConstitution
 *      + racial/ancestry/sub-ancestry/rarity flat HP.
 * Every contributing layer remains separately inspectable and versionable.
 */
export function createEnvoyFromCreation(input, registry) {
  if (!input?.id || !input?.name || !input?.side) return fail("identity_required");
  const race = registry?.[input.raceId];
  if (!race) return fail("unknown_race");
  const rarity = race.rarityProfiles[input.rarityId];
  if (!rarity) return fail("racial_rarity_not_available");
  let ancestry=null,subAncestry=null;
  if(input.ancestryId){
    ancestry=race.ancestries[input.ancestryId];
    if(!ancestry)return fail("unknown_ancestry");
  }else if(Object.keys(race.ancestries).length)return fail("ancestry_required");
  if(input.subAncestryId){
    if(!ancestry)return fail("sub_ancestry_requires_ancestry");
    subAncestry=ancestry.subAncestries[input.subAncestryId];
    if(!subAncestry)return fail("unknown_sub_ancestry");
  }
  const base = {};
  for (const key of CORE_ATTRIBUTES) {
    const value = input.baseAttributes?.[key];
    if (!Number.isInteger(value) || value < 1) return fail("complete_base_attributes_required");
    base[key] = value;
  }
  if (!input.vitality || !Number.isFinite(input.vitality.base) || input.vitality.base<0 ||
      !Number.isFinite(input.vitality.perConstitution) || input.vitality.perConstitution<0 ||
      !Number.isFinite(input.vitality.racialHpFlat ?? 0)) return fail("explicit_vitality_rule_required");
  const raceAttrs=race.attributeModifiers,ancestryAttrs=ancestry?.attributeModifiers||ZERO_ATTRIBUTES,
    subAttrs=subAncestry?.attributeModifiers||ZERO_ATTRIBUTES,rarityAttrs=rarity.attributeModifiers;
  const stats = addStats(base,raceAttrs,ancestryAttrs,subAttrs,rarityAttrs);
  const hp = Math.floor(input.vitality.base + stats.CON * input.vitality.perConstitution +
    input.vitality.racialHpFlat + race.hpFlat + (ancestry?.hpFlat||0) +
    (subAncestry?.hpFlat||0) + rarity.hpFlat);
  if (!Number.isFinite(hp) || hp < 1) return fail("invalid_derived_hp");
  const characterTier = input.characterTier;
  if (!Number.isInteger(characterTier) || characterTier < 0 || characterTier > 9) return fail("character_tier_must_be_0_to_9");
  const racialModifiers=mergeModifierMaps(race.modifiers,ancestry?.modifiers,subAncestry?.modifiers);
  const traits=[...new Set([...race.traits,...(ancestry?.traits||[]),...(subAncestry?.traits||[]),...rarity.traits,...(input.traits||[])])];
  const racialTechniques=[...new Set([...race.racialTechniques,...(ancestry?.racialTechniques||[]),...(subAncestry?.racialTechniques||[]),...rarity.racialTechniques])];
  const racialEffects=[...race.effects,...(ancestry?.effects||[]),...(subAncestry?.effects||[]),...rarity.effects].map(effect=>clone(effect));
  const envoy = {
    id: input.id, name: input.name, side: input.side,
    raceId: race.id, raceName: race.name, lineageId: race.lineageId,
    ancestryId:ancestry?.id||null,ancestryName:ancestry?.name||null,
    subAncestryId:subAncestry?.id||null,subAncestryName:subAncestry?.name||null,
    racialType: race.racialType, racialRarityId: input.rarityId,
    characterTier, tier: characterTier, race: race.id,
    naturalAffinity: race.naturalAffinity,
    baseAttributes: base,
    raceAttributeModifiers:clone(raceAttrs),ancestryAttributeModifiers:clone(ancestryAttrs),
    subAncestryAttributeModifiers:clone(subAttrs),racialAttributeModifiers:addStats({...ZERO_ATTRIBUTES},raceAttrs,ancestryAttrs,subAttrs),
    rarityAttributeModifiers: clone(rarityAttrs),
    raceModifiers:clone(race.modifiers),ancestryModifiers:clone(ancestry?.modifiers||{}),
    subAncestryModifiers:clone(subAncestry?.modifiers||{}),racialModifiers,
    rarityModifiers: clone(rarity.modifiers),stats,
    hp: { current: hp, max: hp, base: hp },
    ap: clone(input.ap || { current: 8, max: 8 }),
    ea: input.ea ? { ...clone(input.ea), affinities: [...new Set([...(input.ea.affinities || []), ...(race.naturalAffinity ? [race.naturalAffinity] : [])])] } : { current: 8, max: 8, affinities: race.naturalAffinity ? [race.naturalAffinity] : [] },
    traits, racialTechniques, racialEffects,
    skills: clone(input.skills || {}), techniques: clone(input.techniques || []),
    inventory: clone(input.inventory || []), equipment: clone(input.equipment || {}),
    statuses: [], injuries: [], alive: true,
    creation: { ruleVersion: input.ruleVersion || "ao-racial-creation-v2", vitality: clone(input.vitality),
      baseAttributeSource:input.baseAttributeSource||"approved-entry-package",
      racialLayerIds:{raceId:race.id,ancestryId:ancestry?.id||null,subAncestryId:subAncestry?.id||null,rarityId:input.rarityId}}
  };
  return { ok:true, entity:envoy, breakdown:{
    baseAttributes:base,raceModifiers:raceAttrs,ancestryModifiers:ancestryAttrs,
    subAncestryModifiers:subAttrs,rarityModifiers:rarityAttrs,effectiveAttributes:stats,
    hp:{base:input.vitality.base,constitution:stats.CON,perConstitution:input.vitality.perConstitution,
      racialFlat:input.vitality.racialHpFlat+race.hpFlat,raceFlat:race.hpFlat,
      ancestryFlat:ancestry?.hpFlat||0,subAncestryFlat:subAncestry?.hpFlat||0,
      rarityFlat:rarity.hpFlat,max:hp}
  }};
}
