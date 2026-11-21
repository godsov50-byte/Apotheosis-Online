# Houston official Nodes and Links evidence acquisition

**Stage:** Raw source acquisition only; no topology is automatically accepted.

## Verified source
City of Houston GIS Landbase and Roads service, layers **Nodes (10)** and **Links (12)**. The public layer catalog identifies Nodes as point features and Links as polyline features. The source is an ArcGIS MapServer service in Houston's projected spatial reference (EPSG:2278); output GeoJSON is requested in EPSG:4326.

Service:
`https://geogimsms.houstontx.gov/arcgis/rest/services/HPC/LandbaseAndRoads_hpc/MapServer`

- Nodes layer: 10
- Links layer: 12
- The tool captures all source attributes (`outFields=*`) and original geometry.
- It verifies object ID completeness against an independent count query.
- Output: `nodes.geojson`, `links.geojson`, and `official-nodes-links-manifest.json`.

## Run

```bash
python scripts/geography/acquire_houston_official_nodes_links.py \
  --output-dir build/houston-road-network
```

Self-test:

```bash
python scripts/geography/acquire_houston_official_nodes_links.py --self-test
```

## Next analysis
Compare official node points with candidate crossings using a projected metric CRS. Node classifications (including bridge and railroad-related types) are evidence to preserve and evaluate, not automatic movement rules. Link identifiers and link geometry require field-level review before any crosswalk is treated as authoritative.

## Safety
This acquisition tool only downloads source data to a local build directory. It does not edit source services, commit bulk GIS data, change AO world state, or write to Supabase.
