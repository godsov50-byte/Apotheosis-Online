/** Validate a staged entrance destination against its actual floor and room cell. */
export function validateInteriorAnchor(floorPlans, rooms, anchor) {
  if (!Array.isArray(floorPlans) || !Array.isArray(rooms) || !anchor) return { valid: false, reason: 'Missing floor plans, rooms, or anchor.' };
  const floorNumber = Number(anchor.floor);
  if (!Number.isInteger(floorNumber) || floorNumber < 1 || floorNumber > floorPlans.length) return { valid: false, reason: 'Anchor floor is out of range.' };
  const cellKey = anchor.cell;
  if (typeof cellKey !== 'string' || !/^\d+:\d+$/.test(cellKey)) return { valid: false, reason: 'Anchor cell is missing or malformed.' };
  const [row, col] = cellKey.split(':').map(Number);
  const floor = floorPlans[floorNumber - 1];
  if (!floor || !Number.isInteger(floor.rows) || !Number.isInteger(floor.cols) || row >= floor.rows || col >= floor.cols) return { valid: false, reason: 'Anchor cell is outside the floor grid.' };
  const cell = floor.cells?.[cellKey];
  if (!cell?.roomId || cell.roomId !== anchor.roomId) return { valid: false, reason: 'Anchor cell is not assigned to the anchor room.' };
  const room = rooms.find(item => item.id === anchor.roomId && item.floor === floorNumber);
  if (!room || !Array.isArray(room.cells) || !room.cells.includes(cellKey)) return { valid: false, reason: 'Anchor room does not contain the destination cell.' };
  return { valid: true, floor: floorNumber, cell: cellKey, roomId: room.id };
}
