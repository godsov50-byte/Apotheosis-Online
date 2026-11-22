#!/usr/bin/env python3
"""Run the reproducible, preview-only Houston road-network pipeline end-to-end.

This orchestrator downloads a complete City of Houston centerline snapshot, compiles
its source-identity street registry, transforms the geometry to Houston-local
millimetres (preview only), and rasterizes candidate centerline cells. It never
writes to AO persistence or declares roads walkable.
"""
from __future__ import annotations
import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ACQUIRE = ROOT / "scripts/geography/acquire_houston_road_centerlines.py"
REGISTRY = ROOT / "scripts/geography/build_houston_street_registry.py"
GRID = ROOT / "scripts/geography/build_houston_road_grid.py"
RASTER = ROOT / "scripts/geography/rasterize_houston_road_grid.mjs"
TOPOLOGY = ROOT / "scripts/geography/build_houston_endpoint_topology_preview.py"\nTOPOLOGY_V2 = ROOT / "scripts/geography/build_houston_endpoint_topology_preview_v2.py"

def run(command: list[str]) -> None:
    print("+", " ".join(map(str, command)), flush=True)
    subprocess.run(command, cwd=ROOT, check=True)

def build(output: Path, preview_only: bool) -> dict:
    if not preview_only:
        raise ValueError("Only --preview-only is supported. Import requires separate Kernel/profile approval.")
    road_dir = output / "source"
    grid_dir = output / "grid"
    run([sys.executable, str(ACQUIRE), "--output-dir", str(road_dir)])
    run([sys.executable, str(REGISTRY), "--input", str(road_dir/"roads.geojson"),
         "--source-manifest", str(road_dir/"manifest.json"), "--output-dir", str(road_dir)])
    run([sys.executable, str(GRID), "--preview-only", "--input", str(road_dir/"roads.geojson"),
         "--source-manifest", str(road_dir/"manifest.json"), "--output-dir", str(grid_dir)])
    run(["node", str(RASTER), "--input", str(grid_dir/"roads-local-mm.json"),
         "--output", str(grid_dir/"road-centerline-cells.json"),
         "--manifest", str(grid_dir/"road-centerline-cells-manifest.json"),
         "--input-manifest", str(grid_dir/"roads-local-mm-manifest.json")])
    run([sys.executable, str(TOPOLOGY), "--input", str(grid_dir/"roads-local-mm.json"),
         "--manifest", str(grid_dir/"roads-local-mm-manifest.json"),
         "--output", str(grid_dir/"endpoint-topology.json"),
         "--report", str(grid_dir/"endpoint-topology-report.json")])
    source_manifest = json.loads((road_dir/"manifest.json").read_text(encoding="utf-8"))
    registry_manifest = json.loads((road_dir/"street-registry-manifest.json").read_text(encoding="utf-8"))
    grid_manifest = json.loads((grid_dir/"roads-local-mm-manifest.json").read_text(encoding="utf-8"))
    raster_manifest = json.loads((grid_dir/"road-centerline-cells-manifest.json").read_text(encoding="utf-8"))
    topology_report = json.loads((grid_dir/"endpoint-topology-report.json").read_text(encoding="utf-8"))\n    topology_v2_report = json.loads((grid_dir/"endpoint-topology-v2-report.json").read_text(encoding="utf-8"))
    summary = {
      "build_id":"ao-houston-road-network-preview-v1",
      "status":"preview_only_not_importable",
      "authoritative_world_state":False,
      "kernel_approval_required":True,
      "source_snapshot_sha256":source_manifest["geometry_sha256"],
      "source_records":source_manifest["feature_count"],
      "source_records_missing_geometry":source_manifest["null_geometry_feature_count"],
      "street_registry_counts":registry_manifest["counts"],
      "grid_features_with_geometry":grid_manifest["features_with_geometry"],
      "grid_features_missing_geometry":grid_manifest["features_missing_geometry"],
      "transformed_vertices":grid_manifest["transformed_vertex_count"],
      "candidate_cells":raster_manifest["total_sparse_cells"],
      "road_paths":topology_report["road_paths"],
      "endpoint_node_candidates":topology_report["endpoint_node_candidates"],\n      "endpoint_node_candidates_v2":topology_v2_report["endpoint_node_candidates"],\n      "endpoint_snap_tolerance_mm_v2":topology_v2_report["snap_tolerance_mm"],
      "source_crs":"EPSG:4326",
      "working_crs":"EPSG:2278",
      "local_grid_cell_size_mm":grid_manifest["cell_size_mm"],
      "outputs":{
        "source_snapshot":str(road_dir/"roads.geojson"),
        "source_manifest":str(road_dir/"manifest.json"),
        "street_registry":str(road_dir/"street-registry.json"),
        "street_registry_manifest":str(road_dir/"street-registry-manifest.json"),
        "local_geometry":str(grid_dir/"roads-local-mm.json"),
        "local_geometry_manifest":str(grid_dir/"roads-local-mm-manifest.json"),
        "candidate_cells":str(grid_dir/"road-centerline-cells.json"),
        "candidate_cells_manifest":str(grid_dir/"road-centerline-cells-manifest.json"),
        "endpoint_topology":str(grid_dir/"endpoint-topology.json"),
        "endpoint_topology_report":str(grid_dir/"endpoint-topology-report.json"),\n        "endpoint_topology_v2":str(grid_dir/"endpoint-topology-v2.json"),\n        "endpoint_topology_v2_report":str(grid_dir/"endpoint-topology-v2-report.json")
      },
      "restrictions":[
        "Road-centerline cells are candidate indexes, not walkable road surfaces.",
        "This build does not validate intersections, grade separation, sidewalks, entrances, or legal access.",
        "Houston profile v2 remains staging-only; output cannot be imported into Kernel, WorldHeart, or Supabase."
      ]
    }
    output.mkdir(parents=True,exist_ok=True)
    (output/"BUILD_SUMMARY.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)
    return summary

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir",type=Path,default=ROOT/"build/houston-road-network-preview")
    parser.add_argument("--preview-only",action="store_true",help="Required staging-only mode.")
    parser.add_argument("--plan",action="store_true",help="Print the planned stages without executing.")
    args=parser.parse_args()
    if args.plan:
        print("\n".join([
          "1. Acquire complete City of Houston centerline snapshot and validate counts/IDs.",
          "2. Compile immutable segment identities and street-name search groups.",
          "3. Transform to Houston-local millimetres using staging profile v2.",
          "4. Rasterize sparse centerline candidate cells.",
          "5. Build legacy endpoint topology candidates.\n6. Build distance-tolerant endpoint topology v2 (no crossing connections).",\n          "7. Write BUILD_SUMMARY.json with source/output counts and provenance."
          
          "NOTE: preview-only; no database or world-state writes."
        ]))
        return 0
    build(args.output_dir,args.preview_only)
    return 0

if __name__=="__main__":
    try: raise SystemExit(main())
    except Exception as exc:
        print("ERROR:",exc,file=sys.stderr)
        raise SystemExit(1)
