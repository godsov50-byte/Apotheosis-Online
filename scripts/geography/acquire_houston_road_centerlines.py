#!/usr/bin/env python3
"""Acquire a consistent, provenance-preserving Houston road-centerline snapshot.

The script writes GeoJSON in WGS84 (EPSG:4326) plus a manifest. It does not
edit the source service or write to AO's live world state/database.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

LAYER_URL = (
    "https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/"
    "COH_RoadCenterline/FeatureServer/0"
)
WHERE = "munileft='HOUSTON' OR muniright='HOUSTON'"
OUT_FIELDS = ",".join([
    "OBJECTID", "GlobalID", "centerlineid", "fullname", "roadclass",
    "onewaydir", "lanes", "speed", "funcclass", "source",
    "munileft", "muniright", "fromleft", "fromright", "toleft", "toright",
    "actfromleft", "actfromright", "acttoleft", "acttoright",
    "parityleft", "parityright", "zipleft", "zipright",
    "last_edited_date", "Shape__Length",
])


def request_json(
    url: str,
    timeout: int,
    retries: int = 4,
    data: bytes | None = None,
) -> dict[str, Any]:
    # ArcGIS accepts query parameters in either a URL or an x-www-form-urlencoded
    # POST body. Geometry batches use POST so hundreds of OBJECTIDs do not create
    # an oversized URL that IIS rejects with a misleading 404. This method is
    # intentionally explicit so CI can verify the diagnostic request path.
    method = "POST" if data is not None else "GET"
    print(f"ArcGIS request ({method}): {url}", file=sys.stderr, flush=True)
    headers = {
        "User-Agent": "ApotheosisOnline-Geography/1.0 (road data acquisition)",
    }
    if data is not None:
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
            if "error" in payload:
                raise RuntimeError(f"ArcGIS error: {payload['error']}")
            return payload
        except urllib.error.HTTPError as exc:
            # A 4xx response is deterministic; retrying it only wastes time and
            # hides the actual ArcGIS endpoint/query that failed.
            try:
                detail = exc.read(1200).decode("utf-8", errors="replace")
            except Exception:
                detail = ""
            raise RuntimeError(
                f"HTTP {exc.code} {exc.reason} for {method} {url}."
                + (f" Response: {detail[:1200]}" if detail else "")
            ) from exc
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt + 1 == retries:
                raise RuntimeError(
                    f"Request failed after {retries} attempts for {method} {url}: {exc}"
                ) from exc
            time.sleep(2 ** attempt)
    raise AssertionError("unreachable")


def get_json(url: str, timeout: int, retries: int = 4) -> dict[str, Any]:
    return request_json(url, timeout, retries)


def post_json(
    url: str,
    params: dict[str, Any],
    timeout: int,
    retries: int = 4,
) -> dict[str, Any]:
    body = urllib.parse.urlencode(params).encode("utf-8")
    return request_json(url, timeout, retries, data=body)


def request_url(params: dict[str, Any]) -> str:
    return LAYER_URL + "/query?" + urllib.parse.urlencode(params)


def source_edit_stamp(timeout: int) -> int | None:
    metadata = get_json(LAYER_URL + "?f=pjson", timeout)
    return metadata.get("editingInfo", {}).get("dataLastEditDate")


def validate_feature(feature: dict[str, Any]) -> None:
    props = feature.get("properties") or {}
    geom = feature.get("geometry")
    if props.get("OBJECTID") is None or not props.get("GlobalID"):
        raise ValueError("Road feature is missing OBJECTID or GlobalID.")
    if not geom or geom.get("type") not in ("LineString", "MultiLineString"):
        raise ValueError(f"Road {props.get('OBJECTID')} has unsupported/empty geometry.")
    lines = [geom["coordinates"]] if geom["type"] == "LineString" else geom["coordinates"]
    if not lines:
        raise ValueError(f"Road {props.get('OBJECTID')} has no coordinate paths.")
    for line in lines:
        if len(line) < 2:
            raise ValueError(f"Road {props.get('OBJECTID')} has a path shorter than two vertices.")
        for point in line:
            if len(point) < 2:
                raise ValueError("Malformed coordinate.")
            lon, lat = point[0], point[1]
            if not (-180 <= lon <= 180 and -90 <= lat <= 90):
                raise ValueError(
                    f"Road {props.get('OBJECTID')} is not WGS84 lon/lat; "
                    "check outSR=4326."
                )


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=path.name + ".", dir=str(path.parent))
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp_name, path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output-dir", type=Path,
        default=Path("build/houston-road-network"),
        help="Output folder; default is build/houston-road-network (not committed automatically).",
    )
    parser.add_argument("--batch-size", type=int, default=500)
    parser.add_argument("--timeout", type=int, default=90)
    parser.add_argument("--pause", type=float, default=0.15)
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 1000:
        parser.error("--batch-size must be between 1 and 1000")

    acquired_at = dt.datetime.now(dt.timezone.utc).isoformat()
    start_edit_stamp = source_edit_stamp(args.timeout)

    ids_payload = get_json(request_url({
        "where": WHERE,
        "returnIdsOnly": "true",
        "returnGeometry": "false",
        "f": "json",
    }), args.timeout)
    object_ids = sorted(set(ids_payload.get("objectIds") or []))
    if not object_ids:
        raise RuntimeError("The source returned no road IDs for the Houston filter.")

    # Independent count query catches incomplete ID responses.
    count_payload = get_json(request_url({
        "where": WHERE,
        "returnCountOnly": "true",
        "f": "json",
    }), args.timeout)
    expected_count = count_payload.get("count")
    if expected_count != len(object_ids):
        raise RuntimeError(
            f"ID/count mismatch: count={expected_count}, unique IDs={len(object_ids)}."
        )

    features: list[dict[str, Any]] = []
    seen_ids: set[int] = set()
    for offset in range(0, len(object_ids), args.batch_size):
        batch = object_ids[offset:offset + args.batch_size]
        payload = post_json(LAYER_URL + "/query", {
            "objectIds": ",".join(map(str, batch)),
            "outFields": OUT_FIELDS,
            "returnGeometry": "true",
            "outSR": "4326",
            "f": "geojson",
        }, args.timeout)
        page = payload.get("features")
        if not isinstance(page, list):
            raise RuntimeError(f"Batch {offset} returned no GeoJSON feature array.")
        for feature in page:
            validate_feature(feature)
            oid = int(feature["properties"]["OBJECTID"])
            if oid in seen_ids:
                raise RuntimeError(f"Duplicate source OBJECTID encountered: {oid}")
            seen_ids.add(oid)
            features.append(feature)
        if len(page) != len(batch):
            raise RuntimeError(
                f"Batch {offset} incomplete: requested {len(batch)}, received {len(page)}."
            )
        print(f"Fetched {len(features):,}/{len(object_ids):,} road segments", file=sys.stderr)
        if args.pause:
            time.sleep(args.pause)

    end_edit_stamp = source_edit_stamp(args.timeout)
    if start_edit_stamp != end_edit_stamp:
        raise RuntimeError(
            "The source changed during acquisition; refusing to publish a mixed-time snapshot."
        )
    if len(features) != expected_count or seen_ids != set(object_ids):
        raise RuntimeError("Final feature set does not match the source ID snapshot.")

    collection = {
        "type": "FeatureCollection",
        "name": "ao_houston_road_centerlines",
        "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
        "features": features,
    }
    geojson_bytes = (
        json.dumps(collection, ensure_ascii=False, separators=(",", ":")) + "\n"
    ).encode("utf-8")
    digest = hashlib.sha256(geojson_bytes).hexdigest()
    manifest = {
        "dataset_id": "ao-earth-houston-road-centerlines",
        "dataset_version": "source-snapshot",
        "status": "acquired_local_snapshot",
        "source": {
            "provider": "City of Houston GIS / COHGIS",
            "service": "COH_RoadCenterline",
            "layer_id": 0,
            "url": LAYER_URL,
            "query_filter": WHERE,
            "source_object_id": "OBJECTID",
            "source_global_id": "GlobalID",
            "source_centerline_id": "centerlineid",
            "source_crs": "EPSG:2278",
            "source_units": "US survey feet",
            "output_crs": "EPSG:4326",
            "output_coordinate_order": "longitude, latitude",
            "source_data_last_edit_epoch_ms": start_edit_stamp,
            "source_data_last_edit_utc": (
                dt.datetime.fromtimestamp(start_edit_stamp / 1000, dt.timezone.utc).isoformat()
                if start_edit_stamp else None
            ),
        },
        "scope": {
            "jurisdiction": "Houston on either side of each road segment",
            "includes_city_boundary_connectors": True,
            "excludes_segments_with_neither_side_identified_as_houston": True,
        },
        "acquired_at_utc": acquired_at,
        "feature_count": len(features),
        "unique_object_id_count": len(seen_ids),
        "geometry_type": "LineString or MultiLineString",
        "geometry_sha256": digest,
        "limitations": [
            "Source positional accuracy/completeness is not warranted for survey or engineering use.",
            "A centerline is not a lane-level driving surface or a sidewalk/pedestrian graph.",
            "Source one-way, speed, and lane attributes are preserved as supplied and require domain validation before operational routing.",
            "Intersection topology, bridge/tunnel grade separation, turn restrictions, and mode access need independent validation.",
        ],
    }
    atomic_write(args.output_dir / "roads.geojson", geojson_bytes)
    atomic_write(
        args.output_dir / "manifest.json",
        (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
    )
    print(json.dumps({
        "status": "success",
        "feature_count": len(features),
        "sha256": digest,
        "output_dir": str(args.output_dir),
    }, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
