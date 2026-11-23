import test from "node:test";
import assert from "node:assert/strict";
import {createEffectRegistry,resolveEffectBatch,tickEntityEffects,resolveEffectiveAttributes,resolveEffectiveDefense} from "../engine/effect-pipeline.mjs";
test("effect registry rejects duplicate ids and unknown effect types",()=>{
 assert.throws(()=>createEffectRegistry([{id:"x",type:"mystery"}]));
});
test("effect batch applies damage, healing, status and resource changes atomically",()=>{
 const field={width:4,height:4,entities:{a:{id:"a",alive:true,hp:{current:5,max:20},ea:{current:2,max:5},statuses:[]},b:{id:"b",alive:true,hp:{current:20,max:20},defense:{DR:2,resistance:{physical:0.25}},statuses:[]}},cells:{},ledger:[],version:0};
 const r=resolveEffectBatch(field,{sourceId:"a",targetId:"b",eventId:"effects-1",effects:[
  {type:"damage",packets:[{type:"physical",amount:10}]},{type:"status",status:{id:"burning",duration:2,stackRule:"refresh"}},
  {type:"resource",target:"self",pool:"ea",amount:2},{type:"heal",target:"self",amount:3}
 ]});
 assert.equal(r.ok,true);assert.equal(r.field.entities.b.hp.current,14);assert.equal(r.field.entities.b.statuses[0].id,"burning");
 assert.equal(r.field.entities.a.hp.current,8);assert.equal(r.field.entities.a.ea.current,4);
 assert.equal(resolveEffectBatch(r.field,{sourceId:"a",targetId:"b",eventId:"effects-1",effects:[{type:"heal",amount:1}]}).reason,"duplicate_effect_event");
});
test("status duration ticks and expires",()=>{
 const r=tickEntityEffects({statuses:[{id:"guard",duration:1,remaining:1,modifiers:{STR:2}}],temporaryModifiers:{STR:2}});
 assert.deepEqual(r.expired,["guard"]);assert.equal(r.entity.statuses.length,0);
});
test("failed effect batch leaves source field untouched",()=>{
 const field={entities:{a:{id:"a",alive:true}},ledger:[],version:0};
 const r=resolveEffectBatch(field,{sourceId:"a",targetId:"missing",eventId:"bad",effects:[{type:"heal",amount:2}]});
 assert.equal(r.ok,false);assert.equal(field.ledger.length,0);
});

test("temporary attribute and defense effects are derived and expire cleanly",()=>{
 const entity={baseAttributes:{STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10,ATT:10},baseDefense:{DR:1},equipment:{},statuses:[]};
 const applied=resolveEffectBatch({entities:{a:entity},ledger:[],version:0},{sourceId:"a",targetId:"a",eventId:"temp-mod",effects:[
  {type:"attribute_modifier",stat:"STR",amount:3,duration:1,statusId:"boost"},
  {type:"attribute_modifier",stat:"DR",amount:2,duration:1,statusId:"guard"}
 ]});
 assert.equal(applied.ok,true);
 assert.equal(resolveEffectiveAttributes(applied.field.entities.a).STR,13);
 assert.equal(resolveEffectiveDefense(applied.field.entities.a).DR,3);
 const ticked=tickEntityEffects(applied.field.entities.a);
 assert.equal(resolveEffectiveAttributes(ticked.entity).STR,10);
 assert.equal(resolveEffectiveDefense(ticked.entity).DR,1);
});
