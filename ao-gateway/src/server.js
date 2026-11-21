import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { assertScope, assertWorldAccess } from "./auth.js";
import { callAuthority, safeAuthorityError } from "./authority.js";

const id = z.string().min(1).max(200);
const worldId = z.string().min(1).max(120);
const object = z.record(z.string(), z.unknown());

function result(value, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    ...(isError ? { isError: true } : {})
  };
}

function register(server, name, description, schema, handler) {
  server.tool(name, description, schema, async args => {
    try {
      return result(await handler(args));
    } catch (error) {
      return result({ ok: false, error: safeAuthorityError(error) }, true);
    }
  });
}

function readWorld(env, principal, scope, operation, input) {
  assertScope(principal, scope);
  assertWorldAccess(principal, input.world_id);
  return callAuthority({
    binding: env.AO_WORLDHEART,
    serviceName: "ao-worldheart",
    channel: "read",
    operation,
    principal,
    input,
    signingKey: env.AO_INTERNAL_SIGNING_KEY
  });
}

function propose(env, principal, scope, operation, input) {
  assertScope(principal, scope);
  assertWorldAccess(principal, input.world_id);
  return callAuthority({
    binding: env.AO_KERNEL,
    serviceName: "ao-kernel",
    channel: "intent",
    operation,
    principal,
    input,
    signingKey: env.AO_INTERNAL_SIGNING_KEY
  });
}

function assertSmallObject(value, label, maxBytes = 24000) {
  const encoded = JSON.stringify(value);
  if (encoded.length > maxBytes) throw new Error(label + " exceeds the gateway payload limit");
  return value;
}

export function createAoMcpServer(env, principal) {
  const server = new McpServer({
    name: "apotheosis-online-shared-gateway",
    version: "0.2.0"
  });

  register(server, "ao_world_overview",
    "Read the current world overview from WorldHeart. This is a snapshot, not an authority to change the world.",
    { world_id: worldId },
    args => readWorld(env, principal, "world:read", "world.overview", args)
  );

  register(server, "ao_building_search",
    "Search current buildings by name, type, purpose, or source identifier.",
    { world_id: worldId, query: z.string().min(1).max(200), limit: z.number().int().min(1).max(50).optional() },
    args => readWorld(env, principal, "building:read", "building.search", args)
  );

  register(server, "ao_building_inspect",
    "Inspect a building's committed state, entrances, floors, rooms, doors, stairs, occupants, and provenance where available.",
    { world_id: worldId, building_id: id },
    args => readWorld(env, principal, "building:read", "building.inspect", args)
  );

  register(server, "ao_entity_spatial_address",
    "Read an entity's current derived spatial address, including world, region, chunk, tile, cell, layer, building, floor, and instance references.",
    { world_id: worldId, entity_id: id },
    args => readWorld(env, principal, "spatial:read", "spatial.entity_address", args)
  );

  register(server, "ao_spatial_resolve",
    "Resolve a supplied coordinate through the world's configured spatial resolver. Resolution does not move an entity or authorize access.",
    {
      world_id: worldId,
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      region_id: id.optional(),
      layer: z.enum(["ground", "interior", "underground", "aerial", "water", "subsurface", "instance"]).optional()
    },
    args => readWorld(env, principal, "spatial:read", "spatial.resolve", args)
  );

  register(server, "ao_event_history",
    "Read committed append-only world events. Proposed or rejected intents are not presented as committed events.",
    {
      world_id: worldId,
      entity_id: id.optional(),
      building_id: id.optional(),
      limit: z.number().int().min(1).max(100).optional()
    },
    args => readWorld(env, principal, "events:read", "events.history", args)
  );

  register(server, "ao_proposal_status",
    "Read the status of an intent previously submitted through the AO Kernel. This tool cannot approve or commit it.",
    { world_id: worldId, proposal_id: id },
    args => readWorld(env, principal, "proposal:read", "proposal.status", args)
  );

  register(server, "ao_building_propose",
    "Submit a proposed building or interior change to the AO Kernel. This creates an intent only; it does not directly edit WorldHeart. User approval and Kernel validation are required before commit.",
    {
      world_id: worldId,
      operation: z.enum(["create", "update", "entrance.create", "room.create", "door.create", "stair.create", "construction.advance"]),
      building_id: id.optional(),
      proposal: object,
      idempotency_key: z.string().min(16).max(128)
    },
    args => {
      assertSmallObject(args.proposal, "Building proposal");
      return propose(env, principal, "building:propose", "building.propose", args);
    }
  );

  register(server, "ao_movement_propose",
    "Submit a movement or building portal intent to the AO Kernel. Allowed actions are walk, enter, exit, and stairs. The Kernel validates origin, route, permissions, collision, and transition rules before any commit.",
    {
      world_id: worldId,
      entity_id: id,
      action: z.enum(["walk", "enter", "exit", "stairs"]),
      destination: object,
      expected_origin_address_key: z.string().min(1).max(1000),
      idempotency_key: z.string().min(16).max(128)
    },
    args => {
      assertSmallObject(args.destination, "Movement destination", 8000);
      return propose(env, principal, "movement:propose", "spatial.propose", args);
    }
  );

  register(server, "ao_npc_assignment_propose",
    "Propose assigning an existing NPC to a building, room, or role. This does not create an NPC or assign one automatically; the Kernel checks that the NPC and destination exist and that the actor may assign them.",
    {
      world_id: worldId,
      npc_id: id,
      building_id: id,
      room_id: id.optional(),
      role: z.string().min(1).max(120),
      idempotency_key: z.string().min(16).max(128)
    },
    args => propose(env, principal, "npc:propose", "npc.assignment.propose", args)
  );

  return server;
}
