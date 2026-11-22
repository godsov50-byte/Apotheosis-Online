#!/usr/bin/env python3
"""Build a provenance-preserving Houston road-centerline AO-grid preview.

This stage transforms WGS84 source lines to the Houston profile's EPSG:2278
working CRS, then to local integer millimetres. The current Houston v2 profile
is not Kernel-approved, so normal execution is blocked. --preview-only permits
a clearly non-authoritative preview artifact and never writes to AO persistence.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from typing import Any

from pyproj import CRS, Transformer, __proj_version__, __version__

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PROFILE = ROOT / "geography/profiles/houston-v2.json"
METRES_PER_US_SURVEY_FOOT = Decimal(1200) / Decimal(3937)
SUPPORTED = {"LineString", "MultiLineString"}


class BuildError(ValueError):
    pass


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def round_mm(value: Decimal) -> int:
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def transform_position(position: list[Any], transformer: Transformer,
                       origin_e: Decimal, origin_n: Decimal) -> list[int]:
    if not isinstance(position, list) or len(position) != 2:
        raise BuildError("Road input must be 2D [longitude, latitude]; vertical reference is unresolved.")
    lon, lat = Decimal(str(position[0])), Decimal(str(position[1]))
    if not lon.is_finite() or not lat.is_finite() or not (-180 <= lon <= 180 and -90 <= lat <= 90):
        raise BuildError("Invalid WGS84 longitude/latitude.")
    east_ft, north_ft = transformer.transform(float(lon), float(lat), errcheck=True)
    if not (float("-inf") < east_ft < float("inf") and float("-inf") < north_ft < float("inf")):
        raise BuildError("PROJ returned a non-finite projected coordinate.")
    east = Decimal(str(east_ft))
    north = Decimal(str(north_ft))
    x_mm = round_mm((east - origin_e) * METRES_PER_US_SURVEY_FOOT * Decimal(1000))
    y_mm = round_mm(-(north - origin_n) * METRES_PER_US_SURVEY_FOOT * Decimal(1000))
    return [x_mm, y_mm]


def transform_geometry(geometry: dict[str, Any], transformer: Transformer,
                       origin_e: Decimal, origin_n: Decimal) -> dict[str, Any]:
    kind = geometry.get("type")
    coords = geometry.get("coordinates")
    if kind == "LineString":
        if not isinstance(coords, list) or len(coords) < 2:
            raise BuildError("LineString must contain at least two positions.")
        return {"type": kind, "coordinates": [
            transform_position(p, transformer, origin_e, origin_n) for p in coords
        ]}
    if kind == "MultiLineString":
        if not isinstance(coords, list) or not coords:
            raise BuildError("MultiLineString must contain at least one path.")
        lines = []
        for line in coords:
            if not isinstance(line, list) or len(line) < 2:
                raise BuildError("Every MultiLineString path must contain at least two positions.")
            lines.append([transform_position(p, transformer, origin_e, origin_n) for p in line])
        return {"type": kind, "coordinates": lines}
    raise BuildError(f"Unsupported road geometry: {kind!r}")


def build(source: dict[str, Any], source_manifest: dict[str, Any],
          profile: dict[str, Any], preview_only: bool) -> tuple[dict[str, Any], dict[str, Any]]:
    if source.get("type") != "FeatureCollection" or not isinstance(source.get("features"), list):
        raise BuildError("Input must be a GeoJSON FeatureCollection.")
    if source.get("crs", {}).get("properties", {}).get("name") not in (None, "EPSG:4326", "urn:ogc:def:crs:OGC:1.3:CRS84"):
        raise BuildError("Input CRS must be declared EPSG:4326/CRS84.")
    if profile.get("profile_key") != "houston" or profile.get("profile_version") != 2:
        raise BuildError("This builder is pinned to Houston profile v2.")
    if profile.get("ao_axis_convention") != {"x": "east", "y": "south", "z": "up"}:
        raise BuildError("Unexpected AO axis convention.")
    origin = profile.get("origin") or {}
    if origin.get("status") != "user_selected_map_anchor_transformed":
        raise BuildError("Houston v2 origin is missing or has an unexpected status.")
    origin_e, origin_n = Decimal(origin["easting"]), Decimal(origin["northing"])
    if not preview_only:
        raise BuildError("This builder only emits non-authoritative preview artifacts. A future canonical importer must be implemented against a separately reviewed and Kernel-approved profile.")

    transformer = Transformer.from_crs(CRS.from_epsg(4326), CRS.from_epsg(2278), always_xy=True)
    accuracy = transformer.accuracy
    if accuracy < 0 or accuracy > 4:
        raise BuildError(f"Selected WGS84-to-EPSG:2278 operation has unaccepted accuracy metadata: {accuracy} m.")
    features = []
    seen = set()
    missing_geometry = 0
    vertex_count = 0
    for feature in source["features"]:
        props = feature.get("properties") or {}
        global_id = props.get("GlobalID")
        object_id = props.get("OBJECTID")
        if global_id is None or object_id is None:
            raise BuildError("Every source road requires OBJECTID and GlobalID.")
        identity = str(global_id).strip()
        if not identity or identity in seen:
            raise BuildError("Missing or duplicate source GlobalID.")
        seen.add(identity)
        geometry = feature.get("geometry")
        if geometry is None:
            missing_geometry += 1
            continue
        local_geometry = transform_geometry(geometry, transformer, origin_e, origin_n)
        if local_geometry["type"] == "LineString":
            vertex_count += len(local_geometry["coordinates"])
        else:
            vertex_count += sum(len(line) for line in local_geometry["coordinates"])
        features.append({
            "type": "Feature",
            "id": "ao:identity:v1:coh_roadcenterline:" + identity,
            "geometry": local_geometry,
            "properties": {
                **props,
                "ao_feature_id": "ao:identity:v1:coh_roadcenterline:" + identity,
                "ao_feature_class": "road-centerline",
                "ao_layer": "ground",
                "ao_level_mm": 0,
                "ao_geometry_role": "centerline_candidate",
                "ao_source_identity": identity,
                "ao_source_object_id": object_id,
                "ao_source_crs": "EPSG:4326",
                "ao_working_crs": "EPSG:2278",
                "ao_local_coordinate_unit": "millimetre",
                "ao_local_axis_order": "x-east,y-south",
                "ao_preview_only": bool(preview_only),
            },
        })
    features.sort(key=lambda f: str(f["properties"]["ao_source_identity"]))
    output = {
        "type": "AOGridInputFeatureCollection",
        "schema_version": "1.0.0",
        "profile_key": "houston",
        "profile_version": 2,
        "coordinate_space": "houston-v2-local-mm-preview" if preview_only else "houston-v2-local-mm-approved",
        "cell_size_mm": int(profile["surface_cell_size_mm"]),
        "features": features,
    }
    source_bytes = json.dumps(source, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    source_hash = source_manifest.get("geometry_sha256") or sha256(source_bytes)
    manifest = {
        "artifact_id": "ao-houston-road-centerline-grid-input",
        "schema_version": "1.0.0",
        "profile_key": "houston",
        "profile_version": 2,
        "status": "preview_only_not_importable" if preview_only else "profile_approved_local_grid_input",
        "authoritative_world_state": False,
        "kernel_approval_required_for_import": True,
        "source_dataset_id": source_manifest.get("dataset_id", "ao-earth-houston-road-centerlines"),
        "source_snapshot_sha256": source_hash,
        "source_feature_count": len(source["features"]),
        "features_with_geometry": len(features),
        "features_missing_geometry": missing_geometry,
        "transformed_vertex_count": vertex_count,
        "source_crs": "EPSG:4326",
        "working_crs": "EPSG:2278",
        "working_crs_units": "US survey foot",
        "ao_local_origin": {
            "easting_ftUS": str(origin_e),
            "northing_ftUS": str(origin_n),
            "wgs84_latitude": origin["reference"]["latitude"],
            "wgs84_longitude": origin["reference"]["longitude"],
        },
        "axis_mapping": "x=(easting-origin_easting); y=-(northing-origin_northing)",
        "unit_conversion": "1 US survey foot = 1200/3937 metres; output millimetres",
        "rounding": "decimal ROUND_HALF_UP (ties away from zero)",
        "projection": {
            "operation": transformer.description,
            "pipeline_definition": transformer.definition,
            "accuracy_metres": accuracy,
            "pyproj_version": __version__,
            "proj_version": __proj_version__,
        },
        "limits": [
            "The selected WGS84-to-EPSG:2278 operation reports 4 m accuracy; millimetre coordinates are fixed-point representation, not millimetre positional accuracy.",
            "Centerline cells are candidate indexes only; they are not road surfaces, sidewalks, walkable areas, or confirmed route edges.",
            "No intersection, bridge/tunnel connection, access permission, turn rule, or movement rule is inferred.",
            "The Houston v2 profile remains unapproved; preview output cannot be imported into Kernel, WorldHeart, or Supabase.",
        ],
    }
    return output, manifest


def self_test() -> None:
    profile = load_json(DEFAULT_PROFILE)
    source = {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
        "features": [
            {"type": "Feature", "properties": {"OBJECTID": 1, "GlobalID": "fixture-road-a", "fullname": "Test Road"},
             "geometry": {"type": "LineString", "coordinates": [
                 [-95.369361, 29.760193], [-95.369350, 29.760193]
             ]}},
            {"type": "Feature", "properties": {"OBJECTID": 2, "GlobalID": "fixture-road-b"},
             "geometry": None},
        ],
    }
    output, manifest = build(source, {"geometry_sha256": "a" * 64}, profile, True)
    assert output["features"][0]["geometry"]["coordinates"][0] == [0, 0]
    assert output["features"][0]["properties"]["ao_geometry_role"] == "centerline_candidate"
    assert manifest["features_missing_geometry"] == 1
    assert manifest["status"] == "preview_only_not_importable"
    try:
        build(source, {}, profile, False)
    except BuildError as exc:
        assert "only emits non-authoritative preview" in str(exc)
    else:
        raise AssertionError("Unapproved profile must not build importable output.")
    print("self-test passed: WGS84 projection, selected origin, integer-mm axes, provenance, and approval gate")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=Path("build/houston-road-network/roads.geojson"))
    parser.add_argument("--source-manifest", type=Path, default=Path("build/houston-road-network/manifest.json"))
    parser.add_argument("--profile", type=Path, default=DEFAULT_PROFILE)
    parser.add_argument("--output-dir", type=Path, default=Path("build/houston-road-grid"))
    parser.add_argument("--preview-only", action="store_true",
                        help="Allow non-authoritative output while Houston v2 remains unapproved.")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    input_bytes = args.input.read_bytes()
    source = json.loads(input_bytes.decode("utf-8"))
    source_manifest = load_json(args.source_manifest) if args.source_manifest.exists() else {}
    declared_hash = source_manifest.get("geometry_sha256")
    if declared_hash and sha256(input_bytes) != declared_hash:
        raise BuildError("Source snapshot SHA-256 does not match its acquisition manifest.")
    profile = load_json(args.profile)
    output, manifest = build(source, source_manifest, profile, args.preview_only)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    output_bytes = (json.dumps(output, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()
    manifest["local_geometry_sha256"] = sha256(output_bytes)
    (args.output_dir / "roads-local-mm.json").write_bytes(output_bytes)
    (args.output_dir / "roads-local-mm-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({
        "status": manifest["status"],
        "features_with_geometry": manifest["features_with_geometry"],
        "features_missing_geometry": manifest["features_missing_geometry"],
        "local_geometry_sha256": manifest["local_geometry_sha256"],
        "output_dir": str(args.output_dir),
    }, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
