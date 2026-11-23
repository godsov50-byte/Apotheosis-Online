import test from "node:test";
import assert from "node:assert/strict";
import {createAOChessContent,AO_PROVISIONAL_EQUIPMENT,AO_PROVISIONAL_TECHNIQUES} from "../engine/ao-chess-content.mjs";
test("content pack exposes skills, techniques, equipment and effects",()=>{
 const c=createAOChessContent();
 assert.equal(Object.keys(c.skills).length,34);
 assert.ok(c.techniques["guard-break"]);
 assert.ok(c.equipment.items["field-iron-sabre"]);
 assert.ok(c.effects.burning);
 assert.equal(Object.keys(c.races).length,0);
});
test("provisional examples do not silently assign rarity or power",()=>{
 const buckler=AO_PROVISIONAL_EQUIPMENT.items.find(x=>x.id==="field-iron-buckler");
 assert.equal(buckler.category,"Regular Item");
 assert.equal(buckler.rarity,undefined);
 assert.equal(buckler.power,undefined);
 assert.ok(buckler.effects.length);
 assert.ok(AO_PROVISIONAL_TECHNIQUES.every(x=>x.provisional===true));
});
