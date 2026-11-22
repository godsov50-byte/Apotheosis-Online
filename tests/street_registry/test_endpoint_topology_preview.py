import importlib.util, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location("endpoint_preview",ROOT/"scripts/geography/build_houston_endpoint_topology_preview.py")
MOD=importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(MOD)
class EndpointTopologyPreviewTests(unittest.TestCase):
 def setUp(self):
  self.data={"type":"AOGridInputFeatureCollection","coordinate_space":"houston-v2-local-mm-preview","features":[
   {"geometry":{"type":"LineString","coordinates":[[0,0],[1000,0],[2000,0]]},"properties":{"ao_source_identity":"r1","ao_geometry_role":"centerline_candidate","ao_preview_only":True}},
   {"geometry":{"type":"LineString","coordinates":[[1000,0],[1000,1000]]},"properties":{"ao_source_identity":"r2","ao_geometry_role":"centerline_candidate","ao_preview_only":True}}]}
  self.manifest={"status":"preview_only_not_importable","profile_version":2}
 def test_shared_endpoint_cell_creates_candidate_node(self):
  out,report=MOD.build(self.data,self.manifest)
  self.assertEqual(report["road_paths"],2)
  self.assertEqual(report["endpoint_node_candidates"],3)
  self.assertTrue(any(n["degree"]==2 for n in out["nodes"]))
  self.assertFalse(out["importable"])
 def test_wrong_provenance_rejected(self):
  d={**self.data,"coordinate_space":"unknown"}
  with self.assertRaises(ValueError): MOD.build(d,self.manifest)
 def test_snap_size_validation(self):
  with self.assertRaises(ValueError): MOD.build(self.data,self.manifest,0)
if __name__=="__main__": unittest.main()
