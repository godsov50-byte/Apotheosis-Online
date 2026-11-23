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
export const RACIAL_ACCESS_STAGES=Object.freeze(["Restricted","Rumored","Discoverable","Verified","Accessible"]);
export const RACIAL_ACCESS_GRANT_TYPES=Object.freeze(["individual_unlock","route_discovery","conditional_availability","global_starting_availability"]);
export function validateRacialStartingAccess(race,decision,{ancestryId=null,subAncestryId=null}={}){
  const stage=race?.accessibility?.stage;
  if(stage!=null&&!RACIAL_ACCESS_STAGES.includes(stage))return fail("racial_access_stage_invalid");
  const governed=Object.keys(race?.accessibility||{}).length||Object.keys(race?.acquisitionGovernance||{}).length;
  if(!governed)return {ok:true,governanceRequired:false};
  if(!decision||decision.allowed!==true||decision.validated!==true)return fail("racial_starting_access_not_validated");
  if(decision.raceId!==race.id)return fail("racial_access_scope_mismatch");
  if(!RACIAL_ACCESS_GRANT_TYPES.includes(decision.grantType)||!decision.grantId)return fail("racial_access_grant_invalid");
  if((decision.ancestryId??null)!==ancestryId||(decision.subAncestryId??null)!==subAncestryId)return fail("racial_access_scope_mismatch");
  return {ok:true,governanceRequired:true,grantId:decision.grantId,grantType:decision.grantType};
}
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
    effects:clone(definition.effects||[]),originLineage:clone(definition.originLineage||{}),
    formNature:clone(definition.formNature||{})};
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
    effects:clone(definition.effects||[]),originLineage:clone(definition.originLineage||{}),
    formNature:clone(definition.formNature||{}),subAncestries};
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
    lineageId: definition.lineageId || definition.originLineage?.lineageId || null,
    existence:clone(definition.existence||{}),
    originLineage:clone(definition.originLineage||{}),
    formNature:clone(definition.formNature||{}),
    speciesClassification:clone(definition.speciesClassification||{}),
    inhabitantUnderstanding:clone(definition.inhabitantUnderstanding||{}),
    population:clone(definition.population||{}),
    accessibility:clone(definition.accessibility||{}),
    acquisitionGovernance:clone(definition.acquisitionGovernance||{}),
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
export function resolveStartingAttributePackage(entryPackage) {
  if(!entryPackage?.id||!entryPackage.baseAttributes)return fail("starting_attribute_package_required");
  const baseAttributes={};
  for(const key of CORE_ATTRIBUTES){
    const value=entryPackage.baseAttributes[key];
    if(!Number.isInteger(value)||value<1)return fail("starting_attribute_package_invalid");
    baseAttributes[key]=value;
  }
  return {ok:true,id:entryPackage.id,name:entryPackage.name||entryPackage.id,
    baseAttributes,sourceRef:entryPackage.sourceRef||null,ruleVersion:entryPackage.ruleVersion||"starting-attributes-v1"};
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
  if(!Number.isSafeInteger(total))return fail("racial_rarity_weight_total_out_of_range");
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
  const access=validateRacialStartingAccess(race,input.accessDecision,{ancestryId:ancestry?.id||null,subAncestryId:subAncestry?.id||null});
  if(!access.ok)return access;
  const startingPackage=resolveStartingAttributePackage(input.startingAttributePackage||{
    id:input.baseAttributeSource||"explicit-entry-package",baseAttributes:input.baseAttributes,
    sourceRef:input.baseAttributeSource||null
  });
  if(!startingPackage.ok)return startingPackage;
  const base=clone(startingPackage.baseAttributes);
  if (!input.vitality || !Number.isFinite(input.vitality.base) || input.vitality.base<0 ||
      !Number.isFinite(input.vitality.perConstitution) || input.vitality.perConstitution<0 ||
      !Number.isFinite(input.vitality.racialHpFlat ?? 0)) return fail("explicit_vitality_rule_required");
  const raceAttrs=race.attributeModifiers,ancestryAttrs=ancestry?.attributeModifiers||ZERO_ATTRIBUTES,
    subAttrs=subAncestry?.attributeModifiers||ZERO_ATTRIBUTES,rarityAttrs=rarity.attributeModifiers;
  const rawStats = addStats(base,raceAttrs,ancestryAttrs,subAttrs,rarityAttrs);
  const stats = Object.fromEntries(CORE_ATTRIBUTES.map(key=>[key,Math.max(1,rawStats[key])]));
  const vitalityHpFlat=input.vitality.racialHpFlat??0;
  const hp = Math.floor(input.vitality.base + stats.CON * input.vitality.perConstitution +
    vitalityHpFlat + race.hpFlat + (ancestry?.hpFlat||0) +
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
    racialRarityId: input.rarityId,
    characterTier, tier: characterTier, race: race.id,
    existence:clone(race.existence),
    originLineage:{race:clone(race.originLineage),ancestry:clone(ancestry?.originLineage||{}),
      subAncestry:clone(subAncestry?.originLineage||{}),ancestryPath:[race.id,...(ancestry?[ancestry.id]:[]),...(subAncestry?[subAncestry.id]:[])]},
    formNature:{race:clone(race.formNature),ancestry:clone(ancestry?.formNature||{}),subAncestry:clone(subAncestry?.formNature||{})},
    speciesClassification:clone(race.speciesClassification),
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
      baseAttributeSource:startingPackage.sourceRef||input.baseAttributeSource||"explicit-entry-package",
      startingAttributePackageId:startingPackage.id,
      startingAttributeRuleVersion:startingPackage.ruleVersion,
      accessDecision:clone(input.accessDecision||null),
      racialLayerIds:{raceId:race.id,ancestryId:ancestry?.id||null,subAncestryId:subAncestry?.id||null,rarityId:input.rarityId}}
  };
  const creationContext={
    inhabitantUnderstanding:clone(race.inhabitantUnderstanding),
    population:clone(race.population),
    accessibility:clone(race.accessibility),
    acquisitionGovernance:clone(race.acquisitionGovernance),
    accessDecision:clone(input.accessDecision||null)
  };
  return { ok:true, entity:envoy, creationContext, breakdown:{
    baseAttributes:base,raceModifiers:raceAttrs,ancestryModifiers:ancestryAttrs,
    subAncestryModifiers:subAttrs,rarityModifiers:rarityAttrs,
    racialModifiers:addStats({...ZERO_ATTRIBUTES},raceAttrs,ancestryAttrs,subAttrs),effectiveAttributes:stats,
    hp:{base:input.vitality.base,constitution:stats.CON,perConstitution:input.vitality.perConstitution,
      racialFlat:vitalityHpFlat+race.hpFlat,raceFlat:race.hpFlat,
      ancestryFlat:ancestry?.hpFlat||0,subAncestryFlat:subAncestry?.hpFlat||0,
      rarityFlat:rarity.hpFlat,max:hp}
  }};
}
