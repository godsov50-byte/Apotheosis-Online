import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../engine/technique-pipeline.mjs";

function fixture() {
  const field = {
    width: 8, height: 8, version: 0, ledger: [], acted: {},
    cells: {},
    entities: {
      envoy: { id:"envoy", side:"white", class:"Saber", archetype:"Anti-Unit", position:{x:1,y:1}, alive:true,
        techniques:["cut","mend","bind"], offensiveTechniqueId:"cut", techniqueSlots:["mend","bind"],
        ap:{current:8,max:8,reserved:0}, ea:{current:6,max:6,reserved:0,affinities:["Fire"]},
        hp:{current:20,max:20}, stats:{}, defense:{DR:0,resistance:{}}, statuses:[] },
      foe: { id:"foe", side:"black", position:{x:2,y:1}, alive:true, hp:{current:18,max:18},
        ap:{current:8,max:8,reserved:0}, ea:{current:4,max:4,reserved:0}, defense:{DR:2,resistance:{physical:.25}}, statuses:[] },
      ally: { id:"ally", side:"white", position:{x:1,y:2}, alive:true, hp:{current:5,max:20}, statuses:[] }
    }
  };
  const registry = T.createTechniqueRegistry([
    {id:"cut",name:"Measured Cut",tier:5,classRequirements:["Saber"],target:{type:"enemy"},geometry:{range:1,chessMotion:"King"},chessMotion:"King",cost:{ap:2,ea:1},uses:2,cooldown:1,effects:[{type:"damage",packets:[{type:"physical",amount:10,penetration:1}],break:2}]},
    {id:"mend",name:"Mend",target:{type:"ally"},geometry:{range:2},cost:{ap:1,ea:2},effects:[{type:"heal",amount:8}]},
    {id:"bind",name:"Binding Seal",target:{type:"enemy"},geometry:{range:3},cost:{ap:1,ea:1},effects:[{type:"status",status:{id:"bound",duration:2,stackRule:"refresh"}}]}
  ]);
  return {field,registry};
}

test("technique registry validates records and rejects duplicate IDs",()=>{
  assert.throws(()=>T.createTechnique({name:"Missing ID"}),/id and name/);
  assert.throws(()=>T.createTechniqueRegistry([{id:"x",name:"X"},{id:"x",name:"Again"}]),/duplicate/);
  assert.throws(()=>T.createTechnique({id:"bad",name:"Bad",chessMotion:"Dragon"}),/chess motion/);
});
test("loadout only equips learned techniques",()=>{
  const {field}=fixture(), e=field.entities.envoy;
  assert.equal(T.assignTechniqueLoadout(e,{offensive:"cut",slots:["mend"]}).offensiveTechniqueId,"cut");
  assert.throws(()=>T.assignTechniqueLoadout(e,{offensive:"unknown"}),/learned/);
});
test("chess motion generates distinct legal target patterns",()=>{
  const origin={x:3,y:3};
  assert.equal(T.chessMotionCells(origin,"King",4).length,8);
  assert.equal(T.chessMotionCells(origin,"Knight",2).length,8);
  assert.ok(T.chessMotionCells(origin,"Rook",2).some(p=>p.x===3&&p.y===1));
  assert.ok(!T.chessMotionCells(origin,"Bishop",2).some(p=>p.x===3&&p.y===1));
});
test("validation checks ownership, requirements, target, range and resources without spending",()=>{
  const {field,registry}=fixture();
  const intent={actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}};
  assert.equal(T.validateTechniqueIntent(field,intent,registry,{requireOffensiveSlot:true}).ok,true);
  assert.equal(T.validateTechniqueIntent(field,{...intent,techniqueId:"unknown"},registry).reason,"unknown_technique");
  assert.equal(T.validateTechniqueIntent(field,{...intent,target:{entityId:"ally"}},registry).reason,"target_must_be_enemy");
  const broke=structuredClone(field);broke.entities.envoy.ap.current=1;
  assert.equal(T.validateTechniqueIntent(broke,intent,registry).reason,"insufficient_AP");
  assert.equal(field.entities.envoy.ap.current,8);
});
test("resolution spends AP and EA independently and applies penetration, DR, resistance and Break",()=>{
  const {field,registry}=fixture();
  const result=T.resolveTechniqueIntent(field,{actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}},registry,{requireOffensiveSlot:true});
  assert.equal(result.ok,true);
  assert.equal(result.field.entities.envoy.ap.current,6);
  assert.equal(result.field.entities.envoy.ea.current,5);
  // 10 raw - (2 DR - 1 penetration), then 25% resistance = 6.75 => rounded total 7
  assert.equal(result.field.entities.foe.hp.current,11);
  assert.equal(result.field.entities.foe.defense.break,2);
  assert.equal(result.field.ledger.at(-1).type,"technique_resolved");
  assert.equal(field.entities.foe.hp.current,18,"input field remains immutable");
});
test("failed validation does not consume resources or mark actor acted",()=>{
  const {field,registry}=fixture();
  const result=T.resolveTechniqueIntent(field,{actorId:"envoy",techniqueId:"cut",target:{entityId:"ally"}},registry);
  assert.equal(result.ok,false);
  assert.equal(result.field.entities.envoy.ap.current,8);
  assert.equal(result.field.entities.envoy.ea.current,6);
  assert.equal(result.field.entities.envoy.acted,undefined);
});
test("ally healing and enemy status effects use the same pipeline",()=>{
  const {field,registry}=fixture();
  const healed=T.resolveTechniqueIntent(field,{actorId:"envoy",techniqueId:"mend",target:{entityId:"ally"}},registry);
  assert.equal(healed.field.entities.ally.hp.current,13);
  const bound=T.resolveTechniqueIntent(field,{actorId:"envoy",techniqueId:"bind",target:{entityId:"foe"}},registry);
  assert.equal(bound.field.entities.foe.statuses[0].id,"bound");
});
test("uses, cooldowns and action lock are enforced",()=>{
  const {field,registry}=fixture();
  const used=T.resolveTechniqueIntent(field,{actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}},registry);
  assert.equal(used.ok,true);
  assert.equal(T.validateTechniqueIntent(used.field,{actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}},registry).reason,"already_acted");
  const cooled=T.tickTechniqueCooldowns(used.field.entities.envoy);
  assert.equal(cooled.techniqueState.cut.cooldownRemaining,0);
});

test("turn reset clears action lock and optionally advances cooldowns",()=>{
  const {field,registry}=fixture();
  const used=T.resolveTechniqueIntent(field,{actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}},registry);
  const reset=T.resetTechniqueTurn(used.field.entities.envoy);
  assert.equal(reset.acted,undefined);
  assert.equal(reset.techniqueState.cut.cooldownRemaining,0);
  assert.equal(T.validateTechniqueIntent({...used.field,entities:{...used.field.entities,envoy:reset},activeSide:"white"},{actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}},registry).ok,true);
});
test("active side and malformed targets are rejected safely",()=>{
  const {field,registry}=fixture();
  assert.equal(T.validateTechniqueIntent({...field,activeSide:"black"},{actorId:"envoy",techniqueId:"cut",target:{entityId:"foe"}},registry).reason,"not_active_side");
  assert.equal(T.validateTechniqueIntent(field,{actorId:"envoy",techniqueId:"cut",target:{}},registry).reason,"target_missing");
});
