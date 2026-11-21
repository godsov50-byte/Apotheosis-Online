"""Projected-coordinate <-> AO local millimetre coordinate adapter.

This module converts coordinates that are ALREADY in the profile's projected
working CRS. It does not perform a datum/projection operation (for example,
EPSG:4326 -> EPSG:2278); that must be done by a separately selected and
versioned PROJ pipeline before calling these functions.

The Houston profile remains draft until its origin and transformation
metadata are approved. Import code must call SpatialProfile.assert_ready().
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import json
from pathlib import Path
from typing import Any


class ProfileNotReadyError(ValueError):
    """Raised when a draft/incomplete spatial profile is used for import."""


def _decimal(value: Decimal | str | int) -> Decimal:
    if isinstance(value, float):
        raise TypeError("Pass Decimal, string, or integer; binary floats are not accepted.")
    try:
        result = value if isinstance(value, Decimal) else Decimal(value)
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise ValueError(f"Invalid decimal coordinate: {value!r}") from exc
    if not result.is_finite():
        raise ValueError("Coordinates must be finite.")
    return result


def round_half_away_from_zero(value: Decimal) -> int:
    """Round a Decimal to an integer, with exact ties away from zero."""
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


@dataclass(frozen=True)
class SpatialProfile:
    profile_key: str
    profile_version: int
    profile_state: str
    horizontal_crs: str
    origin_easting: Decimal | None
    origin_northing: Decimal | None
    metres_per_unit_numerator: int
    metres_per_unit_denominator: int
    ao_subunits_per_metre: int
    surface_cell_size_mm: int
    chunk_size_cells: int
    rounding: str
    source_to_working_crs_pipeline: str | None
    working_crs_to_ao_pipeline: str
    vertical_crs: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "SpatialProfile":
        horizontal = data["horizontal_working_crs"]
        origin = data["origin"]
        factor = horizontal["metres_per_unit"]
        vertical = data.get("vertical_reference") or {}
        origin_e = origin.get("easting")
        origin_n = origin.get("northing")
        return cls(
            profile_key=str(data["profile_key"]),
            profile_version=int(data["profile_version"]),
            profile_state=str(data["profile_state"]),
            horizontal_crs=f'{horizontal["authority"]}:{horizontal["code"]}',
            origin_easting=None if origin_e is None else _decimal(str(origin_e)),
            origin_northing=None if origin_n is None else _decimal(str(origin_n)),
            metres_per_unit_numerator=int(factor["numerator"]),
            metres_per_unit_denominator=int(factor["denominator"]),
            ao_subunits_per_metre=int(data["ao_subunits_per_metre"]),
            surface_cell_size_mm=int(data["surface_cell_size_mm"]),
            chunk_size_cells=int(data["chunk_size_cells"]),
            rounding=str(data["rounding"]),
            source_to_working_crs_pipeline=data.get("source_to_working_crs_pipeline"),
            working_crs_to_ao_pipeline=str(data["working_crs_to_ao_pipeline"]),
            vertical_crs=vertical.get("crs"),
        )

    def assert_ready(self) -> None:
        if self.profile_state != "approved":
            raise ProfileNotReadyError(
                f"Profile {self.profile_key}-v{self.profile_version} is "
                f"{self.profile_state!r}, not approved."
            )
        if self.origin_easting is None or self.origin_northing is None:
            raise ProfileNotReadyError("Both projected origin coordinates must be selected.")
        if self.metres_per_unit_numerator <= 0 or self.metres_per_unit_denominator <= 0:
            raise ProfileNotReadyError("CRS unit conversion must be a positive rational number.")
        if self.ao_subunits_per_metre <= 0 or self.surface_cell_size_mm <= 0:
            raise ProfileNotReadyError("AO coordinate and cell scales must be positive.")
        if self.chunk_size_cells <= 0:
            raise ProfileNotReadyError("Chunk size must be positive.")
        if self.rounding != "decimal_round_half_away_from_zero":
            raise ProfileNotReadyError("Unsupported or non-deterministic rounding rule.")
        if not self.working_crs_to_ao_pipeline:
            raise ProfileNotReadyError("A versioned local-coordinate transform is required.")


@dataclass(frozen=True)
class ProjectedCoordinate:
    easting: Decimal
    northing: Decimal


@dataclass(frozen=True)
class AOCoordinate:
    x_mm: int
    y_mm: int


def load_profile(path: str | Path) -> SpatialProfile:
    """Load the machine-readable profile. Draft profiles may be loaded but not transformed."""
    with Path(path).open("r", encoding="utf-8") as stream:
        return SpatialProfile.from_dict(json.load(stream))


def projected_to_ao(
    point: ProjectedCoordinate,
    profile: SpatialProfile,
) -> AOCoordinate:
    """Convert projected CRS coordinates to integer AO millimetres.

    Source GIS northing increases north; AO Y increases south, so the northing
    delta is negated. Input coordinates must already use profile.horizontal_crs.
    """
    profile.assert_ready()
    easting = _decimal(point.easting)
    northing = _decimal(point.northing)
    metres_per_unit = (
        Decimal(profile.metres_per_unit_numerator)
        / Decimal(profile.metres_per_unit_denominator)
    )
    scale = Decimal(profile.ao_subunits_per_metre)
    x_mm = (easting - profile.origin_easting) * metres_per_unit * scale
    y_mm = -(northing - profile.origin_northing) * metres_per_unit * scale
    return AOCoordinate(
        x_mm=round_half_away_from_zero(x_mm),
        y_mm=round_half_away_from_zero(y_mm),
    )


def ao_to_projected(
    point: AOCoordinate,
    profile: SpatialProfile,
) -> ProjectedCoordinate:
    """Invert the local AO transform into the profile's projected CRS."""
    profile.assert_ready()
    metres_per_unit = (
        Decimal(profile.metres_per_unit_numerator)
        / Decimal(profile.metres_per_unit_denominator)
    )
    divisor = metres_per_unit * Decimal(profile.ao_subunits_per_metre)
    easting = profile.origin_easting + (Decimal(point.x_mm) / divisor)
    northing = profile.origin_northing - (Decimal(point.y_mm) / divisor)
    return ProjectedCoordinate(easting=easting, northing=northing)


def cell_index(coordinate_mm: int, cell_size_mm: int = 1000) -> int:
    """Return the containing cell index; floor division handles negative values."""
    if cell_size_mm <= 0:
        raise ValueError("cell_size_mm must be positive")
    return coordinate_mm // cell_size_mm


def chunk_index(cell: int, chunk_size_cells: int = 64) -> int:
    """Return the containing sparse chunk index, including negative coordinates."""
    if chunk_size_cells <= 0:
        raise ValueError("chunk_size_cells must be positive")
    return cell // chunk_size_cells
