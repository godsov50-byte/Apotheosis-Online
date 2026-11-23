/* AO Chessboard racial affinity damage + Break prototype engine. Not canon. */
(function(root){ "use strict";
 const ELEMENTS=["fire","water","earth","wind","lightning","ice","wood","metal","light","shadow"];
 const DEFAULT_RESISTANCES=Object.fromEntries(ELEMENTS.map(e=>[e,0]));
 function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
 function normalizeProfile(profile={}) {
  const resistances={...DEFAULT_RESISTANCES};
  for(const e of ELEMENTS){const v=Number(profile.resistances?.[e]??0);resistances[e]=clamp(Number.isFinite(v)?v:0,-100,100);}
  const affinities=[...(profile.affinities||[])].filter(e=>ELEMENTS.includes(e));
  const integrity={};for(const e of affinities)integrity[e]=clamp(Number(profile.integrity?.[e]??100),0,100);
  return {raceId:profile.raceId||"unassigned",label:profile.label||"Unassigned",affinities,resistances,integrity,breakThreshold:clamp(Number(profile.breakThreshold??100),1,10000),breakBuildup:clamp(Number(profile.breakBuildup??0),0,10000),broken:!!profile.broken};
 }
 function resolveElementalHit({element,rawDamage,targetProfile,affinityDamage=1,breakBuildup=0}) {
  if(!ELEMENTS.includes(element))throw new Error("Unknown AO element: "+element);
  const profile=normalizeProfile(targetProfile),resistance=profile.resistances[element];
  const appliedDamage=Math.max(0,Math.floor(rawDamage*(1-resistance/100)));
  const affinityHit=profile.affinities.includes(element),integrityBefore=profile.integrity[element]??null;
  const integrityDamage=affinityHit?Math.max(0,Math.floor(appliedDamage*affinityDamage)):0;
  if(affinityHit)profile.integrity[element]=clamp(integrityBefore-integrityDamage,0,100);
  const generatedBreak=affinityHit?Math.max(0,Math.floor(integrityDamage+breakBuildup)):Math.max(0,Math.floor(breakBuildup));
  profile.breakBuildup=clamp(profile.breakBuildup+generatedBreak,0,10000);
  const justBroken=!profile.broken&&profile.breakBuildup>=profile.breakThreshold;if(justBroken)profile.broken=true;
  return {element,rawDamage,resistance,appliedDamage,affinityHit,integrityBefore,integrityDamage,integrityAfter:affinityHit?profile.integrity[element]:null,breakGenerated:generatedBreak,breakBuildup:profile.breakBuildup,breakThreshold:profile.breakThreshold,broken:profile.broken,justBroken,profile};
 }
 const api={ELEMENTS,DEFAULT_RESISTANCES,normalizeProfile,resolveElementalHit};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 root.AOElementalBreak=api;
})(typeof globalThis!=="undefined"?globalThis:this);