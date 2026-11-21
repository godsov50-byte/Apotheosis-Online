import importlib.util
import unittest
from pathlib import Path

SCRIPT=Path(__file__).resolve().parents[2]/"scripts"/"geography"/"build_houston_street_registry.py"
SPEC=importlib.util.spec_from_file_location("street_registry",SCRIPT)
MODULE=importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)

class StreetRegistryTests(unittest.TestCase):
    def test_self_test(self): MODULE.self_test()
    def test_identity_uses_global_id(self):
        self.assertNotEqual(MODULE.identity_key("guid-a"),MODULE.identity_key("guid-b"))
        self.assertEqual(MODULE.identity_key("guid-a"),MODULE.identity_key("guid-a"))
    def test_same_name_does_not_merge_segments(self):
        source={"type":"FeatureCollection","features":[
          {"properties":{"OBJECTID":1,"GlobalID":"a","fullname":"Oak Road","munileft":"HOUSTON","muniright":"HOUSTON"},
           "geometry":{"type":"LineString","coordinates":[[-95,29],[-95.001,29]]}},
          {"properties":{"OBJECTID":2,"GlobalID":"b","fullname":"Oak Road","munileft":"HOUSTON","muniright":"HOUSTON"},
           "geometry":{"type":"LineString","coordinates":[[-95.2,29],[-95.201,29]]}}]}
        registry,report=MODULE.compile_registry(source)
        segments=registry["street_segments"]
        self.assertEqual(len(segments),2)
        self.assertNotEqual(segments[0]["identity_key"],segments[1]["identity_key"])
        self.assertEqual(segments[0]["name_group_key"],segments[1]["name_group_key"])
        self.assertEqual(report["counts"]["source_segment_records"],2)
    def test_duplicate_global_id_rejected(self):
        feature={"properties":{"OBJECTID":1,"GlobalID":"same"},
          "geometry":{"type":"LineString","coordinates":[[-95,29],[-95.001,29]]}}
        with self.assertRaises(ValueError):
            MODULE.compile_registry({"type":"FeatureCollection","features":[feature,feature]})
    def test_nulls_are_not_fabricated(self):
        feature={"properties":{"OBJECTID":1,"GlobalID":"one","fullname":"Elm"},"geometry":None}
        registry,report=MODULE.compile_registry({"type":"FeatureCollection","features":[feature]})
        self.assertIsNone(registry["street_segments"][0]["properties"]["speed_raw"])
        self.assertEqual(report["counts"]["segments_missing_geometry"],1)

if __name__=="__main__": unittest.main()
