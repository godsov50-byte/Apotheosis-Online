#!/usr/bin/env python3
"""Acquire and audit Houston building footprints against official city limits.

Primary footprint source: H-GAC 2018 LiDAR-derived Harris County building
footprints (layer 0). Boundary source: Harris County GIS City of Houston limits
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
    from shapely.geometry import shape
    from shapely.prepared import prep
except ImportError as exc:  # pragma: no cover - exercised in workflow
    raise SystemExit("Install requirements: pip install shapely") from exc

FOOTPRINT_LAYER = (
    "https://geohwp.houstontx.gov/arcgis/rest/services/"
    "02_BaseData_Boundaries/Other/FeatureServer/4"
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
    """Convert a GeoJSON Polygon/MultiPolygon to an Esri rings geometry."""
    kind = geojson_geometry.get("type")
    coordinates = geojson_geometry.get("coordinates", [])
    if kind == "Polygon":
        rings = coordinates
    elif kind == "MultiPolygon":
        rings = [ring for polygon in coordinates for ring in polygon]
    else:
        raise RuntimeError(f"Unsupported city boundary geometry: {kind}")
    return {"rings": rings, "spatialReference": {"wkid": 4326}}


def query_footprints(oid_field: str, raw_polygons: list[dict], pause: float):
    seen: dict[int, dict] = {}
    for polygon_number, geometry in enumerate(raw_polygons, start=1):
        offset = 0
        while True:
            page = get_json(
                FOOTPRINT_LAYER + "/query",
                {
                    "where": "1=1",
                    "geometry": json.dumps(esri_geometry(geometry), separators=(",", ":")),
                    "geometryType": "esriGeometryPolygon",
                    "inSR": "4326",
                    "spatialRel": "esriSpatialRelIntersects",
                    "outFields": "*",
                    "returnGeometry": "true",
                    "outSR": "4326",
                    "f": "geojson",
                    "orderByFields": f"{oid_field} ASC",
                    "resultOffset": str(offset),
                    "resultRecordCount": str(PAGE_SIZE),
                },
            )
            batch = page.get("features")
            if not isinstance(batch, list):
                raise RuntimeError(f"No feature array at polygon {polygon_number}, offset {offset}.")
            if page.get("exceededTransferLimit") is True:
                raise RuntimeError(
                    f"Transfer limit exceeded at polygon {polygon_number}, offset {offset}."
                )
            if not batch:
                break
            for feature in batch:
                properties = feature.get("properties") or {}
                raw_id = properties.get(oid_field)
                if raw_id is None:
                    raise RuntimeError(f"Footprint missing {oid_field}.")
                source_id = int(raw_id)
                if not feature.get("geometry"):
                    raise RuntimeError(f"Footprint {source_id} has no geometry.")
                seen.setdefault(source_id, feature)
            offset += len(batch)
            if len(batch) < PAGE_SIZE:
                break
            time.sleep(pause)
        time.sleep(pause)
    return list(seen.values())


def audit(features: list[dict], raw_polygons: list[dict], oid_field: str):
    from shapely.ops import unary_union

    city = unary_union([shape(geometry) for geometry in raw_polygons])
    city_prepared = prep(city)
    inside = []
    boundary_intersections = []
    geom_types = Counter()
    invalid = 0
    for feature in features:
        props = feature.get("properties") or {}
        geometry = shape(feature["geometry"])
        if geometry.is_empty or not geometry.is_valid:
            invalid += 1
            continue
        centroid = geometry.representative_point()
        record = {
            "source_object_id": props[oid_field],
            "geom_type": props.get("GeomType"),
            "parcel_id": props.get("HGAC_Parcel_Number"),
        }
        geom_types[str(record["geom_type"] or "UNCLASSIFIED")] += 1
        if city_prepared.covers(centroid):
            inside.append(record)
        else:
            boundary_intersections.append(record)
    return {
        "unique_intersecting_source_features": len(features),
        "centroid_inside_city_limits": len(inside),
        "intersecting_but_centroid_outside": len(boundary_intersections),
        "invalid_or_empty_geometries_skipped": invalid,
        "counts_by_source_geom_type_inside": dict(sorted(
            Counter(str(row["geom_type"] or "UNCLASSIFIED") for row in inside).items()
        )),
        "counts_by_source_geom_type_intersecting": dict(sorted(geom_types.items())),
        "inside_feature_ids": inside,
        "boundary_intersection_feature_ids": boundary_intersections,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--city-limits",
        default="build/houston-building-audit/houston-city-limits.geojson",
    )
    parser.add_argument("--out", default="build/houston-building-audit")
    parser.add_argument("--pause", type=float, default=0.15)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        assert esri_geometry({"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 0]]]})["rings"]
        assert esri_geometry({"type": "MultiPolygon", "coordinates": [[[[0, 0], [1, 0], [0, 0]]]]})["rings"]
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
    oid_field = validate_footprint_source(metadata)
    features = query_footprints(oid_field, raw_polygons, args.pause)
    report = audit(features, raw_polygons, oid_field)
    report.update({
        "source_name": "H-GAC Building Footprints 2018 (City of Houston GeoHub republish)",
        "source_url": FOOTPRINT_LAYER,\n        "source_layer_last_updated": "2022-01-25",
        "source_description": (
            "2018 LiDAR-derived Harris County building footprints; source warns "
            "that some features may be false positives from LiDAR classification."
        ),
        "source_copyright": "Houston-Galveston Area Council and Esri",
        "source_vintage": "2018 LiDAR; Harris County delivery 2019-06-24; republished layer last updated 2022-01-25",
        "boundary_source": BOUNDARY_SOURCE,
        "boundary_classes_included": ["FULL", "LIMITED"],
        "boundary_classes_excluded": ["PENDING"],
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "count_definition": (
            "Unique source footprint features intersecting Full/Limited Service "
            "Houston city-limit polygons, counted as inside when the feature's "
            "representative point lies within the union of those polygons."
        ),
        "limitations": [
            "2018 footprint vintage; not a current ground survey.",
            "LiDAR classification may include false positives or omit structures.",
            "A footprint is not necessarily one building, one address, or one business.",\n            "PARCEL_ID identifies a parcel, not a building; parcel counts are not building counts.",
            "Multi-part structures and attached buildings may be represented as one or more polygons.",
            "Counts are source-feature counts, not verified occupancy or building-use counts.",
            "Pending city-limit areas are excluded.",
        ],
    })
    (out / "houston-building-footprints.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, separators=(",", ":")) + "\n",
        encoding="utf-8",
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
