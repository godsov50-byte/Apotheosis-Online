#!/usr/bin/env node
/**
 * Rasterize already transformed Houston road centerlines to sparse AO cells.
 *
 * This tool accepts only the explicitly non-authoritative Houston v2 preview
 * format. It cannot publish, persist, or mark a road as walkable/traversable.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import { rasterizeGeometry } from "../../spatial/ao-grid-rasterizer.mjs";

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function parseArgs(argv) {
  const args = { input: "build/houston-road-grid/roads-local-mm.geojson",
    output: "build/houston-road-grid/road-centerline-cells.json",
    manifest: "build/houston-road-grid/road-centerline-cells-manifest.json",
    maxCellsPerFeature: 100000, maxTotalCells: 10000000 };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--input") args.input = argv[++i];
    else if (key === "--output") args.output = argv[++i];
    else if (key === "--manifest") args.manifest = argv[++i];
    else if (key === "--max-cells-per-feature") args.maxCellsPerFeature = Number(argv[++i]);
    else if (key === "--max-total-cells") args.maxTotalCells = Number(argv[++i]);
    else if (key === "--help") args.help = true;
    else throw new Error("Unknown argument: " + key);
  }
  return args;
}

function validateAndEstimate(geometry, cellSizeMm, limit) {
  const lines = geometry.type === "LineString" ? [geometry.coordinates] :
    geometry.type === "MultiLineString" ? geometry.coordinates : null;
  if (!lines || !lines.length) throw new Error("Only LineString and MultiLineString road centerlines are accepted.");
  let estimate = 0;
  for (const line of lines) {
    if (!Array.isArray(line) || line.length < 2) throw new Error("Each road path needs at least two positions.");
    for (const p of line) {
      if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isSafeInteger)) {
        throw new Error("Local road coordinates must be safe integer [x_mm,y_mm] pairs.");
      }
    }
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i];
      const dx = Math.abs(Math.floor(b[0] / cellSizeMm) - Math.floor(a[0] / cellSizeMm));
      const dy = Math.abs(Math.floor(b[1] / cellSizeMm) - Math.floor(a[1] / cellSizeMm));
      estimate += 3 * (dx + dy + 1);
      if (!Number.isSafeInteger(estimate) || estimate > limit) {
        throw new RangeError("Road feature exceeds the conservative cell-work limit; split the source feature.");
      }
    }
  }
  return estimate;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write("Usage: node scripts/geography/rasterize_houston_road_grid.mjs [--input FILE] [--output FILE] [--manifest FILE]\n");
    return;
  }
  if (!Number.isSafeInteger(args.maxCellsPerFeature) || args.maxCellsPerFeature < 1 ||
      !Number.isSafeInteger(args.maxTotalCells) || args.maxTotalCells < 1) {
    throw new Error("Cell limits must be positive safe integers.");
  }
  const inputBytes = fs.readFileSync(args.input);
  const input = JSON.parse(inputBytes.toString("utf8"));
  if (input.type !== "AOGridInputFeatureCollection" || input.schema_version !== "1.0.0" ||
      input.profile_key !== "houston" || input.profile_version !== 2 ||
      input.coordinate_space !== "houston-v2-local-mm-preview") {
    throw new Error("Input must be a Houston v2 local-mm preview artifact; approved/importable inputs are not accepted by this preview builder.");
  }
  if (!Number.isSafeInteger(input.cell_size_mm) || input.cell_size_mm <= 0 || !Array.isArray(input.features)) {
    throw new Error("Invalid cell size or feature list.");
  }

  const features = [];
  const sourceIds = new Set();
  let totalCells = 0;
  for (const feature of input.features) {
    const props = feature.properties || {};
    const featureId = props.ao_feature_id;
    const sourceIdentity = props.ao_source_identity;
    if (typeof featureId !== "string" || !featureId || typeof sourceIdentity !== "string" || !sourceIdentity) {
      throw new Error("Every feature requires stable AO feature and source identities.");
    }
    if (sourceIds.has(sourceIdentity)) throw new Error("Duplicate source identity: " + sourceIdentity);
    sourceIds.add(sourceIdentity);
    if (props.ao_feature_class !== "road-centerline" || props.ao_geometry_role !== "centerline_candidate" ||
        props.ao_preview_only !== true || props.ao_layer !== "ground" || props.ao_level_mm !== 0) {
      throw new Error("Feature metadata violates the road-centerline preview contract.");
    }
    const estimate = validateAndEstimate(feature.geometry, input.cell_size_mm, args.maxCellsPerFeature);
    const raster = rasterizeGeometry(feature.geometry, {
      featureId,
      featureClass: "road-centerline",
      layer: "ground",
      levelMm: 0,
      cellSizeMm: input.cell_size_mm,
      maxCells: args.maxCellsPerFeature
    });
    totalCells += raster.cellCount;
    if (totalCells > args.maxTotalCells) throw new RangeError("Total output exceeds --max-total-cells.");
    features.push({
      feature_id: featureId,
      source_identity: sourceIdentity,
      source_object_id: props.ao_source_object_id,
      source_properties: props,
      layer: raster.layer,
      level_mm: raster.levelMm,
      role: "centerline_candidate",
      conservative_work_estimate_cells: estimate,
      cell_count: raster.cellCount,
      cells: raster.cells.map(cell => [cell.cellU, cell.cellV])
    });
  }
  features.sort((a, b) => a.source_identity.localeCompare(b.source_identity));
  const output = {
    type: "AOGridCellFeatureCollection",
    schema_version: "1.0.0",
    profile_key: input.profile_key,
    profile_version: input.profile_version,
    coordinate_space: input.coordinate_space,
    cell_size_mm: input.cell_size_mm,
    feature_role: "road-centerline-candidate-only",
    features
  };
  const outputBytes = Buffer.from(JSON.stringify(output) + "\n", "utf8");
  const manifest = {
    artifact_id: "ao-houston-road-centerline-grid-cells",
    schema_version: "1.0.0",
    status: "preview_only_not_importable",
    authoritative_world_state: false,
    kernel_approval_required_for_import: true,
    source_local_geometry_sha256: sha256(inputBytes),
    output_sha256: sha256(outputBytes),
    source_feature_count: input.features.length,
    rasterized_feature_count: features.length,
    total_sparse_cells: totalCells,
    cell_size_mm: input.cell_size_mm,
    cell_role: "centerline_candidate",
    limits: {
      max_cells_per_feature: args.maxCellsPerFeature,
      max_total_cells: args.maxTotalCells
    },
    restrictions: [
      "Cells index source road centerlines only; they are not road-surface or sidewalk occupancy.",
      "No road width, walkability, legal access, route edge, intersection, turn, or grade-level connection is inferred.",
      "Bridge/tunnel/overpass separation and topology validation are not performed by this build.",
      "Preview output is not a Kernel proposal and is never written to WorldHeart or Supabase."
    ]
  };
  fs.mkdirSync(new URL(".", "file://" + process.cwd() + "/"), { recursive: true });
  fs.mkdirSync(args.output.slice(0, args.output.lastIndexOf("/")) || ".", { recursive: true });
  fs.mkdirSync(args.manifest.slice(0, args.manifest.lastIndexOf("/")) || ".", { recursive: true });
  fs.writeFileSync(args.output, outputBytes);
  fs.writeFileSync(args.manifest, JSON.stringify(manifest, null, 2) + "\n");
  process.stdout.write(JSON.stringify({
    status: manifest.status,
    rasterized_feature_count: features.length,
    total_sparse_cells: totalCells,
    output_sha256: manifest.output_sha256,
    output: args.output
  }, null, 2) + "\n");
}

try {
  main();
} catch (error) {
  process.stderr.write("ERROR: " + (error?.message || String(error)) + "\n");
  process.exitCode = 1;
}
