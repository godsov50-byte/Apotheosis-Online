import test from "node:test";
import assert from "node:assert/strict";
import { MockKernel } from "../src/kernel.js";

const req = (request_id, request_type, payload, extra = {}) => ({
  contract_version: "1.0", request_id, request_type, payload, ...extra
});
const move = (id, x, extra = {}) => req(id, "action", {
  domain: "movement", verb: "move", parameters: { destination: { x, y: 0, z: 0 }, ...extra }
}, { actor_id: "character_anasi" });

test("1 perception is read-only", async () => {
  const k = new MockKernel(); const before = k.snapshot();
  const r = await k.handle(req("p1","perception",{mode:"look"},{actor_id:"character_anasi"}));
  assert.equal(r.outcome,"none"); assert.deepEqual(k.snapshot(),before);
});

test("2 movement returns committed authoritative result", async () => {
  const k = new MockKernel(); const r = await k.handle(move("m1",4));
  assert.equal(r.outcome,"committed"); assert.deepEqual(k.positions.get("character_anasi"),{x:4,y:0,z:0});
  assert.equal(r.events.length,1); assert.equal(r.history_record_ids.length,1);
});

test("3 ambiguous movement requests clarification", async () => {
  const k = new MockKernel(); const r = await k.handle(req("m2","action",{domain:"movement",verb:"move"},{actor_id:"character_anasi"}));
  assert.equal(r.request_status,"needs_clarification"); assert.equal(r.error.code,"AMBIGUOUS_REFERENCE");
});

test("4 clarification is marked for revalidation", async () => {
  const k = new MockKernel(); const r = await k.handle(req("c1","clarification",{original_request_id:"m2",answer:"the northern bridge",selected_entity_id:"bridge_1"}));
  assert.equal(r.result.requires_revalidation,true);
});

test("5 impossible movement is rejected", async () => {
  const k = new MockKernel(); const r = await k.handle(move("m3",5,{blocked:true}));
  assert.equal(r.outcome,"rejected"); assert.equal(r.error.code,"PATH_BLOCKED");
  assert.deepEqual(k.positions.get("character_anasi"),{x:0,y:0,z:0});
});

test("6 partial completion preserves committed partial effects", async () => {
  const k = new MockKernel(); const r = await k.handle(req("a6","action",{domain:"construction",verb:"build",parameters:{simulatePartial:true}},{actor_id:"character_anasi"}));
  assert.equal(r.outcome,"partial"); assert.equal(k.history.length,1); assert.ok(r.result.remaining);
});

test("7 long-running execution can be queried", async () => {
  const k = new MockKernel(); const start = await k.handle(req("a7","action",{domain:"exploration",verb:"survey",parameters:{longRunning:true}},{actor_id:"character_anasi"}));
  const status = await k.handle(req("s7","status",{execution_id:start.execution_id}));
  assert.equal(status.execution_status,"running");
});

test("8 retry with same request id is not executed twice", async () => {
  const k = new MockKernel(); await k.handle(move("m8",8)); await k.handle(move("m8",8));
  assert.equal(k.revision,1); assert.equal(k.events.length,1);
});

test("9 idempotency key prevents duplicate effects across request ids", async () => {
  const k = new MockKernel();
  const a = move("m9a",9); a.payload.idempotency_key = "same-operation";
  const b = move("m9b",9); b.payload.idempotency_key = "same-operation";
  await k.handle(a); await k.handle(b); assert.equal(k.revision,1);
});

test("10 concurrent stale-world writes cannot both commit", async () => {
  const k = new MockKernel();
  const a = move("m10a",1,{ }); a.expected_world_revision = "world_0";
  const b = move("m10b",2,{ }); b.expected_world_revision = "world_0";
  const first = await k.handle(a); const second = await k.handle(b);
  assert.equal(first.outcome,"committed"); assert.equal(second.error.code,"STALE_WORLD_STATE");
});

test("11 persistence failure never reports committed", async () => {
  const k = new MockKernel({failNextCommit:true}); const r = await k.handle(move("m11",11));
  assert.equal(r.error.code,"PERSISTENCE_FAILURE"); assert.notEqual(r.outcome,"committed");
  assert.equal(k.revision,0); assert.equal(k.history.length,0);
});

test("12 perception does not disclose hidden source identities", async () => {
  const k = new MockKernel(); const r = await k.handle(req("p12","perception",{mode:"listen"},{actor_id:"character_anasi"}));
  assert.equal(r.result.observations[0].classification,"observed");
  assert.equal("hidden_source_id" in r.result.observations[0],false);
});

test("13 narrative text cannot create a world event", async () => {
  const k = new MockKernel(); await k.handle(req("p13","perception",{mode:"look"},{actor_id:"character_anasi"}));
  assert.equal(k.events.length,0); assert.equal(k.history.length,0);
});

test("14 current state and committed history advance together", async () => {
  const k = new MockKernel(); const r = await k.handle(move("m14",14));
  assert.equal(k.worldRevision(),r.world_revision);
  assert.equal(k.history[0].event.world_revision,r.world_revision);
  assert.deepEqual(k.history[0].event.changes[0].after,k.positions.get("character_anasi"));
});

test("15 fresh interface can recover state without conversation memory", async () => {
  const k = new MockKernel(); await k.handle(move("m15",15));
  const restoredFromAuthority = k.snapshot();
  assert.deepEqual(restoredFromAuthority.positions.character_anasi,{x:15,y:0,z:0});
  assert.equal(restoredFromAuthority.history.length,1);
});

test("16 request id reuse with changed payload is rejected", async () => {
  const k = new MockKernel();
  const original = move("same-id", 4);
  const first = await k.handle(original);
  const altered = move("same-id", 7);
  const second = await k.handle(altered);
  assert.equal(first.outcome, "committed");
  assert.equal(second.error.code, "REQUEST_ID_REUSED");
  assert.deepEqual(k.positions.get("character_anasi"), { x: 4, y: 0, z: 0 });
  assert.equal(k.revision, 1);
});

test("17 idempotency key reuse with changed action is rejected", async () => {
  const k = new MockKernel();
  const first = move("idem-a", 5); first.payload.idempotency_key = "bound-key";
  const second = move("idem-b", 6); second.payload.idempotency_key = "bound-key";
  const a = await k.handle(first); const b = await k.handle(second);
  assert.equal(a.outcome, "committed");
  assert.equal(b.error.code, "IDEMPOTENCY_KEY_REUSED");
  assert.equal(k.revision, 1);
});

test("18 request fingerprints ignore object key order", async () => {
  const k = new MockKernel();
  const a = move("order-id", 8);
  const b = { ...a, payload: { ...a.payload, parameters: { destination: { z: 0, y: 0, x: 8 } } } };
  const first = await k.handle(a); const second = await k.handle(b);
  assert.equal(first.outcome, "committed");
  assert.equal(second.outcome, "committed");
  assert.equal(k.revision, 1);
});
test("19 long-running requests are idempotent and key-bound", async () => {
  const k = new MockKernel();
  const a = req("long-a", "action", { domain: "exploration", verb: "survey", parameters: { longRunning: true } }, { actor_id: "character_anasi" });
  a.payload.idempotency_key = "long-key";
  const b = req("long-b", "action", { domain: "exploration", verb: "survey", parameters: { longRunning: true } }, { actor_id: "character_anasi" });
  b.payload.idempotency_key = "long-key";
  const first = await k.handle(a); const replay = await k.handle(b);
  assert.equal(first.execution_id, replay.execution_id);
  assert.equal(k.executions.size, 1);
  const altered = req("long-c", "action", { domain: "exploration", verb: "survey", parameters: { longRunning: true, other: true } }, { actor_id: "character_anasi" });
  altered.payload.idempotency_key = "long-key";
  const conflict = await k.handle(altered);
  assert.equal(conflict.error.code, "IDEMPOTENCY_KEY_REUSED");
});