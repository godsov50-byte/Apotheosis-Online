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

test("race, ancestry, optional sub-ancestry and racial rarity stack as separately traceable layers",()=>{
 const layered=createRacialRegistry([{
  id:"race-a",name:"Race A",attributeModifiers:{STR:2},hpFlat:1,
  modifiers:{defense:{DR:1}},traits:["race-trait"],
  ancestries:[{id:"ancestry-a",name:"Ancestry A",attributeModifiers:{DEX:1},hpFlat:2,
   modifiers:{defense:{AC:1}},traits:["ancestry-trait"],
   subAncestries:[{id:"sub-a",name:"Sub A",attributeModifiers:{CON:1},hpFlat:3,
    modifiers:{defense:{armor:2}},traits:["sub-trait"]}]}],
  rarityProfiles:[{rarityId:"grade-x",attributeModifiers:{ATT:2},hpFlat:4,weight:3,traits:["rarity-trait"],modifiers:{defense:{DR:2}}}]
 }]);
 const r=createEnvoyFromCreation({id:"layered",name:"Layered",side:"white",raceId:"race-a",ancestryId:"ancestry-a",subAncestryId:"sub-a",rarityId:"grade-x",characterTier:9,baseAttributes:base,vitality:{base:10,perConstitution:2,racialHpFlat:1}},layered);
 assert.equal(r.ok,true);
 assert.equal(r.entity.stats.STR,12);assert.equal(r.entity.stats.DEX,11);assert.equal(r.entity.stats.CON,11);assert.equal(r.entity.stats.ATT,12);
 assert.equal(r.entity.hp.max,43);
 assert.deepEqual(r.entity.racialAttributeModifiers,{STR:2,DEX:1,CON:1,INT:0,WIS:0,CHA:0,ATT:0});
 assert.equal(r.entity.racialModifiers.defense.DR,1);
 assert.equal(r.entity.rarityModifiers.defense.DR,2);
 assert.deepEqual(r.entity.traits,["race-trait","ancestry-trait","sub-trait","rarity-trait"]);
 assert.equal(r.entity.ancestryId,"ancestry-a");assert.equal(r.entity.subAncestryId,"sub-a");
});
test("racial rarity roll requires configured weights and resolves a deterministic weighted interval",()=>{
 const r=createRacialRegistry([{id:"weighted",name:"Weighted",rarityProfiles:[
  {rarityId:"low",weight:2},{rarityId:"high",weight:1}
 ]}]).weighted;
 assert.equal(resolveRacialRarity(r,0).rarityId,"low");
 assert.equal(resolveRacialRarity(r,1).rarityId,"low");
 assert.equal(resolveRacialRarity(r,2).rarityId,"high");
 assert.equal(resolveRacialRarity(r,3).reason,"racial_rarity_roll_out_of_range");
 const unweighted=createRacialRegistry([{id:"unweighted",name:"Unweighted",rarityProfiles:[{rarityId:"unknown-weight"}]}]).unweighted;
 assert.equal(resolveRacialRarity(unweighted,0).reason,"racial_rarity_weights_unconfigured");
});
test("ancestry selection is validated and sub-ancestry remains optional",()=>{
 const r=createRacialRegistry([{id:"race-b",name:"Race B",ancestries:[{id:"a",name:"Ancestry A",subAncestries:[{id:"s",name:"Sub"}]}],rarityProfiles:[{rarityId:"r"}]}]);
 const input={id:"x",name:"x",side:"white",raceId:"race-b",rarityId:"r",characterTier:9,baseAttributes:base,vitality:{base:10,perConstitution:1}};
 assert.equal(createEnvoyFromCreation(input,r).reason,"ancestry_required");
 assert.equal(createEnvoyFromCreation({...input,ancestryId:"a",subAncestryId:"missing"},r).reason,"unknown_sub_ancestry");
 assert.equal(createEnvoyFromCreation({...input,ancestryId:"a"},r).ok,true);
});
