import test from "node:test";
import assert from "node:assert/strict";
import { buildPedestrianGraph } from "./ao-pedestrian-access.mjs";

const geom = [{x:0,y:0},{x:5,y:0}];
const eligible = (id, from, to, kind="sidewalk", geometry=geom) => ({
 id, from, to, kind, geometry, lengthM:5,
 routingApproved:true, status:"verified", walkAccess:true,
 provenance:{source:"test fixture"}
});

test("includes only explicitly approved pedestrian edges", () => {
 const graph=buildPedestrianGraph({sidewalks:[
  eligible("walk-a","n1","n2"),
  {...eligible("candidate","n2","n3"),status:"candidate"},
  {...eligible("no-access","n3","n4"),walkAccess:false},
  {...eligible("not-approved","n4","n5"),routingApproved:false}
 ]});
 assert.equal(graph.edges.length,1);
 assert.equal(graph.edges[0].kind,"sidewalk");
 assert.deepEqual(graph.nodes,["n1","n2"]);
 assert.equal(graph.stagingOnly,true);
 assert.deepEqual(graph.nodeRegistry,[
  {id:"n1",position:{x:0,y:0,z:0},layer:"ground",spaceId:"world",provenance:{source:"test fixture"}},
  {id:"n2",position:{x:5,y:0,z:0},layer:"ground",spaceId:"world",provenance:{source:"test fixture"}}
 ]);
});

test("coordinate-backed nodes can be passed directly to the movement graph",()=>{
 const graph=buildPedestrianGraph({sidewalks:[
  eligible("walk-a","n1","n2"),
  eligible("walk-b","n2","n3","sidewalk",[{x:5,y:0},{x:10,y:0}])
 ]});
 assert.deepEqual(graph.nodeRegistry.map(n=>n.id),["n1","n2","n3"]);
 assert.deepEqual(graph.nodeRegistry.find(n=>n.id==="n2").position,{x:5,y:0,z:0});
});

test("rejects a reused node ID whose coordinates disagree",()=>{
 assert.throws(()=>buildPedestrianGraph({sidewalks:[
  eligible("walk-a","n1","n2"),
  eligible("walk-b","n2","n3","sidewalk",[{x:5.01,y:0},{x:10,y:0}])
 ]}),/Conflicting coordinates for pedestrian node n2/);
});

test("entrance connectors remain explicit and directional",()=>{
 const connector=eligible("door-connector","sidewalk-node","entrance-anchor");
 const graph=buildPedestrianGraph({entranceConnectors:[connector]});
 assert.equal(graph.edges.length,1);
 assert.equal(graph.edges[0].from,"sidewalk-node");
 assert.equal(graph.edges[0].to,"entrance-anchor");
 assert.deepEqual(graph.edges[0].modes,["walk"]);
 assert.equal(graph.nodeRegistry.length,2);
});

test("rejects malformed geometry and duplicate ids",()=>{
 assert.throws(()=>buildPedestrianGraph({sidewalks:[{id:"bad",from:"a",to:"b",geometry:[{x:NaN,y:0},{x:1,y:1}],lengthM:1}]}),/Non-finite/);
 const a=eligible("dup","a","b");
 assert.throws(()=>buildPedestrianGraph({sidewalks:[a],entranceConnectors:[a]}),/Duplicate edge id/);
});
