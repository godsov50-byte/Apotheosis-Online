/**
 * Adds a one-cell placeholder Entrance Hall to floor 1 when absent.
 * The grid is a staging abstraction; it is not inferred architectural geometry.
 */
export function ensureEntranceHall(floorPlan, rooms, floorNumber = 1) {
  if (!floorPlan || !Array.isArray(rooms)) return null;
  const existing = rooms.find(r => r.floor === floorNumber && r.type === 'Entrance hall');
  if (existing) return { room: existing, cell: existing.cells?.[0] ?? null, created: false };
  floorPlan.rows ||= 20; floorPlan.cols ||= 20; floorPlan.cells ||= {};
  const rows = Math.max(1, floorPlan.rows), cols = Math.max(1, floorPlan.cols);
  let cell = null;
  for (let r = 0; r < rows && !cell; r++) for (let c = 0; c < cols; c++) {
    const key = r + ':' + c;
    if (!floorPlan.cells[key]?.roomId) { cell = key; break; }
  }
  if (!cell) return null;
  const room = { id: 'auto-entrance-hall-' + floorNumber, name: 'Entrance Hall', type: 'Entrance hall', floor: floorNumber, cells: [cell], generated: true, placeholder: true };
  rooms.push(room);
  floorPlan.cells[cell] = { ...(floorPlan.cells[cell] || {}), roomId: room.id, label: 'EH' };
  return { room, cell, created: true };
}
