import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { McpServer } from 'npm:@modelcontextprotocol/sdk@1.25.3/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from 'npm:@modelcontextprotocol/sdk@1.25.3/server/webStandardStreamableHttp.js'
import { z } from 'npm:zod@4.1.13'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, mcp-session-id, mcp-protocol-version, accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function readRest(env: Record<string, string>, path: string) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || !env.SUPABASE_URL) throw new Error('AO backend is not configured')
  const url = new URL(path, env.SUPABASE_URL)
  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('AO data read failed')
  return await response.json()
}

function textResult(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] }
}

function createServer(env: Record<string, string>) {
  const server = new McpServer({ name: 'ao-play', version: '0.2.0' })

  server.registerTool('ao_world', {
    title: 'AO World Overview',
    description: 'Read world overview and current world-state snapshot.',
    inputSchema: {},
  }, async () => {
    const [worlds, states] = await Promise.all([
      readRest(env, '/rest/v1/exp_worlds?select=id,world_key,display_name,status,starting_location,world_config'),
      readRest(env, '/rest/v1/exp_world_state?select=world_id,revision,state,updated_at'),
    ])
    return textResult({ worlds, states })
  })

  server.registerTool('ao_map', {
    title: 'AO Map Data',
    description: 'Read geographic regions and spatial chunks. Supply a world UUID.',
    inputSchema: { world_id: z.string().uuid() },
  }, async ({ world_id }) => {
    const [regions, chunks] = await Promise.all([
      readRest(env, `/rest/v1/exp_regions?world_id=eq.${world_id}&select=id,region_key,display_name,bounds,region_data`),
      readRest(env, `/rest/v1/exp_chunks?world_id=eq.${world_id}&select=id,region_id,chunk_key,origin_x,origin_z,width,depth,terrain_data`),
    ])
    return textResult({ regions, chunks })
  })

  server.registerTool('ao_locate', {
    title: 'Locate AO Entity',
    description: 'Find entities by entity key, ID, or partial display name in the specified world.',
    inputSchema: { world_id: z.string().uuid(), query: z.string().min(1).max(100) },
  }, async ({ world_id, query }) => {
    const safe = query.replace(/[(),*]/g, ' ').trim()
    const filter = encodeURIComponent(`(entity_key.ilike.*${safe}*,display_name.ilike.*${safe}*)`)
    const entities = await readRest(env, `/rest/v1/exp_entities?world_id=eq.${world_id}&or=${filter}&select=id,entity_key,entity_type,display_name,region_id,chunk_id,position,properties,current_state&limit=30`)
    return textResult(entities)
  })

  server.registerTool('ao_inspect', {
    title: 'Inspect AO Entity',
    description: 'Read an entity record by UUID.',
    inputSchema: { entity_id: z.string().uuid() },
  }, async ({ entity_id }) => {
    const entity = await readRest(env, `/rest/v1/exp_entities?id=eq.${entity_id}&select=*&limit=1`)
    return textResult(entity)
  })

  server.registerTool('ao_action', {
    title: 'AO Action Intent (Disabled)',
    description: 'Submit a player intent. Disabled until Kernel authorization, transactional validation, and action queue are implemented.',
    inputSchema: { world_id: z.string().uuid(), envoy_id: z.string().uuid().optional(), action: z.string().min(1).max(200), parameters: z.record(z.string(), z.unknown()).optional() },
  }, async (args) => textResult({ accepted: false, status: 'kernel_pending', message: 'Action execution is not enabled. No world state was changed.', request: args }))

  return server
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonError(405, 'Method not allowed')
  const token = Deno.env.get('AO_MCP_TOKEN')
  if (!token) return jsonError(503, 'AO Play endpoint is deployed but its authentication secret has not been configured.')
  if (request.headers.get('authorization') !== `Bearer ${token}`) return jsonError(401, 'Unauthorized')

  try {
    const server = createServer({
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ?? '',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    })
    const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
    await server.connect(transport)
    const response = await transport.handleRequest(request)
    const headers = new Headers(response.headers)
    for (const [key, value] of Object.entries(corsHeaders)) headers.set(key, value)
    return new Response(response.body, { status: response.status, headers })
  } catch {
    return jsonError(500, 'AO Play request failed safely. Check backend configuration.')
  }
})
