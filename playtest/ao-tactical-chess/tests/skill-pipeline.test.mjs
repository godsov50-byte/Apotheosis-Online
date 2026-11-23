import test from "node:test";
import assert from "node:assert/strict";
import {AO_SKILL_DEFINITIONS,createSkillRegistry,cumulativeSkillXp,awardSkillExperience,skillProgress,resolveSkillCheck} from "../engine/skill-pipeline.mjs";
test("34 distinct skill definitions preserve their associated core attributes",()=>{const r=createSkillRegistry();assert.equal(Object.keys(r).length,34);assert.equal(r.SK27.core,"ATT");});
test("F02 cumulative XP thresholds match the current proposal",()=>{assert.equal(cumulativeSkillXp(1),50);assert.equal(cumulativeSkillXp(20),10500);});
test("qualifying XP advances skill levels while effective use is capped by its core",()=>{
 let field={entities:{a:{id:"a",alive:true,baseAttributes:{STR:2},skills:{}}},ledger:[],version:0};
 let r=awardSkillExperience(field,{actorId:"a",skillId:"SK12",xp:150,eventId:"learn-1"});
 assert.equal(r.ok,true);assert.equal(r.progress.learnedLevel,2);assert.equal(r.progress.effectiveLevel,2);
 r=awardSkillExperience(r.field,{actorId:"a",skillId:"SK12",xp:200,eventId:"learn-2"});
 assert.equal(r.progress.learnedLevel,3);assert.equal(r.progress.effectiveLevel,2);
 assert.equal(resolveSkillCheck(r.field.entities.a,"SK12",{roll:10,difficulty:12}).success,true);
});
test("duplicate learning event cannot award XP twice",()=>{
 const field={entities:{a:{id:"a",alive:true,baseAttributes:{STR:10},skills:{}}},ledger:[],version:0};
 const once=awardSkillExperience(field,{actorId:"a",skillId:"SK12",xp:50,eventId:"unique"});
 assert.equal(awardSkillExperience(once.field,{actorId:"a",skillId:"SK12",xp:50,eventId:"unique"}).reason,"duplicate_learning_event");
});
