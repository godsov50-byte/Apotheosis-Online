/**
 * AO Chess provisional content pack.
 * These are executable playtest examples only, not canonized racial lineages,
 * rarity names, equipment balance, or technique values.
 */
import { createRacialRegistry } from "./character-creation-pipeline.mjs";
import { createSkillRegistry } from "./skill-pipeline.mjs";
import { createTechniqueRegistry } from "./technique-pipeline.mjs";
import { createEquipmentRegistry } from "./equipment-pipeline.mjs";
import { createEffectRegistry } from "./effect-pipeline.mjs";

export const AO_PROVISIONAL_RACIAL_PROFILES = Object.freeze([]);
export const AO_PROVISIONAL_RARITY_PROFILES = Object.freeze([]);
export const AO_PROVISIONAL_TECHNIQUES = Object.freeze([
 {id:"field-step",name:"Field Step",tier:9,category:"movement",target:{type:"self"},geometry:{kind:"self"},cost:{ap:1,ea:0},uses:null,cooldown:0,effects:[{type:"resource",target:"self",pool:"stamina",amount:0}],tags:["movement"],provisional:true},
 {id:"guard-break",name:"Guard Break",tier:9,category:"combat",target:{type:"enemy"},geometry:{kind:"range",range:1,minRange:1},cost:{ap:2,ea:1},uses:null,cooldown:0,effects:[{type:"damage",packets:[{type:"physical",amount:6,penetration:1}],break:1}],tags:["melee","break"],provisional:true},
 {id:"ember-lance",name:"Ember Lance",tier:8,category:"affinity",affinityRequirements:["Fire"],target:{type:"enemy"},geometry:{kind:"range",range:3,minRange:1,requiresLineOfSight:true},cost:{ap:2,ea:2},uses:3,cooldown:1,effects:[{type:"damage",packets:[{type:"fire",amount:8,affinity:"Fire"}]}],tags:["projectile","fire"],provisional:true},
 {id:"mending-pulse",name:"Mending Pulse",tier:9,category:"support",target:{type:"ally"},geometry:{kind:"range",range:2,minRange:0},cost:{ap:2,ea:2},uses:2,cooldown:1,effects:[{type:"heal",amount:6}],tags:["healing"],provisional:true}
]);
export const AO_PROVISIONAL_EQUIPMENT = Object.freeze({
 materials:[{id:"field-iron",name:"Field Iron",tags:["metal","crafting"]},{id:"beast-hide",name:"Beast Hide",tags:["leather","crafting"]}],
 items:[
  {id:"field-iron-sabre",name:"Field-Iron Sabre",category:"Regular Item",itemType:"weapon",equipmentSlot:"weapon",modifiers:{},tags:["weapon","sabre","metal"]},
  {id:"hide-traveler-coat",name:"Hide Traveler Coat",category:"Regular Item",itemType:"armor",equipmentSlot:"body",modifiers:{},tags:["armor","leather"]},
  {id:"field-iron-buckler",name:"Field-Iron Buckler",category:"Regular Item",itemType:"shield",equipmentSlot:"offhand",modifiers:{},tags:["shield","metal"]}
 ],
 recipes:[
  {id:"forge-field-sabre",name:"Forge Field-Iron Sabre",ingredients:[{materialId:"field-iron",quantity:2}],output:{itemId:"field-iron-sabre"},knownByDefault:true,skill:{id:"SK20",level:1}},
  {id:"stitch-traveler-coat",name:"Stitch Traveler Coat",ingredients:[{materialId:"beast-hide",quantity:2}],output:{itemId:"hide-traveler-coat"},knownByDefault:true,skill:{id:"SK20",level:1}}
 ]
});
export const AO_PROVISIONAL_EFFECTS = Object.freeze([
 {id:"burning",type:"status",status:{id:"burning",duration:2,remaining:2,tickPhase:"end_turn",stackRule:"refresh",tags:["damage-over-time"]},tags:["fire","damage-over-time"]},
 {id:"guarded",type:"status",status:{id:"guarded",duration:1,remaining:1,stackRule:"refresh",modifiers:{DR:2},tags:["defense"]},tags:["defense"]},
 {id:"weakened",type:"status",status:{id:"weakened",duration:2,remaining:2,stackRule:"refresh",modifiers:{STR:-2},tags:["attribute-debuff"]},tags:["debuff"]}
]);
export function createAOChessContent(){
 return {
  races:createRacialRegistry(AO_PROVISIONAL_RACIAL_PROFILES),
  skills:createSkillRegistry(),
  techniques:createTechniqueRegistry(AO_PROVISIONAL_TECHNIQUES),
  equipment:createEquipmentRegistry(AO_PROVISIONAL_EQUIPMENT),
  effects:createEffectRegistry(AO_PROVISIONAL_EFFECTS)
 };
}
