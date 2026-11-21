/**
 * AO Interior Navigation v0.1
 *
 * Deterministic cell-level routing for admin-authored building floor plans.
 * Walk edges require same-room adjacency or an explicit door record. Floor
 * changes require an explicit two-sided stair landing and admin-set duration.
 * This is a local staging navigation model, not structural/collision truth.
 */

const finite = value => typeof value === "number" && Number.isFinite(value);
const nonEmpty = (value, label) => {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(label + " must be a non-empty string");
  return value.trim();
};
const keyOf = (floor, row, col) => String(floor) + ":" + String(row) + ":" + String(col);
const parseCell = key => {
  const parts = String(key).split(":").map(Number);
  if (parts.length !== 2 || !parts.every(Number.isInteger) || parts.some(n => n < 0)) {
    throw new TypeError("Cell key must be row:col with non-negative integers");
  }
  return { row: parts[0], col: parts[1] };
};
const neighbors = ({ row, col }) => [
  { row: row - 1, col }, { row: row + 1, col },
  { row, col: col - 1 }, { row, col: col + 1 }
];

export function createInteriorNavigationGraph({
  building, cellSizeM = building?.cellSize, stairAccess = {}
}) {
  if (!building || typeof building !== "object") throw new TypeError("building is required");
  const buildingId = nonEmpty(building.id, "building.id");
  if (!Array.isArray(building.floorPlans) || !Array.isArray(building.rooms)) {
    throw new TypeError("building.floorPlans and building.rooms are required");
  }
  if (!finite(cellSizeM) || cellSizeM <= 0) throw new RangeError("cellSizeM must be positive");
  const nodes = new Map(), adjacency = new Map(), edges = new Map(), roomCells = new Map();

  const addNode = node => {
    if (!nodes.has(node.id)) {
      nodes.set(node.id, Object.freeze(node));
      adjacency.set(node.id, []);
    }
  };
  const addEdge = edge => {
    const id = edge.id;
    if (edges.has(id)) return;
    const frozen = Object.freeze(edge);
    edges.set(id, frozen);
    adjacency.get(edge.from).push(frozen);
  };
  const connect = (a, b, kind, details = {}) => {
    if (!nodes.has(a) || !nodes.has(b) || a === b) return;
    const pair = [a, b].sort();
    const suffix = details.id || kind;
    const lengthM = kind === "walk" ? cellSizeM : 0;
    const common = {
      kind, lengthM,
      travelSeconds: kind === "stairs" ? details.travelSeconds : null,
      requiredPermissions: Object.freeze([...(details.requiredPermissions || [])]),
      connectionId: details.id || null,
      from: a, to: b
    };
    addEdge({ ...common, id: pair[0] + "->" + pair[1] + ":" + suffix });
    addEdge({ ...common, id: pair[1] + "->" + pair[0] + ":" + suffix, from: b, to: a });
  };

  // Only explicitly assigned room cells are normally walkable.
  for (let floorIndex = 0; floorIndex < building.floorPlans.length; floorIndex++) {
    const floorId = String(floorIndex + 1), plan = building.floorPlans[floorIndex];
    if (!plan) continue;
    const rows = plan.rows, cols = plan.cols;
    if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(cols) || cols <= 0) {
      throw new RangeError("Floor " + floorId + " has invalid grid dimensions");
    }
    const roomByCell = new Map();
    for (const room of building.rooms.filter(item => String(item.floor) === floorId)) {
      const roomId = nonEmpty(room.id, "room.id");
      if (!Array.isArray(room.cells)) continue;
      for (const cellKey of room.cells) {
        const { row, col } = parseCell(cellKey);
        if (row >= rows || col >= cols) throw new RangeError("Room cell is outside floor " + floorId);
        const key = keyOf(floorId, row, col);
        if (roomByCell.has(key) && roomByCell.get(key) !== roomId) {
          throw new Error("A floor cell is assigned to more than one room: " + key);
        }
        roomByCell.set(key, roomId);
        roomCells.set(key, roomId);
        addNode({ id: key, floorId, row, col, roomId, kind: "room-cell" });
      }
    }
    // Within a room, orthogonally adjacent cells are connected. Cross-room
    // boundaries remain closed until an explicit door is registered.
    for (const [key, roomId] of roomByCell) {
      const { row, col } = parseCell(key.slice(floorId.length + 1));
      for (const next of [{ row, col: col + 1 }, { row: row + 1, col }]) {
        const nextKey = keyOf(floorId, next.row, next.col);
        if (roomByCell.get(nextKey) === roomId) connect(key, nextKey, "walk");
      }
    }

    for (const door of plan.doors || []) {
      const targetRoomId = door.targetRoomId;
      if (!targetRoomId) continue;
      const targetRoom = building.rooms.find(room =>
        room.id === targetRoomId && String(room.floor) === floorId
      );
      if (!targetRoom) continue;
      if (door.accessState === "locked") continue;
      const requiredPermissions = door.accessState === "restricted"
        ? [...(door.requiredPermissions || [])] : [];
      if (door.accessState === "restricted" && requiredPermissions.length === 0) continue;
      const sourceRoomIds = new Set(door.fromRoomIds || []);
      for (const cellKey of door.cells || []) {
        const { row, col } = parseCell(cellKey);
        if (row >= rows || col >= cols) continue;
        const key = keyOf(floorId, row, col);
        const assignedRoom = roomByCell.get(key);
        if (assignedRoom) sourceRoomIds.add(assignedRoom);
        else {
          for (const adjacent of neighbors({ row, col })) {
            const adjacentRoom = roomByCell.get(keyOf(floorId, adjacent.row, adjacent.col));
            if (adjacentRoom && adjacentRoom !== targetRoomId) sourceRoomIds.add(adjacentRoom);
          }
        }
        const isVirtualDoorCell = !assignedRoom;
        if (isVirtualDoorCell) addNode({ id: key, floorId, row, col, roomId: null, kind: "door-cell" });
        for (const next of neighbors({ row, col })) {
          if (next.row < 0 || next.col < 0 || next.row >= rows || next.col >= cols) continue;
          const nextKey = keyOf(floorId, next.row, next.col);
          const nextRoom = roomByCell.get(nextKey);
          if (!nextRoom) continue;
          if (nextRoom === targetRoomId) {
            if (isVirtualDoorCell) {
              // Connect this doorway cell to the target room side.
              connect(key, nextKey, "walk", { id: door.id, requiredPermissions });
            } else if (sourceRoomIds.has(assignedRoom)) {
              connect(key, nextKey, "walk", { id: door.id, requiredPermissions });
            }
          } else if (isVirtualDoorCell && sourceRoomIds.has(nextRoom)) {
            connect(key, nextKey, "walk", { id: door.id, requiredPermissions });
          }
        }
      }
    }
  }

  // A stair is traversable only when both landing cells are explicitly
  // assigned to Stairwell rooms and the record declares its traversal time.
  for (let floorIndex = 0; floorIndex < building.floorPlans.length; floorIndex++) {
    const fromFloor = String(floorIndex + 1), plan = building.floorPlans[floorIndex];
    for (const stair of plan?.stairs || []) {
      if (stair.connectionState !== "Confirmed by admin") continue;
      const toFloor = String(stair.toFloor);
      const sourceCells = stair.cells || (stair.fromCell ? [stair.fromCell] : []);
      const targetCells = stair.targetCells || (stair.toCell ? [stair.toCell] : []);
      const travelSeconds = stair.travelSeconds;
      if (!Number.isInteger(Number(toFloor)) || Number(toFloor) < 1 ||
          Number(toFloor) > building.floorPlans.length || toFloor === fromFloor ||
          !finite(travelSeconds) || travelSeconds <= 0 ||
          sourceCells.length !== 1 || targetCells.length !== 1 ||
          !stair.targetRoomId) continue;
      const sourceRoom = building.rooms.find(room =>
        room.id === stair.roomId && String(room.floor) === fromFloor && room.type === "Stairwell"
      );
      const targetRoom = building.rooms.find(room =>
        room.id === stair.targetRoomId && String(room.floor) === toFloor && room.type === "Stairwell"
      );
      if (!sourceRoom || !targetRoom || !sourceRoom.cells.includes(sourceCells[0]) ||
          !targetRoom.cells.includes(targetCells[0])) continue;
      const sourceCell = parseCell(sourceCells[0]), targetCell = parseCell(targetCells[0]);
      const from = keyOf(fromFloor, sourceCell.row, sourceCell.col);
      const to = keyOf(toFloor, targetCell.row, targetCell.col);
      if (!nodes.has(from) || !nodes.has(to)) continue;
      if (stair.accessState === "locked") continue;
      const requiredPermissions = stair.accessState === "restricted"
        ? [...(stair.requiredPermissions || [])] : [];
      if (stair.accessState === "restricted" && requiredPermissions.length === 0) continue;
      if (stairAccess[stair.id] === false) continue;
      // Unlike walking, a stair is a discrete floor transition with an
      // explicit admin-entered duration; no physical floor height is inferred.
      const addStairDirection = (a, b, suffix) => {
        const id = "stairs:" + stair.id + ":" + suffix;
        const edge = Object.freeze({
          id, from: a, to: b, kind: "stairs", lengthM: 0,
          travelSeconds, requiredPermissions: Object.freeze(requiredPermissions),
          connectionId: stair.id
        });
        edges.set(id, edge);
        adjacency.get(a).push(edge);
      };
      addStairDirection(from, to, "up");
      addStairDirection(to, from, "down");
    }
  }

  for (const list of adjacency.values()) list.sort((a, b) => a.id.localeCompare(b.id));
  return Object.freeze({
    buildingId, nodes, edges, adjacency,
    nodeIds: Object.freeze([...nodes.keys()].sort()),
    roomCells
  });
}

export function planInteriorRoute(graph, {
  fromNodeId, toNodeId, speedMps = 1.2, permissions = []
}) {
  if (!graph?.nodes || !graph?.adjacency) throw new TypeError("An interior navigation graph is required");
  if (!graph.nodes.has(fromNodeId) || !graph.nodes.has(toNodeId)) {
    throw new RangeError("Interior route endpoint is not a walkable cell");
  }
  if (!finite(speedMps) || speedMps <= 0) throw new RangeError("speedMps must be positive");
  const permissionSet = new Set(permissions);
  const costs = new Map([[fromNodeId, 0]]), previous = new Map();
  const unsettled = new Set(graph.nodeIds);
  while (unsettled.size) {
    let current = null, best = Infinity;
    for (const id of unsettled) {
      const cost = costs.get(id) ?? Infinity;
      if (cost < best || (cost === best && current !== null && id < current)) {
        best = cost; current = id;
      }
    }
    if (current === null || !Number.isFinite(best)) break;
    if (current === toNodeId) break;
    unsettled.delete(current);
    for (const edge of graph.adjacency.get(current) || []) {
      if (edge.requiredPermissions.some(permission => !permissionSet.has(permission))) continue;
      const duration = edge.kind === "stairs" ? edge.travelSeconds : edge.lengthM / speedMps;
      const candidate = best + duration, old = costs.get(edge.to) ?? Infinity;
      if (candidate < old) { costs.set(edge.to, candidate); previous.set(edge.to, edge); }
    }
  }
  if (fromNodeId !== toNodeId && !previous.has(toNodeId)) {
    return Object.freeze({
      status: "unreachable", fromNodeId, toNodeId,
      steps: Object.freeze([]), estimatedSeconds: null, distanceM: null
    });
  }
  const steps = [];
  for (let cursor = toNodeId; cursor !== fromNodeId;) {
    const edge = previous.get(cursor);
    if (!edge) throw new Error("Interior route reconstruction failed");
    steps.unshift(edge); cursor = edge.from;
  }
  return Object.freeze({
    status: "ready", fromNodeId, toNodeId,
    steps: Object.freeze(steps),
    estimatedSeconds: costs.get(toNodeId) ?? 0,
    distanceM: steps.reduce((sum, edge) => sum + edge.lengthM, 0),
    speedMps
  });
}

export function advanceInteriorRoute({
  route, elapsedSeconds, stepIndex = 0, stepProgressSeconds = 0
}) {
  if (!route || route.status !== "ready" || !Array.isArray(route.steps)) {
    throw new TypeError("A ready interior route is required");
  }
  if (!finite(elapsedSeconds) || elapsedSeconds < 0 ||
      !Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex > route.steps.length ||
      !finite(stepProgressSeconds) || stepProgressSeconds < 0) {
    throw new RangeError("Invalid interior route progress");
  }
  let remaining = elapsedSeconds, progress = stepProgressSeconds, index = stepIndex;
  const completedSteps = [];
  while (index < route.steps.length && remaining > 0) {
    const edge = route.steps[index];
    const duration = edge.kind === "stairs" ? edge.travelSeconds : edge.lengthM / route.speedMps;
    const needed = Math.max(0, duration - progress);
    if (remaining + 1e-9 < needed) {
      progress += remaining; remaining = 0; break;
    }
    remaining = Math.max(0, remaining - needed);
    completedSteps.push(edge); index++; progress = 0;
  }
  return Object.freeze({
    status: index >= route.steps.length ? "arrived" : "moving",
    stepIndex: index, stepProgressSeconds: progress,
    completedSteps: Object.freeze(completedSteps),
    elapsedConsumedSeconds: elapsedSeconds - remaining
  });
}

export function resolveInteriorCellAddress({
  resolver, buildingId, regionId, exteriorAddress, floorId,
  row, col, cellSizeM, roomId = null
}) {
  if (!resolver || typeof resolver.resolveInterior !== "function") {
    throw new TypeError("A compatible spatial resolver is required");
  }
  if (![row, col].every(Number.isInteger) || row < 0 || col < 0 ||
      !finite(cellSizeM) || cellSizeM <= 0) throw new RangeError("Invalid interior cell coordinates");
  return resolver.resolveInterior({
    buildingId, regionId, exteriorAddress, floorId,
    x: (col + 0.5) * cellSizeM, y: 0,
    z: (row + 0.5) * cellSizeM, roomId,
    coordinateSource: "admin-authored-interior-grid"
  });
}

export function createInteriorTransitionEvent({
  resolver, entityId, fromAddress, toAddress, step,
  occurredAt = new Date().toISOString(), transitionId = null
}) {
  if (!resolver || typeof resolver.transition !== "function") throw new TypeError("A spatial resolver is required");
  if (!step || !["walk", "stairs"].includes(step.kind)) throw new RangeError("Unsupported interior step kind");
  return resolver.transition({
    entityId, from: fromAddress, to: toAddress, kind: step.kind,
    occurredAt, transitionId,
    metadata: {
      authority: "houston-interior-staging",
      buildingId: toAddress.parentLocationId,
      fromFloorId: fromAddress.floorId,
      toFloorId: toAddress.floorId,
      fromRoomId: fromAddress.roomId,
      toRoomId: toAddress.roomId,
      fromCell: { x: fromAddress.position.x, z: fromAddress.position.z },
      toCell: { x: toAddress.position.x, z: toAddress.position.z },
      connectionId: step.connectionId || null,
      estimatedStepSeconds: step.kind === "stairs" ? step.travelSeconds : null
    }
  });
}
