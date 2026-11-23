import test from "node:test";
import assert from "node:assert/strict";
import {
  AO_CHESS_CLASSES,
  createPieceCombatMatch,
  getPieceLegalMoves,
  movePiece,
  attackPiece,
  usePieceTechnique,
  equipPieceItem,
  unequipPieceItem,
  resolveCreatureAction,
  endPieceSideTurn
} from "../engine/piece-combat-controller.mjs";

const unit=(id,side,x,y,extra={})=>({
  id,name:id,side,x,y,pattern:"King",cls:"Saber",
  stats:{STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10,ATT:10},
  hp:{current:30,max:30},ap:{current:6,max:6},ea:{current:6,max:6},
  ...extra
});

test("the complete ten-class roster is exposed without inventing class balance",()=>{
  assert.deepEqual(AO_CHESS_CLASSES,[
    "Saber","Archer","Lancer","Rider","Caster",
    "Assassin","Berserker","Shielder","Avenger","Ruler"
  ]);
});

test("each piece retains its own position, class, movement and creature identity",()=>{
  const match=createPieceCombatMatch({pieces:[
    unit("saber","white",1,1,{cls:"Saber",pattern:"King"}),
    unit("archer","white",3,1,{cls:"Archer",pattern:"Rook"}),
    unit("wolf","black",6,6,{kind:"creature",creatureType:"beast",pattern:"Knight"})
  ]});
  assert.deepEqual(match.pieceIds,["saber","archer","wolf"]);
  assert.deepEqual(match.field.entities.archer.position,{x:3,y:1,z:0});
  assert.equal(match.field.entities.archer.class,"Archer");
  assert.equal(match.field.entities.wolf.kind,"creature");
  assert.equal(match.field.entities.wolf.creatureType,"beast");
  assert.ok(getPieceLegalMoves(match,"saber").length>0);
  assert.ok(getPieceLegalMoves(match,"archer").length>0);
});

test("movement validates the piece's chess pattern and updates its own board position",()=>{
  let match=createPieceCombatMatch({pieces:[
    unit("saber","white",1,1,{pattern:"King"}),
    unit("wolf","black",6,6,{kind:"creature",creatureType:"beast",pattern:"Knight"})
  ]});
  const moved=movePiece(match,{pieceId:"saber",to:{x:2,y:2}});
  assert.equal(moved.ok,true);
  match=moved.match;
  assert.deepEqual(match.field.entities.saber.position,{x:2,y:2,z:0});
  assert.equal(movePiece(match,{pieceId:"saber",to:{x:4,y:2}}).reason,"illegal_piece_move");
});

test("basic combat resolves a creature target and records damage",()=>{
  const match=createPieceCombatMatch({pieces:[
    unit("saber","white",2,2,{pattern:"King"}),
    unit("wolf","black",3,2,{kind:"creature",creatureType:"beast",pattern:"King"})
  ]});
  assert.deepEqual(match.field.entities.saber.position,{x:2,y:2,z:0});
  const result=attackPiece(match,{
    attackerId:"saber",targetId:"wolf",roll:20,
    damagePackets:[{type:"physical",amount:12}]
  });
  assert.equal(result.ok,true);
  assert.equal(result.result.hit,true);
  assert.ok(result.match.field.entities.wolf.hp.current<30);
  assert.equal(result.match.log.at(-1).type,"piece_attack");
});

test("class-specific techniques validate class, learned state, AP and EA before applying effects",()=>{
  const definitions=AO_CHESS_CLASSES.map(cls=>({
    id:cls.toLowerCase()+"-test-technique",name:cls+" Test Technique",class:cls,
    target:{type:"enemy"},geometry:{kind:"range",minRange:1,range:2},
    cost:{ap:2,ea:1},uses:2,effects:[{type:"damage",amount:7,damageType:"physical"}]
  }));
  const match=createPieceCombatMatch({pieces:[
    unit("archer","white",1,1,{cls:"Archer",pattern:"Rook",techniques:["archer-test-technique"]}),
    unit("wolf","black",3,1,{kind:"creature",creatureType:"beast",pattern:"King"})
  ],techniqueDefinitions:definitions});
  assert.equal(Object.keys(match.techniques).length,10);
  const wrongClass=usePieceTechnique(match,{
    actorId:"archer",techniqueId:"saber-test-technique",targetId:"wolf"
  });
  assert.equal(wrongClass.reason,"class_technique_mismatch");
  const used=usePieceTechnique(match,{
    actorId:"archer",techniqueId:"archer-test-technique",targetId:"wolf"
  });
  assert.equal(used.ok,true);
  assert.equal(used.match.field.entities.archer.ap.current,4);
  assert.equal(used.match.field.entities.archer.ea.current,5);
  assert.equal(used.match.field.entities.wolf.hp.current,23);
});

test("equipment can be equipped and removed on an individual piece",()=>{
  const blade={
    kind:"equipment",id:"training-blade",instanceId:"blade-1",name:"Training Blade",
    equipmentSlot:"weapon",state:"intact",compatibleClasses:["Saber"],
    modifiers:{ATT:2},effects:[]
  };
  const match=createPieceCombatMatch({pieces:[
    unit("saber","white",1,1,{inventory:[blade]}),
    unit("wolf","black",6,6,{kind:"creature",creatureType:"beast",pattern:"King"})
  ]});
  const equipped=equipPieceItem(match,{pieceId:"saber",instanceId:"blade-1",slot:"weapon"});
  assert.equal(equipped.ok,true);
  assert.equal(equipped.match.field.entities.saber.equipment.weapon.instanceId,"blade-1");
  const removed=unequipPieceItem(equipped.match,{pieceId:"saber",slot:"weapon"});
  assert.equal(removed.ok,true);
  assert.ok(removed.match.field.entities.saber.inventory.some(item=>item.instanceId==="blade-1"));
});

test("creature controller attacks a reachable piece or advances toward the nearest target",()=>{
  const match=createPieceCombatMatch({pieces:[
    unit("saber","white",2,2,{pattern:"King"}),
    unit("wolf","black",3,2,{kind:"creature",creatureType:"beast",pattern:"King"})
  ],activeSide:"black"});
  const result=resolveCreatureAction(match,{
    creatureId:"wolf",roll:20,damagePackets:[{type:"physical",amount:3}]
  });
  assert.equal(result.ok,true);
  assert.equal(result.match.field.entities.saber.hp.current,27);
});

test("side turn handoff resets that side's technique action marker without inventing AP or EA recovery",()=>{
  const match=createPieceCombatMatch({pieces:[
    unit("saber","white",1,1,{techniques:[]}),
    unit("wolf","black",6,6,{kind:"creature",creatureType:"beast",pattern:"King"})
  ]});
  const next=endPieceSideTurn(match,"black");
  assert.equal(next.field.activeSide,"black");
  assert.equal(next.field.entities.wolf.acted,undefined);
  assert.equal(next.field.entities.wolf.ap.current,6);
  assert.equal(next.field.entities.wolf.ea.current,6);
});
