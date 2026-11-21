import test from "node:test";
import assert from "node:assert/strict";
import { createSupabaseSpatialAdapter } from "./ao-supabase-spatial-adapter.mjs";

function mockClient() {
  const calls = [];
  const client = {
    from(table) {
      const query = {
        select(columns) { calls.push(["select", table, columns]); return query; },
        eq(key, value) { calls.push(["eq", table, key, value]); return query; },
        maybeSingle() {
          return Promise.resolve({ data: table === "ao_spatial_chunks" ? {
            chunk_id: "r:chunk:0:0:0", world_id: "world-a", region_id: "r",
            space_id: "region:r", layer: "ground",
            grid_config: { chunkX: 0, chunkY: 0, chunkZ: 0 },
            source: "kernel", load_state: "known", tile_ids: [], entity_ids: [], updated_at: null
          } : { address: { schemaVersion: 1, worldId: "world-a" } }, error: null });
        },
        upsert(row, options) {
          calls.push(["upsert", table, row, options]);
          return Promise.resolve({ data: null, error: null });
        }
      };
      return query;
    },
    rpc(name, args) {
      calls.push(["rpc", name, args]);
      return Promise.resolve({ data: "transition-id", error: null });
    }
  };
  return { client, calls };
}

test("server adapter maps persisted chunk rows to resolver chunk records", async () => {
  const { client } = mockClient();
  const adapter = createSupabaseSpatialAdapter({ client, worldId: "world-a" });
  const chunk = await adapter.getChunk("r:chunk:0:0:0");
  assert.equal(chunk.id, "r:chunk:0:0:0");
  assert.equal(chunk.worldId, "world-a");
  assert.equal(chunk.grid.chunkZ, 0);
});

test("server adapter routes transition commits through the atomic database RPC", async () => {
  const { client, calls } = mockClient();
  const adapter = createSupabaseSpatialAdapter({ client, worldId: "world-a" });
  const event = { worldId: "world-a", entityId: "e1" };
  const address = { worldId: "world-a", chunkId: "chunk-1" };
  const chunk = { worldId: "world-a", id: "chunk-1" };
  const result = await adapter.commitTransitionAtomic({
    event, destinationAddress: address, destinationChunk: chunk
  });
  assert.equal(result, "transition-id");
  const rpc = calls.find(call => call[0] === "rpc");
  assert.equal(rpc[1], "ao_commit_spatial_transition");
  assert.equal(rpc[2].p_event, event);
  assert.equal(rpc[2].p_destination_address, address);
  assert.equal(rpc[2].p_destination_chunk, chunk);
  assert.equal(calls.filter(call => call[0] === "upsert").length, 0);
});

test("server adapter rejects a transition for another world", async () => {
  const { client } = mockClient();
  const adapter = createSupabaseSpatialAdapter({ client, worldId: "world-a" });
  await assert.rejects(() => adapter.commitTransitionAtomic({
    event: { worldId: "world-b" },
    destinationAddress: { worldId: "world-b" },
    destinationChunk: { worldId: "world-b" }
  }), /another world/);
});

test("server adapter requires an injected Supabase client", () => {
  assert.throws(() => createSupabaseSpatialAdapter({ worldId: "world-a" }), /server-side Supabase client/);
});
