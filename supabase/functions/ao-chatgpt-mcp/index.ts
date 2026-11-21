import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createMcpHandler, McpServer } from "npm:@modelcontextprotocol/server@^2.0.0";
import { pipeline } from "npm:@supabase/middleware@1";
import { withOAuthProtectedResource } from "npm:@supabase/server@^1.6.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@^4.3.6";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const PUBLIC_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY")!;
const WORLD_KEY = "grand-meridian-experiment";
const RESOURCE_METADATA = "https://hixbtiuibtyiqrtacver.supabase.co/functions/v1/ao-chatgpt-mcp/oauth-protected-resource";

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authClient = createClient(SUPABASE_URL, PUBLIC_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function identify(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return data.user.id;
}

function authRequired() {
  return {
    content: [{ type: "text" as const, text: "Connect your Grand Meridian account to use this AO runtime tool." }],
    isError: true,
    _meta: {
      "mcp/www_authenticate": [
        `Bearer resource_metadata="${RESOURCE_METADATA}", error="insufficient_scope", error_description="Sign in and approve AO WorldHeart access to continue"`,
      ],
    },
  };
}

function result(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

async function getWorld() {
  const { data, error } = await admin
    .from("exp_worlds")
    .select("id,world_key,display_name,status,starting_location,world_config")
    .eq("world_key", WORLD_KEY)
    .single();
  if (error || !data || data.status !== "experimental") {
    throw new Error("The Grand Meridian experimental world is unavailable.");
  }
  return data;
}

async function getActor(userId: string, worldId: string) {
  const { data: envoy, error } = await admin
    .from("exp_envoys")
    .select("id,display_name,tier,envoy_status,entity_id,attributes")
    .eq("world_id", worldId)
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Could not load the authenticated Envoy.");
  if (!envoy) return null;
  const { data: position, error: positionError } = await admin
    .from("exp_envoy_positions")
    .select("x,z,revision,updated_at")
    .eq("envoy_id", envoy.id)
    .single();
  if (positionError) throw new Error("Could not load the Envoy position.");
  return { ...envoy, position };
}

async function loadScene(userId: string) {
  const world = await getWorld();
  const [regions, chunks, entities, state, actor] = await Promise.all([
    admin.from("exp_regions").select("id,region_key,display_name,bounds,region_data").eq("world_id", world.id),
    admin.from("exp_chunks").select("id,chunk_key,origin_x,origin_z,width,depth,terrain_data").eq("world_id", world.id),
    admin.from("exp_entities").select("id,entity_key,entity_type,display_name,position,properties,current_state,state_version").eq("world_id", world.id).order("entity_key"),
    admin.from("exp_world_state").select("revision,state,updated_at").eq("world_id", world.id).single(),
    getActor(userId, world.id),
  ]);
  if (regions.error || chunks.error || entities.error || state.error) {
    throw new Error("The experimental scene could not be loaded.");
  }
  return {
    world: {
      id: world.id,
      world_key: world.world_key,
      display_name: world.display_name,
      status: world.status,
      starting_location: world.starting_location,
      world_config: world.world_config,
    },
    world_state: state.data,
    regions: regions.data ?? [],
    chunks: chunks.data ?? [],
    entities: entities.data ?? [],
    actor,
  };
}

function buildServer(userId: string | null) {
  const server = new McpServer({ name: "ao-grand-meridian", version: "0.1.1" });
  const auth = { securitySchemes: [{ type: "oauth2", scopes: ["openid", "email", "profile"] }] };

  server.registerTool(
    "get_grand_meridian_scene",
    {
      title: "Read Grand Meridian",
      description: "Read the current experimental scene, spatial entities, world revision, and the authenticated user's Envoy and position. This does not create an Envoy.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async () => {
      if (!userId) return authRequired();
      try { return result(await loadScene(userId)); }
      catch (e) { return fail(e instanceof Error ? e.message : "SCENE_READ_FAILED"); }
    },
  );

  server.registerTool(
    "enter_grand_meridian",
    {
      title: "Enter Grand Meridian",
      description: "Create or retrieve the authenticated user's provisional experimental Visitor Envoy, then return the updated scene. This creates an experimental identity only; it assigns no Tier or attributes.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      _meta: auth,
    },
    async () => {
      if (!userId) return authRequired();
      try {
        const { data, error } = await admin.rpc("exp_register_visitor", { p_auth_user_id: userId });
        if (error || !data?.envoy_id) throw new Error("ENVOY_REGISTRATION_FAILED");
        return result({ registration: data, scene: await loadScene(userId) });
      } catch (e) { return fail(e instanceof Error ? e.message : "ENVOY_REGISTRATION_FAILED"); }
    },
  );

  server.registerTool(
    "move_grand_meridian_envoy",
    {
      title: "Move Envoy",
      description: "Submit an Envoy position intent in prototype world coordinates. The server checks world bounds and movement speed and records accepted position changes in the experimental ledger. IMPORTANT LIMITATION: server-side wall, obstacle, stair, elevation, and capsule collision validation is not implemented.",
      inputSchema: z.object({ x: z.number().finite().min(-29).max(29), z: z.number().finite().min(-76).max(22) }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ x, z }) => {
      if (!userId) return authRequired();
      try {
        const { data, error } = await admin.rpc("exp_update_envoy_position", { p_auth_user_id: userId, p_x: x, p_z: z });
        if (error) throw new Error(error.message.includes("MOVEMENT_RATE_EXCEEDED") ? "MOVEMENT_RATE_EXCEEDED" : "MOVE_REJECTED");
        return result({ accepted: true, position: data, scene: await loadScene(userId) });
      } catch (e) { return fail(e instanceof Error ? e.message : "MOVE_REJECTED"); }
    },
  );

  server.registerTool(
    "interact_with_grand_meridian",
    {
      title: "Interact with Grand Meridian",
      description: "Submit a supported interaction to the experimental Kernel API. Valid actions: open_door, close_door, inspect_exhibit, toggle_sconce. The backend checks Envoy identity, target, range, allowed action, and idempotency, then appends a committed event. Reuse the same idempotency_key when retrying the same intent.",
      inputSchema: z.object({
        action: z.enum(["open_door", "close_door", "inspect_exhibit", "toggle_sconce"]),
        target_key: z.string().min(1).max(120),
        idempotency_key: z.string().min(16).max(128),
        payload: z.record(z.string(), z.unknown()).optional().default({}),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ action, target_key, idempotency_key, payload }) => {
      if (!userId) return authRequired();
      try {
        const { data, error } = await admin.rpc("exp_commit_interaction", {
          p_auth_user_id: userId,
          p_action: action,
          p_target_key: target_key,
          p_idempotency_key: idempotency_key,
          p_payload: payload ?? {},
        });
        if (error) {
          const message = error.message ?? "";
          const known = ["OUT_OF_INTERACTION_RANGE", "TARGET_NOT_FOUND", "ACTION_NOT_ALLOWED_FOR_TARGET", "INVALID_SCONCE_COORDINATE", "ENVOY_NOT_FOUND"];
          throw new Error(known.find((x) => message.includes(x)) ?? "ACTION_REJECTED");
        }
        return result({ committed: data, scene: await loadScene(userId) });
      } catch (e) { return fail(e instanceof Error ? e.message : "ACTION_REJECTED"); }
    },
  );

  server.registerTool(
    "inspect_grand_meridian_entity",
    {
      title: "Inspect Scene Entity",
      description: "Read one entity by its stable entity_key, including its current state and spatial position.",
      inputSchema: z.object({ entity_key: z.string().min(1).max(120) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ entity_key }) => {
      if (!userId) return authRequired();
      try {
        const world = await getWorld();
        const { data, error } = await admin.from("exp_entities")
          .select("entity_key,entity_type,display_name,position,properties,current_state,state_version")
          .eq("world_id", world.id).eq("entity_key", entity_key).single();
        if (error || !data) throw new Error("ENTITY_NOT_FOUND");
        return result(data);
      } catch (e) { return fail(e instanceof Error ? e.message : "ENTITY_READ_FAILED"); }
    },
  );

  server.registerTool(
    "read_grand_meridian_event_history",
    {
      title: "Read Event History",
      description: "Read the most recent committed events in the Grand Meridian experimental world's append-only ledger.",
      inputSchema: z.object({ limit: z.number().int().min(1).max(30).optional().default(15) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ limit }) => {
      if (!userId) return authRequired();
      try {
        const world = await getWorld();
        const { data, error } = await admin.from("exp_event_ledger")
          .select("sequence_no,event_type,actor_envoy_id,subject_entity_id,payload,committed_at")
          .eq("world_id", world.id).order("sequence_no", { ascending: false }).limit(limit);
        if (error) throw new Error("EVENT_HISTORY_READ_FAILED");
        return result({ events: data ?? [] });
      } catch (e) { return fail(e instanceof Error ? e.message : "EVENT_HISTORY_READ_FAILED"); }
    },
  );


  server.registerTool(
    "list_grand_meridian_buildings",
    {
      title: "List Grand Meridian Buildings",
      description: "List committed building entities in the isolated Grand Meridian experimental world. Returns source-backed entity records; it does not invent floors, rooms, ownership, or occupancy.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async () => {
      if (!userId) return authRequired();
      try {
        const world = await getWorld();
        const { data, error } = await admin.from("exp_entities")
          .select("id,entity_key,entity_type,display_name,position,properties,current_state,state_version,updated_at")
          .eq("world_id", world.id).eq("entity_type", "building").order("display_name");
        if (error) throw new Error("BUILDING_LIST_FAILED");
        return result({ world_id: world.id, buildings: data ?? [] });
      } catch (e) { return fail(e instanceof Error ? e.message : "BUILDING_LIST_FAILED"); }
    },
  );

  server.registerTool(
    "inspect_grand_meridian_building",
    {
      title: "Inspect Grand Meridian Building",
      description: "Inspect one committed building. Explicit component links are read from properties.building_entity_key. Nearby entities are returned separately as spatial candidates only; proximity is not treated as proof of containment.",
      inputSchema: z.object({ entity_key: z.string().min(1).max(120) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ entity_key }) => {
      if (!userId) return authRequired();
      try {
        const world = await getWorld();
        const { data: building, error } = await admin.from("exp_entities")
          .select("id,entity_key,entity_type,display_name,position,properties,current_state,state_version,updated_at")
          .eq("world_id", world.id).eq("entity_key", entity_key).eq("entity_type", "building").single();
        if (error || !building) throw new Error("BUILDING_NOT_FOUND");
        const { data: all, error: allError } = await admin.from("exp_entities")
          .select("id,entity_key,entity_type,display_name,position,properties,current_state,state_version")
          .eq("world_id", world.id).neq("entity_key", entity_key);
        if (allError) throw new Error("BUILDING_COMPONENT_READ_FAILED");
        const records = all ?? [];
        const explicitlyLinked = records.filter(item => item.properties?.building_entity_key === entity_key);
        const footprint = building.properties?.footprint ?? {};
        const width = Number(footprint.width);
        const depth = Number(footprint.depth);
        const bx = Number(building.position?.x);
        const bz = Number(building.position?.z);
        const hasBounds = Number.isFinite(width) && width > 0 && Number.isFinite(depth) && depth > 0
          && Number.isFinite(bx) && Number.isFinite(bz);
        const spatialCandidates = hasBounds ? records.filter(item => {
          const x = Number(item.position?.x), z = Number(item.position?.z);
          return Number.isFinite(x) && Number.isFinite(z)
            && Math.abs(x - bx) <= width / 2 && Math.abs(z - bz) <= depth / 2;
        }) : [];
        return result({
          building,
          explicitly_linked_components: explicitlyLinked,
          spatial_candidates_inside_declared_footprint: spatialCandidates,
          relationship_warning: "Only explicitly_linked_components have a stored building relationship. Spatial candidates are geometric matches against the declared footprint and are not canonical containment links.",
          floor_plan_status: Array.isArray(building.properties?.floor_plans) ? "floor_plans_present" : "no_structured_floor_plan_record"
        });
      } catch (e) { return fail(e instanceof Error ? e.message : "BUILDING_INSPECTION_FAILED"); }
    },
  );

  server.registerTool(
    "list_grand_meridian_building_elements",
    {
      title: "List Grand Meridian Building Elements",
      description: "List committed entrances, doors, interior spaces, stairways, platforms, fixtures, furnishings, and architectural features. Use the building entity key to filter explicit links; unlinked records remain unassigned.",
      inputSchema: z.object({
        building_entity_key: z.string().min(1).max(120).optional(),
        entity_types: z.array(z.enum(["entrance","door","interior_space","stairway","elevated_platform","architectural_feature","furnishing","fixture","decoration"])).max(9).optional()
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ building_entity_key, entity_types }) => {
      if (!userId) return authRequired();
      try {
        const world = await getWorld();
        const types = entity_types?.length ? entity_types : [
          "entrance","door","interior_space","stairway","elevated_platform",
          "architectural_feature","furnishing","fixture","decoration"
        ];
        let query = admin.from("exp_entities")
          .select("id,entity_key,entity_type,display_name,position,properties,current_state,state_version")
          .eq("world_id", world.id).in("entity_type", types).order("entity_type").order("entity_key");
        const { data, error } = await query;
        if (error) throw new Error("BUILDING_ELEMENTS_READ_FAILED");
        const all = data ?? [];
        const elements = building_entity_key
          ? all.filter(item => item.properties?.building_entity_key === building_entity_key)
          : all;
        return result({
          building_entity_key: building_entity_key ?? null,
          elements,
          unlinked_count: building_entity_key ? all.length - elements.length : 0,
          note: building_entity_key
            ? "Only exact properties.building_entity_key links are included. No spatial association is inferred."
            : "Records are listed by entity type; building membership is not inferred."
        });
      } catch (e) { return fail(e instanceof Error ? e.message : "BUILDING_ELEMENTS_READ_FAILED"); }
    },
  );

  server.registerTool(
    "propose_grand_meridian_building_change",
    {
      title: "Propose Grand Meridian Building Change",
      description: "Submit a building, entrance, room, door, stair, building-element, or NPC-assignment proposal. This writes only to the separate pending proposal queue. It does not modify exp_entities, exp_world_state, or the committed event ledger. The Sovereign must approve it in the AO WorldHeart Review Console before the experimental commit function applies it.",
      inputSchema: z.object({
        proposal_type: z.enum([
          "building.create","building.update","building.entrance.create",
          "building.room.create","building.door.create","building.stair.create",
          "building.element.create","npc.assign"
        ]),
        target_entity_key: z.string().min(1).max(120).optional(),
        idempotency_key: z.string().min(16).max(128),
        expected_world_revision: z.number().int().min(0),
        payload: z.record(z.string(), z.unknown())
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      _meta: auth,
    },
    async ({ proposal_type, target_entity_key, idempotency_key, expected_world_revision, payload }) => {
      if (!userId) return authRequired();
      try {
        if (JSON.stringify(payload).length > 32000) throw new Error("PROPOSAL_TOO_LARGE");
        const { data, error } = await admin.rpc("exp_submit_world_proposal", {
          p_auth_user_id: userId,
          p_proposal_type: proposal_type,
          p_target_entity_key: target_entity_key ?? null,
          p_idempotency_key: idempotency_key,
          p_expected_world_revision: expected_world_revision,
          p_payload: payload
        });
        if (error) {
          const message = error.message ?? "";
          const known = [
            "PROPOSAL_TYPE_NOT_ALLOWED","INVALID_IDEMPOTENCY_KEY",
            "INVALID_OR_OVERSIZED_PROPOSAL","TARGET_ENTITY_NOT_FOUND",
            "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PROPOSAL",
            "EXPECTED_WORLD_REVISION_REQUIRED","EXPERIMENT_WORLD_UNAVAILABLE"
          ];
          throw new Error(known.find(code => message.includes(code)) ?? "BUILDING_PROPOSAL_REJECTED");
        }
        return result({ ...data, note: "Pending proposal only. No world state or committed history was changed." });
      } catch (e) { return fail(e instanceof Error ? e.message : "BUILDING_PROPOSAL_FAILED"); }
    },
  );

  server.registerTool(
    "list_my_grand_meridian_proposals",
    {
      title: "List My Grand Meridian Proposals",
      description: "List only the authenticated user's own pending, rejected, stale, or committed building proposals. This tool cannot approve or reject proposals.",
      inputSchema: z.object({ status: z.enum(["pending","approved","rejected","committed","stale"]).optional() }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: auth,
    },
    async ({ status }) => {
      if (!userId) return authRequired();
      try {
        const world = await getWorld();
        let query = admin.from("exp_world_proposals")
          .select("id,proposal_type,target_entity_key,idempotency_key,expected_world_revision,payload,status,created_at,reviewed_at,review_note,committed_event_id")
          .eq("world_id", world.id).eq("proposer_auth_user_id", userId)
          .order("created_at", { ascending: false }).limit(50);
        if (status) query = query.eq("status", status);
        const { data, error } = await query;
        if (error) throw new Error("PROPOSAL_LIST_FAILED");
        return result({ proposals: data ?? [] });
      } catch (e) { return fail(e instanceof Error ? e.message : "PROPOSAL_LIST_FAILED"); }
    },
  );

  return server;
}

Deno.serve(
  pipeline(
    [withOAuthProtectedResource()],
    async (req) => {
      const userId = await identify(req);
      const handler = createMcpHandler(() => buildServer(userId));
      return handler.fetch(req);
    },
  ),
);
