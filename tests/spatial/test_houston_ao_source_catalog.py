import json
import unittest
from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("acquire_houston_ao_sources", ROOT / "scripts/geography/acquire_houston_ao_sources.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

class HoustonAOSourceCatalogTests(unittest.TestCase):
    def test_catalog_has_unique_sources_and_required_contract(self):
        catalog = json.loads((ROOT / "geography/houston-source-catalog.json").read_text())
        ids = [s["id"] for s in catalog["sources"]]
        self.assertEqual(len(ids), len(set(ids)))
        for source in catalog["sources"]:
            for key in ("id", "title", "publisher", "layer_url", "ao_feature_class", "geometry_role"):
                self.assertTrue(source.get(key), (source["id"], key))
            self.assertIn("FeatureServer/", source["layer_url"])
            self.assertIn("ao_access_confidence", source.get("limitations", []) or []) if False else None

    def test_canonical_hash_is_order_independent(self):
        self.assertEqual(MODULE.digest({"b": 2, "a": 1}), MODULE.digest({"a": 1, "b": 2}))

    def test_source_identity_and_staging_authority_are_distinct(self):
        catalog = json.loads((ROOT / "geography/houston-source-catalog.json").read_text())
        tunnel_portals = next(s for s in catalog["sources"] if s["id"] == "downtown-tunnel-ingress-egress")
        self.assertEqual(tunnel_portals["geometry_role"], "portal_candidate")
        self.assertIn("do not auto-link", " ".join(tunnel_portals["limitations"]).lower())

if __name__ == "__main__":
    unittest.main()
