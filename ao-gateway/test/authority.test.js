import test from "node:test";
import assert from "node:assert/strict";
import { callAuthority, createSignedAuthorityRequest } from "../src/authority.js";

const principal = Object.freeze({
  clientId: "agent-test",
  subjectId: "azimah-agent",
  kind: "agent",
  scopes: Object.freeze(["building:propose"]),
  worldIds: Object.freeze(["houston-staging"])
});
const signingKey = "test-only-internal-signing-key-with-sufficient-length";

test("signs internal requests with a request id, timestamp, principal, and payload", async () => {
  const request = await createSignedAuthorityRequest({
    serviceName: "ao-kernel",
    channel: "intent",
    operation: "building.propose",
    principal,
    input: { world_id: "houston-staging", operation: "create" },
    signingKey,
    requestId: "request-test-001",
    issuedAt: 1795280000
  });
  const body = await request.json();
  assert.equal(request.url, "https://ao-kernel.internal/internal/mcp/v1/intent");
  assert.equal(request.headers.get("x-ao-gateway-request-id"), "request-test-001");
  assert.match(request.headers.get("x-ao-gateway-signature"), /^[a-f0-9]{64}$/);
  assert.equal(body.operation, "building.propose");
  assert.equal(body.principal.subjectId, "azimah-agent");
  assert.equal(body.input.operation, "create");
});

test("routes proposals to Kernel and returns its response", async () => {
  let captured;
  const binding = {
    async fetch(request) {
      captured = request;
      return new Response(JSON.stringify({ status: "pending_approval", proposalId: "proposal-1" }), {
        status: 202,
        headers: { "content-type": "application/json" }
      });
    }
  };
  const result = await callAuthority({
    binding,
    serviceName: "ao-kernel",
    channel: "intent",
    operation: "spatial.propose",
    principal,
    input: { world_id: "houston-staging", action: "enter" },
    signingKey
  });
  assert.equal(result.status, "pending_approval");
  assert.equal(captured.url, "https://ao-kernel.internal/internal/mcp/v1/intent");
  assert.equal(captured.method, "POST");
});

test("does not fall back to direct database access when authority binding is absent", async () => {
  await assert.rejects(callAuthority({
    binding: null,
    serviceName: "ao-worldheart",
    channel: "read",
    operation: "building.inspect",
    principal,
    input: { world_id: "houston-staging" },
    signingKey
  }), /service binding is not configured/);
});

test("rejects short internal signing secrets", async () => {
  await assert.rejects(createSignedAuthorityRequest({
    serviceName: "ao-kernel",
    channel: "intent",
    operation: "building.propose",
    principal,
    input: {},
    signingKey: "short"
  }), /at least 32 characters/);
});
