#!/usr/bin/env python3
"""Acquire the City of Houston COH_Limits layer as WGS84 GeoJSON.

This downloads source data only. It does not write to Supabase or the AO
geographic registry. Review the output and source terms before ingestion.
"""
from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

LAYER_URL = (
    "https://services.arcgis.com/su8ic9KbA7PYVxPS/ArcGIS/rest/services/"
    "COH_Limits/FeatureServer/0"
)
EXPECTED_WKID = 102740
PAGE_SIZE = 1000


def get_json(url: str, params: dict[str, str] | None = None) -> dict:
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "ApotheosisOnline-GeographyResearch/1.0"},
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        return json.load(response)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="data/geography/imports/houston-city-limits")
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    metadata = get_json(LAYER_URL, {"f": "pjson"})
    wkid = (
        metadata.get("extent", {}).get("spatialReference", {}).get("latestWkid")
        or metadata.get("extent", {}).get("spatialReference", {}).get("wkid")
    )
    if wkid != EXPECTED_WKID:
        raise SystemExit(f"Unexpected source WKID {wkid}; expected {EXPECTED_WKID}. Stop and review CRS.")

    fields = {field["name"] for field in metadata.get("fields", [])}
    required = {"OBJECTID", "SERVICE_TY"}
    if not required.issubset(fields):
        raise SystemExit(f"Missing expected fields: {sorted(required - fields)}")

    (out / "source-layer-metadata.json").write_text(
        json.dumps(metadata, indent=2) + "\n", encoding="utf-8"
    )

    features: list[dict] = []
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
        batch = page.get("features", [])
        features.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        offset += len(batch)
        time.sleep(0.15)

    if not features:
        raise SystemExit("The service returned zero features; no output GeoJSON written.")

    types = sorted({
        str(feature.get("properties", {}).get("SERVICE_TY", ""))
        for feature in features
    })
    unknown = sorted(set(types) - {"FULL", "LIMITED", "PENDING", "Full Service", "Limited Service", "Pending"})
    if unknown:
        raise SystemExit(f"Unrecognized SERVICE_TY values {unknown}; inspect source before classifying.")

    geojson = {
        "type": "FeatureCollection",
        "name": "COH_Limits",
        "source": {
            "url": LAYER_URL,
            "source_wkid": wkid,
            "output_crs": "EPSG:4326",
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "service_types_observed": types,
            "feature_count": len(features),
        },
        "features": features,
    }
    (out / "houston-city-limits.geojson").write_text(
        json.dumps(geojson, separators=(",", ":")) + "\n", encoding="utf-8"
    )
    (out / "acquisition-report.json").write_text(
        json.dumps(geojson["source"], indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(geojson["source"], indent=2))


if __name__ == "__main__":
    main()
