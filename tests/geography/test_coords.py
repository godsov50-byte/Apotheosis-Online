"""Unit tests for the Houston projected-coordinate adapter (stdlib only)."""

from decimal import Decimal
import json
from pathlib import Path
import tempfile
import unittest

from geography.adapter.coords import (
    AOCoordinate,
    ProjectedCoordinate,
    ProfileNotReadyError,
    SpatialProfile,
    ao_to_projected,
    cell_index,
    chunk_index,
    load_profile,
    projected_to_ao,
    round_half_away_from_zero,
)


def approved_test_profile(
    origin_e: str = "1000000",
    origin_n: str = "500000",
) -> SpatialProfile:
    return SpatialProfile(
        profile_key="test",
        profile_version=1,
        profile_state="approved",
        horizontal_crs="EPSG:2278",
        origin_easting=Decimal(origin_e),
        origin_northing=Decimal(origin_n),
        metres_per_unit_numerator=1200,
        metres_per_unit_denominator=3937,
        ao_subunits_per_metre=1000,
        surface_cell_size_mm=1000,
        chunk_size_cells=64,
        rounding="decimal_round_half_away_from_zero",
        source_to_working_crs_pipeline="test-source-to-2278",
        working_crs_to_ao_pipeline="local-origin-and-axis-conversion-v1",
    )


class CoordinateTransformTests(unittest.TestCase):
    def test_origin_maps_to_zero(self):
        profile = approved_test_profile()
        point = projected_to_ao(
            ProjectedCoordinate(Decimal("1000000"), Decimal("500000")),
            profile,
        )
        self.assertEqual(point, AOCoordinate(0, 0))

    def test_east_is_positive_x_and_north_is_negative_y(self):
        profile = approved_test_profile()
        # 3,937 US survey feet are exactly 1,200 metres.
        point = projected_to_ao(
            ProjectedCoordinate(Decimal("1003937"), Decimal("503937")),
            profile,
        )
        self.assertEqual(point, AOCoordinate(1_200_000_000, -1_200_000_000))

    def test_us_survey_foot_conversion(self):
        profile = approved_test_profile()
        # 1,000 US survey feet = 304.800609601... metres.
        point = projected_to_ao(
            ProjectedCoordinate(Decimal("1001000"), Decimal("500000")),
            profile,
        )
        self.assertEqual(point.x_mm, 304801)
        self.assertEqual(point.y_mm, 0)

    def test_round_trip_is_within_half_millimetre_per_axis(self):
        profile = approved_test_profile()
        original = ProjectedCoordinate(
            Decimal("1001234.567"),
            Decimal("498765.432"),
        )
        local = projected_to_ao(original, profile)
        restored = ao_to_projected(local, profile)
        metres_per_unit = Decimal(1200) / Decimal(3937)
        error_e_m = abs(restored.easting - original.easting) * metres_per_unit
        error_n_m = abs(restored.northing - original.northing) * metres_per_unit
        self.assertLessEqual(error_e_m, Decimal("0.0005"))
        self.assertLessEqual(error_n_m, Decimal("0.0005"))

    def test_round_half_away_from_zero(self):
        self.assertEqual(round_half_away_from_zero(Decimal("2.5")), 3)
        self.assertEqual(round_half_away_from_zero(Decimal("-2.5")), -3)
        self.assertEqual(round_half_away_from_zero(Decimal("2.49")), 2)
        self.assertEqual(round_half_away_from_zero(Decimal("-2.49")), -2)

    def test_binary_float_is_rejected(self):
        profile = approved_test_profile()
        with self.assertRaises(TypeError):
            projected_to_ao(ProjectedCoordinate(1000000.0, Decimal("500000")), profile)

    def test_draft_profile_cannot_transform(self):
        draft = approved_test_profile()
        draft = SpatialProfile(**{**draft.__dict__, "profile_state": "draft"})
        with self.assertRaises(ProfileNotReadyError):
            projected_to_ao(
                ProjectedCoordinate(Decimal("1000000"), Decimal("500000")),
                draft,
            )

    def test_profile_json_is_explicitly_not_ready_without_origin(self):
        path = Path(__file__).parents[2] / "geography" / "profiles" / "houston-v1.json"
        profile = load_profile(path)
        self.assertEqual(profile.horizontal_crs, "EPSG:2278")
        with self.assertRaises(ProfileNotReadyError):
            profile.assert_ready()

    def test_negative_cell_and_chunk_indices_use_floor(self):
        self.assertEqual(cell_index(-1), -1)
        self.assertEqual(cell_index(-1000), -1)
        self.assertEqual(cell_index(-1001), -2)
        self.assertEqual(chunk_index(-1), -1)
        self.assertEqual(chunk_index(-64), -1)
        self.assertEqual(chunk_index(-65), -2)

    def test_invalid_cell_and_chunk_sizes(self):
        with self.assertRaises(ValueError):
            cell_index(10, 0)
        with self.assertRaises(ValueError):
            chunk_index(10, 0)


if __name__ == "__main__":
    unittest.main()
