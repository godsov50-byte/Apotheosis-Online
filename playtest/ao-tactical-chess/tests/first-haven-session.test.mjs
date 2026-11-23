import test from "node:test";
import assert from "node:assert/strict";
import {
  createFirstHavenSession,
  getFirstHavenLegalMoves,
  moveFirstHavenEnvoy,
  attackFirstHavenCreature,
  openFirstHavenContainer,
  collectFirstHavenDrop,
  harvestFirstHavenNode,
  craftFirstHavenEquipment,
  equipFirstHavenItem,
  advanceFirstHavenTechnique,
  endFirstHavenTurn,
  saveFirstHavenSession,
  loadFirstHavenSession,
  getFirstHavenSummary
} from "../engine/first-haven-session.mjs";

test("First Haven generates a Tier 9 Envoy and Tier 9 creature on a 16x16 field",()=>{
  const state=createFirstHavenSession();
  const envoy=state.field.entities[state.envoyId];
  const creature=state.field.entities[state.creatureId];
  assert.equal(state.field.width,16);
  assert.equal(state.field.height,16);
  assert.equal(envoy.characterTier,9);
  assert.equal(envoy.class,"Saber");
  assert.deepEqual(envoy.stats,{STR:20,DEX:20,CON:20,INT:20,WIS:20,CHA:20,ATT:20});
  assert.equal(creature.characterTier,9);
  assert.equal(creature.kind,"creature");
  assert.equal(state.status,"active");
  assert.equal(getFirstHavenLegalMoves(state).length,8);
});

test("Envoy movement and creature response resolve through the shared board bridge",()=>{
  let state=createFirstHavenSession({positions:{envoy:{x:4,y:4},creature:{x:12,y:12}}});
  const moved=moveFirstHavenEnvoy(state,{x:5,y:4});
  assert.equal(moved.ok,true);
  state=endFirstHavenTurn(moved.state);
  assert.equal(state.field.activeSide,"white");
  assert.ok(state.field.ledger.some(event=>event.type==="board_move_resolved"));
});

test("defeating the creature creates separate physical material, equipment and fragment drops plus a resource node",()=>{
  const state=createFirstHavenSession({positions:{envoy:{x:8,y:7},creature:{x:9,y:7}}});
  const result=attackFirstHavenCreature(state,{roll:20,damage:100});
  assert.equal(result.ok,true);
  assert.equal(result.result.defeated,true);
  const summary=getFirstHavenSummary(result.state);
  assert.equal(summary.creatureAlive,false);
  assert.ok(summary.drops.some(drop=>drop.kind==="material_drop"&&drop.containerId==="creature-cache"));
  assert.ok(summary.drops.some(drop=>drop.kind==="equipment_drop"));
  assert.ok(summary.drops.some(drop=>drop.kind==="technique_fragment_drop"));
  assert.ok(summary.nodes.some(node=>node.id==="creature-residue-node"));
});

test("container contents and technique fragments require separate manual collection",()=>{
  let state=createFirstHavenSession({positions:{envoy:{x:8,y:7},creature:{x:9,y:7}}});
  state=attackFirstHavenCreature(state,{roll:20,damage:100}).state;
  const opened=openFirstHavenContainer(state);
  assert.equal(opened.ok,true);
  state=opened.state;
  const material=Object.values(state.field.drops).find(drop=>drop.kind==="material_drop"&&drop.containerId);
  assert.ok(material);
  const collected=collectFirstHavenDrop(state,material.id);
  assert.equal(collected.ok,true);
  state=collected.state;
  const fragment=Object.values(state.field.drops).find(drop=>drop.kind==="technique_fragment_drop");
  const fragmentCollected=collectFirstHavenDrop(state,fragment.id);
  assert.equal(fragmentCollected.ok,true);
  state=fragmentCollected.state;
  assert.ok(state.field.entities[state.envoyId].inventory.some(item=>item.kind==="technique_fragment"));
});

test("collected creature essence and knowledge fragment advances Guard Break one tier",()=>{
  let state=createFirstHavenSession({positions:{envoy:{x:8,y:7},creature:{x:9,y:7}}});
  state=attackFirstHavenCreature(state,{roll:20,damage:100}).state;
  const fragment=Object.values(state.field.drops).find(drop=>drop.kind==="technique_fragment_drop");
  state=collectFirstHavenDrop(state,fragment.id).state;
  const advanced=advanceFirstHavenTechnique(state);
  assert.equal(advanced.ok,true);
  assert.equal(advanced.result.previousTier,9);
  assert.equal(advanced.result.newTier,8);
  assert.equal(advanced.state.field.entities[state.envoyId].techniqueTiers["guard-break"],8);
});

test("resource extraction creates a field drop that must be collected separately",()=>{
  let state=createFirstHavenSession({positions:{envoy:{x:4,y:2},creature:{x:14,y:14}}});
  const extracted=harvestFirstHavenNode(state);
  assert.equal(extracted.ok,true);
  const drop=extracted.result.drop;
  assert.equal(drop.kind,"material_drop");
  assert.equal(drop.collected,false);
  const collected=collectFirstHavenDrop(extracted.state,drop.id);
  assert.equal(collected.ok,true);
  assert.ok(collected.state.field.entities[state.envoyId].inventory.some(item=>item.kind==="material"&&item.materialId==="field-iron"));
});

test("crafting requires proximity to the forge and consumes gathered materials atomically",()=>{
  let state=createFirstHavenSession({positions:{envoy:{x:2,y:12},creature:{x:14,y:14}}});
  const actor=state.field.entities[state.envoyId];
  actor.inventory=[{kind:"material",materialId:"field-iron",quantity:2}];
  const crafted=craftFirstHavenEquipment(state,"forge-field-sabre");
  assert.equal(crafted.ok,true);
  assert.ok(crafted.state.field.entities[state.envoyId].inventory.some(item=>item.kind==="equipment"&&item.id==="field-iron-sabre"));
  const instance=crafted.state.field.entities[state.envoyId].inventory.find(item=>item.kind==="equipment");
  const equipped=equipFirstHavenItem(crafted.state,instance.instanceId,"weapon");
  assert.equal(equipped.ok,true);
  assert.equal(equipped.state.field.entities[state.envoyId].equipment.weapon.id,"field-iron-sabre");
});

test("local save and load preserve encounter state",()=>{
  const state=createFirstHavenSession();
  const restored=loadFirstHavenSession(saveFirstHavenSession(state));
  assert.equal(restored.field.width,16);
  assert.equal(restored.field.entities[restored.envoyId].characterTier,9);
  assert.equal(restored.field.entities[restored.creatureId].alive,true);
});
