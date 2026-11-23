/* AO building frontage utility: derives nearby street-facing sides from building footprints. */
(function(root){
 "use strict";
 function deriveFrontage({streetNetwork,footprint,maxDistance=12}){
  if(!streetNetwork||typeof streetNetwork.nearestStreet!=="function")throw new Error("Street network required");
  if(!footprint||![footprint.x,footprint.y,footprint.w,footprint.h].every(Number.isFinite)||footprint.w<=0||footprint.h<=0)throw new Error("Invalid building footprint");
  if(!Number.isFinite(maxDistance)||maxDistance<0)throw new Error("Invalid frontage distance");
  const sides=[
   {side:"north",points:[{x:footprint.x+footprint.w/2,y:footprint.y},{x:footprint.x,y:footprint.y},{x:footprint.x+footprint.w,y:footprint.y}]},
   {side:"east",points:[{x:footprint.x+footprint.w,y:footprint.y+footprint.h/2},{x:footprint.x+footprint.w,y:footprint.y},{x:footprint.x+footprint.w,y:footprint.y+footprint.h}]},
   {side:"south",points:[{x:footprint.x+footprint.w/2,y:footprint.y+footprint.h},{x:footprint.x,y:footprint.y+footprint.h},{x:footprint.x+footprint.w,y:footprint.y+footprint.h}]},
   {side:"west",points:[{x:footprint.x,y:footprint.y+footprint.h/2},{x:footprint.x,y:footprint.y},{x:footprint.x,y:footprint.y+footprint.h}]}
  ];
  const frontages=[];
  for(const side of sides){
   let best=null;
   for(const point of side.points){
    const hit=streetNetwork.nearestStreet(point.x,point.y,maxDistance);
    if(hit&&(!best||hit.distance<best.distance))best={streetId:hit.streetId,streetName:hit.name,streetType:hit.type,distance:hit.distance,buildingSide:side.side,buildingPoint:{x:point.x,y:point.y},streetPoint:{x:hit.point.x,y:hit.point.y}};
   }
   if(best)frontages.push(best);
  }
  frontages.sort((a,b)=>a.distance-b.distance);
  return {buildingId:footprint.id||null,frontages,primary:frontages[0]||null,accessibleSides:frontages.map(f=>f.buildingSide)};
 }
 root.AOFrontage={deriveFrontage};
 if(typeof module!=="undefined"&&module.exports)module.exports=root.AOFrontage;
})(typeof window!=="undefined"?window:globalThis);
