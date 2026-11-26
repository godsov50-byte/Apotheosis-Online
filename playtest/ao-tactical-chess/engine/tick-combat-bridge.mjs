/** Server-side integration boundary for one closed AO local tick.
 * Trusted inputs: authoritative field, persisted intents with authenticated
 * actor IDs, rules, perception resolver, deadlines and seeded roll provider.
 * Never accept those inputs from a browser. No persistence side effects here.
 */
import {resolveBoardAttack,resolveBoardTechnique,resolveBoardMove,isBoardMotionLegal} from "./board-engine-bridge.mjs";
import {lineOfSight,traceLine,getCell,reaction,emitEvent} from "./ao-chess-engine.mjs";
const clone=structuredClone;
const fail=reason=>({ok:false,reason});
const validRoll=r=>Number.isInteger(r)&&r>=1&&r<=20;
const addr=p=>String.fromCharCode(65+p.x)+(8-p.y);
const toCell=p=>typeof p==="string"&&/^[A-H][1-8]$/.test(p)?{x:p.charCodeAt(0)-65,y:8-Number(p[1]),z:0}:null;
function fresh(field,actor){return {...field,activeSide:actor.side,acted:{},entities:{...field.entities,[actor.id]:{...actor,acted:false}}}}
function pathClear(field,a,b){return traceLine(a,b).every(p=>!getCell(field,p).blocked)}
function validate(field,i,profiles,canPerceive){
 const a=field.entities[i.actorId];
 if(!a?.alive)return "actor_unavailable";
 if(i.type==="wait")return null;
 if(i.type==="move"){
  const b=toCell(i.destination);
  if(!b||b.y===7||!isBoardMotionLegal(field,a,b)||!pathClear(field,a.position,b))return "invalid_motion";
  if(Object.values(field.entities).some(e=>e.alive&&e.id!==a.id&&e.position.x===b.x&&e.position.y===b.y))return "occupied_cell";
  return null;
 }
 if(!["attack","technique"].includes(i.type))return "unsupported_intent";
 const d=field.entities[i.targetId];
 if(!d?.alive||a.id===d.id||a.side===d.side)return "invalid_target";
 if(!canPerceive(a.id,d.id,field)||!lineOfSight(field,a.position,d.position)||!isBoardMotionLegal(field,a,d.position))return "target_not_reachable";
 const profile=profiles[a.id];
 if(!profile)return "profile_required";
 if(i.type==="attack"&&(!Array.isArray(profile.basicDamagePackets)||!profile.basicDamagePackets.length))return "attack_profile_required";
 if(i.type==="technique"){
  if(!a.boardTechniqueId||!a.boardTechniqueProfile?.effects?.some(e=>e.type==="damage"))return "technique_profile_required";
  if(profile.requiredTechniqueEquipment&&!profile.equippedCategories?.includes(profile.requiredTechniqueEquipment))return "equipment_requirement";
  const t=a.boardTechniqueProfile;
  if(a.ap.current<(t.cost?.ap??a.boardTechniqueCost)||a.ea.current<(t.cost?.ea??a.boardTechniqueEaCost))return "insufficient_resources";
  if((a.techniqueState?.[a.boardTechniqueId]?.used||0)>=a.boardTechniqueUsesMax)return "uses_exhausted";
  if((a.techniqueState?.[a.boardTechniqueId]?.cooldownRemaining||0)>0)return "cooldown";
 }
 return null;
}
export function prepareCombatTick({field,revision,tickId,intents,profiles,canPerceive,guardRule,responseDeadline,now}){
 if(!Number.isInteger(revision)||!tickId||!Array.isArray(intents)||typeof canPerceive!=="function"||!Number.isFinite(now)||!Number.isFinite(responseDeadline)||responseDeadline<=now)return fail("invalid_tick");
 if(new Set(intents.map(i=>i.actorId)).size!==intents.length)return fail("duplicate_actor_intent");
 const ordered=[...intents].map(i=>({actorId:i.actorId,type:i.type,targetId:i.targetId,destination:i.destination})).sort((a,b)=>(profiles[b.actorId]?.priority??0)-(profiles[a.actorId]?.priority??0)||a.actorId.localeCompare(b.actorId));
 const rejected=[],accepted=[],windows=[];
 for(const i of ordered){
  const reason=validate(field,i,profiles,canPerceive);
  if(reason){rejected.push({actorId:i.actorId,reason});continue}
  accepted.push(i);
  const d=field.entities[i.targetId];
  if(d&&guardRule&&["attack","technique"].includes(i.type)&&canPerceive(d.id,i.actorId,field)&&d.reaction?.ready&&d.ap.current>=guardRule.apCost&&guardRule.apCost>=0&&guardRule.acBonus>=0){
    windows.push({id:tickId+":"+i.actorId+":"+d.id,actorId:d.id,sourceId:i.actorId,deadline:responseDeadline,options:["guard","pass"]});
  }
 }
 return {ok:true,plan:{revision,tickId,accepted,rejected,windows,responseDeadline}};
}
// Only the affected viewer receives their own response windows.
export const projectResponseWindows=(plan,actorId)=>plan.windows.filter(w=>w.actorId===actorId).map(({id,deadline,options})=>({id,deadline,options}));
export function resolveCombatTick({field,revision,plan,responses,profiles,canPerceive,guardRule,rollFor,now,chart={}}){
 if(plan.revision!==revision)return fail("stale_revision");
 if(typeof rollFor!=="function"||!Number.isFinite(now)||!Array.isArray(responses))return fail("invalid_resolution");
 const decisions=new Map();
 for(const r of responses){
  const w=plan.windows.find(w=>w.id===r.windowId&&w.actorId===r.actorId);
  if(!w||!w.options.includes(r.choice)||decisions.has(w.id))return fail("invalid_response");
  decisions.set(w.id,r.choice);
 }
 if(now<plan.responseDeadline&&plan.windows.some(w=>!decisions.has(w.id)))return fail("response_pending");
 let next=clone(field);const results=[...plan.rejected],defeats=[];
 for(const i of plan.accepted){
  const reason=validate(next,i,profiles,canPerceive);
  if(reason){results.push({actorId:i.actorId,status:"rejected",reason});continue}
  if(i.type==="wait"){results.push({actorId:i.actorId,status:"committed"});continue}
  const actor=next.entities[i.actorId], eventId=plan.tickId+":"+i.actorId;
  if(i.type==="move"){
   const r=resolveBoardMove(fresh(next,actor),{actorId:actor.id,to:toCell(i.destination),eventId});
   if(r.ok){next=r.field;results.push({actorId:actor.id,status:"committed"})}else results.push({actorId:actor.id,status:"rejected",reason:r.reason});
   continue;
  }
  const d=next.entities[i.targetId],w=plan.windows.find(w=>w.actorId===d.id&&w.sourceId===actor.id),roll=rollFor(eventId);
  if(!validRoll(roll))return fail("server_roll_required");
  let candidate=fresh(next,actor),guarded=false,originalAC=d.defense.AC;
  if(w&&decisions.get(w.id)==="guard"&&guardRule&&d.reaction.ready&&d.ap.current>=guardRule.apCost&&canPerceive(d.id,actor.id,next)){
   candidate=reaction(candidate,d.id,{type:"guard",cost:guardRule.apCost,eventId:eventId+":guard"}).field;
   const u=candidate.entities[d.id];
   candidate={...candidate,entities:{...candidate.entities,[d.id]:{...u,defense:{...u.defense,AC:originalAC+guardRule.acBonus}}}};guarded=true;
  }
  const r=i.type==="attack"?resolveBoardAttack(candidate,{attackerId:actor.id,defenderId:d.id,roll,damagePackets:clone(profiles[actor.id].basicDamagePackets),eventId,chart,captureAdvance:false}):resolveBoardTechnique(candidate,{actorId:actor.id,defenderId:d.id,roll,eventId,chart,captureAdvance:false});
  if(!r.ok){results.push({actorId:actor.id,status:"rejected",reason:r.reason});continue}
  next=r.field;
  if(guarded){const u=next.entities[d.id];next={...next,entities:{...next.entities,[d.id]:{...u,defense:{...u.defense,AC:originalAC}}}}}
  if(d.alive&&!next.entities[d.id].alive)defeats.push({entityId:d.id,position:addr(d.position),eventId});
  results.push({actorId:actor.id,status:"committed",hit:r.hit,damage:r.damage,guarded});
 }
 next=emitEvent({...next,activeSide:null,acted:{}},{id:plan.tickId+":commit",type:"combat_tick_committed",revision:revision+1});
 return {ok:true,revision:revision+1,field:next,results,defeats,events:next.ledger.slice(field.ledger.length)};
}
