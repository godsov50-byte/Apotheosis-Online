import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureEntranceHall } from './ao-entrance-hall.mjs';

test('creates a starter foyer cell and room on an empty floor', () => {
  const floor = { rows: 3, cols: 3, cells: {} }, rooms = [];
  const result = ensureEntranceHall(floor, rooms);
  assert.equal(result.created, true);
  assert.equal(result.room.type, 'Entrance hall');
  assert.equal(floor.cells[result.cell].roomId, result.room.id);
});
test('does not duplicate a foyer when called repeatedly', () => {
  const floor = { rows: 2, cols: 2, cells: {} }, rooms = [];
  ensureEntranceHall(floor, rooms);
  const again = ensureEntranceHall(floor, rooms);
  assert.equal(again.created, false);
  assert.equal(rooms.length, 1);
});
test('does not overwrite occupied floor cells', () => {
  const floor = { rows: 1, cols: 2, cells: {'0:0':{roomId:'old'}} }, rooms = [];
  const result = ensureEntranceHall(floor, rooms);
  assert.equal(result.cell, '0:1');
  assert.equal(floor.cells['0:0'].roomId, 'old');
});
test('returns null when all cells are already assigned', () => {
  const floor = { rows: 1, cols: 1, cells: {'0:0':{roomId:'old'}} };
  assert.equal(ensureEntranceHall(floor, []), null);
});
