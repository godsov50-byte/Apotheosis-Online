/**
 * Persistent dungeon integration boundary. Server-side only.
 * This adapter deliberately calls the existing AO Chess bridge rather than
 * implementing a second attack, DR, resistance, or technique calculator.
 * A trusted persistence layer must authenticate actorId, supply the profiles,
 * choose the d20 roll, and atomically commit next state against revision.
 */
import { createBoardField, resolveBoardMove, resolveBoardAttack,
  resolveBoardTechnique, projectBoardUnits } from "./board-engine-bridge.mjs";
import { setCell, lineOfSight, recoverResources, emitEvent } from "./ao-chess-engine.mjs";

const clone = structuredClone;
const fail = reason => ({ ok:false, reason });
const cell = p => /^[A-H][1-8]$/.test(p) ? {x:p.charCodeAt(0)-65,y:8-Number(p.slice(1)),z:0} : null;
const address = p => String.fromCharCode(65+p.x)+(8-p.y);
const crossesExterior = (a,b) => (a.y===7)!==(b.y===7);
const inside = p => p.y<7;
const blocked = ["C4","F4","C6","F6","H5","H6","H3"];

/** Create from the authoritative dungeon snapshot, never a client's stats. */
export function beginDungeonEncounter({units, revision, participantIds, enemyId, chart={}}) {
  if (!Number.isInteger(revision)||!Array.isArray(participantIds)||!participantIds.length||
      new Set(participantIds).size!==participantIds.length) throw Error("invalid encounter identity");
  if (!Array.isArray(units)||units.length!==participantIds.length+1) throw Error("unexpected participants");
  const roster=units.map(u=>{
    const p=cell(u.pos);
    if(!p||!inside(p)||blocked.includes(u.pos)) throw Error("invalid encounter position");
    if(u.id===enemyId ? u.side!=="black" : !participantIds.includes(u.id)||u.side!=="white") throw Error("invalid allegiance");
    if(!Number.isFinite(u.dmg)||u.dmg<0) throw Error("missing basic attack profile");
    return {...clone(u),x:p.x,y:p.y};
  });
  if(!roster.some(u=>u.id===enemyId)||!participantIds.every(id=>roster.some(u=>u.id===id)))throw Error("missing combatant");
  let field=createBoardField(roster);
  for(const p of blocked.map(cell))field=setCell(field,p,{blocked:true,opaque:true});
  // The exterior is outside this encounter; connector transitions remain
  // the responsibility of the persistent spatial engine.
  for(let x=0;x<8;x++)field=setCell(field,{x,y:7,z:0},{blocked:true,opaque:true});
  const order=[...participantIds,enemyId];
  return {revision,field,roster,order,activeIndex:0,round:1,enemyId,chart:clone(chart),status:"active",dropOrigins:[]};
}

/** A server-supplied roll and authenticated identity are separate from intent. */
export function resolveDungeonCombat(state,intent,{actorId,roll}={}) {
  if(state.status!=="active")return fail("encounter_inactive");
  if(intent?.revision!==state.revision)return fail("stale_revision");
  const active=state.order[state.activeIndex], actor=state.field.entities[actorId];
  if(actorId!==active||!actor?.alive)return fail("not_your_activation");
  let field=state.field,result,activeIndex=state.activeIndex,round=state.round;
  const id="dungeon-"+state.revision+"-"+actorId;
  const kind=intent.type;
  if(kind==="end_turn"){
    let steps=0;
    do {activeIndex=(activeIndex+1)%state.order.length;if(activeIndex===0)round++;steps++}
    while(!field.entities[state.order[activeIndex]]?.alive&&steps<state.order.length);
    const next=field.entities[state.order[activeIndex]];
    field={...field,round,activeSide:next.side,acted:{},entities:{...field.entities,[next.id]:recoverResources(next,{ap:next.ap.max})}};
    field=emitEvent(field,{id,type:"dungeon_activation_ended",actorId,nextActorId:next.id,round});
  }else if(kind==="move"){
    const to=cell(intent.destination||"");if(!to||!inside(to)||crossesExterior(actor.position,to))return fail("connector_transition_requires_exploration");
    result=resolveBoardMove(field,{actorId,to,eventId:id});
  }else if(kind==="attack"||kind==="technique"){
    const target=field.entities[intent.targetId];
    if(!target?.alive||target.side===actor.side)return fail("invalid_target");
    if(!lineOfSight(field,actor.position,target.position))return fail("blocked_los");
    if(!Number.isInteger(roll)||roll<1||roll>20)return fail("server_roll_required");
    const profile=state.roster.find(u=>u.id===actorId);
    if(kind==="attack"){
      const packets=profile.basicDamagePackets||[{type:"physical",amount:profile.dmg}];
      result=resolveBoardAttack(field,{attackerId:actorId,defenderId:target.id,roll,damagePackets:clone(packets),chart:state.chart,eventId:id});
    }else{
      // Only the server-owned learned/equipped technique profile may supply
      // damage and resource costs. No client-supplied damage or bonuses.
      if(!actor.boardTechniqueProfile?.effects?.some(e=>e.type==="damage"))return fail("technique_profile_required");
      result=resolveBoardTechnique(field,{actorId,defenderId:target.id,roll,chart:state.chart,eventId:id});
    }
  }else return fail("unsupported_intent");
  if(result&&!result.ok)return fail(result.reason||"engine_rejected");
  if(result)field=result.field;
  const enemy=field.entities[state.enemyId];
  const status=!enemy.alive?"victory":state.order.filter(x=>x!==state.enemyId).every(x=>!field.entities[x]?.alive)?"defeat":"active";
  // Defeat source is recorded, not fabricated loot. The existing
  // drop-resource pipeline must generate actual drops using approved profiles.
  const dropOrigins=[...state.dropOrigins];
  if(status==="victory"&&!dropOrigins.some(x=>x.sourceId===enemy.id))dropOrigins.push({sourceId:enemy.id,position:address(state.field.entities[enemy.id].position),eventId:id});
  const next={...state,revision:state.revision+1,field,activeIndex,round,status,dropOrigins};
  return {ok:true,next,events:field.ledger.slice(state.field.ledger.length)};
}

/** Trusted projection only. Perceiver filtering must precede any client response. */
export function projectDungeonCombat(state){
  return {revision:state.revision,round:state.round,status:state.status,activeActorId:state.order[state.activeIndex],
    units:projectBoardUnits(state.roster,state.field,{includeDefeated:true}).map(u=>({...u,pos:address(u)})),
    dropOrigins:clone(state.dropOrigins)};
}
