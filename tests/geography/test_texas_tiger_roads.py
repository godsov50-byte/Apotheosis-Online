import unittest
from scripts.geography.acquire_texas_tiger_roads import county_archive_names

class TexasRoadInventoryTests(unittest.TestCase):
    def test_all_254_county_archives_required(self):
        html = "".join(f'<a href="tl_2025_48{i:03d}_roads.zip">x</a>' for i in range(1,255))
        self.assertEqual(len(county_archive_names(html)),254)
    def test_missing_county_fails_closed(self):
        with self.assertRaises(RuntimeError):
            county_archive_names('<a href="tl_2025_48001_roads.zip">x</a>')

if __name__ == "__main__":
    unittest.main()
