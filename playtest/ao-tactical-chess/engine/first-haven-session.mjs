/**
 * First Haven end-to-end AO Chess playtest session.
 * Generated entities and all numeric profiles here are explicitly provisional
 * test fixtures. They do not declare race, creature, class, or balance canon.
 */
import { createBoardField, resolveBoardMove, resolveBoardAttack, resolveBoardTechnique, endBoardTurn, projectBoardUnits } from "./board-engine-bridge.mjs";
import { createEnvoyFromCreation, createRacialRegistry } from "./character-creation-pipeline.mjs";
import { createAOChessContent, AO_PROVISIONAL_EQUIPMENT, AO_PROVISIONAL_TECHNIQUES } from "./ao-chess-content.mjs";
import { createEquipmentRegistry, craftEquipment, equipEquipment, unequipEquipment } from "./equipment-pipeline.mjs";
import { createResourceNode, resolveDefeatDrops, extractResource, collectBalancedDrop } from "./drop-resource-pipeline.mjs";
import { advanceTechniqueTierFromFragments } from "./technique-fragment-pipeline.mjs";

const clone = value => structuredClone(value);
const distance = (a,b) => Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
const key = (x,y) => x + "," + y + ",0";
const CORE = ["STR","DEX","CON","INT","WIS","CHA","ATT"];
const BASE_TIER9_ATTRIBUTES = Object.freeze({STR:20,DEX:20,CON:20,INT:20,WIS:20,CHA:20,ATT:20});
const CREATURE_ATTRIBUTES = Object.freeze({STR:10,DEX:10,CON:10,INT:10,WIS:10,CHA:10,ATT:10});

function buildRegistries() {
  const content = createAOChessContent();
  const equipment = createEquipmentRegistry({
    materials: AO_PROVISIONAL_EQUIPMENT.materials,
    items: AO_PROVISIONAL_EQUIPMENT.items,
    recipes: AO_PROVISIONAL_EQUIPMENT.recipes.map(recipe => ({
      ...recipe,
      stationTags: ["forge"],
      skill: { id: "SK20", level: 1 }
    }))
  });
  const techniqueFragments = {
    "creature-memory": {
      id: "creature-memory",
      name: "Creature Memory Fragment",
      traits: ["creature", "instinct"],
      essence: { traits: ["beast-nature"], potency: 20 },
      knowledge: { traits: ["guarding-instinct"], potency: 20 }
    }
  };
  const techniques = {
    ...content.techniques,
    "guard-break": {
      ...AO_PROVISIONAL_TECHNIQUES.find(item => item.id === "guard-break"),
      progression: {
        learningCosts: [],
        advancementCostsByCurrentTier: {
          "9": [{
            fragmentId: "creature-memory",
            quantity: 1,
            requiredEssenceTraits: ["beast-nature"],
            requiredKnowledgeTraits: ["guarding-instinct"]
          }]
        }
      }
    }
  };
  return {
    equipment,
    drops: { ...equipment, techniqueFragments },
    resources: {
      "field-iron-resource": { id: "field-iron-resource", materialId: "field-iron", name: "Field Iron" },
      "creature-residue-resource": { id: "creature-residue-resource", materialId: "beast-hide", name: "Creature Residue" }
    },
    methods: {
      "hand-gather": { id: "hand-gather", resourceTags: ["metal"], skill: { id: "SK20", level: 1 }, range: 1, baseYield: 1, requiresManualCollection: true },
      "salvage-residue": { id: "salvage-residue", resourceTags: ["residue"], range: 1, baseYield: 1, requiresManualCollection: true }
    },
    techniques,
    techniqueFragments
  };
}

function makeEnvoy() {
  const registry = createRacialRegistry([{
    id: "unclassified-playtest-shell",
    name: "Unclassified Playtest Shell",
    rarityProfiles: [{ rarityId: "unresolved-playtest" }]
  }]);
  const created = createEnvoyFromCreation({
    id: "first-haven-envoy",
    name: "New Envoy",
    side: "white",
    raceId: "unclassified-playtest-shell",
    rarityId: "unresolved-playtest",
    characterTier: 9,
    startingAttributePackage: {
      id: "tier-9-playtest-baseline-v1",
      name: "Tier 9 Playtest Baseline",
      baseAttributes: clone(BASE_TIER9_ATTRIBUTES),
      sourceRef: "ao-playtest-fixture",
      ruleVersion: "tier-9-playtest-baseline-v1"
    },
    vitality: { base: 10, perConstitution: 2, racialHpFlat: 0 },
    ap: { current: 8, max: 8 },
    ea: { current: 8, max: 8, affinities: [] },
    skills: {
      SK01: { level: 1, learnedLevel: 1, xp: 50 },
      SK20: { level: 1, learnedLevel: 1, xp: 50 }
    },
    techniques: ["guard-break"],
    inventory: [],
    equipment: {}
  }, registry);
  if (!created.ok) throw new Error("Tier 9 Envoy generation failed: " + created.reason);
  const guardBreak = AO_PROVISIONAL_TECHNIQUES.find(item => item.id === "guard-break");
  return {
    ...created.entity,
    class: "Saber",
    cls: "Saber",
    archetype: "Anti-Unit",
    pattern: "King",
    x: 2, y: 2,
    facing: "S",
    hp: created.entity.hp,
    maxHp: created.entity.hp.max,
    ac: 12,
    atk: 3,
    dr: 0,
    weapon: "Unarmed",
    weaponDamage: 5,
    technique: "Guard Break",
    techniqueId: "guard-break",
    techniqueProfile: { ...clone(guardBreak), classRequirements: ["Saber"], requiredSkills: [] },
    techniqueTier: 9,
    techniqueCost: 2,
    techniqueEaCost: 1,
    maxTechniqueUses: 3,
    uses: 3,
    portraitUrl: ""
  };
}

function makeCreature() {
  return {
    id: "first-haven-creature",
    name: "First Haven Creature",
    side: "black",
    kind: "creature",
    creatureType: "unclassified-playtest-creature",
    characterTier: 9,
    tier: 9,
    class: "Unclassified Creature",
    cls: "Unclassified Creature",
    archetype: "Instinctive",
    pattern: "King",
    x: 9, y: 7,
    facing: "N",
    hp: 36,
    maxHp: 36,
    ac: 10,
    atk: 2,
    dr: 0,
    stats: clone(CREATURE_ATTRIBUTES),
    baseAttributes: clone(CREATURE_ATTRIBUTES),
    ap: 8,
    apMax: 8,
    ea: 0,
    eaMax: 0,
    affinities: [],
    techniques: [],
    skills: {},
    inventory: [],
    equipment: {},
    weapon: "Natural weapon",
    weaponDamage: 4,
    sourceRef: "first-haven-playtest-creature-v1",
    nature: "Creature"
  };
}

function appendEvent(field,event) {
  const ledger = [...(field.ledger || [])];
  if (ledger.some(item => item.id === event.id)) return field;
  return { ...field, ledger: [...ledger, clone(event)], version: (field.version || 0) + 1 };
}

function legalMoves(field, unitId) {
  const unit = field.entities[unitId];
  if (!unit || !unit.alive) return [];
  const x = unit.position.x, y = unit.position.y, out = [];
  const add = (tx,ty) => {
    if (tx < 0 || ty < 0 || tx >= field.width || ty >= field.height) return;
    const occupant = Object.values(field.entities).find(entity => entity.alive && entity.id !== unitId && entity.position.x === tx && entity.position.y === ty);
    if (!occupant || occupant.side !== unit.side) out.push({x:tx,y:ty,attack:!!occupant});
  };
  const ray = (dx,dy) => {
    for (let step=1;step<Math.max(field.width,field.height);step++) {
      const tx=x+dx*step,ty=y+dy*step;
      if(tx<0||ty<0||tx>=field.width||ty>=field.height)break;
      const occupant=Object.values(field.entities).find(entity=>entity.alive&&entity.id!==unitId&&entity.position.x===tx&&entity.position.y===ty);
      if(occupant){if(occupant.side!==unit.side)out.push({x:tx,y:ty,attack:true});break;}
      out.push({x:tx,y:ty,attack:false});
    }
  };
  if(unit.boardMotion==="King") {
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(dx||dy)add(x+dx,y+dy);
  } else if(unit.boardMotion==="Knight") {
    [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dx,dy])=>add(x+dx,y+dy));
  } else if(unit.boardMotion==="Rook"||unit.boardMotion==="Queen") {
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>ray(dx,dy));
  }
  if(unit.boardMotion==="Bishop"||unit.boardMotion==="Queen") {
    [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([dx,dy])=>ray(dx,dy));
  }
  return out;
}

function withRoster(state, field) {
  return { ...state, field, units: projectBoardUnits(state.roster, field) };
}

function resolveDefeat(state, defeatedId) {
  if (defeatedId !== state.creatureId || state.rewardsResolved) return state;
  const creature = state.field.entities[defeatedId];
  const position = clone(creature.position);
  let field = {
    ...state.field,
    containers: {
      ...(state.field.containers || {}),
      "creature-cache": {
        id: "creature-cache",
        name: "Creature Cache",
        position,
        opened: false,
        collected: false,
        sourceId: defeatedId,
        contents: [{ materialId: "beast-hide", quantity: 2 }]
      }
    }
  };
  const rewards = resolveDefeatDrops(field, {
    source: { id: defeatedId, type: "creature_death", eventId: "defeat:" + defeatedId, essenceSource: "creature" },
    profile: {
      id: "first-haven-tier-9-creature-profile-v1",
      rewardBudget: 4,
      materialDrops: [
        { materialId: "beast-hide", chance: 1, min: 2, max: 2, containerId: "creature-cache" }
      ],
      equipmentDrops: {
        chance: 1,
        max: 1,
        entries: [{ itemId: "field-iron-buckler", weight: 1, budgetCost: 1 }]
      },
      techniqueFragmentDrops: [
        { fragmentId: "creature-memory", chance: 1, min: 1, max: 1, containerId: null }
      ]
    },
    registry: state.registries.drops,
    position,
    seed: state.seed + ":creature-defeat"
  });
  if (!rewards.ok) throw new Error("Creature reward resolution failed: " + rewards.reason);
  field = rewards.field;
  field = {
    ...field,
    resourceNodes: {
      ...(field.resourceNodes || {}),
      "creature-residue-node": createResourceNode({
        id: "creature-residue-node",
        resourceId: "creature-residue-resource",
        quantity: 1,
        maxQuantity: 1,
        position,
        quality: 50,
        tags: ["residue"],
        sourceId: defeatedId
      })
    }
  };
  field = appendEvent(field, {
    id: "first-haven-creature-defeated:" + defeatedId,
    type: "first_haven_creature_defeated",
    sourceId: defeatedId,
    position,
    spawnedResourceNodeId: "creature-residue-node"
  });
  return { ...state, field, rewardsResolved: true };
}

export function createFirstHavenSession({ seed = "first-haven-tier-9-demo", positions = {} } = {}) {
  const registries = buildRegistries();
  const envoy = makeEnvoy();
  const creature = makeCreature();
  if (positions.envoy) { envoy.x=positions.envoy.x; envoy.y=positions.envoy.y; }
  if (positions.creature) { creature.x=positions.creature.x; creature.y=positions.creature.y; }
  const field = createBoardField([envoy,creature],{width:16,height:16,turn:"white",round:1});
  const node = createResourceNode({
    id:"first-haven-iron-node",
    resourceId:"field-iron-resource",
    quantity:3,
    maxQuantity:3,
    position:{x:4,y:3},
    quality:50,
    tags:["metal"],
    sourceId:"first-haven-resource-cell"
  });
  field.entities[creature.id] = { ...field.entities[creature.id], kind: "creature", creatureType: creature.creatureType };
  const initialized = {
    ...field,
    resourceNodes: { [node.id]: node },
    resources: registries.resources,
    methods: registries.methods,
    drops: {},
    containers: {},
    stations: {
      "haven-forge": { id:"haven-forge", name:"First Haven Forge", position:{x:2,y:13}, tags:["forge"], active:true }
    },
    worldTime: 0
  };
  const state = {
    version: 1,
    seed,
    width: 16,
    height: 16,
    envoyId: envoy.id,
    creatureId: creature.id,
    roster: [envoy,creature],
    units: projectBoardUnits([envoy,creature],initialized),
    field: initialized,
    registries,
    rewardsResolved: false,
    status: "active",
    log: [{
      tag:"First Haven · Arrival",
      text:"A Tier 9 Envoy enters First Haven. A Tier 9 creature moves in the nearby clearing. The encounter is a local playtest, not a committed world event."
    }]
  };
  return state;
}

export function getFirstHavenLegalMoves(state, unitId = state.envoyId) {
  return legalMoves(state.field,unitId);
}

export function moveFirstHavenEnvoy(state,{x,y}={}) {
  const result = resolveBoardMove(state.field,{
    actorId:state.envoyId,
    to:{x,y},
    legalCells:getFirstHavenLegalMoves(state).map(cell=>({x:cell.x,y:cell.y})),
    eventId:"first-haven-move-"+state.field.version
  });
  if(!result.ok)return {ok:false,reason:result.reason,state};
  const next=withRoster(state,result.field);
  next.log=[{tag:"Movement",text:"The Envoy advances across First Haven."},...state.log];
  return {ok:true,state:next,result};
}

export function attackFirstHavenCreature(state,{technique=false,roll=10,damage=5}={}) {
  if(state.status!=="active")return {ok:false,reason:"encounter_not_active",state};
  const attacker=state.field.entities[state.envoyId];
  const defender=state.field.entities[state.creatureId];
  if(!attacker?.alive||!defender?.alive)return {ok:false,reason:"combatant_unavailable",state};
  let result;
  if(technique) {
    result=resolveBoardTechnique(state.field,{
      actorId:state.envoyId,
      defenderId:state.creatureId,
      roll,
      damagePackets:[{type:"physical",amount:damage}],
      eventId:"first-haven-technique-"+state.field.version
    });
  } else {
    result=resolveBoardAttack(state.field,{
      attackerId:state.envoyId,
      defenderId:state.creatureId,
      roll,
      damagePackets:[{type:"physical",amount:damage}],
      eventId:"first-haven-attack-"+state.field.version
    });
  }
  if(!result.ok)return {ok:false,reason:result.reason,state};
  let next=withRoster(state,result.field);
  next.log=[{
    tag:technique?"Technique · Guard Break":"Combat · Basic Attack",
    text:(technique?"The Envoy uses Guard Break. ":"The Envoy attacks. ")+
      (result.hit?"The creature takes "+result.damage+" damage.":"The attack misses.")+
      (result.defeated?" The creature is defeated; its physical drops remain in the field.":"")
  },...state.log];
  if(result.defeated)next=resolveDefeat(next,state.creatureId);
  return {ok:true,state:next,result};
}

export function openFirstHavenContainer(state,containerId="creature-cache") {
  const container=state.field.containers?.[containerId];
  const actor=state.field.entities[state.envoyId];
  if(!container)return {ok:false,reason:"container_unavailable",state};
  if(container.opened)return {ok:false,reason:"container_already_open",state};
  if(distance(actor.position,container.position)>1)return {ok:false,reason:"container_out_of_reach",state};
  const field={...state.field,containers:{
    ...state.field.containers,[containerId]:{...container,opened:true}
  }};
  const next={...state,field:appendEvent(field,{
    id:"container-opened:"+containerId,
    type:"container_opened",
    actorId:state.envoyId,
    containerId
  }),log:[{tag:"Container Opened",text:"The Envoy opens the creature cache. Its contents remain physical until collected."},...state.log]};
  return {ok:true,state:next};
}

export function collectFirstHavenDrop(state,dropId) {
  const result=collectBalancedDrop(state.field,{
    actorId:state.envoyId,dropId,confirm:true,collectionRange:1
  },state.registries.drops);
  if(!result.ok)return {ok:false,reason:result.reason,state};
  const next=withRoster(state,result.field);
  next.log=[{tag:"Collected",text:"The Envoy manually collects a field drop. Its source and quality remain recorded."},...state.log];
  return {ok:true,state:next};
}

export function harvestFirstHavenNode(state,nodeId="first-haven-iron-node") {
  const result=extractResource(state.field,{
    actorId:state.envoyId,nodeId,methodId:nodeId==="creature-residue-node"?"salvage-residue":"hand-gather",
    seed:state.seed+":"+nodeId
  },{
    resources:state.registries.resources,
    methods:state.registries.methods
  });
  if(!result.ok)return {ok:false,reason:result.reason,state};
  const next=withRoster(state,result.field);
  next.log=[{tag:"Resource Extracted",text:"A finite resource node is worked. The extracted material is a separate field drop and must still be collected."},...state.log];
  return {ok:true,state:next,result};
}

export function craftFirstHavenEquipment(state,recipeId) {
  const actor=state.field.entities[state.envoyId];
  const station=state.field.stations["haven-forge"];
  if(distance(actor.position,station.position)>1)return {ok:false,reason:"forge_out_of_reach",state};
  const field={...state.field,entities:{
    ...state.field.entities,[actor.id]:{...actor,stationId:station.id}
  }};
  const result=craftEquipment(field,{actorId:actor.id,recipeId},state.registries.equipment);
  if(!result.ok)return {ok:false,reason:result.reason,state};
  const next=withRoster(state,result.field);
  next.log=[{tag:"Crafted",text:"The Envoy crafts "+result.created.map(item=>item.name).join(", ")+". Material costs and provenance are committed to the local encounter ledger."},...state.log];
  return {ok:true,state:next,result};
}

export function equipFirstHavenItem(state,instanceId,slot="offhand") {
  const result=equipEquipment(state.field,{actorId:state.envoyId,instanceId,slot});
  if(!result.ok)return {ok:false,reason:result.reason,state};
  const next=withRoster(state,result.field);
  next.log=[{tag:"Equipment",text:"The Envoy equips an item. Effective attributes and defenses are recalculated."},...state.log];
  return {ok:true,state:next};
}

export function unequipFirstHavenItem(state,slot="offhand") {
  const result=unequipEquipment(state.field,{actorId:state.envoyId,slot});
  if(!result.ok)return {ok:false,reason:result.reason,state};
  return {ok:true,state:withRoster(state,result.field)};
}

export function advanceFirstHavenTechnique(state) {
  const result=advanceTechniqueTierFromFragments(state.field,{
    actorId:state.envoyId,techniqueId:"guard-break",targetTier:8
  },{ techniques: state.registries.techniques, fragmentDefinitions: state.registries.techniqueFragments });
  if(!result.ok)return {ok:false,reason:result.reason,state};
  const next=withRoster(state,result.field);
  next.log=[{tag:"Technique Progression",text:"Guard Break advances from Technique Tier 9 to Technique Tier 8 by consuming the required creature essence and knowledge fragment."},...state.log];
  return {ok:true,state:next,result};
}

export function endFirstHavenTurn(state) {
  let field=endBoardTurn(state.field,"black");
  const creature=field.entities[state.creatureId];
  const envoy=field.entities[state.envoyId];
  if(creature?.alive&&envoy?.alive) {
    const dx=envoy.position.x-creature.position.x,dy=envoy.position.y-creature.position.y;
    if(Math.max(Math.abs(dx),Math.abs(dy))<=1) {
      const attack=resolveBoardAttack(field,{
        attackerId:creature.id,defenderId:envoy.id,roll:Math.floor(Math.random()*20)+1,
        damagePackets:[{type:"physical",amount:Math.floor(Math.random()*4)+1}],
        eventId:"first-haven-creature-turn-"+field.version
      });
      if(attack.ok)field=attack.field;
    } else {
      const options=legalMoves(field,creature.id).filter(cell=>!cell.attack);
      options.sort((a,b)=>distance(a,envoy.position)-distance(b,envoy.position));
      if(options.length) {
        const move=resolveBoardMove(field,{
          actorId:creature.id,to:options[0],
          legalCells:options.map(cell=>({x:cell.x,y:cell.y})),
          eventId:"first-haven-creature-move-"+field.version
        });
        if(move.ok)field=move.field;
      }
    }
  }
  field=endBoardTurn(field,"white");
  field={
    ...field,
    entities:Object.fromEntries(Object.entries(field.entities).map(([id,entity])=>{
      const clean={...entity};delete clean.acted;return [id,clean];
    })),
    acted:{}
  };
  const next=withRoster(state,field);
  next.log=[{tag:"Creature Response · Turn End",text:creature?.alive?"The creature responds to the Envoy's position.":"The clearing is quiet; no creature remains to answer."},...state.log];
  return next;
}

export function saveFirstHavenSession(state) {
  return JSON.stringify(state);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBoardPosition(value) {
  return isRecord(value) &&
    Number.isInteger(value.x) && value.x >= 0 && value.x < 16 &&
    Number.isInteger(value.y) && value.y >= 0 && value.y < 16;
}

export function loadFirstHavenSession(serialized) {
  let state;
  try {
    state = JSON.parse(serialized);
  } catch {
    throw new Error("Invalid First Haven local save: malformed JSON.");
  }

  const field = state?.field;
  const entities = field?.entities;
  const envoy = entities?.[state?.envoyId];
  const creature = entities?.[state?.creatureId];
  const station = field?.stations?.["haven-forge"];
  const validEntities = isRecord(entities) &&
    Object.entries(entities).every(([id, entity]) =>
      isRecord(entity) && entity.id === id && isBoardPosition(entity.position) &&
      typeof entity.alive === "boolean"
    );

  const validLog = Array.isArray(state?.log) &&
    state.log.every(entry => isRecord(entry) &&
      typeof entry.tag === "string" && typeof entry.text === "string");

  const validRegistries = isRecord(state?.registries) &&
    ["equipment", "drops", "resources", "methods", "techniques", "techniqueFragments"]
      .every(key => isRecord(state.registries[key]));

  const validField = isRecord(field) &&
    field.width === 16 && field.height === 16 &&
    ["white", "black"].includes(field.activeSide) &&
    validEntities &&
    isRecord(field.drops) &&
    isRecord(field.containers) &&
    isRecord(field.resourceNodes) &&
    isRecord(field.stations) &&
    Array.isArray(field.ledger) &&
    isRecord(station) && isBoardPosition(station.position);

  const validSession = isRecord(state) &&
    state.version === 1 && state.width === 16 && state.height === 16 &&
    typeof state.seed === "string" &&
    typeof state.envoyId === "string" && typeof state.creatureId === "string" &&
    Array.isArray(state.roster) && state.roster.length >= 2 &&
    isRecord(envoy) && envoy.side === "white" &&
    isRecord(creature) && creature.side === "black" &&
    validField && validRegistries && validLog &&
    typeof state.rewardsResolved === "boolean" &&
    ["active", "complete"].includes(state.status);

  if (!validSession) {
    throw new Error("Invalid First Haven local save: session structure is incomplete or inconsistent.");
  }
  return state;
}

export function getFirstHavenSummary(state) {
  const envoy=state.field.entities[state.envoyId];
  const creature=state.field.entities[state.creatureId];
  return {
    tier:envoy?.characterTier??9,
    hp:envoy?.hp?.current??0,
    maxHp:envoy?.hp?.max??0,
    ap:envoy?.ap?.current??0,
    ea:envoy?.ea?.current??0,
    creatureAlive:!!creature?.alive,
    drops:Object.values(state.field.drops||{}).filter(drop=>!drop.collected),
    containers:Object.values(state.field.containers||{}),
    nodes:Object.values(state.field.resourceNodes||{}),
    inventory:clone(envoy?.inventory||[]),
    equipment:clone(envoy?.equipment||{}),
    techniqueTier:envoy?.techniqueTiers?.["guard-break"]??9,
    ledgerCount:(state.field.ledger||[]).length
  };
}
