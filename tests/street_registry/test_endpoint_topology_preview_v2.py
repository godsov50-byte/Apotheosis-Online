import importlib.util, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location("endpoint_v2",ROOT/"scripts"/"geography"/"build_houston_endpoint_topology_preview_v2.py")
MOD=importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(MOD)
class EndpointTopologyV2Tests(unittest.TestCase):
 def setUp(self):
  self.data={"type":"AOGridInputFeatureCollection","coordinate_space":"houston-v2-local-mm-preview","features":[
   {"geometry":{"type":"LineString","coordinates":[[0,0],[1000,0]]},"properties":{"ao_source_identity":"a","ao_geometry_role":"centerline_candidate","ao_preview_only":True}},
   {"geometry":{"type":"LineString","coordinates":[[1000,500],[1000,2500]]},"properties":{"ao_source_identity":"b","ao_geometry_role":"centerline_candidate","ao_preview_only":True}},
   {"geometry":{"type":"LineString","coordinates":[[6000,0],[7000,0]]},"properties":{"ao_source_identity":"c","ao_geometry_role":"centerline_candidate","ao_preview_only":True}}]}
  self.manifest={"status":"preview_only_not_importable","profile_version":2}
 def test_distance_cluster_and_noncluster(self):
  out,report=MOD.build(self.data,self.manifest,1000)
  self.assertEqual(report["road_paths"],3)
  self.assertEqual(report["endpoint_node_candidates"],5)
  self.assertEqual(out["road_paths"][0]["end_node_candidate"],out["road_paths"][1]["start_node_candidate"])
  self.assertNotEqual(out["road_paths"][1]["end_node_candidate"],out["road_paths"][2]["start_node_candidate"])
  self.assertFalse(out["importable"])
 def test_zero_tolerance_only_exact_matches(self):
  out,_=MOD.build(self.data,self.manifest,0)
  self.assertNotEqual(out["road_paths"][0]["end_node_candidate"],out["road_paths"][1]["start_node_candidate"])
 def test_invalid_manifest_rejected(self):
  with self.assertRaises(ValueError): MOD.build(self.data,{"status":"wrong"},1000)
if __name__=="__main__": unittest.main()
