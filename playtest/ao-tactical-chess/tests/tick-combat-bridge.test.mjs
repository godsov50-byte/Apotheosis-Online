import test from "node:test";
import assert from "node:assert/strict";
import {createBoardField} from "../engine/board-engine-bridge.mjs";
import {setCell} from "../engine/ao-chess-engine.mjs";
import {prepareCombatTick,resolveCombatTick,projectResponseWindows} from "../engine/tick-combat-bridge.mjs";
const unit=(id,side,x,y,overrides={})=>({id,name:id,side,x,y,cls:"Saber",pattern:"King",tier:9,hp:20,maxHp:20,ac:10,dr:2,atk:5,dmg:10,ap:8,apMax:8,ea:6,eaMax:6,facing:"N",...overrides});
const fixture=(units=[unit("borin","white",4,5),unit("guardian","black",4,4)],overrides={})=>({
 field:createBoardField(units),revision:11,tickId:"test-1",profiles:{borin:{priority:2,basicDamagePackets:[{type:"physical",amount:10}]},guardian:{priority:1,basicDamagePackets:[{type:"physical",amount:7}]}},canPerceive:()=>true,guardRule:{apCost:1,acBonus:5},responseDeadline:2000,now:0,...overrides
});
const attack={actorId:"borin",type:"attack",targetId:"guardian"};
const resolve=(f,plan,responses=[],extra={})=>resolveCombatTick({...f,plan,responses,now:2000,rollFor:()=>20,...extra});
test("tick staging leaves world unchanged; response windows are viewer scoped",()=>{
 const f=fixture(),before=structuredClone(f.field),p=prepareCombatTick({...f,intents:[attack]});
 assert.equal(p.ok,true);assert.deepEqual(f.field,before);assert.equal(projectResponseWindows(p.plan,"borin").length,0);assert.equal(projectResponseWindows(p.plan,"guardian").length,1);
 assert.equal(resolve(f,p.plan,[],{now:1000}).reason,"response_pending");
 assert.equal(resolve(f,p.plan,[{actorId:"borin",windowId:p.plan.windows[0].id,choice:"guard"}]).reason,"invalid_response");
});
test("existing attack resolver uses trusted packets rather than client numbers",()=>{
 const f=fixture(),p=prepareCombatTick({...f,intents:[{...attack,damagePackets:[{type:"physical",amount:999}],roll:20}]});
 const r=resolve(f,p.plan);assert.equal(r.ok,true);assert.equal(r.field.entities.guardian.hp.current,12);assert.equal(r.revision,12);
 assert.equal(r.events.some(e=>e.type==="attack_resolved"),true);
 assert.equal(resolve(f,p.plan,[],{revision:12}).reason,"stale_revision");
});
test("guard response consumes AP, modifies only the immediate attack and preserves equipment stats",()=>{
 const f=fixture(),p=prepareCombatTick({...f,intents:[attack]});
 const r=resolve(f,p.plan,[{actorId:"guardian",windowId:p.plan.windows[0].id,choice:"guard"}],{rollFor:()=>7});
 assert.equal(r.ok,true);assert.equal(r.field.entities.guardian.hp.current,20);assert.equal(r.field.entities.guardian.ap.current,7);assert.equal(r.field.entities.guardian.defense.AC,10);assert.equal(r.field.entities.guardian.reaction.ready,false);
});
test("blocked or unperceived threats grant no window",()=>{
 const f=fixture([unit("borin","white",4,5),unit("guardian","black",4,4)],{canPerceive:(viewer)=>viewer==="borin"});
 assert.equal(prepareCombatTick({...f,intents:[attack]}).plan.windows.length,0);
 const g=fixture([unit("borin","white",4,5,{pattern:"Rook"}),unit("guardian","black",4,2)]);g.field=setCell(g.field,{x:4,y:3,z:0},{blocked:true,opaque:true});
 const p=prepareCombatTick({...g,intents:[attack]});assert.equal(p.plan.accepted.length,0);assert.equal(p.plan.windows.length,0);
});
test("defeat preserves the original position and does not teleport attacker",()=>{
 const f=fixture([unit("borin","white",4,5),unit("guardian","black",4,4,{hp:4,maxHp:4})]);
 const r=resolve(f,prepareCombatTick({...f,intents:[attack]}).plan);
 assert.equal(r.ok,true);assert.equal(r.field.entities.guardian.alive,false);assert.equal(r.defeats[0].position,"E4");assert.deepEqual(r.field.entities.borin.position,{x:4,y:5,z:0});
});
test("opposing intents resolve by trusted priority, not arrival order",()=>{
 const f=fixture([unit("borin","white",4,5),unit("guardian","black",6,5)]);
 const intents=[{actorId:"guardian",type:"move",destination:"F3"},{actorId:"borin",type:"move",destination:"F3"}];
 const r=resolve(f,prepareCombatTick({...f,intents}).plan);
 assert.equal(r.ok,true);assert.equal(r.field.entities.borin.position.x,5);assert.equal(r.field.entities.guardian.position.x,6);assert.equal(r.results.find(x=>x.actorId==="guardian").status,"rejected");
});
test("unequipped shield gates technique without spending resources",()=>{
 const f=fixture([unit("borin","white",4,5,{cls:"Shielder",technique:"Shield Pulse",techniqueId:"pulse",techniqueTier:9,uses:3,techniqueProfile:{id:"pulse",name:"Shield Pulse",tier:9,target:{type:"enemy"},geometry:{kind:"range",range:1,minRange:1},cost:{ap:3,ea:2},uses:3,effects:[{type:"damage",packets:[{type:"physical",amount:10}]}]}}),unit("guardian","black",4,4)]);
 f.profiles.borin.requiredTechniqueEquipment="Shield";f.profiles.borin.equippedCategories=[];
 const p=prepareCombatTick({...f,intents:[{...attack,type:"technique"}]});assert.equal(p.plan.rejected[0].reason,"equipment_requirement");assert.equal(p.plan.windows.length,0);
 f.profiles.borin.equippedCategories=["Shield"];
 const q=prepareCombatTick({...f,intents:[{...attack,type:"technique"}]});const r=resolve(f,q.plan);assert.equal(r.ok,true);assert.equal(r.field.entities.borin.ap.current,5);assert.equal(r.field.entities.borin.ea.current,4);assert.equal(r.field.entities.guardian.hp.current,12);
});
