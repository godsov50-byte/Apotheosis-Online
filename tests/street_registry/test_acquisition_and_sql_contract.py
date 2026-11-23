import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module

ACQUIRE=load("houston_acquire",ROOT/"scripts"/"geography"/"acquire_houston_road_centerlines.py")
SQL=(ROOT/"geography"/"database"/"migrations"/"20261121000400_ao_houston_street_registry.sql").read_text()

class AcquisitionContractTests(unittest.TestCase):
    def test_valid_feature_and_null_geometry_are_preserved(self):
        ACQUIRE.validate_feature({"properties":{"OBJECTID":1,"GlobalID":"g1"},"geometry":None})
        ACQUIRE.validate_feature({"properties":{"OBJECTID":2,"GlobalID":"g2"},
          "geometry":{"type":"LineString","coordinates":[[-95,29],[-95.001,29]]}})
    def test_feature_order_is_canonical_by_source_object_id(self):
        features=[
          {"properties":{"OBJECTID":9,"GlobalID":"g9"},"geometry":None},
          {"properties":{"OBJECTID":2,"GlobalID":"g2"},"geometry":None}]
        ordered=ACQUIRE.canonical_feature_order(features)
        self.assertEqual([f["properties"]["OBJECTID"] for f in ordered],[2,9])
        self.assertEqual(ACQUIRE.canonical_feature_order(ordered),ordered)
    def test_bad_identity_or_coordinates_rejected(self):
        with self.assertRaises(ValueError):
            ACQUIRE.validate_feature({"properties":{"OBJECTID":1},"geometry":None})
        with self.assertRaises(ValueError):
            ACQUIRE.validate_feature({"properties":{"OBJECTID":2,"GlobalID":"g"},
              "geometry":{"type":"LineString","coordinates":[[500,500],[501,501]]}})
    def test_sql_uses_shared_source_features_and_append_only_revisions(self):
        self.assertIn("references ao_spatial.source_features",SQL)
        self.assertIn("street_segment_revisions_append_only",SQL)
        self.assertIn("street_name_observations_append_only",SQL)
        self.assertIn("street_name_groups_current",SQL)
        self.assertIn("force row level security",SQL.lower())
        self.assertIn("from public,anon,authenticated",SQL.replace(" ","").lower())
    def test_sql_does_not_grant_browser_roles(self):
        self.assertIn("to service_role",SQL)
        self.assertNotIn("grant select,insert on ao_spatial.street_segment_records to authenticated",SQL.lower())

if __name__=="__main__": unittest.main()
