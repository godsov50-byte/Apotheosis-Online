# Source building footprint adapter

`spatial/ao-building-records.mjs` converts a valid GeoJSON Polygon footprint into an editable **staging proposal** for the Houston world builder.

- Preserves the source feature ID, all source properties and full source geometry.
- Converts the outer ring to Leaflet latitude/longitude order for the current builder.
- Generates a deterministic proposal ID from the source ID; if absent, uses a stable geometry hash.
- Leaves entrances, rooms and interior cells empty for later authoring.
- Does not infer purpose, occupants, entrance access, floor count, or AO identity. The floor-plan count defaults to one as a placeholder and is explicitly marked unknown.
- Rejects non-Polygon geometry and invalid outer rings; it does not silently flatten MultiPolygons or holes.

This adapter is a data-normalization slice. It does not yet attach imported features to clickable building records in the browser UI, commit them to Kernel/WorldHeart, or persist to Supabase.

Run:
```sh
node --test spatial/ao-building-records.test.mjs
```
