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

## Crossing-candidate crosswalk
CI now runs `scripts/geography/crosswalk_houston_crossings_to_official_nodes.py` after the interior crossing audit. It projects candidate and node coordinates into EPSG:2278, then reports official Nodes within a configurable 15 m radius.

Each crossing is labeled as:
- `no_official_node_within_radius`
- `single_official_node_candidate`
- `multiple_official_nodes_candidate`

The crosswalk preserves nearby node properties and distances. **It is evidence only:** node proximity does not establish road-to-road connectivity, and no crossing is auto-connected. The artifact `official-node-crosswalk.json` is produced for review.

Self-test checks CRS round-trip, a positive nearby-node match, a no-match case, and that no topology decision is assumed.


## CI acquisition scope
The continuous integration workflow now acquires the official **Nodes layer only** to keep the topology review pipeline focused and avoid blocking the crossing audit on the larger Links snapshot. The acquisition script still supports downloading both layers (default) or Nodes only (`--nodes-only`). Links acquisition remains available as a separate manual/full snapshot step.
