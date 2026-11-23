/* AO Chessboard Heirloom technique damage axes. Prototype; numbers are provisional, not canon. */
(function(root){ "use strict";
 const AXIS_BONUSES={elemental:0.10,weaponType:0.05,qualityPerLevel:0.02};
 function resolveTechniqueDamage({baseDamage,techniqueElement="",targetResistance=0,heirloom=null,techniqueWeaponType=""}={}){
  const base=Math.max(0,Math.floor(Number(baseDamage)||0));
  const item=heirloom||{};
  const quality=Math.max(0,Math.min(5,Math.floor(Number(item.quality)||0)));
  const elementalActive=!!techniqueElement&&String(item.element||"").toLowerCase()===String(techniqueElement).toLowerCase()&&Number(targetResistance)<0;
  const weaponActive=!!techniqueWeaponType&&String(item.weaponType||"").toLowerCase()===String(techniqueWeaponType).toLowerCase()&&(item.compatibleWeaponTypes||[]).map(v=>String(v).toLowerCase()).includes(String(techniqueWeaponType).toLowerCase());
  const elementalBonus=elementalActive?AXIS_BONUSES.elemental:0;
  const weaponBonus=weaponActive?AXIS_BONUSES.weaponType:0;
  const qualityBonus=quality>0?(quality-1)*AXIS_BONUSES.qualityPerLevel:0;
  const totalBonus=Math.round((elementalBonus+weaponBonus+qualityBonus)*10000)/10000;
  const bonusDamage=Math.floor(base*totalBonus);
  return {baseDamage:base,elementalAxis:{active:elementalActive,bonus:elementalBonus},weaponTypeAxis:{active:weaponActive,bonus:weaponBonus},qualityAxis:{quality,bonus:qualityBonus},totalBonus,bonusDamage,finalDamage:base+bonusDamage};
 }
 const api={AXIS_BONUSES,resolveTechniqueDamage};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 root.AOHeirloomTechniqueDamage=api;
})(typeof globalThis!=="undefined"?globalThis:this);
