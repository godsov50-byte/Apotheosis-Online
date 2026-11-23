import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../engine/equipment-pipeline.mjs";

function fixture() {
  const registry = E.createEquipmentRegistry({
    materials: [
      {id:"iron",name:"Iron",stackLimit:99},
      {id:"wood",name:"Hardwood",stackLimit:99},
      {id:"oil",name:"Repair Oil"}
    ],
    items: [
      {id:"iron-sword",name:"Iron Sword",category:"Regular Item",itemType:"weapon",equipmentSlot:"weapon",compatibleClasses:["Saber"],durability:{current:40,max:40,integrity:100},modifiers:{attack:3},tags:["weapon"]},
      {id:"heirloom-blade",name:"Heirloom Blade",category:"Heirloom",itemType:"weapon",equipmentSlot:"weapon",durability:{current:100,max:100},advancementEligible:false}
    ],
    recipes: [
      {id:"forge-sword",name:"Forge Iron Sword",knownByDefault:true,stationTags:["forge"],toolTags:["hammer"],skill:{id:"smithing",level:2},ingredients:[{materialId:"iron",quantity:3},{materialId:"wood",quantity:1}],output:{itemId:"iron-sword"},duration:2},
      {id:"temper-sword",name:"Temper Sword",kind:"refine",knownByDefault:true,stationTags:["forge"],ingredients:[{materialId:"iron",quantity:1}],output:{itemId:"iron-sword",propertyOverrides:{tempered:true},modifierOverrides:{attack:5}}},
      {id:"repair-sword",name:"Repair Sword",kind:"repair",knownByDefault:true,ingredients:[{materialId:"oil",quantity:1}],output:{itemId:"iron-sword"}}
    ]
  });
  const field = {
    version:0,ledger:[],equipmentSequence:0,worldTime:12,
    stations:{forge1:{id:"forge1",tags:["forge"],active:true}},
    drops:{drop1:E.createMaterialDrop({id:"drop1",materialId:"iron",quantity:3,position:{x:1,y:0},sourceId:"goblin"})},
    containers:{chest:{id:"chest",position:{x:0,y:1},opened:true,contents:[{materialId:"wood",quantity:2}],collected:false}},
    entities:{
      smith:{id:"smith",alive:true,side:"white",class:"Saber",race:"Human",tier:9,position:{x:0,y:0},stationId:"forge1",knownRecipes:["forge-sword","temper-sword","repair-sword"],skills:{smithing:{level:3}},inventory:[
        {kind:"material",materialId:"iron",quantity:2,provenance:{sourceId:"mine"}},
        {kind:"material",materialId:"wood",quantity:1},
        {kind:"equipment",instanceId:"hammer1",id:"hammer",name:"Hammer",tags:["hammer"],state:"intact"}
      ],equipment:{}},
      ally:{id:"ally",alive:true,side:"white",class:"Saber",race:"Human",tier:9,inventory:[],equipment:{}}
    }
  };
  return {field,registry};
}
const craftIntent={actorId:"smith",recipeId:"forge-sword"};

test("item categories remain separate from rarity, power and advancement eligibility",()=>{
  const {registry}=fixture();
  assert.deepEqual(E.ITEM_CATEGORIES,["Regular Item","Heirloom","Conceptual Heirloom","Cursed Conceptual Heirloom"]);
  const heirloom=registry.items["heirloom-blade"];
  assert.equal(heirloom.category,"Heirloom");
  assert.equal(heirloom.advancementEligible,false);
  assert.equal(heirloom.rarity,null);
  assert.equal(heirloom.power,null);
  assert.throws(()=>E.createItemDefinition({id:"bad",name:"Bad",category:"Cursed Heirloom"}),/unknown AO item category/);
});
test("recipe registry validates ingredients and duplicate IDs",()=>{
  assert.throws(()=>E.createCraftingRecipe({id:"x",name:"Bad",output:{itemId:"x"}}),/ingredients/);
  assert.throws(()=>E.createEquipmentRegistry({recipes:[{id:"x",name:"X",ingredients:[{materialId:"m",quantity:1}],output:{itemId:"a"}},{id:"x",name:"X2",ingredients:[{materialId:"m",quantity:1}],output:{itemId:"a"}}]}),/duplicate recipe/);
});
test("manual material drops and opened containers are collected with provenance",()=>{
  const {field,registry}=fixture();
  const denied=E.collectMaterialDrop(field,{actorId:"smith",dropId:"drop1"},registry);
  assert.equal(denied.reason,"manual_collection_required");
  const picked=E.collectMaterialDrop(field,{actorId:"smith",dropId:"drop1",confirm:true},registry);
  assert.equal(picked.ok,true);
  assert.equal(picked.field.entities.smith.inventory.filter(x=>x.materialId==="iron").reduce((n,x)=>n+x.quantity,0),5);
  const chest=E.collectContainerMaterials(picked.field,{actorId:"smith",containerId:"chest"},registry);
  assert.equal(chest.ok,true);
  assert.equal(chest.field.entities.smith.inventory.find(x=>x.materialId==="wood").quantity,3);
  assert.equal(chest.field.ledger.at(-1).type,"container_materials_collected");
});
test("craft validates materials, station, tool and skill before atomic consumption",()=>{
  const {field,registry}=fixture();
  const missing=E.craftEquipment(field,craftIntent,registry);
  assert.equal(missing.ok,false);
  assert.equal(missing.reason,"insufficient_material");
  assert.equal(field.entities.smith.inventory[0].quantity,2);
  const picked=E.collectMaterialDrop(field,{actorId:"smith",dropId:"drop1",confirm:true},registry);
  const chest=E.collectContainerMaterials(picked.field,{actorId:"smith",containerId:"chest"},registry);
  const crafted=E.craftEquipment(chest.field,craftIntent,registry);
  assert.equal(crafted.ok,true);
  assert.equal(crafted.created.length,1);
  assert.equal(crafted.created[0].category,"Regular Item");
  assert.equal(crafted.created[0].provenance.recipeId,"forge-sword");
  assert.equal(crafted.field.entities.smith.inventory.some(x=>x.instanceId===crafted.created[0].instanceId),true);
  assert.equal(crafted.field.ledger.at(-1).type,"equipment_crafted");
});
test("failed craft does not consume materials or mark actor acted",()=>{
  const {field,registry}=fixture();
  const noStation=structuredClone(field);noStation.entities.smith.stationId="missing";
  assert.equal(E.craftEquipment(noStation,craftIntent,registry).reason,"required_station_missing");
  const noTool=structuredClone(field);noTool.entities.smith.inventory=noTool.entities.smith.inventory.filter(x=>x.instanceId!=="hammer1");
  assert.equal(E.craftEquipment(noTool,craftIntent,registry).reason,"required_tool_missing");
  const noSkill=structuredClone(field);noSkill.entities.smith.skills.smithing.level=1;
  assert.equal(E.craftEquipment(noSkill,craftIntent,registry).reason,"crafting_skill_requirement");
  assert.equal(field.entities.smith.inventory[0].quantity,2);
});
test("equip and unequip enforce compatibility and slot assignment",()=>{
  const {field,registry}=fixture();
  const {field:withMats}=(()=>{const p=E.collectMaterialDrop(field,{actorId:"smith",dropId:"drop1",confirm:true},registry);return E.collectContainerMaterials(p.field,{actorId:"smith",containerId:"chest"},registry);})();
  const crafted=E.craftEquipment(withMats,craftIntent,registry);
  const id=crafted.created[0].instanceId;
  const equipped=E.equipEquipment(crafted.field,{actorId:"smith",instanceId:id,slot:"weapon"});
  assert.equal(equipped.ok,true);
  assert.equal(equipped.field.entities.smith.equipment.weapon.instanceId,id);
  const unequipped=E.unequipEquipment(equipped.field,{actorId:"smith",slot:"weapon"});
  assert.equal(unequipped.ok,true);
  assert.equal(unequipped.field.entities.smith.inventory.some(x=>x.instanceId===id),true);
  const incompatible=E.validateEquipmentAction({class:"Caster",race:"Human",tier:9},crafted.created[0],{action:"equip",slot:"weapon"});
  assert.equal(incompatible.reason,"class_incompatible");
});
test("refinement preserves category and advancement eligibility while changing defined properties",()=>{
  const {field,registry}=fixture();
  const {field:withMats}=(()=>{const p=E.collectMaterialDrop(field,{actorId:"smith",dropId:"drop1",confirm:true},registry);return E.collectContainerMaterials(p.field,{actorId:"smith",containerId:"chest"},registry);})();
  const crafted=E.craftEquipment(withMats,craftIntent,registry);
  const id=crafted.created[0].instanceId;
  const refined=E.refineEquipment(crafted.field,{actorId:"smith",instanceId:id,recipeId:"temper-sword"},registry);
  assert.equal(refined.ok,true);
  assert.equal(refined.item.properties.tempered,true);
  assert.equal(refined.item.modifiers.attack,5);
  assert.equal(refined.item.category,"Regular Item");
  assert.equal(refined.item.advancementEligible,false);
  assert.equal(refined.item.refinementHistory.length,1);
});
test("equipment damage, repair, break and destruction are separate states",()=>{
  const {field,registry}=fixture();
  const item={kind:"equipment",instanceId:"blade",id:"iron-sword",name:"Blade",durability:{current:40,max:40,integrity:100},state:"intact"};
  const damaged=E.damageEquipmentInstance(item,{damage:31,break:60});
  assert.equal(damaged.state,"broken");
  assert.equal(item.durability.current,40);
  const destroyed=E.damageEquipmentInstance(damaged,{damage:99});
  assert.equal(destroyed.state,"destroyed");
  const actor=structuredClone(field.entities.smith);
  actor.inventory.push({...damaged});
  actor.inventory.push({kind:"material",materialId:"oil",quantity:1});
  const repairField={...field,entities:{...field.entities,smith:actor}};
  const repaired=E.repairEquipment(repairField,{actorId:"smith",instanceId:"blade",recipeId:"repair-sword"},registry);
  assert.equal(repaired.ok,true);
  assert.equal(repaired.field.entities.smith.inventory.find(x=>x.instanceId==="blade").state,"intact");
});
test("equipment transfers preserve instance identity and provenance",()=>{
  const {field}=fixture();
  const moved={kind:"equipment",instanceId:"i1",id:"iron-sword",name:"Sword",provenance:{recipeId:"forge-sword"}};
  field.entities.smith.inventory.push(moved);
  const result=E.transferEquipment(field,{fromId:"smith",toId:"ally",instanceId:"i1"});
  assert.equal(result.ok,true);
  assert.equal(result.field.entities.ally.inventory[0].instanceId,"i1");
  assert.equal(result.field.entities.ally.inventory[0].provenance.recipeId,"forge-sword");
  assert.equal(field.entities.smith.inventory.some(x=>x.instanceId==="i1"),true);
});
