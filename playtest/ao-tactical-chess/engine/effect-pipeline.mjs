/**
 * AO effect/status pipeline. Effects are independent records applied by techniques,
 * equipment, racial traits, environmental sources, and combat events.
 * Numeric magnitudes and durations are supplied by versioned content data.
 */
const clone=value=>structuredClone(value);
const num=(v,d=0)=>Number.isFinite(v)?v:d;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const key=p=>`${p.x},${p.y},${p.z||0}`;
const fail=(reason,field)=>({ok:false,reason,field});
export const EFFECT_TYPES=Object.freeze(["damage","heal","status","remove_status","resource","attribute_modifier","displace","terrain"]);
export function createEffect(definition){
 if(!definition?.id||!EFFECT_TYPES.includes(definition.type))throw new Error("effect id and supported type required");
 return {id:definition.id,type:definition.type,tags:[...(definition.tags||[])],target:definition.target||"target",...clone(definition)};
}
export function createEffectRegistry(definitions=[]){
 const records={};for(const d of definitions){const e=createEffect(d);if(records[e.id])throw new Error("duplicate effect id: "+e.id);records[e.id]=e;}return records;
}
function applyStatus(statuses,status){
 if(!status?.id)throw new Error("status id required");
 const list=[...statuses],i=list.findIndex(s=>s.id===status.id);
 if(i<0)list.push({...clone(status),stacks:Math.max(1,num(status.stacks,1))});
 else if(status.stackRule==="refresh")list[i]={...list[i],duration:Math.max(num(list[i].duration),num(status.duration)),remaining:Math.max(num(list[i].remaining,list[i].duration),num(status.duration))};
 else if(status.stackRule==="stack")list[i]={...list[i],stacks:num(list[i].stacks,1)+num(status.stacks,1)};
 else if(status.stackRule==="replace")list[i]=clone(status);
 else return null;
 return list;
}
function damage(target,packet){
 if(packet.trueDamage===true||packet.type==="true")return Math.max(0,num(packet.amount));
 const penetration=Math.max(0,num(packet.penetration));
 const armor=Math.max(0,num(target.defense?.armor)-penetration);
 const dr=Math.max(0,num(target.defense?.DR)-penetration);
 const after=Math.max(0,num(packet.amount)-armor-dr);
 const resistance=clamp(num(target.defense?.resistance?.[packet.type||"physical"]),-1,1);
 return Math.max(0,after*(1-resistance));
}
export function resolveEffectBatch(field,{sourceId,targetId,effects=[],eventId,context={}}={}){
 if(!eventId||!Array.isArray(effects)||!effects.length)return fail("effect_batch_and_event_id_required",field);
 if((field.ledger||[]).some(e=>e.id===eventId))return fail("duplicate_effect_event",field);
 const next=clone(field),source=next.entities?.[sourceId],target=next.entities?.[targetId];
 if(sourceId&&!source)return fail("effect_source_missing",field);
 if(targetId&&!target)return fail("effect_target_missing",field);
 const outcomes=[];
 for(const effect of effects){
  if(!EFFECT_TYPES.includes(effect.type))return fail("unsupported_effect_type",field);
  const recipient=effect.target==="self"?source:effect.target==="source"?source:target;
  if(effect.type==="damage"){
   if(!recipient?.hp)return fail("damage_target_has_no_hp",field);
   const packets=effect.packets||[{type:effect.damageType||"physical",amount:effect.amount,penetration:effect.penetration,trueDamage:effect.trueDamage}];
   const amount=Math.round(packets.reduce((sum,p)=>sum+damage(recipient,p),0));
   recipient.hp.current=Math.max(0,num(recipient.hp.current)-amount);
   if(effect.break!=null)recipient.defense={...(recipient.defense||{}),break:num(recipient.defense?.break)+num(effect.break)};
   if(recipient.hp.current<=0)recipient.alive=false;
   outcomes.push({type:"damage",targetId:recipient.id,amount,break:num(effect.break)});
  }else if(effect.type==="heal"){
   if(!recipient?.hp)return fail("heal_target_has_no_hp",field);
   const amount=Math.max(0,num(effect.amount));
   recipient.hp.current=Math.min(num(recipient.hp.max,recipient.hp.current),recipient.hp.current+amount);
   outcomes.push({type:"heal",targetId:recipient.id,amount});
  }else if(effect.type==="status"){
   if(!recipient)return fail("status_target_missing",field);
   const statuses=applyStatus(recipient.statuses||[],effect.status);
   if(!statuses)return fail("status_stack_rule_invalid",field);
   recipient.statuses=statuses;outcomes.push({type:"status",targetId:recipient.id,statusId:effect.status.id});
  }else if(effect.type==="remove_status"){
   if(!recipient)return fail("status_target_missing",field);
   recipient.statuses=(recipient.statuses||[]).filter(s=>s.id!==effect.statusId);
   outcomes.push({type:"remove_status",targetId:recipient.id,statusId:effect.statusId});
  }else if(effect.type==="resource"){
   const pool=recipient?.[effect.pool];if(!pool)return fail("resource_pool_missing",field);
   const amount=num(effect.amount);pool.current=clamp(pool.current+amount,0,num(pool.max,pool.current+amount));
   outcomes.push({type:"resource",targetId:recipient.id,pool:effect.pool,amount});
  }else if(effect.type==="attribute_modifier"){
   if(!recipient)return fail("modifier_target_missing",field);
   const stat=effect.stat;if(!["STR","DEX","CON","INT","WIS","CHA","ATT"].includes(stat)||!Number.isFinite(effect.amount))return fail("invalid_attribute_modifier",field);
   const mods={...(recipient.temporaryModifiers||{})};mods[stat]=num(mods[stat])+effect.amount;recipient.temporaryModifiers=mods;
   outcomes.push({type:"attribute_modifier",targetId:recipient.id,stat,amount:effect.amount,duration:effect.duration??null});
  }else if(effect.type==="displace"){
   if(!recipient||!effect.to)return fail("displacement_target_missing",field);
   const to=clone(effect.to),occupied=Object.values(next.entities||{}).some(e=>e.id!==recipient.id&&e.alive!==false&&key(e.position)===key(to));
   const cell=next.cells?.[key(to)];
   if(occupied||cell?.blocked||to.x<0||to.y<0||to.x>=next.width||to.y>=next.height)return fail("displacement_blocked",field);
   recipient.position=to;outcomes.push({type:"displace",targetId:recipient.id,to});
  }else if(effect.type==="terrain"){
   if(!effect.position)return fail("terrain_position_missing",field);
   const k=key(effect.position),cell=next.cells?.[k]||{entities:[]};next.cells={...(next.cells||{}),[k]:{...cell,...clone(effect.patch||{})}};
   outcomes.push({type:"terrain",position:clone(effect.position),patch:clone(effect.patch||{})});
  }
 }
 if(source)next.entities[source.id]=source;if(target)next.entities[target.id]=target;
 next.ledger=[...(next.ledger||[]),{id:eventId,type:"effect_batch_resolved",sourceId:sourceId||null,targetId:targetId||null,context:clone(context),outcomes:clone(outcomes)}];
 next.version=(next.version||0)+1;
 return {ok:true,field:next,outcomes};
}
export function tickEntityEffects(entity,{phase="end_turn"}={}){
 const next=clone(entity),kept=[],expired=[];
 for(const status of next.statuses||[]){
  if(status.tickPhase&&status.tickPhase!==phase){kept.push(status);continue;}
  const remaining=status.remaining??status.duration;
  if(remaining==null){kept.push(status);continue;}
  const value=remaining-1;
  if(value<=0)expired.push(status.id);else kept.push({...status,remaining:value});
 }
 next.statuses=kept;
 const modifiers={...(next.temporaryModifiers||{})};
 for(const status of expired){delete modifiers[status];}
 next.temporaryModifiers=modifiers;
 return {entity:next,expired};
}
