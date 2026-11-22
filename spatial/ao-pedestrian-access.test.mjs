import test from "node:test";
import assert from "node:assert/strict";
import { buildPedestrianGraph } from "./ao-pedestrian-access.mjs";

const geom = [{x:0,y:0},{x:5,y:0}];
const eligible = (id, from, to, kind="sidewalk") => ({
 id, from, to, kind, geometry:geom, lengthM:5,
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
});

test("entrance connectors remain explicit and directional",()=>{
 const connector=eligible("door-connector","sidewalk-node","entrance-anchor");
 const graph=buildPedestrianGraph({entranceConnectors:[connector]});
 assert.equal(graph.edges.length,1);
 assert.equal(graph.edges[0].from,"sidewalk-node");
 assert.equal(graph.edges[0].to,"entrance-anchor");
 assert.deepEqual(graph.edges[0].modes,["walk"]);
});

test("rejects malformed geometry and duplicate ids",()=>{
 assert.throws(()=>buildPedestrianGraph({sidewalks:[{id:"bad",from:"a",to:"b",geometry:[{x:NaN,y:0},{x:1,y:1}],lengthM:1}]}),/Non-finite/);
 const a=eligible("dup","a","b");
 assert.throws(()=>buildPedestrianGraph({sidewalks:[a],entranceConnectors:[a]}),/Duplicate edge id/);
});
