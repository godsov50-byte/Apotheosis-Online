import test from "node:test";
import assert from "node:assert/strict";
import {createRacialRegistry,createEnvoyFromCreation} from "../engine/character-creation-pipeline.mjs";
const registry=createRacialRegistry([{id:"test-lineage",name:"Test Lineage",naturalAffinity:"Fire",attributeModifiers:{STR:2,CON:1},hpFlat:3,modifiers:{defense:{DR:1,resistance:{fire:0.1}}},traits:["night-vision"],racialTechniques:["racial-spark"],rarityProfiles:[{rarityId:"common",attributeModifiers:{DEX:1},hpFlat:2},{rarityId:"rare",attributeModifiers:{ATT:3},hpFlat:5,modifiers:{defense:{DR:2}},traits:["rare-sense"]}]}]);
const base={STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10,ATT:10};
test("racial and rarity modifiers remain separate and produce HP from explicit vitality rule",()=>{
 const r=createEnvoyFromCreation({id:"envoy",name:"Envoy",side:"white",raceId:"test-lineage",rarityId:"rare",characterTier:9,baseAttributes:base,vitality:{base:10,perConstitution:2,racialHpFlat:0}},registry);
 assert.equal(r.ok,true);assert.equal(r.entity.stats.STR,12);assert.equal(r.entity.stats.CON,11);assert.equal(r.entity.stats.ATT,13);
 assert.equal(r.entity.hp.max,40);assert.deepEqual(r.entity.ea.affinities,["Fire"]);assert.equal(r.entity.racialModifiers.defense.DR,1);assert.equal(r.entity.rarityModifiers.defense.DR,2);assert.ok(r.entity.traits.includes("rare-sense"));
 assert.deepEqual(r.breakdown.racialModifiers,{STR:2,DEX:0,CON:1,INT:0,WIS:0,CHA:0,ATT:0});
});
test("no fixed point pool is imposed; every base attribute must be explicit",()=>{
 const r=createEnvoyFromCreation({id:"x",name:"x",side:"white",raceId:"test-lineage",rarityId:"common",characterTier:9,baseAttributes:{STR:30},vitality:{base:10,perConstitution:1,racialHpFlat:0}},registry);
 assert.equal(r.reason,"complete_base_attributes_required");
});
test("race, rarity and character Tier are independently validated",()=>{
 assert.equal(createEnvoyFromCreation({id:"x",name:"x",side:"white",raceId:"missing",rarityId:"common",characterTier:9,baseAttributes:base,vitality:{base:10,perConstitution:1,racialHpFlat:0}},registry).reason,"unknown_race");
 assert.equal(createEnvoyFromCreation({id:"x",name:"x",side:"white",raceId:"test-lineage",rarityId:"common",characterTier:10,baseAttributes:base,vitality:{base:10,perConstitution:1,racialHpFlat:0}},registry).reason,"character_tier_must_be_0_to_9");
});
