import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HTML = ROOT / "geography" / "ao-houston-buildings-roads-world-builder.html"


class HoustonMovementPreviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = HTML.read_text(encoding="utf-8")
        start = cls.html.rfind('<script type="module">')
        if start < 0:
            raise AssertionError("Houston builder must expose its movement integration as an ES module script")
        start = cls.html.index(">", start) + 1
        end = cls.html.find("</script>", start)
        if end < 0:
            raise AssertionError("Houston builder movement module script is not closed")
        cls.script = cls.html[start:end]

    def test_module_script_passes_node_syntax_check(self):
        with tempfile.NamedTemporaryFile("w", suffix=".mjs", encoding="utf-8") as handle:
            handle.write(self.script)
            handle.flush()
            result = subprocess.run(
                ["node", "--check", handle.name],
                capture_output=True,
                text=True,
                check=False,
            )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_preview_requires_explicit_admin_confirmation(self):
        self.assertIn('id="previewWalkRoute"', self.html)
        self.assertIn('id="confirmWalkRoute"', self.html)
        self.assertIn("$('confirmWalkRoute').disabled=false", self.script)
        self.assertIn("function confirmAndWalk()", self.script)
        self.assertIn("routingApproved:true,status:'accepted_for_staging'", self.script)

    def test_preview_requires_selected_usable_entrance_and_confirmed_connector(self):
        self.assertIn("en.connectorState!=='Confirmed by admin'", self.script)
        self.assertIn("en.access==='Blocked / unusable'", self.script)
        self.assertIn("!en.roadPoint", self.script)

    def test_movement_uses_kernel_movement_module_and_elapsed_frame_time(self):
        self.assertIn('../spatial/ao-spatial-movement.mjs', self.script)
        self.assertIn("resolveMovementStep(", self.script)
        self.assertIn("(now-lastFrameAt)/1000", self.script)
        self.assertIn("No AO world state is being changed", self.script)

    def test_selection_changes_clear_stale_route_preview(self):
        self.assertIn("function selectBuilding(bid){if(insideBuilding&&bid!==insideBuilding)", self.script)
        self.assertIn("clearMovementPreview();", self.script)
        self.assertIn("function clearMovementPreview", self.script)

    def test_exterior_interior_portal_and_local_persistence_are_wired(self):
        for value in ("ao-building-transitions.mjs", "bindInteriorThreshold", "createBuildingPortal", "resolveBuildingPortalTransition", "createSpatialRepository", "commitSpatialTransition", "aoHoustonSpatialTransitionsV1"):
            with self.subTest(value=value):
                self.assertIn(value, self.script)
        self.assertIn("insideBuilding", self.script)
        self.assertIn("no Kernel, WorldHeart or Supabase writes occur", self.html)


if __name__ == "__main__":
    unittest.main()
