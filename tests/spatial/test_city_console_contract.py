"""Static contract checks for the AO city experience console prototype."""
from pathlib import Path
import unittest

PAGE = Path(__file__).parents[2] / "geography" / "ao-city-console.html"
DOC = Path(__file__).parents[2] / "docs" / "geography" / "ao-city-console.md"\nSCRIPT = Path(__file__).parents[2] / "geography" / "ao-city-console.js"


class CityConsoleContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = PAGE.read_text(encoding="utf-8")
        cls.doc = DOC.read_text(encoding="utf-8")\n        cls.js = SCRIPT.read_text(encoding="utf-8")

    def test_primary_interfaces_are_present(self):
        for label in ("Text", "GPS", "Tactical / ASCII", "Navigation", "Narration", "Admin"):
            with self.subTest(label=label):
                self.assertIn(label, self.html)

    def test_map_and_local_tactical_grid_are_present(self):
        self.assertIn('id="map"', self.html)
        self.assertIn('id="gridview"', self.html)
        self.assertIn("1 m preview cells", self.html)

    def test_admin_can_author_buildings_entrances_and_rooms(self):
        for marker in ("Place building on map", "Add entrance to selected", "Add room to selected building"):
            with self.subTest(marker=marker):
                self.assertIn(marker, self.html)
        self.assertIn("doorState", self.html)
        self.assertIn("building_entrance", self.html)

    def test_text_commands_and_movement_are_present(self):
        for command in ("look around", "show grid", "where am i", "enter selected", "move north"):
            with self.subTest(command=command):
                self.assertIn(command, self.html.lower())

    def test_demo_state_is_browser_local_and_not_claimed_as_canonical(self):
        self.assertIn("localStorage", self.html)
        self.assertIn("not connected", self.html.lower())
        self.assertIn("not AO-authoritative geometry", self.html)
        self.assertIn("not committed to AO", self.html)

    def test_docs_disclose_missing_production_integrations(self):
        for phrase in ("Kernel", "WorldHeart", "Supabase", "direct-line", "origin unset"):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, self.doc)


if __name__ == "__main__":
    unittest.main()
