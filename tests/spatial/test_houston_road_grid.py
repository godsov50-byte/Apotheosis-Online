"""Tests for the Houston road-centerline local-grid preview builder."""
from __future__ import annotations

import copy
import unittest

from scripts.geography.build_houston_road_grid import (
    BuildError,
    DEFAULT_PROFILE,
    build,
    load_json,
)


def fixture():
    return {
        "type": "FeatureCollection",
        "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "OBJECTID": 10, "GlobalID": "road-b",
                    "fullname": "Second Road", "roadclass": "LOCAL",
                    "onewaydir": None, "lanes": "2",
                },
                "geometry": {"type": "LineString", "coordinates": [
                    [-95.369361, 29.760193], [-95.369350, 29.760193]
                ]},
            },
            {
                "type": "Feature",
                "properties": {"OBJECTID": 11, "GlobalID": "road-a", "fullname": "First Road"},
                "geometry": {"type": "MultiLineString", "coordinates": [
                    [[-95.369361, 29.760193], [-95.369361, 29.760200]],
                    [[-95.369361, 29.760193], [-95.369355, 29.760193]],
                ]},
            },
            {
                "type": "Feature",
                "properties": {"OBJECTID": 12, "GlobalID": "road-null"},
                "geometry": None,
            },
        ],
    }


class HoustonRoadGridBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.profile = load_json(DEFAULT_PROFILE)

    def test_preview_converts_anchor_to_zero_and_preserves_source(self):
        output, manifest = build(fixture(), {}, self.profile, True)
        first = output["features"][0]
        self.assertEqual(first["properties"]["ao_source_identity"], "road-a")
        self.assertEqual(first["properties"]["lanes"], None)
        self.assertEqual(first["properties"]["ao_geometry_role"], "centerline_candidate")
        self.assertEqual(first["geometry"]["coordinates"][0][0], [0, 0])
        self.assertEqual(manifest["features_missing_geometry"], 1)
        self.assertEqual(manifest["status"], "preview_only_not_importable")
        self.assertEqual(manifest["projection"]["accuracy_metres"], 4.0)

    def test_preview_output_is_deterministic(self):
        a = build(fixture(), {}, self.profile, True)
        b = build(fixture(), {}, self.profile, True)
        self.assertEqual(a, b)

    def test_unapproved_profile_cannot_make_importable_output(self):
        with self.assertRaisesRegex(BuildError, "only emits non-authoritative preview"):
            build(fixture(), {}, self.profile, False)

    def test_duplicate_source_identity_is_rejected(self):
        data = fixture()
        duplicate = copy.deepcopy(data["features"][0])
        duplicate["properties"]["OBJECTID"] = 99
        data["features"].append(duplicate)
        with self.assertRaisesRegex(BuildError, "duplicate source GlobalID"):
            build(data, {}, self.profile, True)

    def test_3d_coordinates_are_rejected_while_vertical_reference_is_unknown(self):
        data = fixture()
        data["features"][0]["geometry"]["coordinates"][0].append(12.0)
        with self.assertRaisesRegex(BuildError, "must be 2D"):
            build(data, {}, self.profile, True)

    def test_non_wgs84_crs_is_rejected(self):
        data = fixture()
        data["crs"]["properties"]["name"] = "EPSG:2278"
        with self.assertRaisesRegex(BuildError, "EPSG:4326"):
            build(data, {}, self.profile, True)

    def test_missing_source_identity_is_rejected(self):
        data = fixture()
        del data["features"][0]["properties"]["GlobalID"]
        with self.assertRaisesRegex(BuildError, "OBJECTID and GlobalID"):
            build(data, {}, self.profile, True)


if __name__ == "__main__":
    unittest.main()
