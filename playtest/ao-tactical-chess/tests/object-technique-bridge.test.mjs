import test from "node:test";
import assert from "node:assert/strict";
import {createBoardField} from "../engine/board-engine-bridge.mjs";
import {setCell} from "../engine/ao-chess-engine.mjs";
import {prepareCombatTick,resolveCombatTick} from "../engine/tick-combat-bridge.mjs";
const pulse={id:"pulse",name:"Shield Pulse",tier:9,target:{type:"enemy"},geometry:{kind:"range",range:1,minRange:1},cost:{ap:3,ea:2},uses:3,effects:[{type:"damage",packets:[{type:"physical",amount:10}]}]};
function fixture(){
 let field=createBoardField([{id:"borin",name:"Borin",side:"white",x:3,y:4,cls:"Shielder",pattern:"King",tier:9,hp:42,maxHp:42,ap:8,apMax:8,ea:8,eaMax:8,technique:"Shield Pulse",techniqueId:"pulse",techniqueTier:9,uses:3,techniqueProfile:pulse}]);
 field=setCell(field,{x:3,y:3,z:0},{blocked:true,opaque:true});
 field={...field,objects:{pillar:{id:"pillar",type:"Pillar",position:{x:3,y:3,z:0},durability:30,maxDurability:100,condition:"Damaged",defense:{DR:0,armor:0,resistance:{}}}}};
 return {field,revision:11,tickId:"environment-1",profiles:{borin:{requiredTechniqueEquipment:"Shield",equippedCategories:["Shield"],objectTechniqueTargets:{pulse:["Pillar"]}}},canPerceive:()=>true,now:0,responseDeadline:2000};
}
const intent={actorId:"borin",type:"object_technique",targetId:"pillar"};
const plan=f=>prepareCombatTick({...f,intents:[intent]}).plan;
const resolve=(f,p=plan(f))=>resolveCombatTick({...f,plan:p,responses:[],now:2000,rollFor:()=>20});
test("same tick consumes AP EA and uses; object identity survives; no Envoy defeat or capture",()=>{
 const f=fixture(),before=structuredClone(f.field),p=plan(f);
 assert.equal(p.accepted.length,1);assert.equal(p.windows.length,0);assert.deepEqual(f.field,before);
 const r=resolve(f,p);assert.equal(r.ok,true);assert.equal(r.results[0].status,"committed");assert.equal(r.field.entities.borin.ap.current,5);assert.equal(r.field.entities.borin.ea.current,6);assert.equal(r.field.entities.borin.techniqueState.pulse.used,1);
 assert.equal(r.field.objects.pillar.id,"pillar");assert.equal(r.field.objects.pillar.durability,20);assert.equal(r.field.objects.pillar.condition,"Broken");assert.equal(r.field.entities.pillar,undefined);assert.deepEqual(r.defeats,[]);assert.deepEqual(r.field.entities.borin.position,f.field.entities.borin.position);assert.equal(r.events.filter(e=>e.type==="object_damage_resolved").length,1);
});
test("server-owned DR and damage; forged damage ignored",()=>{
 const f=fixture();f.field.objects.pillar.defense.DR=3;
 const p=prepareCombatTick({...f,intents:[{...intent,damage:1000,damagePackets:[{amount:1000}]}]}).plan;
 const r=resolve(f,p);assert.equal(r.field.objects.pillar.durability,23);
});
test("ineligible targets, missing shield, hidden target, exhausted uses and insufficient EA do not spend resources",()=>{
 for(const alter of [f=>f.profiles.borin.objectTechniqueTargets={},f=>f.profiles.borin.equippedCategories=[],f=>f.canPerceive=()=>false,f=>f.field.entities.borin.techniqueState.pulse.used=3,f=>f.field.entities.borin.ea.current=1,f=>f.field.objects.pillar.durability=0]){
 const f=fixture();alter(f);const before=structuredClone(f.field),p=plan(f);assert.equal(p.accepted.length,0);assert.deepEqual(f.field,before);const r=resolve(f,p);assert.deepEqual(r.field.entities,f.field.entities);assert.deepEqual(r.field.objects,f.field.objects);
 }
});
test("stale revisions rejected; object damage does not clear terrain implicitly",()=>{
 const f=fixture();f.field.objects.pillar.durability=10;const p=plan(f);assert.equal(resolve({...f,revision:12},p).reason,"stale_revision");
 const r=resolve(f,p);assert.equal(r.field.objects.pillar.condition,"Destroyed");assert.equal(r.field.cells["3,3,0"].blocked,true);
});
