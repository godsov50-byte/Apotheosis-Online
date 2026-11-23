import test from "node:test";
import assert from "node:assert/strict";
import { rasterizeGeometry } from "../../spatial/ao-grid-rasterizer.mjs";

const meta = { featureId: "fixture-1", featureClass: "road-centerline", cellSizeMm: 1000 };
const cells = result => result.cells.map(c => [c.cellU, c.cellV]);

test("rasterizes horizontal centerlines into deterministic cells", () => {
  const result = rasterizeGeometry({ type: "LineString", coordinates: [[100, 100], [2900, 100]] }, meta);
  assert.deepEqual(cells(result), [[0,0],[1,0],[2,0]]);
  assert.equal(result.role, "centerline");
});

test("supercover includes both side cells at exact diagonal corner crossings", () => {
  const result = rasterizeGeometry({ type: "LineString", coordinates: [[100,100],[2100,2100]] }, meta);
  assert.deepEqual(cells(result), [[0,0],[1,0],[0,1],[1,1],[2,1],[1,2],[2,2]]);
});

test("rasterizes polygon area without adding a boundary-only halo", () => {
  const result = rasterizeGeometry({
    type: "Polygon",
    coordinates: [[[0,0],[2000,0],[2000,1000],[0,1000],[0,0]]]
  }, { ...meta, featureClass: "building-footprint" });
  assert.deepEqual(cells(result), [[0,0],[1,0]]);
  assert.equal(result.role, "surface");
});

test("respects polygon holes", () => {
  const result = rasterizeGeometry({
    type: "Polygon",
    coordinates: [
      [[0,0],[3000,0],[3000,3000],[0,3000],[0,0]],
      [[1000,1000],[2000,1000],[2000,2000],[1000,2000],[1000,1000]]
    ]
  }, { ...meta, featureClass: "building-footprint" });
  assert.deepEqual(cells(result), [
    [0,0],[1,0],[2,0],
    [0,1],[2,1],
    [0,2],[1,2],[2,2]
  ]);
});

test("supports negative coordinates with stable floor-based addressing", () => {
  const result = rasterizeGeometry({ type: "LineString", coordinates: [[-1900,-100],[-100,-100]] }, meta);
  assert.deepEqual(cells(result), [[-2,-1],[-1,-1]]);
});

test("keeps vertical level and layer separate from horizontal cell coordinates", () => {
  const result = rasterizeGeometry({ type: "LineString", coordinates: [[100,100],[1100,100]] }, {
    ...meta, featureClass: "tunnel", layer: "underground", levelMm: -6500
  });
  assert.equal(result.layer, "underground");
  assert.equal(result.levelMm, -6500);
  assert.ok(result.cells.every(cell => cell.levelMm === -6500));
});

test("supports MultiLineString and MultiPolygon", () => {
  const lines = rasterizeGeometry({ type: "MultiLineString", coordinates: [
    [[100,100],[1100,100]], [[100,2100],[1100,2100]]
  ] }, meta);
  assert.equal(lines.cellCount, 4);
  const polygons = rasterizeGeometry({ type: "MultiPolygon", coordinates: [
    [[[0,0],[1000,0],[1000,1000],[0,1000],[0,0]]],
    [[[2000,0],[3000,0],[3000,1000],[2000,1000],[2000,0]]]
  ] }, { ...meta, featureClass: "building-footprint" });
  assert.deepEqual(cells(polygons), [[0,0],[2,0]]);
});

test("is deterministic and preserves the source feature identity", () => {
  const geometry = { type: "LineString", coordinates: [[0,0],[4000,3000]] };
  const a = rasterizeGeometry(geometry, meta);
  const b = rasterizeGeometry(geometry, meta);
  assert.deepEqual(a, b);
  assert.equal(a.featureId, "fixture-1");
});

test("rejects unsafe coordinates and oversized raster windows", () => {
  assert.throws(() => rasterizeGeometry({ type: "LineString", coordinates: [[0,0],[1.5,2]] }, meta), /safe integer/);
  assert.throws(() => rasterizeGeometry({
    type: "Polygon",
    coordinates: [[[0,0],[100000,0],[100000,100000],[0,100000],[0,0]]]
  }, { ...meta, maxCells: 100 }), /maxCells/);
});
