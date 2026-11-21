#!/usr/bin/env python3
"""Acquire the 2024 Census TIGER/Line state boundary archive.

The archive contains all U.S. state/equivalent polygons. Keep the source
archive and extracted files as an immutable input; select Texas by GEOID='48'
in the downstream GIS normalization step. This script does not write to AO
or Supabase.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

SOURCE_URL = "https://www2.census.gov/geo/tiger/TIGER2024/STATE/tl_2024_us_state.zip"
EXPECTED_FILES = {".shp", ".shx", ".dbf", ".prj"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="data/geography/imports/texas-state-boundary-2024")
    args = parser.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    archive = out / "tl_2024_us_state.zip"
    request = urllib.request.Request(
        SOURCE_URL, headers={"User-Agent": "ApotheosisOnline-GeographyResearch/1.0"}
    )
    digest = hashlib.sha256()
    try:
        with urllib.request.urlopen(request, timeout=120) as response, archive.open("wb") as target:
            while chunk := response.read(1024 * 1024):
                target.write(chunk)
                digest.update(chunk)
    except Exception:
        archive.unlink(missing_ok=True)
        raise

    with zipfile.ZipFile(archive) as zipped:
        members = zipped.namelist()
        extensions = {Path(name).suffix.lower() for name in members}
        missing = EXPECTED_FILES - extensions
        if missing:
            archive.unlink(missing_ok=True)
            raise SystemExit(f"Archive is missing required shapefile components: {sorted(missing)}")
        for member in members:
            destination = (out / "extracted" / member).resolve()
            root = (out / "extracted").resolve()
            if root not in destination.parents and destination != root:
                raise SystemExit(f"Unsafe archive member path: {member}")
        zipped.extractall(out / "extracted")

    report = {
        "source_url": SOURCE_URL,
        "dataset": "2024 TIGER/Line state and equivalent entity polygons",
        "vintage": "2024",
        "boundary_reference_date": "2024-01-01",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "archive": archive.name,
        "archive_sha256": digest.hexdigest(),
        "archive_bytes": archive.stat().st_size,
        "extracted_components": sorted(extensions),
        "texas_selection": "Select GEOID='48' during downstream GIS normalization; do not treat the full national archive as Texas-only.",
    }
    (out / "acquisition-report.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
