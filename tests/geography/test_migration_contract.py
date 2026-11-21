"""Static contract tests for the AO Houston spatial SQL migration.

These checks do not replace applying the migration to disposable PostgreSQL
with PostGIS and testing actual roles, policies, triggers and spatial queries.
"""

from pathlib import Path
import unittest


MIGRATION = (
    Path(__file__).parents[2]
    / "geography"
    / "database"
    / "migrations"
    / "20261121000100_ao_houston_spatial_features.sql"
)


class SpatialMigrationContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sql = MIGRATION.read_text(encoding="utf-8").lower()

    def test_uses_separate_spatial_schema(self):
        self.assertIn("create schema if not exists ao_spatial", self.sql)

    def test_keeps_source_and_canonical_geometry_separate(self):
        self.assertIn("create table ao_spatial.source_features", self.sql)
        self.assertIn("source_geom geometry(geometry)", self.sql)
        self.assertIn("create table ao_spatial.canonical_features", self.sql)
        self.assertIn("canonical_geom geometry(geometry, 0)", self.sql)

    def test_spatial_indexes_exist(self):
        self.assertIn("source_features_geom_gix", self.sql)
        self.assertIn("canonical_features_geom_gix", self.sql)
        self.assertIn("using gist", self.sql)

    def test_browser_roles_are_not_granted_access(self):
        self.assertIn("revoke all on schema ao_spatial from public, anon, authenticated", self.sql)
        self.assertIn("revoke all on all tables in schema ao_spatial from public, anon, authenticated", self.sql)
        self.assertIn("to service_role", self.sql)

    def test_rls_is_enabled_and_forced(self):
        self.assertIn("enable row level security", self.sql)
        self.assertIn("force row level security", self.sql)

    def test_source_and_approved_profiles_are_protected(self):
        self.assertIn("reject_source_feature_mutation", self.sql)
        self.assertIn("guard_approved_profile_update", self.sql)
        self.assertIn("canonical_features_identity_immutable", self.sql)

    def test_database_does_not_create_world_state_entities(self):
        self.assertNotIn("create table ao_spatial.world_entities", self.sql)
        self.assertNotIn("create table ao_spatial.sp_entities", self.sql)

    def test_houston_profile_is_seeded_as_draft(self):
        self.assertIn("'houston', 1, 'draft'", self.sql)
        self.assertIn("'epsg:2278'", self.sql)


if __name__ == "__main__":
    unittest.main()
