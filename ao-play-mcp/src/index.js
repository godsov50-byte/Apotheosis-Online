import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const server = new McpServer({ name: "ao-play", version: "0.1.0" });

function supabaseHeaders(env) {
  return { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}`, Accept: "application/json" };
}
async function rest(env, path) {
  const url = new URL(path, env.SUPABASE_URL);
  const res = await fetch(url, { headers: supabaseHeaders(env) });
  if (!res.ok) throw new Error(`Supabase read failed (${res.status})`);
  return res.json();
}
function textResult(value) { return ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] }); }

server.tool("ao_world", "Load AO world overview and world-state snapshot.", {}, async (_, extra) => {
  const env = extra?.env;
  const worlds = await rest(env, "/rest/v1/exp_worlds?select=id,world_key,display_name,status,starting_location,world_config");
  const states = await rest(env, "/rest/v1/exp_world_state?select=world_id,revision,state,updated_at");
  return textResult({ worlds, states });
});
server.tool("ao_map", "List geographic regions and spatial chunks for a world. Pass world UUID.", { world_id: z.string().uuid() }, async ({world_id}, extra) => {
  const env = extra?.env;
  const regions = await rest(env, `/rest/v1/exp_regions?world_id=eq.${world_id}&select=id,region_key,display_name,bounds,region_data`);
  const chunks = await rest(env, `/rest/v1/exp_chunks?world_id=eq.${world_id}&select=id,region_id,chunk_key,origin_x,origin_z,width,depth,terrain_data`);
  return textResult({ regions, chunks });
});
server.tool("ao_locate", "Find entities by exact entity ID, key, or partial name.", { world_id: z.string().uuid(), query: z.string().min(1) }, async ({world_id,query}, extra) => {
  const env = extra?.env;
  const q = encodeURIComponent(query.replace(/[(),]/g," "));
  const entities = await rest(env, `/rest/v1/exp_entities?world_id=eq.${world_id}&or=(entity_key.ilike.*${q}*,display_name.ilike.*${q}*)&select=id,entity_key,entity_type,display_name,region_id,chunk_id,position,properties,current_state&limit=30`);
  return textResult(entities);
});
server.tool("ao_inspect", "Inspect a single entity by UUID.", { entity_id: z.string().uuid() }, async ({entity_id}, extra) => {
  const env = extra?.env;
  const entity = await rest(env, `/rest/v1/exp_entities?id=eq.${entity_id}&select=*&limit=1`);
  return textResult(entity);
});
server.tool("ao_action", "Submit a player action intent to AO's action queue. It does not directly alter world state; Kernel processing is not yet deployed.", { world_id: z.string().uuid(), envoy_id: z.string().uuid().optional(), action: z.string().min(1), parameters: z.record(z.string(), z.unknown()).optional() }, async (args) => {
  return textResult({ accepted: false, status: "kernel_pending", message: "Action queue and Kernel executor are not deployed yet. This tool is intentionally read-only until authorization and transactional validation are implemented.", request: args });
});

export default {
  async fetch(request, env) {
    if (request.method !== "POST" && request.method !== "GET") return new Response("Method not allowed", {status:405});
    if (request.headers.get("authorization") !== `Bearer ${env.AO_MCP_TOKEN}`) return new Response("Unauthorized", {status:401});
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    return transport.handleRequest(request);
  }
};
