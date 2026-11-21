const encoder = new TextEncoder();
const MAX_AUTHORITY_RESPONSE_BYTES = 1024 * 1024;

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(secret, message) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("AO_INTERNAL_SIGNING_KEY must be configured with at least 32 characters");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function createSignedAuthorityRequest({
  serviceName,
  channel,
  operation,
  principal,
  input,
  signingKey,
  requestId = crypto.randomUUID(),
  issuedAt = Math.floor(Date.now() / 1000)
}) {
  if (!["ao-kernel", "ao-worldheart"].includes(serviceName)) {
    throw new TypeError("Unknown AO authority service");
  }
  if (!["intent", "read"].includes(channel)) throw new TypeError("Invalid authority channel");
  const body = JSON.stringify({
    schemaVersion: 1,
    requestId,
    issuedAt,
    operation,
    principal: {
      clientId: principal.clientId,
      subjectId: principal.subjectId,
      kind: principal.kind,
      scopes: [...principal.scopes],
      worldIds: [...principal.worldIds]
    },
    input
  });
  const signature = await hmacHex(signingKey, String(issuedAt) + "." + requestId + "." + body);
  return new Request("https://" + serviceName + ".internal/internal/mcp/v1/" + channel, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "x-ao-gateway-client": "ao-shared-gateway",
      "x-ao-gateway-issued-at": String(issuedAt),
      "x-ao-gateway-request-id": requestId,
      "x-ao-gateway-signature": signature
    },
    body
  });
}

export async function callAuthority({
  binding,
  serviceName,
  channel,
  operation,
  principal,
  input,
  signingKey
}) {
  if (!binding || typeof binding.fetch !== "function") {
    throw new Error(serviceName + " service binding is not configured; AO gateway fails closed");
  }
  const request = await createSignedAuthorityRequest({
    serviceName, channel, operation, principal, input, signingKey
  });
  const response = await binding.fetch(request);
  const raw = await response.text();
  if (raw.length > MAX_AUTHORITY_RESPONSE_BYTES) {
    throw new Error("AO authority response exceeded the gateway limit");
  }
  let value;
  try {
    value = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("AO authority returned a non-JSON response");
  }
  if (!response.ok) {
    const code = typeof value.code === "string" ? value.code : "AUTHORITY_ERROR";
    const message = typeof value.message === "string" ? value.message : "AO authority rejected the request";
    const error = new Error(message);
    error.code = code;
    error.status = response.status;
    throw error;
  }
  return value;
}

export function safeAuthorityError(error) {
  return {
    code: typeof error?.code === "string" ? error.code : "AO_GATEWAY_REQUEST_FAILED",
    message: typeof error?.message === "string" ? error.message : "AO gateway request failed"
  };
}
