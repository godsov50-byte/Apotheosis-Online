import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const script = path.join(root, "scripts/geography/rasterize_houston_road_grid.mjs");

function rewriteFixture(f) {
  const bytes = Buffer.from(JSON.stringify(f.fixture));
  fs.writeFileSync(f.input, bytes);
  fs.writeFileSync(f.inputManifest, JSON.stringify({
    status: "preview_only_not_importable",
    profile_version: 2,
    local_geometry_sha256: crypto.createHash("sha256").update(bytes).digest("hex")
  }));
}

function runFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ao-houston-grid-"));
  const input = path.join(dir, "input.json");
  const output = path.join(dir, "cells.json");
  const manifest = path.join(dir, "manifest.json");
  const inputManifest = path.join(dir, "input-manifest.json");
  const fixture = {
    type: "AOGridInputFeatureCollection",
    schema_version: "1.0.0",
    profile_key: "houston",
    profile_version: 2,
    coordinate_space: "houston-v2-local-mm-preview",
    cell_size_mm: 1000,
    features: [{
      type: "Feature",
      id: "road-1",
      geometry: { type: "LineString", coordinates: [[0, 0], [2100, 2100]] },
      properties: {
        ao_feature_id: "ao:identity:v1:coh_roadcenterline:road-1",
        ao_feature_class: "road-centerline",
        ao_layer: "ground",
        ao_level_mm: 0,
        ao_geometry_role: "centerline_candidate",
        ao_source_identity: "road-1",
        ao_source_object_id: 1,
        ao_preview_only: true,
        fullname: "Test Road"
      }
    }]
  };
  const inputBytes = Buffer.from(JSON.stringify(fixture));
  fs.writeFileSync(input, inputBytes);
  fs.writeFileSync(inputManifest, JSON.stringify({
    status: "preview_only_not_importable",
    profile_version: 2,
    local_geometry_sha256: crypto.createHash("sha256").update(inputBytes).digest("hex")
  }));
  return { dir, input, output, manifest, inputManifest, fixture };
}

test("rasterizes preview road centerline, retaining identity and source attributes", () => {
  const f = runFixture();
  const result = spawnSync(process.execPath, [script, "--input", f.input, "--input-manifest", f.inputManifest, "--output", f.output, "--manifest", f.manifest], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(fs.readFileSync(f.output, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(f.manifest, "utf8"));
  assert.equal(output.features.length, 1);
  assert.equal(output.features[0].source_identity, "road-1");
  assert.equal(output.features[0].source_properties.fullname, "Test Road");
  assert.equal(output.features[0].role, "centerline_candidate");
  assert.deepEqual(output.features[0].cells, [[0,0],[1,0],[0,1],[1,1],[2,1],[1,2],[2,2]]);
  assert.equal(manifest.status, "preview_only_not_importable");
  assert.equal(manifest.authoritative_world_state, false);
});

test("rejects any input not explicitly marked as the Houston preview format", () => {
  const f = runFixture();
  f.fixture.coordinate_space = "houston-v2-local-mm-approved";
  rewriteFixture(f);
  const result = spawnSync(process.execPath, [script, "--input", f.input, "--input-manifest", f.inputManifest, "--output", f.output, "--manifest", f.manifest], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /preview artifact/);
});

test("rejects a source feature that tries to claim walkability", () => {
  const f = runFixture();
  f.fixture.features[0].properties.ao_geometry_role = "walkable";
  rewriteFixture(f);
  const result = spawnSync(process.execPath, [script, "--input", f.input, "--input-manifest", f.inputManifest, "--output", f.output, "--manifest", f.manifest], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /preview contract/);
});
