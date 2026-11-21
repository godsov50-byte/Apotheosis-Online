// AO Play MCP Worker — stateless Streamable HTTP MCP endpoint
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Deploy only behind auth before enabling writes.
const VERSION = "0.1.0";
const tools = [
 {name:"ao_world",description:"List available AO experimental worlds and status.",inputSchema:{type:"object",properties:{},additionalProperties:false}},
 {name:"ao_entities",description:"Find AO entities by ID, type, or name (limited read-only query).",inputSchema:{type:"object",properties:{world_key:{type:"string"},entity_key:{type:"string"},entity_type:{type:"string"},name:{type:"string"},limit:{type:"integer",minimum:1,maximum:50}},additionalProperties:false}},
 {name:"ao_entity",description:"Read one AO entity record by entity_key.",inputSchema:{type:"object",properties:{world_key:{type:"string"},entity_key:{type:"string"}},required:["world_key","entity_key"],additionalProperties:false}},
 {name:"ao_map",description:"Read geographic/spatial world metadata and region/chunk records. Current prototype data is grid-based; GPS conversion is not implied.",inputSchema:{type:"object",properties:{world_key:{type:"string"},region_key:{type:"string"}},required:["world_key"],additionalProperties:false}},
 {name:"ao_action_proposal",description:"Create a non-committed gameplay proposal for review. Does not mutate the live world.",inputSchema:{type:"object",properties:{world_key:{type:"string"},actor_entity_key:{type:"string"},action:{type:"string"},target_entity_key:{type:"string"},details:{type:"object"}},required:["world_key","action"],additionalProperties:false}}
];
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type, authorization","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{...cors,"Content-Type":"application/json"}});
async function db(env,path){const u=env.SUPABASE_URL;const k=env.SUPABASE_SERVICE_ROLE_KEY;if(!u||!k)throw Error("AO backend is not configured");const r=await fetch(u+"/rest/v1/"+path,{headers:{apikey:k,Authorization:"Bearer "+k}});if(!r.ok)throw Error("Backend query failed ("+r.status+")");return r.json();}
async function run(name,args,env){
 const worlds=await db(env,"exp_worlds?select=id,world_key,display_name,status,starting_location,world_config&order=created_at.asc");
 const world=worlds.find(w=>w.world_key===args.world_key);
 if(name==="ao_world")return worlds;
 if(!world)throw Error("Unknown world_key");
 if(name==="ao_entities"){
  let q="exp_entities?select=id,entity_key,entity_type,display_name,position,properties,current_state&world_id=eq."+world.id+"&limit="+(args.limit||25);
  if(args.entity_key)q+="&entity_key=eq."+encodeURIComponent(args.entity_key);
  if(args.entity_type)q+="&entity_type=eq."+encodeURIComponent(args.entity_type);
  if(args.name)q+="&display_name=ilike."+encodeURIComponent("*"+args.name+"*");
  return db(env,q);
 }
 if(name==="ao_entity"){const rows=await db(env,"exp_entities?select=*&world_id=eq."+world.id+"&entity_key=eq."+encodeURIComponent(args.entity_key));return rows[0]||null;}
 if(name==="ao_map"){
  let regions=await db(env,"exp_regions?select=*&world_id=eq."+world.id);
  if(args.region_key)regions=regions.filter(r=>r.region_key===args.region_key);
  const chunks=await db(env,"exp_chunks?select=*&world_id=eq."+world.id);
  return {world:world.display_name,regions,chunks};
 }
 if(name==="ao_action_proposal")return {accepted:false,status:"proposal_only",message:"Action captured as a proposal only. World mutations are not implemented in this release; no changes committed.",proposal:{actor_entity_key:args.actor_entity_key||null,action:args.action,target_entity_key:args.target_entity_key||null,details:args.details||{}}};
 throw Error("Unknown tool");
}
export default {async fetch(req,env){
 if(req.method==="OPTIONS")return new Response(null,{headers:cors});
 if(req.method==="GET")return new Response("AO Play MCP "+VERSION+" endpoint. Use POST /mcp.",{headers:cors});
 if(req.method!=="POST")return json({error:"Use POST"},405);
 let body;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const id=body.id??null;
 if(body.method==="initialize")return json({jsonrpc:"2.0",id,result:{protocolVersion:"2025-03-26",capabilities:{tools:{}},serverInfo:{name:"ao-play",version:VERSION}}});
 if(body.method==="notifications/initialized")return new Response(null,{status:202,headers:cors});
 if(body.method==="ping")return json({jsonrpc:"2.0",id,result:{}});
 if(body.method==="tools/list")return json({jsonrpc:"2.0",id,result:{tools}});
 if(body.method==="tools/call"){
  try{const result=await run(body.params?.name,body.params?.arguments||{},env);return json({jsonrpc:"2.0",id,result:{content:[{type:"text",text:JSON.stringify(result,null,2)}],isError:false}})}
  catch(e){return json({jsonrpc:"2.0",id,result:{content:[{type:"text",text:e.message||"Tool failed"}],isError:true}})}
 }
 return json({jsonrpc:"2.0",id,error:{code:-32601,message:"Method not found"}},400);
}};
