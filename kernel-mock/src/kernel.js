function stableStringify(value) {
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
  }
  return JSON.stringify(value);
}

function actionFingerprint(request) {
  const p = request.payload ?? {};
  return stableStringify({
    actor_id: request.actor_id ?? null, domain: p.domain ?? null, verb: p.verb ?? null,
    target_id: p.target_id ?? null, parameters: p.parameters ?? {}, duration_mode: p.duration_mode ?? null
  });
}

export class MockKernel {
  constructor({ failNextCommit = false } = {}) {
    this.revision = 0;
    this.positions = new Map([["character_anasi", { x: 0, y: 0, z: 0 }]]);
    this.executions = new Map();
    this.requests = new Map();
    this.requestFingerprints = new Map();
    this.idempotency = new Map();
    this.idempotencyFingerprints = new Map();
    this.events = [];
    this.history = [];
    this.failNextCommit = failNextCommit;
    this.nextExecution = 1;
  }

  snapshot() {
    return structuredClone({
      revision: this.revision,
      positions: Object.fromEntries(this.positions),
      events: this.events,
      history: this.history
    });
  }

  async handle(request) {
    const shapeError = this.validate(request);
    if (shapeError) return this.response(request, {
      request_status: "rejected", outcome: "rejected",
      error: { code: "INVALID_REQUEST", message: shapeError }
    });

    const requestFingerprint = stableStringify(request);
    if (this.requests.has(request.request_id)) {
      if (this.requestFingerprints.get(request.request_id) !== requestFingerprint) {
        return this.response(request, { request_status: 'rejected', outcome: 'rejected',
          error: { code: 'REQUEST_ID_REUSED', message: 'Request ID was already used with a different payload.' } });
      }
      return structuredClone(this.requests.get(request.request_id));
    }
    if (request.expected_world_revision && request.expected_world_revision !== this.worldRevision()) {
      const stale = this.response(request, { request_status: "rejected", outcome: "rejected",
        error: { code: "STALE_WORLD_STATE", message: "The world changed; refresh state and resubmit." } });
      this.requests.set(request.request_id, stale);
      this.requestFingerprints.set(request.request_id, requestFingerprint);
      return structuredClone(stale);
    }

    let result;
    switch (request.request_type) {
      case "perception": result = this.perceive(request); break;
      case "plan": result = this.plan(request); break;
      case "status": result = this.status(request); break;
      case "clarification": result = this.clarify(request); break;
      case "action": result = await this.act(request); break;
      default: result = { request_status: "rejected", outcome: "rejected",
        error: { code: "INVALID_REQUEST", message: "Unsupported request type." } };
    }
    const response = this.response(request, result);
    this.requests.set(request.request_id, response);
    this.requestFingerprints.set(request.request_id, requestFingerprint);
    return structuredClone(response);
  }

  validate(r) {
    if (!r || typeof r !== "object" || Array.isArray(r)) return "Request must be an object.";
    for (const key of ["contract_version", "request_id", "request_type", "payload"]) {
      if (!(key in r)) return `Missing required field: ${key}.`;
    }
    if (r.contract_version !== "1.0") return "Unsupported contract version.";
    if (typeof r.request_id !== "string" || !r.request_id) return "request_id must be a non-empty string.";
    if (!["perception", "action", "plan", "status", "clarification"].includes(r.request_type)) return "Unknown request_type.";
    if (!r.payload || typeof r.payload !== "object" || Array.isArray(r.payload)) return "payload must be an object.";
    if (["perception", "action"].includes(r.request_type) && !r.actor_id) return "actor_id is required for this request type.";
    if (r.request_type === "perception" && !["look","inspect","listen","smell","touch","investigate","sense","observe_environment"].includes(r.payload.mode)) return "Invalid perception mode.";
    if (r.request_type === "action" && (!r.payload.domain || !r.payload.verb)) return "Action requires domain and verb.";
    if (r.request_type === "plan" && !r.payload.objective) return "Plan requires objective.";
    if (r.request_type === "status" && !r.payload.execution_id) return "Status requires execution_id.";
    if (r.request_type === "clarification" && (!r.payload.original_request_id || !r.payload.answer)) return "Clarification requires original_request_id and answer.";
    return null;
  }

  worldRevision() { return `world_${this.revision}`; }

  response(request, fields) {
    return {
      contract_version: "1.0",
      request_id: request?.request_id ?? "invalid",
      response_id: `resp_${request?.request_id ?? "invalid"}`,
      request_status: "completed",
      execution_status: null,
      outcome: "none",
      execution_id: null,
      world_revision: this.worldRevision(),
      result: {},
      events: [],
      history_record_ids: [],
      clarification: null,
      error: null,
      ...fields
    };
  }

  perceive(request) {
    return {
      request_status: "completed", outcome: "none",
      result: { mode: request.payload.mode, observations: [
        { classification: "observed", subject: "environment", description: "Mock environment observation." }
      ], unknowns: [] },
      events: [], history_record_ids: []
    };
  }

  plan(request) {
    return { request_status: "completed", outcome: "none",
      result: { proposal_only: true, objective: request.payload.objective, steps: [] },
      events: [], history_record_ids: [] };
  }

  status(request) {
    const execution = this.executions.get(request.payload.execution_id);
    if (!execution) return { request_status: "rejected", outcome: "rejected",
      error: { code: "ENTITY_NOT_FOUND", message: "Execution not found." } };
    return { request_status: "completed", execution_status: execution.execution_status,
      outcome: execution.outcome, execution_id: execution.execution_id,
      result: { progress: execution.progress, remaining: execution.remaining },
      events: [], history_record_ids: [] };
  }

  clarify(request) {
    return { request_status: "completed", outcome: "none",
      result: { original_request_id: request.payload.original_request_id,
        answer_received: true, selected_entity_id: request.payload.selected_entity_id ?? null,
        requires_revalidation: true },
      events: [], history_record_ids: [] };
  }

  async act(request) {
    const p = request.payload;
    const key = p.idempotency_key;
    const operationFingerprint = actionFingerprint(request);
    if (key && this.idempotency.has(key)) {
      if (this.idempotencyFingerprints.get(key) !== operationFingerprint) {
        return { request_status: 'rejected', outcome: 'rejected',
          error: { code: 'IDEMPOTENCY_KEY_REUSED', message: 'Idempotency key was already used for a different action.' },
          events: [], history_record_ids: [] };
      }
      return structuredClone(this.idempotency.get(key));
    }
    if (p.domain === "movement" && p.verb === "move") {
      const destination = p.parameters?.destination;
      if (!destination || !["x","y","z"].every(k => Number.isFinite(destination[k]))) {
        return { request_status: "needs_clarification", outcome: "none",
          clarification: { question: "Which valid destination should be used?", options: [] },
          error: { code: "AMBIGUOUS_REFERENCE", message: "A precise destination is required." } };
      }
      if (p.parameters?.blocked) return { request_status: "rejected", outcome: "rejected",
        error: { code: "PATH_BLOCKED", message: "The requested route is blocked." } };
      const actor = request.actor_id;
      const before = this.positions.get(actor) ?? { x: 0, y: 0, z: 0 };
      return this.commit(request, actor, "position", before, destination, key, operationFingerprint);
    }
    if (p.parameters?.simulatePartial) {
      const partial = this.commit(request, request.actor_id, "mock_progress", 0, 1, key, operationFingerprint);
      const interrupted = { ...partial, request_status: "completed", execution_status: "interrupted",
        outcome: "partial", result: { ...partial.result, remaining: p.parameters.remaining ?? "unfinished work",
          interruption_reason: "Mock interruption after a committed partial step." } };
      if (key) this.idempotency.set(key, structuredClone(interrupted));
      return interrupted;
    }
    if (p.parameters?.longRunning) {
      const execution_id = `exec_${this.nextExecution++}`;
      const execution = { execution_id, execution_status: "running", outcome: "none",
        progress: 0, remaining: p.parameters.remaining ?? "work" };
      this.executions.set(execution_id, execution);
      return { request_status: "accepted", execution_status: "running", outcome: "none",
        execution_id, result: { progress: 0 }, events: [], history_record_ids: [] };
    }
    if (p.parameters?.fail) return { request_status: "rejected", outcome: "failed",
      execution_status: "failed", error: { code: "CAPABILITY_INSUFFICIENT", message: "Mock capability check failed." } };
    return { request_status: "rejected", outcome: "rejected",
      error: { code: "ACTION_NOT_PERMITTED", message: "The mock does not implement this action." } };
  }

  commit(request, entityId, field, before, after, idempotencyKey, operationFingerprint) {
    if (this.failNextCommit) {
      this.failNextCommit = false;
      return { request_status: "rejected", outcome: "failed", execution_status: "failed",
        error: { code: "PERSISTENCE_FAILURE", message: "Atomic persistence failed; no world change was committed." },
        events: [], history_record_ids: [] };
    }
    const nextRevision = this.revision + 1;
    const event = {
      event_id: `event_${nextRevision}`, type: "entity_state_changed",
      actor_id: request.actor_id ?? null, source_request_id: request.request_id,
      execution_id: null, timestamp: new Date().toISOString(),
      world_revision: `world_${nextRevision}`, affected_entities: [entityId],
      changes: [{ entity_id: entityId, field, before, after }]
    };
    // The in-memory fixture applies state and its ledger record together only after all checks pass.
    this.positions.set(entityId, field === "position" ? structuredClone(after) : (this.positions.get(entityId) ?? { x: 0, y: 0, z: 0 }));
    this.revision = nextRevision;
    this.events.push(event);
    const historyId = `history_${nextRevision}`;
    this.history.push({ history_record_id: historyId, event: structuredClone(event) });
    const result = { request_status: "completed", execution_status: "committed", outcome: "committed",
      world_revision: this.worldRevision(), result: { entity_id: entityId, [field]: structuredClone(after) },
      events: [event], history_record_ids: [historyId] };
    if (idempotencyKey) {
      this.idempotency.set(idempotencyKey, structuredClone(result));
      this.idempotencyFingerprints.set(idempotencyKey, operationFingerprint);
    }
    return result;
  }
}
