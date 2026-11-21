#!/usr/bin/env python3
"""Acquire and audit Houston building footprints against official city limits.

Primary footprint source: Microsoft's statewide Texas building-footprint layer,
extracted from 2019-2020 imagery and queried only within Houston city limits. Boundary source: Harris County GIS City of Houston limits
(layer 2), acquired by acquire_houston_city_limits.py.

The report counts unique source footprints whose centroid falls inside Full or
Limited Service city-limit polygons. It separately reports intersecting
footprints whose centroid is outside, because edge-crossing features should
not silently inflate the in-boundary count. Pending boundary areas are excluded.
This is a source-data audit, not a claim that every feature is a valid building.
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

try:
    from shapely.geometry import shape, mapping, Polygon, MultiPolygon
    from shapely.geometry.polygon import orient
    from shapely.prepared import prep
except ImportError as exc:  # pragma: no cover - exercised in workflow
    raise SystemExit("Install requirements: pip install shapely") from exc

FOOTPRINT_LAYER = (
    "https://services.arcgis.com/lqRTrQp2HrfnJt8U/ArcGIS/rest/services/"
    "Texas_BuildingFootprints/FeatureServer/0"
)
BOUNDARY_SOURCE = (
    "https://www.gis.hctx.net/arcgis/rest/services/"
    "CoH/CoH_Boundaries/MapServer/2"
)
PAGE_SIZE = 1000
INCLUDED_SERVICE_TYPES = {"FULL", "LIMITED", "FULL SERVICE", "LIMITED SERVICE"}


def get_json(url: str, params: dict[str, str] | None = None) -> dict:
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    request = urllib.request.Request(
        url, headers={"User-Agent": "ApotheosisOnline-BuildingAudit/1.0"}
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        payload = json.load(response)
    if not isinstance(payload, dict) or "error" in payload:
        raise RuntimeError(f"ArcGIS request failed: {payload}")
    return payload


def post_json(url: str, params: dict[str, str]) -> dict:
    data = urllib.parse.urlencode(params).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "User-Agent": "ApotheosisOnline-BuildingAudit/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        payload = json.load(response)
    if not isinstance(payload, dict) or "error" in payload:
        raise RuntimeError(f"ArcGIS POST request failed: {payload}")
    return payload


def normalized_service_type(properties: dict) -> str:
    value = properties.get("SERVICE_TY") or properties.get("SERVICE_TYPE") or ""
    return " ".join(str(value).strip().upper().split())


def load_city_polygons(path: Path):
    document = json.loads(path.read_text(encoding="utf-8"))
    features = document.get("features", [])
    polygons = []
    excluded = Counter()
    for feature in features:
        properties = feature.get("properties") or {}
        service_type = normalized_service_type(properties)
        geometry = feature.get("geometry")
        if service_type in INCLUDED_SERVICE_TYPES and geometry:
            polygon = shape(geometry)
            if not polygon.is_empty and polygon.is_valid:
                polygons.append(prep(polygon))
            else:
                raise RuntimeError(
                    f"Invalid city-limit geometry for source feature "
                    f"{properties.get('OBJECTID')}"
                )
        else:
            excluded[service_type or "UNCLASSIFIED"] += 1
    if not polygons:
        raise RuntimeError(
            "No valid Full/Limited Service city-limit polygons found. "
            "Check source fields and boundary acquisition."
        )
    return polygons, dict(excluded)


def validate_footprint_source(metadata: dict) -> str:
    if metadata.get("geometryType") != "esriGeometryPolygon":
        raise RuntimeError("Footprint source is not polygon geometry.")
    fields = {field.get("name") for field in metadata.get("fields", [])}
    oid = metadata.get("objectIdField") or metadata.get("objectIdFieldName")
    if not oid:
        oid_field = next(
            (field.get("name") for field in metadata.get("fields", [])
             if field.get("type") == "esriFieldTypeOID"),
            None,
        )
        oid = oid_field
    if not oid or oid not in fields:
        raise RuntimeError("Could not identify the footprint source ObjectID field.")
    formats = {
        value.strip().lower()
        for value in metadata.get("supportedQueryFormats", "").split(",")
    }
    if not ({"json", "geojson"} & formats):
        raise RuntimeError("Source does not advertise JSON/GeoJSON query support.")
    if metadata.get("advancedQueryCapabilities", {}).get("supportsPagination") is False:
        raise RuntimeError("Source explicitly reports pagination unsupported.")
    return oid


def esri_geometry(geojson_geometry: dict) -> dict:
    """Convert GeoJSON polygons to Esri rings with required shell/hole winding."""
    geometry = shape(geojson_geometry)
    if isinstance(geometry, Polygon):
        polygons = [geometry]
    elif isinstance(geometry, MultiPolygon):
        polygons = list(geometry.geoms)
    else:
        raise RuntimeError(f"Unsupported city boundary geometry: {geometry.geom_type}")
    rings = []
    for polygon in polygons:
        # Esri JSON expects clockwise exterior rings and counter-clockwise holes.
        oriented = orient(polygon, sign=-1.0)
        polygon_mapping = mapping(oriented)
        rings.extend([list(ring) for ring in polygon_mapping["coordinates"]])
    return {"rings": rings, "spatialReference": {"wkid": 4326}}


def query_footprint_count(raw_polygons: list[dict]) -> int:
    from shapely.ops import unary_union

    combined_geometry = mapping(unary_union([shape(item) for item in raw_polygons]))
    response = post_json(
        FOOTPRINT_LAYER + "/query",
        {
            "where": "1=1",
            "geometry": json.dumps(esri_geometry(combined_geometry), separators=(",", ":")),
            "geometryType": "esriGeometryPolygon",
            "inSR": "4326",
            "spatialRel": "esriSpatialRelIntersects",
            "returnCountOnly": "true",
            "f": "json",
        },
    )
    count = response.get("count")
    if not isinstance(count, int) or count < 0:
        raise RuntimeError(f"ArcGIS did not return a valid footprint count: {response}")
    return count


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--city-limits",
        default="build/houston-building-audit/houston-city-limits.geojson",
    )
    parser.add_argument("--out", default="build/houston-building-audit")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        polygon_rings = esri_geometry({"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 0]]]})["rings"]
        multi_rings = esri_geometry({"type": "MultiPolygon", "coordinates": [[[[0, 0], [1, 0], [0, 0]]]]})["rings"]
        assert polygon_rings and multi_rings
        assert len(polygon_rings[0]) >= 4
        assert normalized_service_type({"SERVICE_TY": " full service "}) == "FULL SERVICE"
        print("Building footprint audit self-test passed.")
        return

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    city_path = Path(args.city_limits)
    if not city_path.exists():
        raise SystemExit(
            f"Missing {city_path}; first run scripts/geography/acquire_houston_city_limits.py."
        )
    city_document = json.loads(city_path.read_text(encoding="utf-8"))
    raw_polygons = [
        feature["geometry"] for feature in city_document.get("features", [])
        if normalized_service_type(feature.get("properties") or {}) in INCLUDED_SERVICE_TYPES
        and feature.get("geometry")
    ]
    if not raw_polygons:
        raise SystemExit("No Full/Limited Service city-limit polygons found.")

    metadata = get_json(FOOTPRINT_LAYER, {"f": "pjson"})
    validate_footprint_source(metadata)
    count = query_footprint_count(raw_polygons)
    report = {
        "source_name": "Microsoft US Building Footprints (Texas layer)",
        "source_url": FOOTPRINT_LAYER,
        "source_description": "Building footprints extracted from 2019-2020 imagery; Microsoft-licensed Open Database License (ODbL).",
        "source_vintage": "2019-2020 imagery",
        "source_copyright": "Microsoft",
        "boundary_source": BOUNDARY_SOURCE,
        "boundary_classes_included": ["FULL", "LIMITED"],
        "boundary_classes_excluded": ["PENDING"],
        "boundary_feature_count": len(raw_polygons),
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "unique_footprint_features_intersecting_city_limits": count,
        "count_definition": (
            "ArcGIS returnCountOnly count of unique source footprint polygon features "
            "intersecting the union of Full/Limited Service Houston city-limit polygons. "
            "This is a source-footprint count, not a verified count of distinct physical buildings."
        ),
        "source_full_extent": metadata.get("fullExtent"),
        "source_spatial_reference": metadata.get("extent", {}).get("spatialReference"),
        "limitations": [
            "2019-2020 imagery vintage; not a current ground survey.",
            "Automated imagery extraction can omit buildings or produce false positives.",
            "One footprint feature is not guaranteed to equal one physically distinct building.",
            "The count includes polygons intersecting the city boundary, including any edge-touching features.",
            "Building use, occupancy, floors, entrances, and business tenancy are not supplied by this count.",
            "Pending city-limit areas are excluded.",
        ],
    }
    (out / "source-layer-metadata.json").write_text(
        json.dumps(metadata, indent=2) + "\\n", encoding="utf-8"
    )
    (out / "building-footprint-audit.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    (out / "source-layer-metadata.json").write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="utf-8"
    )
    summary = {key: value for key, value in report.items() if key not in {
        "inside_feature_ids", "boundary_intersection_feature_ids"
    }}
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
