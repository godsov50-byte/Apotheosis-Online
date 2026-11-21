const encoder = new TextEncoder();

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function parseClients(raw) {
  if (typeof raw !== "string" || !raw.trim()) throw new Error("AO_CLIENTS secret is not configured");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("AO_CLIENTS must be a non-empty JSON array");
  return parsed;
}

export async function authenticateRequest(request, env) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer ([A-Za-z0-9._~+/-]{24,512})$/);
  if (!match) return null;

  const suppliedHash = await sha256Hex(match[1]);
  const clients = parseClients(env.AO_CLIENTS);
  let matched = null;
  for (const client of clients) {
    if (client && constantTimeEqual(String(client.tokenSha256 || "").toLowerCase(), suppliedHash)) {
      matched = client;
    }
  }
  if (!matched || matched.active !== true) return null;

  const requiredStrings = ["clientId", "subjectId", "kind"];
  if (requiredStrings.some(key => typeof matched[key] !== "string" || !matched[key].trim())) {
    throw new Error("AO_CLIENTS contains an incomplete client record");
  }
  if (!["sovereign", "agent"].includes(matched.kind)) {
    throw new Error("AO_CLIENTS client kind must be sovereign or agent");
  }
  if (!Array.isArray(matched.scopes) || !matched.scopes.every(value => typeof value === "string")) {
    throw new Error("AO_CLIENTS client scopes must be an array of strings");
  }
  if (!Array.isArray(matched.worldIds) || matched.worldIds.length === 0 ||
      !matched.worldIds.every(value => typeof value === "string" && value.trim())) {
    throw new Error("AO_CLIENTS client worldIds must be a non-empty array");
  }

  return Object.freeze({
    clientId: matched.clientId,
    subjectId: matched.subjectId,
    kind: matched.kind,
    scopes: Object.freeze([...new Set(matched.scopes)]),
    worldIds: Object.freeze([...new Set(matched.worldIds)]),
    active: true
  });
}

export function assertScope(principal, requiredScope) {
  if (!principal || !principal.scopes.includes(requiredScope)) {
    throw new Error("This AO client is not authorized for the requested capability");
  }
}

export function assertWorldAccess(principal, worldId) {
  if (!principal || !principal.worldIds.includes(worldId)) {
    throw new Error("This AO client is not authorized for the requested world");
  }
}
