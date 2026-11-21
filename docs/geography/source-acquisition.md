# Geographic source acquisition

## Texas state boundary

Run from the repository root:

```bash
python scripts/geography/acquire_texas_boundary_2024.py
```

This downloads and extracts the U.S. Census Bureau 2024 TIGER/Line state and
equivalent-entity polygon archive. The source archive covers the United States,
not Texas alone. During downstream GIS normalization, select Texas by
`GEOID='48'`. Keep the original archive, SHA-256 digest, extraction metadata,
and source vintage with the normalized Texas geometry.

The selected Census vintage is 2024; Census states that legal boundaries and
names are as of January 1, 2024. The download script does not write to AO or
Supabase.

## Houston city limits

Run from the repository root:

```bash
python scripts/geography/acquire_houston_city_limits.py
```

The script downloads Harris County GIS `CoH_Boundaries` MapServer layer 2
(`COH_City_Limit`). The service advertises GeoJSON and exposes the
`SERVICE_TY` classification. The script checks the source CRS and required
fields, pages through features, requests EPSG:4326 output, preserves raw and
normalized service-type values, and writes source metadata plus an acquisition
report.

Outputs are written under `data/geography/imports/houston-city-limits/`.
This is a local acquisition target. Review dataset size, source terms,
geometry validity, topology, and provenance before committing or ingesting it.
The script does not write to Supabase or the AO geographic registry.

The Houston MapServer does not declare a source vintage in its reviewed
metadata; the acquisition report records the retrieval timestamp and labels
the vintage as undeclared. A separate City of Houston public-only layer is
labelled Version 2024 and updated November 20, 2024. It is retained as a
historical cross-check, not silently merged into the primary source.

## Import boundary

Acquisition is not ingestion. Before geometry enters AO, validate source
provenance, coordinate transforms, polygon validity, ring orientation and
holes, multipart geometry, overlaps/gaps, and administrative classifications.
Keep Full Service, Limited Service, and Pending separate; Pending is not
current city limits. No acquisition script in this directory writes to
Supabase or the AO geographic registry.
