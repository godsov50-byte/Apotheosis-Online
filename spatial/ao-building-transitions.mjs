/**
 * AO Building Portal Transitions v0.1
 *
 * Composes the spatial resolver/repository contracts for exterior <-> interior
 * transitions. It does not grant access, decide canon, or write directly to a
 * production database. The browser adapter below is explicitly staging-only.
 */
import { assertSpatialAddress, spatialAddressKey } from "./ao-spatial-addressing.mjs";

const nonEmpty = (v, label) => {
  if (typeof v !== "string" || !v.trim()) throw new TypeError(label + " must be a non-empty string");
  return v.trim();
};
const finite = n => typeof n === "number" && Number.isFinite(n);
const deepFreeze = value => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};
const clone = value => structuredClone(value);

export function createBuildingPortal({
  buildingId, entranceId, regionId, latitude, longitude, access,
  connectorState, interiorBinding, provenance = {}
}) {
  buildingId = nonEmpty(buildingId, "buildingId");
  entranceId = nonEmpty(entranceId, "entranceId");
  regionId = nonEmpty(regionId, "regionId");
  if (!finite(latitude) || latitude < -90 || latitude > 90 ||
      !finite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError("Portal needs a valid WGS84 entrance coordinate");
  }
  if (connectorState !== "Confirmed by admin") {
    throw new Error("Portal road connector is not admin-confirmed");
  }
  if (!["Verified by admin", "Restricted access"].includes(access)) {
    throw new Error("Portal access is unverified, blocked, or unsupported");
  }
  if (!interiorBinding || interiorBinding.connectionState !== "Confirmed by admin") {
    throw new Error("Portal needs an explicitly confirmed interior threshold binding");
  }
  const floorId = nonEmpty(String(interiorBinding.floorId), "interiorBinding.floorId");
  const roomId = nonEmpty(interiorBinding.roomId, "interiorBinding.roomId");
  const roomType = nonEmpty(interiorBinding.roomType, "interiorBinding.roomType");
  if (roomType !== "Entrance hall") {
    throw new Error("Interior threshold must be assigned to an Entrance hall room");
  }
  const row = interiorBinding.row, col = interiorBinding.col, cellSizeM = interiorBinding.cellSizeM;
  if (!Number.isInteger(row) || row < 0 || !Number.isInteger(col) || col < 0 ||
      !finite(cellSizeM) || cellSizeM <= 0) {
    throw new RangeError("Interior binding needs non-negative integer row/col and positive cellSizeM");
  }
  const requiredPermissions = Array.isArray(interiorBinding.requiredPermissions)
    ? [...new Set(interiorBinding.requiredPermissions.map((p, i) => nonEmpty(p, "requiredPermissions[" + i + "]")))]
    : [];
  if (access === "Restricted access" && requiredPermissions.length === 0) {
    throw new Error("Restricted portal must declare at least one required permission");
  }
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    throw new TypeError("provenance must be an object");
  }
  return deepFreeze({
    schemaVersion: 1, id: "portal:" + buildingId + ":" + entranceId,
    buildingId, entranceId, regionId, latitude, longitude, access,
    connectorState, interiorBinding: {
      floorId, roomId, roomType, row, col, cellSizeM,
      connectionState: interiorBinding.connectionState,
      requiredPermissions
    },
    provenance: clone(provenance)
  });
}

export function resolveBuildingPortalTransition({
  resolver, portal, direction, entityId, currentAddress,
  permissions = [], occurredAt, transitionId
}) {
  if (!resolver || typeof resolver.resolveGeographic !== "function" ||
      typeof resolver.resolveInterior !== "function" || typeof resolver.transition !== "function") {
    throw new TypeError("A compatible spatial resolver is required");
  }
  if (!portal || portal.schemaVersion !== 1) throw new TypeError("A validated building portal is required");
  if (!["enter", "exit"].includes(direction)) throw new RangeError("direction must be enter or exit");
  entityId = nonEmpty(entityId, "entityId");
  assertSpatialAddress(currentAddress);
  const permissionSet = new Set(permissions);
  for (const permission of portal.interiorBinding.requiredPermissions) {
    if (!permissionSet.has(permission)) throw new Error("Missing portal permission: " + permission);
  }
  const exteriorAddress = resolver.resolveGeographic({
    latitude: portal.latitude, longitude: portal.longitude,
    regionId: portal.regionId, layer: "ground",
    coordinateSource: "admin-confirmed-entrance",
    parentLocationId: portal.buildingId
  });
  const binding = portal.interiorBinding;
  // Interior X/Z are measured floor-grid coordinates. Physical floor elevation
  // remains unknown; floorId provides the distinct local floor namespace.
  const interiorAddress = resolver.resolveInterior({
    buildingId: portal.buildingId, regionId: portal.regionId,
    exteriorAddress, floorId: binding.floorId,
    x: (binding.col + 0.5) * binding.cellSizeM,
    y: 0,
    z: (binding.row + 0.5) * binding.cellSizeM,
    roomId: binding.roomId,
    coordinateSource: "admin-authored-interior-grid"
  });
  const expected = direction === "enter" ? exteriorAddress : interiorAddress;
  const destination = direction === "enter" ? interiorAddress : exteriorAddress;
  if (spatialAddressKey(currentAddress) !== spatialAddressKey(expected)) {
    throw new Error("Actor is not at the portal's " + (direction === "enter" ? "exterior threshold" : "interior threshold"));
  }
  return resolver.transition({
    entityId, from: currentAddress, to: destination,
    kind: direction,
    occurredAt,
    transitionId,
    metadata: {
      authority: "houston-admin-staging-assertion",
      portalId: portal.id,
      buildingId: portal.buildingId,
      entranceId: portal.entranceId,
      floorId: binding.floorId,
      roomId: binding.roomId,
      thresholdCell: { row: binding.row, col: binding.col },
      access: portal.access,
      requiredPermissions: binding.requiredPermissions,
      provenance: clone(portal.provenance)
    }
  });
}

/**
 * Commit helper with a read-before-write guard. The repository adapter MUST
 * also compare expectedOriginAddressKey inside its atomic transaction; the
 * pre-read alone is not a concurrency guarantee.
 */
export async function commitSpatialTransition({ repository, event }) {
  if (!repository || typeof repository.loadEntityAddress !== "function" ||
      typeof repository.commitTransition !== "function") {
    throw new TypeError("A compatible spatial repository is required");
  }
  const current = await repository.loadEntityAddress(event.entityId);
  if (!current) throw new Error("Entity has no persisted spatial baseline");
  if (spatialAddressKey(current) !== event.originAddressKey) {
    throw new Error("Spatial transition is stale: persisted origin no longer matches");
  }
  return repository.commitTransition(event, {
    expectedOriginAddressKey: event.originAddressKey
  });
}

/**
 * Production seam: only a real Kernel authority implementation may approve.
 * The caller supplies the WorldHeart-backed repository adapter. No fallback
 * approval or direct Supabase write exists here.
 */
export async function authorizeAndCommitSpatialTransition({ kernel, repository, event }) {
  if (!kernel || typeof kernel.authorizeSpatialTransition !== "function") {
    throw new TypeError("Production Kernel adapter must implement authorizeSpatialTransition");
  }
  const decision = await kernel.authorizeSpatialTransition({
    entityId: event.entityId,
    kind: event.kind,
    from: clone(event.from),
    to: clone(event.to),
    originAddressKey: event.originAddressKey,
    destinationAddressKey: event.destinationAddressKey,
    metadata: clone(event.metadata)
  });
  if (!decision || decision.status !== "approved" || !decision.approvalId) {
    return { status: "rejected", reason: decision?.reason || "Kernel did not approve the transition" };
  }
  const authorizedEvent = deepFreeze({
    ...clone(event),
    metadata: {
      ...clone(event.metadata),
      authority: "ao-kernel",
      kernelApprovalId: nonEmpty(decision.approvalId, "decision.approvalId")
    }
  });
  await commitSpatialTransition({ repository, event: authorizedEvent });
  return { status: "committed", event: authorizedEvent, approvalId: decision.approvalId };
}

/**
 * Browser-local single-key ledger for the Houston prototype only.
 * One localStorage setItem stores both current position and append-only events.
 * It is not multi-tab safe, shared, authenticated, or a WorldHeart adapter.
 */
export function createBrowserStagingSpatialAdapter(storage, {
  key = "aoHoustonSpatialTransitionsV1"
} = {}) {
  if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
    throw new TypeError("A localStorage-compatible storage object is required");
  }
  const read = () => {
    const raw = storage.getItem(key);
    if (!raw) return { schema: "ao-spatial-staging-ledger/v1", baselines: {}, positions: {}, chunks: {}, events: [] };
    const value = JSON.parse(raw);
    if (value.schema !== "ao-spatial-staging-ledger/v1" ||
        !value.baselines || !value.positions || !value.chunks || !Array.isArray(value.events)) {
      throw new Error("Unsupported local spatial staging ledger");
    }
    return value;
  };
  const write = state => storage.setItem(key, JSON.stringify(state));
  return Object.freeze({
    async getChunk() { return null; },
    async putChunk() {},
    async getEntityAddress(entityId) { return read().positions[entityId] || null; },
    async seedEntityAddress(entityId, address) {
      entityId = nonEmpty(entityId, "entityId");
      assertSpatialAddress(address);
      const state = read();
      if (state.positions[entityId]) {
        if (spatialAddressKey(state.positions[entityId]) !== spatialAddressKey(address)) {
          throw new Error("Staging baseline already exists; reset the staging ledger before repositioning");
        }
        return;
      }
      state.baselines[entityId] = clone(address);
      state.positions[entityId] = clone(address);
      write(state);
    },
    async commitTransitionAtomic({ event, destinationAddress, destinationChunk, expectedOriginAddressKey }) {
      const state = read();
      const prior = state.events.find(item => item.id === event.id);
      if (prior) {
        if (JSON.stringify(prior) === JSON.stringify(event)) return;
        throw new Error("Transition ID collision with different event content");
      }
      const current = state.positions[event.entityId];
      if (!current || spatialAddressKey(current) !== expectedOriginAddressKey ||
          expectedOriginAddressKey !== event.originAddressKey) {
        throw new Error("Atomic staging commit rejected: expected origin does not match current position");
      }
      // A single-key write makes event append, destination-chunk registration
      // and current-position replacement one storage operation in this prototype.
      if (destinationChunk?.id) state.chunks[destinationChunk.id] = clone(destinationChunk);
      state.events.push(clone(event));
      state.positions[event.entityId] = clone(destinationAddress);
      write(state);
    }
  });
}
