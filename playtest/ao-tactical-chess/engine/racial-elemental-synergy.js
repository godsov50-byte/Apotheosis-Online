/* AO Chessboard racial elemental synergy prototype.
 * Provisional test values only: aligned techniques gain +50% XP and +10% damage.
 * Race affinity provides a head start; non-aligned characters can still train normally.
 */
(function(root){
  const ELEMENTS=["fire","water","earth","wind","lightning","ice","wood","metal","light","shadow"];
  const XP_PER_USE=10, ALIGNED_XP_BONUS=0.5, ALIGNED_DAMAGE_BONUS=0.10;
  function normalizeRaceProfile(profile={}){
    const aligned=(profile.alignedElements||profile.affinities||[]).map(e=>String(e).toLowerCase()).filter(e=>ELEMENTS.includes(e));
    return {raceId:profile.raceId||null,label:profile.label||"Race profile",alignedElements:[...new Set(aligned)]};
  }
  function masteryLevel(xp){return Math.max(0,Math.floor(Math.sqrt(Math.max(0,xp)/100)));}
  function nextLevelXp(level){return (level+1)*(level+1)*100;}
  function applyTechniqueUse(character,element,baseDamage=0){
    const e=String(element||"").toLowerCase();
    if(!ELEMENTS.includes(e)) return {aligned:false,element:e,xpGained:0,totalXp:0,mastery:0,damageBonus:0,finalDamage:baseDamage};
    character.elementalTechniqueXp=character.elementalTechniqueXp||{};
    const before=Number(character.elementalTechniqueXp[e]||0);
    const aligned=normalizeRaceProfile(character.raceProfile||{}).alignedElements.includes(e);
    const xpGained=XP_PER_USE+(aligned?Math.floor(XP_PER_USE*ALIGNED_XP_BONUS):0);
    const totalXp=before+xpGained;
    character.elementalTechniqueXp[e]=totalXp;
    const damageBonus=aligned?Math.floor(baseDamage*ALIGNED_DAMAGE_BONUS):0;
    return {aligned,element:e,xpGained,totalXp,mastery:masteryLevel(totalXp),nextLevelXp:nextLevelXp(masteryLevel(totalXp)),damageBonus,finalDamage:baseDamage+damageBonus};
  }
  root.AORacialElementalSynergy={ELEMENTS,normalizeRaceProfile,masteryLevel,nextLevelXp,applyTechniqueUse,config:{xpPerUse:XP_PER_USE,alignedXpBonus:ALIGNED_XP_BONUS,alignedDamageBonus:ALIGNED_DAMAGE_BONUS}};
})(typeof window!=="undefined"?window:globalThis);
if(typeof module!=="undefined"&&module.exports) module.exports=globalThis.AORacialElementalSynergy;
