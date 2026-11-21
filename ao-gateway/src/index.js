import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { authenticateRequest } from "./auth.js";
import { createAoMcpServer } from "./server.js";

const MAX_REQUEST_BYTES = 64 * 1024;

function json(value, status, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });
}

function allowedOrigins(env) {
  return String(env.AO_ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return {};
  const allowed = allowedOrigins(env);
  if (!allowed.includes(origin) && !allowed.includes("*")) return null;
  return {
    "access-control-allow-origin": allowed.includes("*") ? "*" : origin,
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID",
    "access-control-expose-headers": "MCP-Protocol-Version, MCP-Session-Id",
    "vary": "Origin"
  };
}

function withCors(response, headers) {
  if (!headers) return response;
  const merged = new Headers(response.headers);
  for (const [key, value] of Object.entries(headers)) merged.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: merged });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ status: "ok", service: "ao-shared-gateway", version: "0.2.0" }, 200);
    }
    if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);

    const cors = corsHeaders(request, env);
    if (cors === null) return json({ error: "origin_not_allowed" }, 403, {});
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), cors);
    }
    if (!["GET", "POST", "DELETE"].includes(request.method)) {
      return withCors(json({ error: "method_not_allowed" }, 405), cors);
    }

    if (request.method === "POST") {
      const declaredLength = Number(request.headers.get("content-length") || 0);
      if (declaredLength > MAX_REQUEST_BYTES) {
        return withCors(json({ error: "request_too_large" }, 413), cors);
      }
      const body = await request.clone().text();
      if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
        return withCors(json({ error: "request_too_large" }, 413), cors);
      }
    }

    let principal;
    try {
      principal = await authenticateRequest(request, env);
    } catch {
      return withCors(json({ error: "gateway_auth_configuration_error" }, 503), cors);
    }
    if (!principal) {
      return withCors(json({ error: "unauthorized" }, 401, { "www-authenticate": "Bearer" }), cors);
    }

    try {
      // Stateless transport: each HTTP request gets a fresh MCP server bound
      // to the authenticated client identity. No process-global client state.
      const server = createAoMcpServer(env, principal);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await server.connect(transport);
      const response = await transport.handleRequest(request);
      return withCors(response, cors);
    } catch {
      return withCors(json({ error: "mcp_request_failed" }, 500), cors);
    }
  }
};
