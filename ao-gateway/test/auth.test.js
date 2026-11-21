import test from "node:test";
import assert from "node:assert/strict";
import { authenticateRequest, assertScope, assertWorldAccess, sha256Hex } from "../src/auth.js";

const token = "ao-test-client-token-0123456789-abcdef";

async function makeRequest(value = token) {
  return new Request("https://ao.example/mcp", {
    method: "POST",
    headers: { authorization: "Bearer " + value }
  });
}

async function makeEnv(overrides = {}) {
  return {
    AO_CLIENTS: JSON.stringify([{
      clientId: "chatgpt-test",
      subjectId: "sovereign-test",
      kind: "sovereign",
      tokenSha256: await sha256Hex(token),
      scopes: ["world:read", "building:read", "building:propose"],
      worldIds: ["houston-staging"],
      active: true
    }]),
    ...overrides
  };
}

test("authenticates a registered client using a SHA-256 token digest", async () => {
  const principal = await authenticateRequest(await makeRequest(), await makeEnv());
  assert.equal(principal.clientId, "chatgpt-test");
  assert.equal(principal.subjectId, "sovereign-test");
  assert.equal(principal.kind, "sovereign");
  assert.ok(Object.isFrozen(principal));
});

test("rejects an unknown bearer token", async () => {
  const principal = await authenticateRequest(await makeRequest("unregistered-token-value-0123456789"), await makeEnv());
  assert.equal(principal, null);
});

test("rejects inactive clients", async () => {
  const env = await makeEnv();
  const records = JSON.parse(env.AO_CLIENTS);
  records[0].active = false;
  env.AO_CLIENTS = JSON.stringify(records);
  assert.equal(await authenticateRequest(await makeRequest(), env), null);
});

test("enforces capability scopes", async () => {
  const principal = await authenticateRequest(await makeRequest(), await makeEnv());
  assert.doesNotThrow(() => assertScope(principal, "building:propose"));
  assert.throws(() => assertScope(principal, "movement:propose"), /not authorized/);
});

test("enforces world allowlists independently of tool scopes", async () => {
  const principal = await authenticateRequest(await makeRequest(), await makeEnv());
  assert.doesNotThrow(() => assertWorldAccess(principal, "houston-staging"));
  assert.throws(() => assertWorldAccess(principal, "live-world"), /not authorized/);
});

test("fails closed when the client registry is missing or malformed", async () => {
  await assert.rejects(
    authenticateRequest(await makeRequest(), {}),
    /AO_CLIENTS secret is not configured/
  );
  await assert.rejects(
    authenticateRequest(await makeRequest(), { AO_CLIENTS: "not-json" }),
    SyntaxError
  );
});
