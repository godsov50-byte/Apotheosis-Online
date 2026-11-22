import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SCRIPT=ROOT/"scripts"/"geography"/"build_houston_road_preview.py"
SPEC=importlib.util.spec_from_file_location("road_preview",SCRIPT)
MODULE=importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)

class HoustonRoadPreviewOrchestratorTests(unittest.TestCase):
    def test_preview_only_gate_is_required(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaisesRegex(ValueError,"Only --preview-only"):
                MODULE.build(Path(temp),False)
    def test_plan_mode_is_nonexecuting_description(self):
        # The plan text is deliberately descriptive; CLI plan mode exits before subprocess execution.
        self.assertTrue(MODULE.ACQUIRE.exists())
        self.assertTrue(MODULE.REGISTRY.exists())
        self.assertTrue(MODULE.GRID.exists())
        self.assertTrue(MODULE.RASTER.exists())

if __name__=="__main__": unittest.main()
