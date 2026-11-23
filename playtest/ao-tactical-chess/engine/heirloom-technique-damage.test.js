const test=require("node:test");
const assert=require("node:assert/strict");
const engine=require("../engine/heirloom-technique-damage.js");
test("elemental axis bonus requires aligned heirloom element and target vulnerability",()=>{
 const r=engine.resolveTechniqueDamage({baseDamage:100,techniqueElement:"fire",targetResistance:-20,heirloom:{element:"fire",quality:1}});
 assert.equal(r.elementalAxis.active,true);assert.equal(r.elementalAxis.bonus,.10);assert.equal(r.bonusDamage,10);
});
test("weapon type and quality axes stack independently with elemental axis",()=>{
 const r=engine.resolveTechniqueDamage({baseDamage:100,techniqueElement:"fire",targetResistance:-20,techniqueWeaponType:"greatsword",heirloom:{element:"fire",weaponType:"greatsword",compatibleWeaponTypes:["greatsword"],quality:3}});
 assert.equal(r.weaponTypeAxis.active,true);assert.equal(r.weaponTypeAxis.bonus,.05);assert.equal(r.qualityAxis.bonus,.04);assert.equal(r.totalBonus,.19);assert.equal(r.finalDamage,119);
});
test("axes do not activate when conditions fail",()=>{
 const r=engine.resolveTechniqueDamage({baseDamage:100,techniqueElement:"fire",targetResistance:0,techniqueWeaponType:"sword",heirloom:{element:"ice",weaponType:"axe",compatibleWeaponTypes:["axe"],quality:1}});
 assert.equal(r.bonusDamage,0);assert.equal(r.finalDamage,100);
});
test("quality alone can enhance damage and is bounded",()=>{
 const r=engine.resolveTechniqueDamage({baseDamage:50,heirloom:{quality:5}});
 assert.equal(r.qualityAxis.quality,5);assert.equal(r.bonusDamage,4);assert.equal(r.finalDamage,54);
});
