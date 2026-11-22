import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInteriorAnchor } from './ao-interior-anchor-validation.mjs';

const make = () => {
  const cell='0:1', room={id:'hall',floor:1,cells:[cell]};
  return {floors:[{rows:2,cols:2,cells:{[cell]:{roomId:'hall'}}}],rooms:[room],anchor:{floor:1,cell,roomId:'hall'}};
};
test('accepts a valid assigned entrance destination',()=>{const d=make();assert.equal(validateInteriorAnchor(d.floors,d.rooms,d.anchor).valid,true)});
test('rejects missing anchor',()=>{const d=make();assert.equal(validateInteriorAnchor(d.floors,d.rooms,null).valid,false)});
test('rejects out-of-grid cell',()=>{const d=make();d.anchor.cell='9:9';assert.equal(validateInteriorAnchor(d.floors,d.rooms,d.anchor).valid,false)});
test('rejects mismatched cell room',()=>{const d=make();d.floors[0].cells['0:1'].roomId='other';assert.equal(validateInteriorAnchor(d.floors,d.rooms,d.anchor).valid,false)});
test('rejects room that does not list anchor cell',()=>{const d=make();d.rooms[0].cells=[];assert.equal(validateInteriorAnchor(d.floors,d.rooms,d.anchor).valid,false)});
test('rejects malformed cell keys',()=>{const d=make();d.anchor.cell='1,2';assert.equal(validateInteriorAnchor(d.floors,d.rooms,d.anchor).valid,false)});
