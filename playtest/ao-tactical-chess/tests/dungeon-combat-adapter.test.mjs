import test from "node:test";
import assert from "node:assert/strict";
import {beginDungeonEncounter,resolveDungeonCombat,projectDungeonCombat} from "../engine/dungeon-combat-adapter.mjs";
const unit=(id,side,pos,overrides={})=>({id,name:id,side,pos,cls:"Saber",pattern:"King",tier:9,hp:20,maxHp:20,ac:10,dr:2,atk:5,dmg:10,ap:8,apMax:8,ea:6,eaMax:6,facing:"N",...overrides});
const start=(overrides={})=>beginDungeonEncounter({units:[unit("borin","white","E3"),unit("liora","white","D3"),unit("guardian","black","E4",overrides)],revision:11,participantIds:["borin","liora"],enemyId:"guardian"});
const act=(s,actor,type,extra={})=>resolveDungeonCombat(s,{revision:s.revision,type,...extra},{actorId:actor,roll:20});
test("uses existing damage calculation, preserves input and ignores forged client damage",()=>{
 const s=start();const before=structuredClone(s);
 const r=act(s,"borin","attack",{targetId:"guardian",damagePackets:[{type:"physical",amount:999}]});
 assert.equal(r.ok,true);assert.equal(r.next.field.entities.guardian.hp.current,12);assert.deepEqual(s,before);
 assert.equal(r.next.revision,12);assert.ok(r.events.some(e=>e.type==="attack_resolved"));
});
test("out-of-turn actors and stale revisions cannot change combat",()=>{
 const s=start();assert.equal(act(s,"liora","attack",{targetId:"guardian"}).reason,"not_your_activation");
 assert.equal(resolveDungeonCombat(s,{type:"attack",revision:10,targetId:"guardian"},{actorId:"borin",roll:20}).reason,"stale_revision");
});
test("activation rotates across both Envoys and the creature",()=>{
 let s=start();s=act(s,"borin","end_turn").next;assert.equal(projectDungeonCombat(s).activeActorId,"liora");
 s=act(s,"liora","end_turn").next;assert.equal(projectDungeonCombat(s).activeActorId,"guardian");
 s=act(s,"guardian","end_turn").next;assert.equal(projectDungeonCombat(s).activeActorId,"borin");assert.equal(s.round,2);
});
test("defeat origin is recorded once, on the original creature square",()=>{
 const s=start({hp:4,maxHp:4});const r=act(s,"borin","attack",{targetId:"guardian"});
 assert.equal(r.ok,true);assert.equal(r.next.status,"victory");assert.equal(r.next.dropOrigins.length,1);assert.equal(r.next.dropOrigins[0].position,"E4");
 assert.equal(act(r.next,"borin","attack",{targetId:"guardian"}).reason,"encounter_inactive");
});
test("temple obstacles and the exterior are not legal combat destinations",()=>{
 const s=start();assert.equal(act(s,"borin","move",{destination:"F4"}).ok,false);
 assert.equal(act(s,"borin","move",{destination:"E1"}).ok,false);
});
test("server-owned technique profile spends AP/EA and uses",()=>{
 const s=beginDungeonEncounter({revision:0,participantIds:["borin","liora"],enemyId:"guardian",units:[
 unit("borin","white","E3",{technique:"Shield Pulse",techniqueId:"pulse",techniqueTier:9,uses:3,techniqueProfile:{id:"pulse",name:"Shield Pulse",tier:9,target:{type:"enemy"},geometry:{kind:"range",range:1,minRange:1},cost:{ap:3,ea:2},uses:3,effects:[{type:"damage",packets:[{type:"physical",amount:10}]}]}}),
 unit("liora","white","D3"),unit("guardian","black","E4")
 ]});
 const r=act(s,"borin","technique",{targetId:"guardian"});assert.equal(r.ok,true);
 assert.equal(r.next.field.entities.borin.ap.current,5);assert.equal(r.next.field.entities.borin.ea.current,4);
 assert.equal(r.next.field.entities.guardian.hp.current,12);
});
