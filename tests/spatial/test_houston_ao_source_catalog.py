import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import importlib.util

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/geography/acquire_houston_ao_sources.py"
SPEC = importlib.util.spec_from_file_location("acquire_houston_ao_sources", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class HoustonAOSourceCatalogTests(unittest.TestCase):
    def setUp(self):
        self.catalog = json.loads((ROOT / "geography/houston-source-catalog.json").read_text())

    def test_catalog_has_unique_sources_and_required_contract(self):
        ids = [source["id"] for source in self.catalog["sources"]]
        self.assertGreaterEqual(len(ids), 30)
        self.assertEqual(len(ids), len(set(ids)))
        for source in self.catalog["sources"]:
            for key in ("id", "title", "publisher", "layer_url", "layer_id", "ao_feature_class", "geometry_role"):
                self.assertTrue(source.get(key) is not None, (source["id"], key))
            self.assertTrue(
                "/FeatureServer/" in source["layer_url"] or "/MapServer/" in source["layer_url"],
                source["layer_url"],
            )

    def test_core_source_groups_are_registered(self):
        ids = {source["id"] for source in self.catalog["sources"]}
        expected = {
            "houston-city-limits", "houston-city-cadastral-parcels",
            "houston-sidewalks-hpw", "houston-site-addresses",
            "houston-hpb-trails-existing", "houston-hpb-trails-proposed",
            "hgac-hydrography-polygons", "hgac-major-rivers",
            "houston-bikeways", "metro-bus-stops", "metro-bus-routes",
            "metro-rail-lines", "houston-fire-districts",
        }
        self.assertTrue(expected.issubset(ids), sorted(expected - ids))

    def test_parcel_fields_exclude_owner_and_mailing_contact_data(self):
        parcel = next(s for s in self.catalog["sources"] if s["id"] == "houston-city-cadastral-parcels")
        fields = {field.upper() for field in parcel["out_fields"]}
        self.assertIn("TAX_ID", fields)
        self.assertIn("SITE_ADDR_1", fields)
        self.assertNotIn("OWNER_MAILTO", fields)
        self.assertNotIn("MAIL_ADDR_1", fields)
        self.assertNotIn("OWNER_LIST", fields)

    def test_trail_planning_statuses_are_separate(self):
        trails = [s for s in self.catalog["sources"] if s["id"].startswith("houston-hpb-trails-")]
        self.assertEqual(len(trails), 5)
        roles = {s["geometry_role"] for s in trails}
        self.assertEqual(len(roles), 5)
        for source in trails:
            self.assertTrue(any("No automatic walk-routing approval" in note for note in source["limitations"]))

    def test_canonical_hash_is_order_independent(self):
        self.assertEqual(MODULE.digest({"b": 2, "a": 1}), MODULE.digest({"a": 1, "b": 2}))

    def test_self_test_runs_without_bbox(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--self-test"],
            cwd=ROOT, capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("self-test passed", result.stdout)

    def test_real_acquisition_still_requires_bbox(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--source", "downtown-tunnel-paths"],
            cwd=ROOT, capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("--bbox is required for acquisition", result.stderr)

    def test_acquire_layer_preserves_provenance_and_geometry_extent(self):
        layer_url = "https://example.invalid/FeatureServer/0"
        metadata = {
            "objectIdField": "OBJECTID",
            "fields": [{"name": "OBJECTID", "type": "esriFieldTypeOID"}],
            "extent": {"spatialReference": {"wkid": 2278}},
            "lastEditDate": 100,
            "dataLastEditDate": 200,
            "serviceItemId": "service-item",
        }
        source = {
            "id": "fixture-layer", "title": "Fixture", "publisher": "Test Publisher",
            "layer_url": layer_url, "layer_id": 0, "ao_feature_class": "test",
            "geometry_role": "test_candidate", "out_fields": ["GlobalID", "name"],
            "item_id": "catalog-item", "item_url": "https://example.invalid/item",
            "source_license_info": "Test licence", "source_authoritative": False,
            "source_access_information": "Test attribution", "source_modified_at": "2026-01-01",
            "limitations": ["test only"],
        }

        def fake_get_json(url, params, timeout):
            if url == layer_url:
                return metadata
            if url == layer_url + "/query" and params.get("returnIdsOnly") == "true":
                return {"objectIds": [7, 8]}
            if url == layer_url + "/query":
                self.assertEqual(params["outFields"], "OBJECTID,GlobalID,name")
                return {
                    "features": [
                        {"type": "Feature", "properties": {"OBJECTID": 7, "GLOBALID": "gid-7", "name": "A"},
                         "geometry": {"type": "Point", "coordinates": [-95.4, 29.7]}},
                        {"type": "Feature", "properties": {"OBJECTID": 8, "GlobalID": "gid-8", "name": "B"},
                         "geometry": {"type": "Point", "coordinates": [-95.3, 29.8]}},
                    ]
                }
            raise AssertionError((url, params))

        with tempfile.TemporaryDirectory() as directory:
            with patch.object(MODULE, "get_json", side_effect=fake_get_json):
                manifest = MODULE.acquire_layer(source, Path(directory), [-95.5, 29.6, -95.2, 29.9], 50, 10, 0)
            output = json.loads((Path(directory) / "fixture-layer" / "features.geojson").read_text())
            self.assertEqual(manifest["source_service_item_id"], "catalog-item")
            self.assertEqual(manifest["source_item_url"], source["item_url"])
            self.assertEqual(manifest["source_license_info"], "Test licence")
            self.assertEqual(manifest["source_access_information"], "Test attribution")
            self.assertEqual(manifest["downloaded_feature_count"], 2)
            self.assertTrue(manifest["pagination_complete"])
            self.assertEqual(manifest["downloaded_geometry_extent_wgs84"], [-95.4, 29.7, -95.3, 29.8])
            self.assertEqual(manifest["source_fields_requested"], ["OBJECTID", "GlobalID", "name"])
            self.assertEqual(output["features"][0]["id"], "ao:source:fixture-layer:gid-7")
            self.assertFalse(output["features"][0]["properties"]["ao_kernel_approved"])

    def test_duplicate_global_identity_is_rejected(self):
        layer_url = "https://example.invalid/FeatureServer/0"
        metadata = {
            "objectIdField": "OBJECTID", "fields": [{"name": "OBJECTID", "type": "esriFieldTypeOID"}],
            "lastEditDate": 1, "dataLastEditDate": 1,
        }
        source = {
            "id": "fixture-layer", "title": "Fixture", "publisher": "Test",
            "layer_url": layer_url, "layer_id": 0, "ao_feature_class": "test",
            "geometry_role": "test_candidate",
        }
        def fake_get_json(url, params, timeout):
            if url == layer_url:
                return metadata
            if params.get("returnIdsOnly") == "true":
                return {"objectIds": [1, 2]}
            return {"features": [
                {"type": "Feature", "properties": {"OBJECTID": 1, "GlobalID": "duplicate"},
                 "geometry": {"type": "Point", "coordinates": [-95.4, 29.7]}},
                {"type": "Feature", "properties": {"OBJECTID": 2, "GlobalID": "duplicate"},
                 "geometry": {"type": "Point", "coordinates": [-95.3, 29.8]}},
            ]}
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(MODULE, "get_json", side_effect=fake_get_json):
                with self.assertRaisesRegex(MODULE.AcquireError, "duplicate stable source identity"):
                    MODULE.acquire_layer(source, Path(directory), None, 50, 10, 0)


if __name__ == "__main__":
    unittest.main()
