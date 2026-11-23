#!/usr/bin/env python3
"""Acquire H-GAC 2018 Harris County building footprints intersecting Houston city limits.

The source is approximate LiDAR-derived evidence, not a surveyed building inventory.
The output is GeoJSON in WGS84 for import into the local AO city-console registry.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BOUNDARY_URL = "https://services.arcgis.com/NummVBqZSIJKUeVR/arcgis/rest/services/COH_City_Limit_view/FeatureServer/0"
FOOTPRINT_URL = "https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0"
SOURCE_ID = "hgac-harris-county-building-footprints-2018"
SOURCE_CRS = 2278
OUTPUT_CRS = 4326

def request_json(url: str, params: dict[str, Any] | None = None, timeout: int = 90) -> dict[str, Any]:
    query = urllib.parse.urlencode(params or {})
    target = url + ("?" + query if query else "")
    headers = {"User-Agent": "Apotheosis-Online-Geography/1.0"}
    # ArcGIS rejects or resets oversized GET requests, especially the full
    # Houston boundary polygon used by the spatial-intersection query.
    # Send long parameter sets as form-encoded POST requests instead.
    if len(target) > 1800:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        req = urllib.request.Request(url, data=query.encode("ascii"), headers=headers)
    else:
        req = urllib.request.Request(target, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        data = json.loads(response.read().decode("utf-8"))
    if "error" in data:
        raise RuntimeError("ArcGIS service error: " + json.dumps(data["error"], sort_keys=True))
    return data

def layer_metadata(url: str, timeout: int) -> dict[str, Any]:
    data = request_json(url, {"f": "pjson"}, timeout)
    editing = data.get("editingInfo") or {}
    return {
        "name": data.get("name"),
        "geometryType": data.get("geometryType"),
        "objectIdField": data.get("objectIdField"),
        "maxRecordCount": data.get("maxRecordCount"),
        "lastEditDate": editing.get("lastEditDate"),
        "dataLastEditDate": editing.get("dataLastEditDate"),
        "spatialReference": data.get("extent", {}).get("spatialReference"),
    }

def query_ids(url: str, where: str, timeout: int, **spatial: Any) -> list[int]:
    data = request_json(url + "/query", {
        "where": where, "returnIdsOnly": "true", "returnGeometry": "false",
        "f": "json", **spatial
    }, timeout)
    ids = data.get("objectIds")
    # ArcGIS returns objectIds: null when a polygon has no intersecting
    # footprints; treat that as an empty result rather than a malformed reply.
    if ids is None:
        return []
    if not isinstance(ids, list):
        raise RuntimeError("ArcGIS did not return an objectIds list.")
    return sorted(int(value) for value in ids)

def fetch_boundary_rings(timeout: int, batch_size: int) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    ids = query_ids(BOUNDARY_URL, "1=1", timeout)
    if not ids:
        raise RuntimeError("Houston city-limit boundary query returned no features.")
    geometries: list[dict[str, Any]] = []
    seen: set[int] = set()
    # The ArcGIS boundary service returns HTTP 404 for oversized GET query strings.
    # Keep boundary geometry batches below its observed URL-length threshold.
    boundary_batch_size = min(batch_size, 200)
    for start in range(0, len(ids), boundary_batch_size):
        batch = ids[start:start + boundary_batch_size]
        data = request_json(BOUNDARY_URL + "/query", {
            "objectIds": ",".join(map(str, batch)), "outFields": "*",
            "returnGeometry": "true", "outSR": str(SOURCE_CRS), "f": "json"
        }, timeout)
        for feature in data.get("features", []):
            attrs = feature.get("attributes") or {}
            oid = attrs.get("OBJECTID", attrs.get("OBJECTID_1", attrs.get("FID")))
            if oid is not None:
                seen.add(int(oid))
            geometry = feature.get("geometry") or {}
            if geometry.get("rings"):
                geometries.append({"rings": geometry["rings"], "spatialReference": {"wkid": SOURCE_CRS}})
    if seen and seen != set(ids):
        raise RuntimeError("Houston boundary acquisition did not return the complete object ID set.")
    if not geometries:
        raise RuntimeError("Houston boundary geometry contains no polygon features.")
    ring_count = sum(len(geometry["rings"]) for geometry in geometries)
    return geometries, {"object_ids": ids, "feature_count": len(ids), "polygon_count": len(geometries), "ring_count": ring_count}

def validate_geometry(geometry: Any) -> str:
    if geometry is None:
        return "missing"
    if not isinstance(geometry, dict) or geometry.get("type") not in ("Polygon", "MultiPolygon"):
        raise ValueError("Building footprint geometry must be Polygon, MultiPolygon or null.")
    found = 0
    def walk(value: Any) -> None:
        nonlocal found
        if not isinstance(value, list):
            return
        if len(value) >= 2 and isinstance(value[0], (int, float)) and isinstance(value[1], (int, float)):
            x, y = value[0], value[1]
            if not (-180 <= x <= 180 and -90 <= y <= 90):
                raise ValueError("Building coordinates are not WGS84 longitude/latitude.")
            found += 1
            return
        for item in value:
            walk(item)
    walk(geometry.get("coordinates"))
    if found < 4:
        raise ValueError("Building polygon has fewer than four coordinate positions.")
    return "present"

def canonical_digest(value: Any) -> str:
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()

def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temp.replace(path)

def acquire(output_dir: Path, batch_size: int = 500, timeout: int = 90, pause: float = 0.15) -> dict[str, Any]:
    before = layer_metadata(FOOTPRINT_URL, timeout)
    boundary_geometries, boundary_manifest = fetch_boundary_rings(timeout, batch_size)
    # Query each boundary polygon independently. Sending the entire 835-ring
    # city-limit geometry at once causes the county footprint service to time out.
    # Individual polygons keep each spatial request small; IDs are deduplicated.
    footprint_ids: set[int] = set()
    for index, polygon in enumerate(boundary_geometries, start=1):
        spatial = {
            "geometry": json.dumps(polygon, separators=(",", ":")),
            "geometryType": "esriGeometryPolygon",
            "inSR": str(SOURCE_CRS),
            "spatialRel": "esriSpatialRelIntersects",
        }
        footprint_ids.update(query_ids(FOOTPRINT_URL, "1=1", timeout, **spatial))
        if pause:
            time.sleep(pause)
        if index % 50 == 0:
            print(f"Queried {index}/{len(boundary_geometries)} Houston boundary polygons; unique footprint IDs: {len(footprint_ids)}")
    ids = sorted(footprint_ids)
    if not ids:
        raise RuntimeError("Houston city-limit polygons did not intersect any building footprints.")
    features: list[dict[str, Any]] = []
    seen: set[int] = set()
    for start in range(0, len(ids), batch_size):
        batch = ids[start:start + batch_size]
        data = request_json(FOOTPRINT_URL + "/query", {
            "objectIds": ",".join(map(str, batch)),
            "outFields": "*", "returnGeometry": "true",
            "outSR": str(OUTPUT_CRS), "f": "geojson"
        }, timeout)
        returned = data.get("features", [])
        returned_ids = []
        for feature in returned:
            props = feature.get("properties") or {}
            oid = props.get("OBJECTID", props.get("objectid"))
            if oid is None:
                raise RuntimeError("Building footprint is missing its source OBJECTID.")
            oid = int(oid)
            if oid in seen:
                raise RuntimeError("Duplicate building footprint OBJECTID: " + str(oid))
            seen.add(oid)
            returned_ids.append(oid)
            validate_geometry(feature.get("geometry"))
            features.append(feature)
        if set(returned_ids) != set(batch):
            missing = sorted(set(batch) - set(returned_ids))
            raise RuntimeError("Incomplete building footprint batch; missing IDs: " + repr(missing[:20]))
        if pause:
            time.sleep(pause)
    after = layer_metadata(FOOTPRINT_URL, timeout)
    if before.get("lastEditDate") != after.get("lastEditDate") or before.get("dataLastEditDate") != after.get("dataLastEditDate"):
        raise RuntimeError("Building footprint service metadata changed during acquisition; rerun for a consistent snapshot.")
    if seen != set(ids):
        raise RuntimeError("Acquired building footprint IDs do not match the complete spatial query ID set.")
    features.sort(key=lambda f: int((f.get("properties") or {}).get("OBJECTID", 0)))
    collection = {"type": "FeatureCollection", "features": features}
    digest = canonical_digest(collection)
    missing_geometry = sum(1 for feature in features if feature.get("geometry") is None)
    manifest = {
        "registry_id": "ao-houston-building-footprints",
        "registry_version": "1.0.0",
        "source_dataset": SOURCE_ID,
        "publisher": "Houston-Galveston Area Council / Harris County GIS",
        "source_url": FOOTPRINT_URL,
        "source_description": "2018 LiDAR-derived building footprint data; approximate and may contain misclassified features.",
        "city_scope": "features intersecting the City of Houston limits polygon; boundary-touching features may extend beyond the limit",
        "boundary_source_url": BOUNDARY_URL,
        "boundary_feature_count": boundary_manifest["feature_count"],
        "boundary_ring_count": boundary_manifest["ring_count"],
        "source_crs": "EPSG:2278",
        "output_crs": "EPSG:4326",
        "source_metadata_before": before,
        "source_metadata_after": after,
        "acquired_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "counts": {
            "source_object_ids": len(ids),
            "downloaded_features": len(features),
            "unique_object_ids": len(seen),
            "features_with_geometry": len(features) - missing_geometry,
            "features_missing_geometry": missing_geometry,
        },
        "geometry_sha256": digest,
        "identity_note": "OBJECTID is a source locator for this dataset snapshot, not a guaranteed permanent building identity.",
        "use_limitations": [
            "Approximate LiDAR-derived footprints; source warns that misclassified returns can create erroneous buildings.",
            "Not a survey, legal building outline, parcel boundary, or guarantee of current on-the-ground conditions.",
            "Does not supply verified entrances, access, ownership, occupancy, floors, rooms, or interior geometry."
        ]
    }
    atomic_json(output_dir / "buildings.geojson", collection)
    atomic_json(output_dir / "manifest.json", manifest)
    print(json.dumps(manifest["counts"] | {"geometry_sha256": digest}, indent=2))
    return manifest

def self_test() -> None:
    polygon = {"type": "Polygon", "coordinates": [[[-95.4, 29.7], [-95.3, 29.7], [-95.3, 29.8], [-95.4, 29.7]]]}
    assert validate_geometry(polygon) == "present"
    assert validate_geometry(None) == "missing"
    assert canonical_digest({"a": 1, "b": 2}) == canonical_digest({"b": 2, "a": 1})
    print("self-test passed: WGS84 polygon validation, null preservation, canonical digest")

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path("build/houston-building-footprints"))
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--timeout", type=int, default=90)
    parser.add_argument("--pause", type=float, default=0.15)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    acquire(args.output_dir, args.batch_size, args.timeout, args.pause)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
