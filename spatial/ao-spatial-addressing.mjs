/**
 * Apotheosis Online — Spatial Addressing & Resolution Kernel
 *
 * Pure, deterministic addressing primitives. This module does not read GPS
 * hardware, write to Supabase, or mutate the live world. Adapters must persist
 * committed results through the AO Kernel/WorldHeart authority boundary.
 *
 * Coordinate contract:
 * - Geographic input is WGS84 latitude/longitude.
 * - Each region defines a local metric frame anchored at originLat/originLon.
 * - That frame is intentionally regional (local equirectangular/ENU approximation),
 *   not a world-scale projection. Use separate region frames for large distances.
 * - Chunk/tile/cell indices are deterministic within a region or local space.
 */

export const SPATIAL_SCHEMA_VERSION = 1;
export const DEFAULT_GRID = Object.freeze({
  chunkSizeM: 1024,
  tileSizeM: 64,
  cellSizeM: 1
});

export const SPATIAL_LAYERS = Object.freeze([
  "ground", "interior", "underground", "aerial", "water", "subsurface", "instance"
]);

export const TRANSITION_KINDS = Object.freeze([
  "walk", "run", "ride", "enter", "exit", "stairs", "climb",
  "takeoff", "fly", "land", "teleport", "instance-enter",
  "instance-exit", "spawn", "despawn", "admin-relocate"
]);

const EARTH_RADIUS_M = 6371008.8;
const finite = n => typeof n === "number" && Number.isFinite(n);
const requiredString = (v, name) => {
  if (typeof v !== "string" || !v.trim()) throw new TypeError(name + " must be a non-empty string");
  return v.trim();
};
const floorDiv = (n, d) => Math.floor(n / d);
const clone = value => structuredClone(value);
const deepFreeze = value => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
};

function validateGrid(grid) {
  const g = { ...DEFAULT_GRID, ...(grid || {}) };
  for (const k of ["chunkSizeM", "tileSizeM", "cellSizeM"]) {
    if (!finite(g[k]) || g[k] <= 0) throw new RangeError(k + " must be a positive finite number");
  }
  if (g.chunkSizeM % g.tileSizeM !== 0 || g.tileSizeM % g.cellSizeM !== 0) {
    throw new RangeError("chunkSizeM must divide evenly into tileSizeM, and tileSizeM into cellSizeM");
  }
  return Object.freeze(g);
}

function regionContains(region, lat, lon) {
  const b = region.bounds;
  if (!b) return false;
  const lonInside = b.west <= b.east
    ? lon >= b.west && lon <= b.east
    : lon >= b.west || lon <= b.east; // antimeridian-aware bounds
  return lat >= b.south && lat <= b.north && lonInside;
}

function projectGeographic(region, lat, lon, altitudeM = 0) {
  const lat0 = region.originLat * Math.PI / 180;
  const dLat = (lat - region.originLat) * Math.PI / 180;
  const dLon = (lon - region.originLon) * Math.PI / 180;
  return {
    x: EARTH_RADIUS_M * dLon * Math.cos(lat0),
    y: EARTH_RADIUS_M * dLat,
    z: altitudeM
  };
}

function makeGridAddress({
  worldId, regionId, spaceId, x, y, z = 0, layer, grid,
  parentLocationId = null, instanceId = null, physicalAddressKey = null,
  exteriorAddressKey = null, roomId = null, floorId = null,
  coordinateSource = "world-metric", geographic = null
}) {
  if (![x, y, z].every(finite)) throw new TypeError("Spatial x, y and z must be finite numbers");
  if (!SPATIAL_LAYERS.includes(layer)) throw new RangeError("Unsupported spatial layer: " + layer);

  // Three-dimensional addressing: altitude/depth participates in chunk,
  // tile and cell identity instead of being merely descriptive metadata.
  const cx = floorDiv(x, grid.chunkSizeM);
  const cy = floorDiv(y, grid.chunkSizeM);
  const cz = floorDiv(z, grid.chunkSizeM);
  const localChunkX = x - cx * grid.chunkSizeM;
  const localChunkY = y - cy * grid.chunkSizeM;
  const localChunkZ = z - cz * grid.chunkSizeM;
  const tilesPerChunk = grid.chunkSizeM / grid.tileSizeM;
  const txInChunk = floorDiv(localChunkX, grid.tileSizeM);
  const tyInChunk = floorDiv(localChunkY, grid.tileSizeM);
  const tzInChunk = floorDiv(localChunkZ, grid.tileSizeM);
  const tileX = cx * tilesPerChunk + txInChunk;
  const tileY = cy * tilesPerChunk + tyInChunk;
  const tileZ = cz * tilesPerChunk + tzInChunk;
  const localTileX = localChunkX - txInChunk * grid.tileSizeM;
  const localTileY = localChunkY - tyInChunk * grid.tileSizeM;
  const localTileZ = localChunkZ - tzInChunk * grid.tileSizeM;
  const cellXInTile = floorDiv(localTileX, grid.cellSizeM);
  const cellYInTile = floorDiv(localTileY, grid.cellSizeM);
  const cellZInTile = floorDiv(localTileZ, grid.cellSizeM);
  const cellX = floorDiv(x, grid.cellSizeM);
  const cellY = floorDiv(y, grid.cellSizeM);
  const cellZ = floorDiv(z, grid.cellSizeM);

  const namespace = spaceId || ("region:" + regionId);
  const layerNamespace = namespace + ":layer:" + layer;
  const chunkId = layerNamespace + ":chunk:" + cx + ":" + cy + ":" + cz;
  const tileId = layerNamespace + ":tile:" + tileX + ":" + tileY + ":" + tileZ;
  const cellId = layerNamespace + ":cell:" + cellX + ":" + cellY + ":" + cellZ;

  return Object.freeze({
    schemaVersion: SPATIAL_SCHEMA_VERSION,
    worldId,
    regionId,
    spaceId: namespace,
    spaceType: spaceId ? "local" : "geographic",
    chunkId,
    tileId,
    cellId,
    layer,
    grid: Object.freeze({
      chunkX: cx, chunkY: cy, chunkZ: cz,
      tileX, tileY, tileZ,
      tileXInChunk: txInChunk, tileYInChunk: tyInChunk, tileZInChunk: tzInChunk,
      cellX, cellY, cellZ,
      cellXInTile: cellXInTile, cellYInTile: cellYInTile, cellZInTile: cellZInTile,
      cellSizeM: grid.cellSizeM,
      tileSizeM: grid.tileSizeM,
      chunkSizeM: grid.chunkSizeM
    }),
    position: Object.freeze({ x, y, z }),
    parentLocationId,
    instanceId,
    physicalAddressKey,
    exteriorAddressKey,
    roomId,
    floorId,
    coordinateSource,
    geographic: geographic ? Object.freeze({ ...geographic }) : null
  });
}

export function spatialAddressKey(address) {
  assertSpatialAddress(address);
  return [
    address.worldId, address.spaceId, address.layer,
    address.instanceId || "-", address.chunkId, address.tileId, address.cellId
  ].join("|");
}

export function assertSpatialAddress(address) {
  if (!address || address.schemaVersion !== SPATIAL_SCHEMA_VERSION) {
    throw new TypeError("Unsupported or missing spatial address schemaVersion");
  }
  requiredString(address.worldId, "address.worldId");
  requiredString(address.regionId, "address.regionId");
  requiredString(address.spaceId, "address.spaceId");
  requiredString(address.chunkId, "address.chunkId");
  requiredString(address.tileId, "address.tileId");
  requiredString(address.cellId, "address.cellId");
  if (!SPATIAL_LAYERS.includes(address.layer)) throw new TypeError("Invalid address layer");
  if (!address.position || !["x", "y", "z"].every(k => finite(address.position[k]))) {
    throw new TypeError("Address position must contain finite x, y and z");
  }
  return true;
}

export function createChunkRecord(address, { source = "resolver", status = "known" } = {}) {
  assertSpatialAddress(address);
  return {
    schemaVersion: SPATIAL_SCHEMA_VERSION,
    id: address.chunkId,
    worldId: address.worldId,
    regionId: address.regionId,
    spaceId: address.spaceId,
    layer: address.layer,
    grid: {
      chunkX: address.grid.chunkX,
      chunkY: address.grid.chunkY,
      chunkZ: address.grid.chunkZ,
      chunkSizeM: address.grid.chunkSizeM,
      tileSizeM: address.grid.tileSizeM,
      cellSizeM: address.grid.cellSizeM
    },
    source,
    status, // known | loaded | dirty | unavailable; unloading never deletes this record
    entityIds: [],
    tileIds: [],
    updatedAt: null
  };
}

export function createSpatialResolver({
  worldId,
  regions,
  grid = DEFAULT_GRID,
  maxRegionRadiusKm = 250
}) {
  worldId = requiredString(worldId, "worldId");
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new TypeError("At least one explicitly defined spatial region is required");
  }
  const g = validateGrid(grid);
  const regionMap = new Map();
  for (const input of regions) {
    const id = requiredString(input.id, "region.id");
    if (regionMap.has(id)) throw new Error("Duplicate region id: " + id);
    if (!finite(input.originLat) || input.originLat < -90 || input.originLat > 90 ||
        !finite(input.originLon) || input.originLon < -180 || input.originLon > 180) {
      throw new RangeError("Region " + id + " needs valid WGS84 originLat/originLon");
    }
    if (input.bounds) {
      const b = input.bounds;
      if (![b.south, b.north, b.west, b.east].every(finite) ||
          b.south > b.north || b.south < -90 || b.north > 90 ||
          b.west < -180 || b.west > 180 || b.east < -180 || b.east > 180) {
        throw new RangeError("Region " + id + " has invalid WGS84 bounds");
      }
    }
    const radius = input.maxRadiusKm ?? maxRegionRadiusKm;
    if (!finite(radius) || radius <= 0) throw new RangeError("Region " + id + " maxRadiusKm must be positive");
    regionMap.set(id, Object.freeze({
      ...input,
      id,
      coordinateSystem: input.coordinateSystem || "local-equirectangular-wgs84",
      maxRadiusKm: radius
    }));
  }

  function getRegion(regionId) {
    const region = regionMap.get(requiredString(regionId, "regionId"));
    if (!region) throw new RangeError("Unknown region: " + regionId);
    return region;
  }

  function inferRegion(lat, lon) {
    const matches = [...regionMap.values()].filter(r => regionContains(r, lat, lon));
    if (matches.length !== 1) {
      throw new RangeError(matches.length
        ? "Geographic point matches multiple regions; supply regionId explicitly"
        : "No configured region covers this GPS coordinate; supply an approved region mapping");
    }
    return matches[0];
  }

  function resolveGeographic({
    latitude, longitude, altitudeM = 0, regionId = null,
    layer = "ground", coordinateSource = "gps", parentLocationId = null
  }) {
    if (!finite(latitude) || latitude < -90 || latitude > 90 ||
        !finite(longitude) || longitude < -180 || longitude > 180 ||
        !finite(altitudeM)) throw new RangeError("Invalid WGS84 coordinate or altitude");
    const region = regionId ? getRegion(regionId) : inferRegion(latitude, longitude);
    if (region.bounds && !regionContains(region, latitude, longitude)) {
      throw new RangeError("GPS coordinate is outside explicitly selected region " + region.id);
    }
    const projected = projectGeographic(region, latitude, longitude, altitudeM);
    const radiusKm = Math.hypot(projected.x, projected.y) / 1000;
    if (radiusKm > region.maxRadiusKm) {
      throw new RangeError("Coordinate exceeds region local-frame radius; resolve through another region");
    }
    return makeGridAddress({
      worldId, regionId: region.id, x: projected.x, y: projected.y, z: projected.z,
      layer, grid: g, parentLocationId,
      coordinateSource,
      geographic: { crs: "EPSG:4326", latitude, longitude, altitudeM }
    });
  }

  function resolveWorldPosition({
    regionId, x, y, z = 0, layer = "ground",
    coordinateSource = "world-metric", parentLocationId = null
  }) {
    const region = getRegion(regionId);
    const radiusKm = Math.hypot(x, y) / 1000;
    if (radiusKm > region.maxRadiusKm) throw new RangeError("World position exceeds region local-frame radius");
    return makeGridAddress({
      worldId, regionId, x, y, z, layer, grid: g,
      parentLocationId, coordinateSource
    });
  }

  function resolveInterior({
    buildingId, regionId, exteriorAddress, floorId, x, y, z = 0,
    roomId = null, coordinateSource = "admin-or-source-interior"
  }) {
    buildingId = requiredString(buildingId, "buildingId");
    if (floorId === null || floorId === undefined) throw new TypeError("floorId must be supplied");
    floorId = requiredString(String(floorId), "floorId");
    if (exteriorAddress) {
      assertSpatialAddress(exteriorAddress);
      if (exteriorAddress.worldId !== worldId) throw new Error("Exterior address belongs to another world");
      if (regionId && regionId !== exteriorAddress.regionId) throw new Error("Interior region conflicts with exterior address");
      regionId = exteriorAddress.regionId;
    }
    regionId = requiredString(regionId, "regionId");
    getRegion(regionId);
    const spaceId = "building:" + buildingId + ":floor:" + floorId;
    return makeGridAddress({
      worldId, regionId, spaceId, x, y, z, layer: "interior", grid: g,
      parentLocationId: buildingId,
      exteriorAddressKey: exteriorAddress ? spatialAddressKey(exteriorAddress) : null,
      physicalAddressKey: "building:" + buildingId + ":floor:" + floorId,
      floorId, roomId, coordinateSource
    });
  }

  function resolveUnderground({
    siteId, regionId, surfaceAddress, x, y, z = 0,
    layer = "underground", coordinateSource = "survey-or-world-model"
  }) {
    siteId = requiredString(siteId, "siteId");
    if (!["underground", "subsurface"].includes(layer)) throw new RangeError("Underground address requires underground/subsurface layer");
    if (surfaceAddress) {
      assertSpatialAddress(surfaceAddress);
      if (surfaceAddress.worldId !== worldId) throw new Error("Surface address belongs to another world");
      regionId = surfaceAddress.regionId;
    }
    getRegion(regionId);
    return makeGridAddress({
      worldId, regionId, spaceId: "site:" + siteId, x, y, z, layer, grid: g,
      parentLocationId: siteId,
      exteriorAddressKey: surfaceAddress ? spatialAddressKey(surfaceAddress) : null,
      physicalAddressKey: "site:" + siteId,
      coordinateSource
    });
  }

  function resolveInstance({
    instanceId, sourceAddress, x, y, z = 0, layer = "instance",
    coordinateSource = "instance-local"
  }) {
    instanceId = requiredString(instanceId, "instanceId");
    assertSpatialAddress(sourceAddress);
    if (sourceAddress.worldId !== worldId) throw new Error("Instance source address belongs to another world");
    if (!["instance", "interior", "underground", "aerial", "ground", "water"].includes(layer)) {
      throw new RangeError("Invalid instance layer");
    }
    return makeGridAddress({
      worldId, regionId: sourceAddress.regionId,
      spaceId: "instance:" + instanceId, x, y, z, layer, grid: g,
      parentLocationId: sourceAddress.parentLocationId,
      instanceId,
      physicalAddressKey: sourceAddress.physicalAddressKey || spatialAddressKey(sourceAddress),
      exteriorAddressKey: spatialAddressKey(sourceAddress),
      coordinateSource
    });
  }

  function transition({
    entityId, from, to, kind, occurredAt = new Date().toISOString(),
    metadata = {}, transitionId = null
  }) {
    entityId = requiredString(entityId, "entityId");
    assertSpatialAddress(from);
    assertSpatialAddress(to);
    if (from.worldId !== worldId || to.worldId !== worldId) throw new Error("Cross-world transition is not supported");
    if (!TRANSITION_KINDS.includes(kind)) throw new RangeError("Unsupported transition kind: " + kind);
    if (typeof occurredAt !== "string" || !occurredAt.trim()) throw new TypeError("occurredAt must be an ISO timestamp string");
    if (kind === "teleport" && spatialAddressKey(from) === spatialAddressKey(to)) {
      throw new Error("Teleport destination must differ from origin");
    }
    return Object.freeze({
      schemaVersion: SPATIAL_SCHEMA_VERSION,
      id: transitionId || null,
      entityId,
      worldId,
      kind,
      from: deepFreeze(clone(from)),
      to: deepFreeze(clone(to)),
      originAddressKey: spatialAddressKey(from),
      destinationAddressKey: spatialAddressKey(to),
      occurredAt,
      metadata: deepFreeze(clone(metadata))
    });
  }

  return Object.freeze({
    worldId,
    grid: g,
    regions: Object.freeze([...regionMap.values()]),
    resolveGeographic,
    resolveWorldPosition,
    resolveInterior,
    resolveUnderground,
    resolveInstance,
    transition,
    getRegion
  });
}

/**
 * Persistence boundary contract.
 *
 * Adapter methods:
 *   getChunk(chunkId) -> chunk|null
 *   putChunk(chunkRecord) -> void
 *   getEntityAddress(entityId) -> address|null
 *   commitTransitionAtomic({event, destinationAddress, destinationChunk}) -> void
 *
 * commitTransitionAtomic must atomically append the immutable event and update
 * the entity's current address. The Kernel decides whether a transition is
 * legal before calling it. This library never writes directly to Supabase.
 */
export function createSpatialRepository(adapter) {
  if (!adapter || typeof adapter.getChunk !== "function" ||
      typeof adapter.putChunk !== "function" ||
      typeof adapter.getEntityAddress !== "function" ||
      typeof adapter.commitTransitionAtomic !== "function") {
    throw new TypeError("Spatial adapter must implement getChunk, putChunk, getEntityAddress and commitTransitionAtomic");
  }

  async function loadChunk(address) {
    assertSpatialAddress(address);
    const existing = await adapter.getChunk(address.chunkId);
    if (existing) return existing;
    const record = createChunkRecord(address);
    await adapter.putChunk(record);
    return record;
  }

  async function loadEntityAddress(entityId) {
    const address = await adapter.getEntityAddress(requiredString(entityId, "entityId"));
    if (address) assertSpatialAddress(address);
    return address;
  }

  async function commitTransition(event) {
    if (!event || event.schemaVersion !== SPATIAL_SCHEMA_VERSION) throw new TypeError("Invalid transition event");
    assertSpatialAddress(event.from);
    assertSpatialAddress(event.to);
    requiredString(event.entityId, "event.entityId");
    if (event.worldId !== event.to.worldId || event.worldId !== event.from.worldId) {
      throw new Error("Transition event world does not match its addresses");
    }
    if (event.originAddressKey !== spatialAddressKey(event.from) ||
        event.destinationAddressKey !== spatialAddressKey(event.to)) {
      throw new Error("Transition address keys do not match their address payloads");
    }
    const destinationChunk = await loadChunk(event.to);
    await adapter.commitTransitionAtomic({
      event: clone(event),
      destinationAddress: clone(event.to),
      destinationChunk: clone(destinationChunk)
    });
    return event;
  }

  return Object.freeze({ loadChunk, loadEntityAddress, commitTransition });
}

export function sameSimulationSpace(a, b) {
  assertSpatialAddress(a);
  assertSpatialAddress(b);
  return a.worldId === b.worldId &&
    a.spaceId === b.spaceId &&
    a.layer === b.layer &&
    (a.instanceId || null) === (b.instanceId || null) &&
    (a.floorId || null) === (b.floorId || null);
}

export function samePhysicalPlace(a, b) {
  assertSpatialAddress(a);
  assertSpatialAddress(b);
  if (a.worldId !== b.worldId) return false;
  const physicalA = a.physicalAddressKey || spatialAddressKey(a);
  const physicalB = b.physicalAddressKey || spatialAddressKey(b);
  return physicalA === physicalB;
}
