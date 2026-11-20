# Geographic source acquisition

## Houston city limits

Run from the repository root:

```bash
python scripts/geography/acquire_houston_city_limits.py
```

The script downloads the City of Houston COH_Limits FeatureServer layer 0,
checks the source WKID and required fields, pages through all features,
requests GeoJSON in EPSG:4326, records the actual service-type values, and
writes an acquisition report.

Outputs are written under `data/geography/imports/houston-city-limits/`.
That directory is a local acquisition target and should not be committed
without reviewing the dataset size, source terms, geometry validity, and
provenance. No Supabase or production database is modified.

Source metadata was reviewed on 2026-11-20. The service reports WKID 102740
(EPSG:2278). The script stops if the service CRS changes so that coordinates
cannot be silently misinterpreted.
