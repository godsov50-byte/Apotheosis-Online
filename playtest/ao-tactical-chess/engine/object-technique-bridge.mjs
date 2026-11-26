/**
 * Environment target adapter for the shared technique pipeline.
 * Only server-owned profiles and object records are accepted by this boundary.
 * No database writes, client-supplied damage, PvP or automatic terrain clearing.
 */
import {createTechniqueRegistry,validateTechniqueIntent,resolveTechniqueIntent} from "./technique-pipeline.mjs";
import {lineOfSight,emitEvent} from "./ao-chess-engine.mjs";
const fail=(reason,field)=>({ok:false,reason,field});
const condition=(hp,max)=>hp===0?"Destroyed":hp*4<=max?"Broken":hp<max?"Damaged":"Intact";
function prepare(field,intent,profiles,canPerceive){
 const actor=field.entities[intent.actorId],object=field.objects?.[intent.targetId],profile=profiles[intent.actorId];
 if(!actor?.alive)return fail("actor_unavailable",field);
 if(!object||field.entities[object.id]||object.id!==intent.targetId||!Number.isInteger(object.durability)||!Number.isInteger(object.maxDurability)||object.durability<=0||object.durability>object.maxDurability)return fail("object_unavailable",field);
 const t=actor.boardTechniqueProfile,id=actor.boardTechniqueId;
 if(!id||!t||!profile?.objectTechniqueTargets?.[id]?.includes(object.type))return fail("object_target_not_allowed",field);
 if(profile.requiredTechniqueEquipment&&!profile.equippedCategories?.includes(profile.requiredTechniqueEquipment))return fail("equipment_requirement",field);
 if(!object.position||!Number.isInteger(object.position.x)||!Number.isInteger(object.position.y)||object.position.x<0||object.position.y<0||object.position.x>=field.width||object.position.y>=field.height)return fail("invalid_object_position",field);
 if(!canPerceive(actor.id,object.id,field)||!lineOfSight(field,actor.position,object.position))return fail("target_not_reachable",field);
 // Only damage effects are supported until object-specific secondary effects are defined.
 if(!t.effects?.length||t.effects.some(e=>e.type!=="damage"))return fail("object_effect_unsupported",field);
 if(!object.defense||!Number.isFinite(object.defense.DR)||!Number.isFinite(object.defense.armor)||!object.defense.resistance)return fail("object_defense_unassigned",field);
 const registry=createTechniqueRegistry([{...t,id,name:actor.boardTechniqueName||t.name,tier:actor.boardTechniqueTier,classRequirements:t.classRequirements||[actor.class],target:{type:"entity"},geometry:{...(t.geometry||{kind:"range",range:1,minRange:1}),lineOfSight:true},chessMotion:t.chessMotion||actor.boardMotion,cost:t.cost||{ap:actor.boardTechniqueCost,ea:actor.boardTechniqueEaCost},uses:t.uses??actor.boardTechniqueUsesMax}]);
 // Ephemeral target projection, not a living combatant or a team member.
 const target={id:object.id,type:"object",alive:true,position:structuredClone(object.position),hp:{current:object.durability,max:object.maxDurability},defense:structuredClone(object.defense),ea:{affinities:object.affinities||[]}};
 const candidate={...field,activeSide:actor.side,acted:{},entities:{...field.entities,[actor.id]:{...actor,acted:false},[object.id]:target}};
 const request={actorId:actor.id,techniqueId:id,target:{entityId:object.id}};
 const validation=validateTechniqueIntent(candidate,request,registry);
 if(!validation.ok)return fail(validation.reason,field);
 return {ok:true,candidate,request,registry,object};
}
export function validateObjectTechnique(field,intent,profiles,canPerceive){const p=prepare(field,intent,profiles,canPerceive);return p.ok?{ok:true}:p}
export function resolveObjectTechnique(field,intent,{profiles,canPerceive,eventId,chart={}}){
 if(!eventId||field.ledger.some(e=>e.id===eventId))return fail("duplicate_or_missing_event",field);
 const p=prepare(field,intent,profiles,canPerceive);if(!p.ok)return p;
 const r=resolveTechniqueIntent(p.candidate,p.request,p.registry,{affinityChart:chart});if(!r.ok)return fail(r.reason,field);
 const previous=p.object,nextDurability=r.field.entities[previous.id].hp.current;
 const updated={...previous,durability:nextDurability,condition:condition(nextDurability,previous.maxDurability)};
 const entities={...r.field.entities};delete entities[previous.id];
 const next=emitEvent({...r.field,entities,objects:{...field.objects,[previous.id]:updated}},{id:eventId,type:"object_damage_resolved",actorId:intent.actorId,objectId:previous.id,techniqueId:p.request.techniqueId,previousDurability:previous.durability,newDurability:nextDurability,damage:previous.durability-nextDurability,condition:updated.condition,costs:r.costs});
 return {ok:true,field:next,damage:previous.durability-nextDurability,object:updated,costs:r.costs};
}
