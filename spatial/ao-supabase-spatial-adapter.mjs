/**
 * Server-only Supabase adapter for AO spatial persistence.
 *
 * Inject a Supabase client created with the server-side service role.
 * NEVER import this adapter into browser code or expose the service-role key.
 * The database RPC atomically appends the transition and updates current state.
 */

const required = (value, name) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(name + " must be a non-empty string");
  return value.trim();
};

function unwrap(result, operation) {
  if (result?.error) {
    const error = new Error("AO spatial Supabase " + operation + " failed: " + result.error.message);
    error.cause = result.error;
    throw error;
  }
  return result?.data ?? null;
}

function fromChunkRow(row) {
  if (!row) return null;
  return {
    schemaVersion: 1,
    id: row.chunk_id,
    worldId: row.world_id,
    regionId: row.region_id,
    spaceId: row.space_id,
    layer: row.layer,
    grid: row.grid_config || {},
    source: row.source,
    status: row.load_state,
    entityIds: row.entity_ids || [],
    tileIds: row.tile_ids || [],
    updatedAt: row.updated_at
  };
}

export function createSupabaseSpatialAdapter({ client, worldId }) {
  worldId = required(worldId, "worldId");
  if (!client || typeof client.from !== "function" || typeof client.rpc !== "function") {
    throw new TypeError("A server-side Supabase client with from() and rpc() is required");
  }

  async function getChunk(chunkId) {
    const result = await client.from("ao_spatial_chunks")
      .select("*")
      .eq("world_id", worldId)
      .eq("chunk_id", required(chunkId, "chunkId"))
      .maybeSingle();
    return fromChunkRow(unwrap(result, "getChunk"));
  }

  async function putChunk(record) {
    if (record.worldId !== worldId) throw new Error("Chunk belongs to another world");
    const row = {
      world_id: worldId,
      chunk_id: required(record.id, "chunk.id"),
      region_id: required(record.regionId, "chunk.regionId"),
      space_id: required(record.spaceId, "chunk.spaceId"),
      layer: required(record.layer, "chunk.layer"),
      grid_config: record.grid || {},
      chunk_state: { status: record.status || "known", source: record.source || "resolver" },
      tile_ids: record.tileIds || [],
      entity_ids: record.entityIds || [],
      source: record.source || "resolver",
      load_state: record.status || "known",
      updated_at: new Date().toISOString()
    };
    const result = await client.from("ao_spatial_chunks")
      .upsert(row, { onConflict: "world_id,chunk_id" });
    unwrap(result, "putChunk");
  }

  async function getEntityAddress(entityId) {
    const result = await client.from("ao_spatial_entity_addresses")
      .select("address")
      .eq("world_id", worldId)
      .eq("entity_id", required(entityId, "entityId"))
      .maybeSingle();
    return unwrap(result, "getEntityAddress")?.address || null;
  }

  async function commitTransitionAtomic({ event, destinationAddress, destinationChunk }) {
    if (event.worldId !== worldId || destinationAddress.worldId !== worldId) {
      throw new Error("Transition belongs to another world");
    }
    const result = await client.rpc("ao_commit_spatial_transition", {
      p_event: event,
      p_destination_address: destinationAddress,
      p_destination_chunk: destinationChunk
    });
    return unwrap(result, "commitTransitionAtomic");
  }

  return Object.freeze({
    getChunk,
    putChunk,
    getEntityAddress,
    commitTransitionAtomic
  });
}
