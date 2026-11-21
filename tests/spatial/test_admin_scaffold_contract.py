"""Static contract tests for the incremental Houston admin spatial scaffold.

These tests inspect migration intent only. They do not replace PostGIS runtime,
RLS, API authorization, or Kernel integration tests.
"""

from pathlib import Path
import unittest


MIGRATION = (
    Path(__file__).parents[2]
    / "geography"
    / "database"
    / "migrations"
    / "20261121000200_ao_houston_spatial_scaffold.sql"
)


class AdminSpatialScaffoldTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sql = MIGRATION.read_text(encoding="utf-8").lower()

    def test_creates_spatial_objects_connections_and_admin_queue(self):
        self.assertIn("create table ao_spatial.spatial_objects", self.sql)
        self.assertIn("create table ao_spatial.spatial_connections", self.sql)
        self.assertIn("create table ao_spatial.admin_development_queue", self.sql)

    def test_supports_empty_or_partial_place_development(self):
        self.assertIn("'spatial_only'", self.sql)
        self.assertIn("'needs_admin'", self.sql)
        self.assertIn("'in_progress'", self.sql)
        self.assertIn("'developed'", self.sql)

    def test_supports_roads_buildings_interiors_and_underground_types(self):
        for kind in (
            "'road_segment'",
            "'sidewalk'",
            "'building'",
            "'building_entrance'",
            "'floor'",
            "'room'",
            "'tunnel_segment'",
            "'dungeon_site'",
            "'business_premises'",
        ):
            with self.subTest(kind=kind):
                self.assertIn(kind, self.sql)

    def test_connections_are_typed_and_access_aware(self):
        self.assertIn("'road_to_sidewalk'", self.sql)
        self.assertIn("'building_entrance'", self.sql)
        self.assertIn("'tunnel_link'", self.sql)
        self.assertIn("'waterway_flow'", self.sql)
        self.assertIn("access_requirements jsonb", self.sql)
        self.assertIn("physical_constraints jsonb", self.sql)

    def test_imported_objects_require_canonical_evidence(self):
        self.assertIn("record_origin <> 'imported'", self.sql)
        self.assertIn("canonical_feature_id is not null", self.sql)

    def test_admin_queue_tracks_one_object_at_a_time(self):
        self.assertIn("spatial_object_id uuid not null", self.sql)
        self.assertIn("assigned_admin_id text", self.sql)
        self.assertIn("queue_state", self.sql)

    def test_browser_roles_have_no_direct_access(self):
        self.assertIn("enable row level security", self.sql)
        self.assertIn("force row level security", self.sql)
        self.assertIn("from public, anon, authenticated", self.sql)
        self.assertIn("to service_role", self.sql)

    def test_scaffold_does_not_seed_fake_city_content_or_world_entities(self):
        self.assertNotIn("insert into ao_spatial.spatial_objects", self.sql)
        self.assertNotIn("insert into ao_spatial.spatial_connections", self.sql)
        self.assertNotIn("create table ao_spatial.world_entities", self.sql)


if __name__ == "__main__":
    unittest.main()
