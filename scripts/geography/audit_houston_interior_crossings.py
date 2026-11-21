#!/usr/bin/env python3
"""Find interior road-line crossing candidates for manual topology review.

This is a diagnostic tool only. It never changes the road graph or assumes a
geometric crossing is traversable. Requires Shapely 2.x. WGS84 endpoint
distances use a local approximation and are not survey-grade measurements.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from shapely.geometry import Point, shape
from shapely.strtree import STRtree


def meters_per_degree(latitude: float) -> tuple[float, float]:
    return 111320.0 * math.cos(math.radians(latitude)), 110574.0


def endpoint_distance_m(line, point: Point) -> float:
    coords = line.coords
    lon_scale, lat_scale = meters_per_degree(point.y)

    def distance(coord):
        return math.hypot((coord[0] - point.x) * lon_scale,
                         (coord[1] - point.y) * lat_scale)

    return min(distance(coords[0]), distance(coords[-1]))


def intersection_points(geometry):
    if geometry.is_empty:
        return []
    if geometry.geom_type == "Point":
        return [geometry]
    if geometry.geom_type == "MultiPoint":
        return list(geometry.geoms)
    if geometry.geom_type == "GeometryCollection":
        return [point for part in geometry.geoms for point in intersection_points(part)]
    # Lines/overlaps are reported separately only as non-point geometry stats.
    return []


def audit(collection, interior_threshold_m: float = 2.0):
    paths, metadata = [], []
    for feature in collection.get("features", []):
        geometry = feature.get("geometry")
        if geometry is None:
            continue
        parsed = shape(geometry)
        parts = list(parsed.geoms) if parsed.geom_type == "MultiLineString" else [parsed]
        properties = feature.get("properties") or {}
        for path_index, line in enumerate(parts):
            if line.geom_type != "LineString" or len(line.coords) < 2:
                continue
            paths.append(line)
            metadata.append({
                "source_objectid": properties.get("OBJECTID"),
                "source_globalid": properties.get("GlobalID"),
                "centerlineid": properties.get("centerlineid"),
                "name": properties.get("fullname"),
                "road_class": properties.get("roadclass"),
                "oneway_raw": properties.get("onewaydir"),
                "path_index": path_index,
            })

    if not paths:
        return []

    index = STRtree(paths)
    candidates = []
    seen = set()
    for i, line_a in enumerate(paths):
        for j_value in index.query(line_a, predicate="intersects"):
            j = int(j_value)
            if j <= i:
                continue
            if metadata[i]["source_objectid"] == metadata[j]["source_objectid"]:
                continue
            crossing = line_a.intersection(paths[j])
            for point in intersection_points(crossing):
                distance_a = endpoint_distance_m(line_a, point)
                distance_b = endpoint_distance_m(paths[j], point)
                if min(distance_a, distance_b) < interior_threshold_m:
                    continue
                key = (i, j, round(point.x, 7), round(point.y, 7))
                if key in seen:
                    continue
                seen.add(key)
                candidates.append({
                    "point_wgs84": [round(point.x, 7), round(point.y, 7)],
                    "interior_distance_a_m": round(distance_a, 2),
                    "interior_distance_b_m": round(distance_b, 2),
                    "road_a": metadata[i],
                    "road_b": metadata[j],
                    "review_status": "unreviewed_candidate",
                    "connection_decision": "not_assumed",
                    "review_note": (
                        "Geometric crossing only; validate at-grade vs bridge/tunnel/rail "
                        "and source node/link evidence."
                    ),
                })

    candidates.sort(key=lambda item: (
        item["point_wgs84"][1], item["point_wgs84"][0],
        str(item["road_a"]["source_objectid"]),
        str(item["road_b"]["source_objectid"]),
    ))
    for number, item in enumerate(candidates, 1):
        item["candidate_id"] = f"ic-{number:07d}"
    return candidates


def self_test():
    sample = {"features": [
        {"properties": {"OBJECTID": 1, "GlobalID": "a", "fullname": "N-S"},
         "geometry": {"type": "LineString", "coordinates": [[0.001, 0], [0.001, 0.002]]}},
        {"properties": {"OBJECTID": 2, "GlobalID": "b", "fullname": "E-W"},
         "geometry": {"type": "LineString", "coordinates": [[0, 0.001], [0.002, 0.001]]}},
        {"properties": {"OBJECTID": 3, "GlobalID": "c", "fullname": "T"},
         "geometry": {"type": "LineString", "coordinates": [[0.001, 0.002], [0.001, 0.003]]}},
    ]}
    found = audit(sample, 2.0)
    assert len(found) == 1, found
    assert found[0]["review_status"] == "unreviewed_candidate"
    assert found[0]["connection_decision"] == "not_assumed"
    print("self-test passed: interior crossing flagged; endpoint contacts excluded")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--interior-threshold-m", type=float, default=2.0)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if not args.input or not args.output:
        parser.error("--input and --output are required")
    data = json.loads(args.input.read_text(encoding="utf-8"))
    candidates = audit(data, args.interior_threshold_m)
    report = {
        "dataset": "ao-earth-houston-road-centerlines",
        "status": "geometric_candidates_not_topology_truth",
        "candidate_count": len(candidates),
        "interior_threshold_m": args.interior_threshold_m,
        "decision_policy": "no crossing is automatically connected; candidates require human/source validation",
        "candidates": candidates,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "candidates"}, indent=2))


if __name__ == "__main__":
    main()
