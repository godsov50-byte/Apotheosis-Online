/* AO Chessboard Heirloom stat modifiers. Optional item property; prototype support. */
(function(root){ "use strict";
 const CORE_STATS=["STR","DEX","CON","INT","WIS","CHA","ATT"];
 function normalizeModifiers(item){
  const source=item&&item.statModifiers&&typeof item.statModifiers==="object"?item.statModifiers:{};
  const out={};
  for(const stat of CORE_STATS){
   const value=Number(source[stat]);
   if(Number.isFinite(value)&&value!==0)out[stat]=value;
  }
  return out;
 }
 function resolveEffectiveStats(baseStats={},heirlooms=[]){
  const base={},bonus={};
  for(const stat of CORE_STATS){
   const value=Number(baseStats[stat]);
   base[stat]=Number.isFinite(value)?value:0;
   bonus[stat]=0;
  }
  for(const item of (Array.isArray(heirlooms)?heirlooms:[])){
   const mods=normalizeModifiers(item);
   for(const [stat,value] of Object.entries(mods))bonus[stat]+=value;
  }
  const effective={};
  for(const stat of CORE_STATS)effective[stat]=base[stat]+bonus[stat];
  return {base,bonus,effective};
 }
 const api={CORE_STATS,normalizeModifiers,resolveEffectiveStats};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 root.AOHeirloomStatModifiers=api;
})(typeof globalThis!=="undefined"?globalThis:this);
