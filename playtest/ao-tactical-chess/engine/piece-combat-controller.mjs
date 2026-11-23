/**
 * AO Chess piece-level combat controller.
 *
 * Connects the existing board-motion bridge, equipment lifecycle and technique
 * resolver into one reusable match API. Values and technique definitions are
 * supplied by encounter data; this module does not seed canon techniques or
 * balance numbers.
 */
import {
  createBoardField,
  resolveBoardMove,
  resolveBoardAttack
} from "./board-engine-bridge.mjs";
import {
  chessMotionCells,
  createTechniqueRegistry,
  resolveTechniqueIntent,
  resetTechniqueTurn
} from "./technique-pipeline.mjs";
import { equipEquipment, unequipEquipment } from "./equipment-pipeline.mjs";

export const AO_CHESS_CLASSES = Object.freeze([
  "Saber", "Archer", "Lancer", "Rider", "Caster",
  "Assassin", "Berserker", "Shielder", "Avenger", "Ruler"
]);

const clone = value => structuredClone(value);
const positionKey = p => `${p.x},${p.y},${p.z || 0}`;
const distance = (a,b) => Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const fail = (reason, extra={}) => ({ok:false,reason,...extra});

function validatePiece(piece, width, height) {
  if (!piece?.id || !piece?.name) throw new Error("piece id and name are required");
  if (!["white","black"].includes(piece.side)) throw new Error("piece side must be white or black");
  if (!Number.isInteger(piece.x) || !Number.isInteger(piece.y) ||
      piece.x<0 || piece.y<0 || piece.x>=width || piece.y>=height) {
    throw new Error("piece position is outside the board");
  }
  if (!["King","Queen","Rook","Bishop","Knight","Pawn"].includes(piece.pattern)) {
    throw new Error("piece requires a supported chess movement pattern");
  }
  if (piece.kind !== "creature" && !AO_CHESS_CLASSES.includes(piece.cls || piece.class)) {
    throw new Error("combatant requires one of the ten AO Chess classes");
  }
  if (piece.kind === "creature" && !piece.creatureType) {
    throw new Error("creature requires a creatureType");
  }
}

/** Build a match from encounter records; every entity has its own position and loadout. */
export function createPieceCombatMatch({
  pieces, width=8, height=8, activeSide="white", round=1,
  techniqueDefinitions=[]
}={}) {
  if (!Array.isArray(pieces) || !pieces.length) throw new Error("match requires at least one piece");
  if (!["white","black"].includes(activeSide)) throw new Error("invalid active side");
  const ids=new Set(), positions=new Set();
  for (const piece of pieces) {
    validatePiece(piece,width,height);
    if(ids.has(piece.id)) throw new Error("duplicate piece id: "+piece.id);
    ids.add(piece.id);
    const key=positionKey({x:piece.x,y:piece.y});
    if(positions.has(key)) throw new Error("two pieces cannot occupy the same starting cell");
    positions.add(key);
  }
  const techniques=createClassTechniqueCatalog(techniqueDefinitions);
  const field=createBoardField(pieces.map(piece=>({
    ...clone(piece),
    hp: piece.hp ?? {current:piece.maxHp ?? 30,max:piece.maxHp ?? 30},
    maxHp: piece.maxHp ?? piece.hp?.max ?? 30,
    ap: piece.ap ?? {current:piece.apMax ?? 6,max:piece.apMax ?? 6},
    apMax: piece.apMax ?? piece.ap?.max ?? 6,
    ea: piece.ea ?? {current:piece.eaMax ?? 6,max:piece.eaMax ?? 6},
    eaMax: piece.eaMax ?? piece.ea?.max ?? 6,
    class: piece.cls || piece.class,
    techniques: piece.techniques || [],
    inventory: piece.inventory || [],
    equipment: piece.equipment || {}
  })),{width,height,turn:activeSide,round});
  const entities={...field.entities};
  for(const piece of pieces){
    const entity=entities[piece.id];
    entity.kind=piece.kind || "envoy";
    entity.creatureType=piece.creatureType || null;
    entity.pattern=piece.pattern;
    entity.position={x:piece.x,y:piece.y,z:0};
    entity.techniqueSlots=[...(piece.techniqueSlots || [])];
    entity.offensiveTechniqueId=piece.offensiveTechniqueId || null;
    entity.aiProfile=piece.aiProfile || null;
    entity.inventory=clone(piece.inventory || []);
    entity.equipment=clone(piece.equipment || {});
  }
  return {
    version:1,width,height,round,field:{...field,entities},
    techniques:techniques.registry,techniqueClasses:techniques.byClass,
    pieceIds:pieces.map(piece=>piece.id),
    log:[{type:"match_created",pieceIds:pieces.map(piece=>piece.id)}]
  };
}

/** Every class receives its own technique collection. A definition must name its owning class. */
export function createClassTechniqueCatalog(definitions=[]) {
  const byClass=Object.fromEntries(AO_CHESS_CLASSES.map(name=>[name,[]]));
  const normalized=[];
  for(const definition of definitions){
    const owner=definition.class || definition.classId;
    if(!AO_CHESS_CLASSES.includes(owner)) throw new Error("technique must declare one owning AO Chess class");
    const classRequirements=[...new Set([...(definition.classRequirements||[]),owner])];
    if(classRequirements.length!==1 || classRequirements[0]!==owner) {
      throw new Error("class technique cannot be assigned to another class");
    }
    normalized.push({...clone(definition),classRequirements});
    byClass[owner].push(definition.id);
  }
  const registry=createTechniqueRegistry(normalized);
  return {registry,byClass};
}

function occupiedByOther(field, actorId, p) {
  return Object.values(field.entities).some(e=>e.alive && e.id!==actorId &&
    positionKey(e.position)===positionKey(p));
}

export function getPieceLegalMoves(match,pieceId) {
  const field=match.field, actor=field.entities[pieceId];
  if(!actor?.alive || (field.activeSide && actor.side!==field.activeSide)) return [];
  if(actor.boardMotion==="Pawn"){
    const direction=actor.side==="white"?-1:1;
    const startRow=actor.side==="white"?field.height-2:1;
    const moves=[];
    const one={x:actor.position.x,y:actor.position.y+direction,z:0};
    if(one.y>=0&&one.y<field.height&&!occupiedByOther(field,pieceId,one)&&!field.cells?.[positionKey(one)]?.blocked){
      moves.push({x:one.x,y:one.y});
      const two={x:actor.position.x,y:actor.position.y+2*direction,z:0};
      if(actor.position.y===startRow&&two.y>=0&&two.y<field.height&&
        !occupiedByOther(field,pieceId,two)&&!field.cells?.[positionKey(two)]?.blocked) moves.push({x:two.x,y:two.y});
    }
    return moves;
  }
  const cells=chessMotionCells(actor.position,actor.boardMotion,Math.max(field.width,field.height),{
    side:actor.side,occupied:p=>occupiedByOther(field,pieceId,p),includeOccupied:true
  });
  return cells.filter(p=>p.x>=0&&p.y>=0&&p.x<field.width&&p.y<field.height&&
    !occupiedByOther(field,pieceId,p) && !field.cells?.[positionKey(p)]?.blocked
  ).map(({x,y})=>({x,y}));
}

export function movePiece(match,{pieceId,to,eventId}={}) {
  const legal=getPieceLegalMoves(match,pieceId);
  if(!legal.some(p=>p.x===to?.x&&p.y===to?.y)) return {...fail("illegal_piece_move"),match};
  const from=clone(match.field.entities[pieceId].position);
  const result=resolveBoardMove(match.field,{actorId:pieceId,to,legalCells:legal,eventId});
  if(!result.ok)return {...result,match};
  return {ok:true,match:{...match,field:result.field,log:[...match.log,{type:"piece_moved",pieceId,from,to:clone(to)}]},result};
}

export function attackPiece(match,{
  attackerId,targetId,roll,damagePackets,eventId,attackBonus=0,breakAmount=0,
  chart={}
}={}) {
  const attacker=match.field.entities[attackerId],target=match.field.entities[targetId];
  if(!attacker?.alive||!target?.alive)return {...fail("combatant_unavailable"),match};
  if(attacker.side===target.side)return {...fail("friendly_target"),match};
  if(!getPieceAttackTargets(match,attackerId).includes(targetId))return {...fail("target_out_of_attack_geometry"),match};
  const result=resolveBoardAttack(match.field,{
    attackerId,defenderId:targetId,roll,damagePackets,eventId,attackBonus,breakAmount,chart
  });
  if(!result.ok)return {...result,match};
  return {ok:true,match:{...match,field:result.field,log:[...match.log,{
    type:"piece_attack",attackerId,targetId,hit:result.hit,damage:result.damage,defeated:result.defeated
  }]},result};
}

export function getPieceAttackTargets(match,pieceId) {
  const actor=match.field.entities[pieceId];
  if(!actor?.alive || actor.side!==match.field.activeSide)return [];
  return Object.values(match.field.entities)
    .filter(target=>target.alive&&target.side!==actor.side)
    .filter(target=>getPieceLegalAttackCell(match,actor,target))
    .map(target=>target.id);
}
function getPieceLegalAttackCell(match,actor,target) {
  if(actor.boardMotion==="Pawn"){
    const direction=actor.side==="white"?-1:1;
    return Math.abs(target.position.x-actor.position.x)===1 &&
      target.position.y-actor.position.y===direction;
  }
  const cells=chessMotionCells(actor.position,actor.boardMotion,Math.max(match.width,match.height),{
    side:actor.side,occupied:p=>occupiedByOther(match.field,actor.id,p),includeOccupied:true
  });
  return cells.some(p=>positionKey(p)===positionKey(target.position));
}

/** Techniques are selected from the acting piece's learned list and class-bound registry. */
export function usePieceTechnique(match,{
  actorId,techniqueId,targetId,targetPosition,requireOffensiveSlot=false
}={}) {
  const actor=match.field.entities[actorId];
  if(!actor?.alive)return {...fail("actor_unavailable"),match};
  const technique=match.techniques[techniqueId];
  if(!technique)return {...fail("unknown_technique"),match};
  if(!match.techniqueClasses[actor.class]?.includes(techniqueId))return {...fail("class_technique_mismatch"),match};
  if(!(actor.techniques||[]).includes(techniqueId))return {...fail("technique_not_learned"),match};
  const target=targetId?{entityId:targetId}:targetPosition?{position:targetPosition}:null;
  if(!target)return {...fail("target_required"),match};
  const result=resolveTechniqueIntent(match.field,{
    actorId,techniqueId,target
  },match.techniques,{requireOffensiveSlot});
  if(!result.ok)return {...result,match};
  return {ok:true,match:{...match,field:result.field,log:[...match.log,{
    type:"piece_technique",actorId,techniqueId,targetId:result.targetId||null,
    affected:clone(result.affected),outcomes:clone(result.outcomes)
  }]},result};
}

export function equipPieceItem(match,{pieceId,instanceId,slot}={}) {
  const result=equipEquipment(match.field,{actorId:pieceId,instanceId,slot});
  if(!result.ok)return {...result,match};
  return {ok:true,match:{...match,field:result.field,log:[...match.log,{type:"equipment_equipped",pieceId,instanceId,slot}]}};
}
export function unequipPieceItem(match,{pieceId,slot}={}) {
  const result=unequipEquipment(match.field,{actorId:pieceId,slot});
  if(!result.ok)return {...result,match};
  return {ok:true,match:{...match,field:result.field,log:[...match.log,{type:"equipment_unequipped",pieceId,slot}]}};
}

/** Simple creature controller: attack a reachable foe, otherwise advance one legal cell. */
export function resolveCreatureAction(match,{
  creatureId,roll=10,damagePackets=[{type:"physical",amount:1}],eventId
}={}) {
  const creature=match.field.entities[creatureId];
  if(!creature?.alive || creature.kind!=="creature")return {...fail("creature_unavailable"),match};
  if(creature.side!==match.field.activeSide)return {...fail("not_active_side"),match};
  const targets=Object.values(match.field.entities)
    .filter(entity=>entity.alive&&entity.side!==creature.side)
    .sort((a,b)=>distance(creature.position,a.position)-distance(creature.position,b.position));
  const target=targets.find(entity=>getPieceAttackTargets(match,creatureId).includes(entity.id));
  if(target)return attackPiece(match,{attackerId:creatureId,targetId:target.id,roll,damagePackets,eventId});
  const legal=getPieceLegalMoves(match,creatureId);
  if(!legal.length)return {...fail("creature_has_no_legal_move"),match};
  const nearest=targets[0];
  legal.sort((a,b)=>distance(a,nearest.position)-distance(b,nearest.position));
  return movePiece(match,{pieceId:creatureId,to:legal[0],eventId});
}

/** End a side's activation without assuming unapproved AP/EA recovery formulas. */
export function endPieceSideTurn(match,nextSide) {
  if(!["white","black"].includes(nextSide)||nextSide===match.field.activeSide)throw new Error("next side must be the opposing side");
  const entities={...match.field.entities};
  const acted={...(match.field.acted||{})};
  for(const [id,entity] of Object.entries(entities)){
    if(entity.side===nextSide&&entity.alive){
      entities[id]=resetTechniqueTurn(entity);
      delete acted[id];
    }
  }
  return {...match,field:{...match.field,entities,acted,activeSide:nextSide,round:nextSide==="white"?match.round+1:match.round},
    round:nextSide==="white"?match.round+1:match.round,
    log:[...match.log,{type:"side_turn_started",side:nextSide}]};
}
