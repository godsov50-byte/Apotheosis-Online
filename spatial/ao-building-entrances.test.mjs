import test from 'node:test';
import assert from 'node:assert/strict';
import { createProvisionalEntrance } from './ao-building-entrances.mjs';

test('places provisional entrance at midpoint of longest edge', () => {
  const fp = [[0,0],[0,0.002],[0.001,0.002],[0.001,0],[0,0]];
  const e = createProvisionalEntrance(fp);
  assert.deepEqual(e.position, [0.0005,0]);
  assert.equal(e.method, 'longest-edge-midpoint');
});
test('includes provenance for selected boundary segment', () => {
  const e = createProvisionalEntrance([[1,1],[1,1.001],[1.002,1.001],[1.002,1],[1,1]]);
  assert.equal(e.boundaryEdge.index, 0);
  assert.deepEqual(e.boundaryEdge.start, [1,1]);
});
test('rejects short or invalid coordinate arrays', () => {
  assert.equal(createProvisionalEntrance([[0,0],[0,1]]), null);
  assert.equal(createProvisionalEntrance([[0,0],[0,1],[NaN,1]]), null);
});
test('rejects degenerate zero-length polygons', () => {
  assert.equal(createProvisionalEntrance([[2,2],[2,2],[2,2]]), null);
});
