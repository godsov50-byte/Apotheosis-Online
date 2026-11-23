const test=require("node:test");
const assert=require("node:assert/strict");
const synergy=require("../engine/racial-elemental-synergy.js");

test("aligned element grants bonus technique XP and damage",()=>{
 const character={raceProfile:{alignedElements:["fire"]}};
 const result=synergy.applyTechniqueUse(character,"fire",100);
 assert.equal(result.aligned,true);
 assert.equal(result.xpGained,15);
 assert.equal(result.damageBonus,10);
 assert.equal(result.finalDamage,110);
 assert.equal(character.elementalTechniqueXp.fire,15);
});
test("non-aligned element remains usable with baseline XP and no damage bonus",()=>{
 const character={raceProfile:{alignedElements:["fire"]}};
 const result=synergy.applyTechniqueUse(character,"ice",100);
 assert.equal(result.aligned,false);
 assert.equal(result.xpGained,10);
 assert.equal(result.damageBonus,0);
 assert.equal(result.finalDamage,100);
 assert.equal(character.elementalTechniqueXp.ice,10);
});
test("unknown element grants no progression or bonus",()=>{
 const character={raceProfile:{alignedElements:["fire"]}};
 const result=synergy.applyTechniqueUse(character,"void",100);
 assert.equal(result.xpGained,0);
 assert.equal(result.finalDamage,100);
 assert.deepEqual(character.elementalTechniqueXp,{});
});
test("mastery progression derives from accumulated XP",()=>{
 assert.equal(synergy.masteryLevel(99),0);
 assert.equal(synergy.masteryLevel(100),1);
 assert.equal(synergy.masteryLevel(400),2);
});
