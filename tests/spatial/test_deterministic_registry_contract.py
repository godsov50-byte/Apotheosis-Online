"""Static safety/contract checks for the deterministic registry migration."""
from pathlib import Path
import unittest

MIGRATION = Path(__file__).parents[2] / "geography" / "database" / "migrations" / "20261121000300_ao_deterministic_registry.sql"

class DeterministicRegistryContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sql = MIGRATION.read_text(encoding="utf-8").lower()

    def test_permanent_identity_aliases_are_unique(self):
        self.assertIn("create table ao_spatial.object_identities", self.sql)
        self.assertIn("unique(identity_namespace,source_record_key)", self.sql)

    def test_revisions_and_visual_references_are_append_only(self):
        self.assertIn("create table ao_spatial.object_revisions", self.sql)
        self.assertIn("create table ao_spatial.visual_references", self.sql)
        self.assertIn("object_revisions_append_only", self.sql)
        self.assertIn("visual_references_append_only", self.sql)

    def test_generation_records_reproducibility_inputs(self):
        self.assertIn("create table ao_spatial.generation_manifests", self.sql)
        for field in ("source_object_ids", "source_revision_ids", "rule_version", "prompt_template_version", "deterministic_seed", "output_sha256"):
            self.assertIn(field, self.sql)

    def test_corrections_are_proposals_and_decisions(self):
        self.assertIn("create table ao_spatial.correction_proposals", self.sql)
        self.assertIn("create table ao_spatial.correction_decisions", self.sql)
        self.assertIn("kernel_approval_id", self.sql)

    def test_browser_roles_are_denied(self):
        self.assertIn("from public,anon,authenticated", self.sql)
        self.assertIn("to service_role", self.sql)
        self.assertIn("force row level security", self.sql)

if __name__ == "__main__":
    unittest.main()
