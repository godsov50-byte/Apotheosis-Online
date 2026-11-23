import test from "node:test";
import assert from "node:assert/strict";
import { createSourceBuildingRecord } from "./ao-building-records.mjs";

const feature = {
  type: "Feature", id: "H-42", properties: { OBJECTID: 42, NAME: "Example Hall", floors: 8 },
  geometry: { type: "Polygon", coordinates: [[[-95.37,29.76],[-95.369,29.76],[-95.369,29.761],[-95.37,29.761],[-95.37,29.76]]] }
};
test("creates editable proposal from valid source polygon and converts coordinates to Leaflet order", () => {
  const b = createSourceBuildingRecord(feature);
  assert.equal(b.id, "source-building:H-42");
  assert.equal(b.name, "Example Hall");
  assert.deepEqual(b.footprint[0], [29.76, -95.37]);
  assert.equal(b.floorsKnown, false);
  assert.equal(b.source.properties.NAME, "Example Hall");
});
test("stable fallback id derives from geometry when source id is absent", () => {
  const a = createSourceBuildingRecord({ ...feature, id: undefined, properties: {} });
  const b = createSourceBuildingRecord({ ...feature, id: undefined, properties: {} });
  assert.equal(a.id, b.id);
});
test("keeps source geometry and properties without mutating input", () => {
  const before = JSON.stringify(feature);
  const b = createSourceBuildingRecord(feature);
  assert.deepEqual(b.source.geometry, feature.geometry);
  assert.equal(JSON.stringify(feature), before);
});
test("rejects non-polygon geometry rather than silently converting", () => {
  assert.throws(() => createSourceBuildingRecord({ ...feature, geometry: { type: "Point", coordinates: [-95.37,29.76] } }), /Only Polygon/);
});
test("rejects malformed outer rings", () => {
  assert.throws(() => createSourceBuildingRecord({ ...feature, geometry: { type: "Polygon", coordinates: [[[0,0],[1,1],[NaN,2]]] } }), /valid outer ring/);
});

test("rejects interior rings because the staging renderer cannot represent building courtyards yet", () => {
  const withHole = structuredClone(feature);
  withHole.geometry.coordinates.push([[-95.3698,29.7602],[-95.3697,29.7602],[-95.3697,29.7603],[-95.3698,29.7603],[-95.3698,29.7602]]);
  assert.throws(() => createSourceBuildingRecord(withHole), /Polygon holes are not supported/);
});
test("rejects unclosed GeoJSON outer rings", () => {
  const unclosed = structuredClone(feature);
  unclosed.geometry.coordinates[0].pop();
  assert.throws(() => createSourceBuildingRecord(unclosed), /outer ring must be closed/);
});
