const test=require("node:test");
const assert=require("node:assert/strict");
const {normalizeModifiers,resolveEffectiveStats,CORE_STATS}=require("./heirloom-stat-modifiers.js");
test("no stat modifiers leave base values unchanged",()=>{
 const r=resolveEffectiveStats({STR:12,ATT:7},[]);
 assert.deepEqual(r.effective,{STR:12,DEX:0,CON:0,INT:0,WIS:0,CHA:0,ATT:7});
 assert.deepEqual(r.bonus,{STR:0,DEX:0,CON:0,INT:0,WIS:0,CHA:0,ATT:0});
});
test("multiple heirlooms stack additive modifiers independently",()=>{
 const r=resolveEffectiveStats({STR:10,ATT:5},[{statModifiers:{STR:2,ATT:1}},{statModifiers:{STR:3,DEX:4}}]);
 assert.equal(r.bonus.STR,5);assert.equal(r.effective.STR,15);assert.equal(r.effective.DEX,4);assert.equal(r.effective.ATT,6);
});
test("negative modifiers apply as penalties and unsupported keys are ignored",()=>{
 const mods=normalizeModifiers({statModifiers:{CON:-2,HP:100,AC:3,ATT:"bad"}});
 assert.deepEqual(mods,{CON:-2});
 const r=resolveEffectiveStats({CON:8},[{statModifiers:{CON:-2}}]);
 assert.equal(r.effective.CON,6);
});
test("recomputing from base avoids double stacking",()=>{
 const base={STR:10};const items=[{statModifiers:{STR:2}}];
 assert.equal(resolveEffectiveStats(base,items).effective.STR,12);
 assert.equal(resolveEffectiveStats(base,items).effective.STR,12);
});
