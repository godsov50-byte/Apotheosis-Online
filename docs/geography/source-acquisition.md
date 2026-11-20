# Geographic source acquisition

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

The selected Texas state boundary baseline is Census 2024 TIGER/Line. Census
states that its legal boundaries and names are as of January 1, 2024. The
Houston MapServer does not declare a source vintage in its reviewed metadata;
the acquisition report therefore records the retrieval timestamp and labels
the vintage as not declared rather than assuming it is current or 2024.

A separate City of Houston public-only layer is labelled Version 2024 and
updated November 20, 2024. It is retained as a historical cross-check, not
silently merged into the primary source.
