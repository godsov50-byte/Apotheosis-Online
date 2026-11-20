#!/usr/bin/env python3
"""Acquire the Houston city-limit polygons as WGS84 GeoJSON.

Source: Harris County GIS CoH_Boundaries MapServer, layer 2
(COH_City_Limit). This is a source-data download only; it does not write to
Supabase or the AO geographic registry. Review provenance, terms, and geometry
before ingestion.
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

LAYER_URL = "https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer/2"
EXPECTED_WKID = 102740
EXPECTED_LATEST_WKID = 2278
PAGE_SIZE = 1000
ALLOWED_SERVICE_TYPES = {"FULL", "LIMITED", "PENDING", "FULL SERVICE", "LIMITED SERVICE"}


def get_json(url: str, params: dict[str, str] | None = None) -> dict:
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    request = urllib.request.Request(
        url, headers={"User-Agent": "ApotheosisOnline-GeographyResearch/1.0"}
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = json.load(response)
    if not isinstance(payload, dict):
        raise SystemExit(f"Expected a JSON object from {url}")
    if "error" in payload:
        raise SystemExit(f"ArcGIS returned an error for {url}: {payload['error']}")
    return payload


def validate_metadata(metadata: dict) -> tuple[int | None, int | None]:
    spatial_ref = metadata.get("extent", {}).get("spatialReference", {})
    wkid, latest_wkid = spatial_ref.get("wkid"), spatial_ref.get("latestWkid")
    identifiers = {wkid, latest_wkid}
    if EXPECTED_WKID not in identifiers and EXPECTED_LATEST_WKID not in identifiers:
        raise SystemExit(
            f"Unexpected CRS (wkid={wkid}, latestWkid={latest_wkid}); "
            f"expected {EXPECTED_WKID}/{EXPECTED_LATEST_WKID}."
        )
    fields = {field.get("name") for field in metadata.get("fields", [])}
    required = {"OBJECTID", "SERVICE_TY"}
    if not required.issubset(fields):
        raise SystemExit(f"Missing expected fields: {sorted(required - fields)}")
    formats = {item.strip().lower() for item in metadata.get("supportedQueryFormats", "").split(",")}
    if "geojson" not in formats:
        raise SystemExit(f"GeoJSON is not advertised by source: {sorted(formats)}")
    if metadata.get("advancedQueryCapabilities", {}).get("supportsPagination") is False:
        raise SystemExit("Source explicitly reports pagination unsupported; refusing a possibly truncated download.")
    return wkid, latest_wkid


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="data/geography/imports/houston-city-limits")
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    metadata = get_json(LAYER_URL, {"f": "pjson"})
    wkid, latest_wkid = validate_metadata(metadata)
    (out / "source-layer-metadata.json").write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="utf-8"
    )

    features: list[dict] = []
    seen_ids: set[int] = set()
    offset = 0
    while True:
        page = get_json(
            LAYER_URL + "/query",
            {
                "where": "1=1",
                "outFields": "*",
                "returnGeometry": "true",
                "outSR": "4326",
                "f": "geojson",
                "orderByFields": "OBJECTID ASC",
                "resultOffset": str(offset),
                "resultRecordCount": str(PAGE_SIZE),
            },
        )
        batch = page.get("features")
        if not isinstance(batch, list):
            raise SystemExit(f"No feature array returned at offset {offset}.")
        if page.get("exceededTransferLimit") is True:
            raise SystemExit(f"Transfer limit exceeded at offset {offset}; no output written.")
        if not batch:
            break
        for feature in batch:
            properties = feature.get("properties") or {}
            object_id = properties.get("OBJECTID")
            if object_id is None:
                raise SystemExit("A feature is missing OBJECTID.")
            object_id = int(object_id)
            if object_id in seen_ids:
                raise SystemExit(f"Duplicate OBJECTID {object_id}; pagination may be unstable.")
            if not feature.get("geometry"):
                raise SystemExit(f"Feature {object_id} has no geometry.")
            seen_ids.add(object_id)
        features.extend(batch)
        offset += len(batch)
        if len(batch) < PAGE_SIZE:
            break
        time.sleep(0.15)

    if not features:
        raise SystemExit("The service returned zero features; no GeoJSON written.")

    raw_types = sorted({
        str((feature.get("properties") or {}).get("SERVICE_TY", "")).strip()
        for feature in features
    })
    normalized_types = sorted({value.upper() for value in raw_types})
    unknown = sorted(set(normalized_types) - ALLOWED_SERVICE_TYPES)
    if unknown:
        raise SystemExit(f"Unknown SERVICE_TY values {unknown}; inspect before classifying.")

    source = {
        "url": LAYER_URL,
        "source_wkid": wkid,
        "source_latest_wkid": latest_wkid,
        "output_crs": "EPSG:4326",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "service_types_observed": raw_types,
        "service_types_normalized": normalized_types,
        "feature_count": len(features),
        "object_id_min": min(seen_ids),
        "object_id_max": max(seen_ids),
        "vintage": "not_declared_by_source_service",
    }
    geojson = {"type": "FeatureCollection", "name": "COH_City_Limit", "source": source, "features": features}
    (out / "houston-city-limits.geojson").write_text(
        json.dumps(geojson, separators=(",", ":")) + "\n", encoding="utf-8"
    )
    (out / "acquisition-report.json").write_text(
        json.dumps(source, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(source, indent=2))


if __name__ == "__main__":
    main()
