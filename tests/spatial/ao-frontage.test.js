const test=require("node:test"),assert=require("node:assert/strict");
const {createStreetNetwork}=require("../../geography/ao-street-network.js");
const {deriveFrontage}=require("../../geography/ao-frontage.js");
const streets=()=>createStreetNetwork({width:20,height:20,streets:[
{id:"n",name:"North Road",type:"local",width:2,points:[{x:1,y:2},{x:18,y:2}]},
{id:"e",name:"East Road",type:"arterial",width:3,points:[{x:18,y:1},{x:18,y:18}]}
]});
test("building frontage selects closest side and records street relationship",()=>{const result=deriveFrontage({streetNetwork:streets(),footprint:{id:"shop-1",x:5,y:5,w:5,h:4},maxDistance:10});assert.ok(result.primary);assert.equal(result.primary.buildingSide,"north");assert.equal(result.primary.streetName,"North Road");assert.equal(result.primary.distance,3);assert.ok(result.accessibleSides.includes("north"));});
test("frontage returns no street relationships beyond max distance",()=>{const result=deriveFrontage({streetNetwork:streets(),footprint:{x:4,y:14,w:3,h:3},maxDistance:1});assert.equal(result.primary,null);assert.deepEqual(result.frontages,[]);});
test("invalid footprint dimensions and distance are rejected",()=>{assert.throws(()=>deriveFrontage({streetNetwork:streets(),footprint:{x:1,y:1,w:0,h:2}}));assert.throws(()=>deriveFrontage({streetNetwork:streets(),footprint:{x:1,y:1,w:2,h:2},maxDistance:-1}));});
