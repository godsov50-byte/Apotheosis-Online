# Houston Road Network — AO Geographic Foundation

**Status:** Official source and acquisition contract verified; acquisition pipeline committed; full feature snapshot not yet downloaded or imported into AO's canonical spatial registry.

## Authoritative road source

The City of Houston's public **COH_RoadCenterline** FeatureServer layer is the selected source:

https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0

The service description says the road dataset covers the City of Houston and its ETJ and is maintained as roads are added or removed and street names/block ranges change. The source describes it as the most up-to-date and accurate Houston road-centerline dataset, while its disclaimer says it is for general reference and does not warrant accuracy or completeness for specific applications. The source was originally assembled in 2008 from Greater Harris County 911 roads and StarMap road classes, with subsequent edits from the Geographic Data Committee, approved plats, and permit records.

The layer is polyline geometry in **EPSG:2278 (NAD83 / Texas South Central, US survey feet)**. AO's canonical geographic interchange is **EPSG:4326 (WGS84)** with GeoJSON coordinates in longitude, latitude order. The acquisition script requests server-side transformation to EPSG:4326 and retains source identifiers and attributes.

## Houston scope and observed counts

The source layer contains a wider Houston-region / ETJ network. Do not import every record as a City of Houston road.

The selected filter is:

`munileft = 'HOUSTON' OR muniright = 'HOUSTON'`

On 2026-11-20, the service returned:

| Query | Road records |
|---|---:|
| Entire public layer | 235,807 |
| Houston on either side | 83,760 |
| Houston on both sides only | 83,544 |
| Boundary / cross-jurisdiction connectors included by the selected filter | 216 |

The selected 83,760-feature scope keeps roads that touch the Houston jurisdiction on either side, including the 216 boundary/cross-jurisdiction connectors. ETJ-only segments without Houston on either side are excluded. The two side-of-road municipality fields remain attached to every feature so AO can distinguish internal streets from jurisdiction edges.

Counts are observations from the source on the stated date, not permanent constants. The acquisition script obtains a fresh ID set and count every time it runs.

## Road attributes

Preserve source values rather than guessing their meaning:

- Identity: `GlobalID`, `OBJECTID`, `centerlineid`
- Name: `fullname`, `roadname`, `prefix`, `roadtype`, `suffix`, `commonname`, `legalname`
- Classification: `roadclass`, `funcclass`, `fccode`, `source`
- Direction and capacity: `onewaydir`, `lanes`, `speed`
- Address ranges: `fromleft`, `toleft`, `fromright`, `toright`, active range fields, parity fields
- Jurisdiction and postal context: `munileft`, `muniright`, `countyleft`, `countyright`, `zipleft`, `zipright`
- Source edit metadata: `last_edited_date`

In particular, `onewaydir`, `lanes`, and `speed` are supplied as strings in this service. Their raw values must be retained. Do not treat a zero lane value, a blank direction, or a speed value as an operationally validated instruction without checking the source's coded domains and semantics.

## Separate City of Houston topology references

The production City of Houston Landbase and Roads service also publishes separate layers:

- **Street Centerlines (layer 9):** [production MapServer layer](https://geogimsms.houstontx.gov/arcgis/rest/services/HPC/LandbaseAndRoads_hpc/MapServer/9)
- **Nodes (layer 10):** [intersection / special-node reference](https://geogimsms.houstontx.gov/arcgis/rest/services/HPC/LandbaseAndRoads_hpc/MapServer/10)
- **Links (layer 12):** [network-link reference](https://geogimsms.houstontx.gov/arcgis/rest/services/HPC/LandbaseAndRoads_hpc/MapServer/12)

The Nodes layer has point geometry and attributes including `NODEID`, `ORI_NODEID`, `NODE_TYPE`, street names, and jurisdiction. The Links layer has polyline geometry and attributes including `LINKID`, `LINK_TYPE`, and `ROAD_CLASS`.

These are useful independent topology references. Their identifiers are not assumed to match the COH_RoadCenterline `GlobalID` or `centerlineid`; a crosswalk must be demonstrated before joining them. Nodes also encode special conditions such as bridges, railroads, and traffic signals, which must not be flattened into ordinary at-grade intersections.

## AO road model

1. **Road segment:** an AO-owned spatial entity whose base geometry is a source polyline. Preserve full shape and all source identifiers.
2. **Intersection node:** a separate spatial entity representing a validated junction or special crossing.
3. **Connectivity:** explicit edge-to-node incidence, built from verified geometry/topology. Do not create a junction merely because two lines visually cross; preserve bridge/tunnel/rail separation.
4. **Directionality:** preserve raw source direction fields, then normalize them only after the source domain has been validated.
5. **Access:** model motor vehicle, pedestrian, bicycle, service, private, and restricted access separately when verified data exists. A road centerline alone does not establish sidewalk access or traversability.
6. **Continuous movement:** the map index/grid never constrains position. The road graph is a routing aid; it does not replace continuous coordinates, collision geometry, off-road movement, or Kernel validation.
7. **Provenance:** every imported feature retains provider, service/layer, source IDs, source edit timestamp, retrieval time, original CRS, transformation, and snapshot checksum.

The preferred AO stable identity is deterministic from the source `GlobalID`, with `OBJECTID` and `centerlineid` retained as source identifiers. Source records are never treated as AO-authored canon; AO changes and overlays remain separate and versioned.

## Acquisition

The committed script:

`scripts/geography/acquire_houston_road_centerlines.py`

Run:

```bash
python scripts/geography/acquire_houston_road_centerlines.py --output-dir build/houston-road-network
```

The script:

1. Captures the filtered source OBJECTID set and independently checks its count with short GET requests.
2. Fetches the fixed ID set in bounded batches using form-encoded HTTP POST requests. The geometry query is sent in the request body rather than a long URL, avoiding the City GIS server's 404 response to oversized batch URLs.
3. Requests geometry in EPSG:4326.
4. Validates unique IDs, GlobalIDs, line geometry, and coordinate ranges.
5. Checks the source data edit timestamp before and after acquisition and refuses to publish if the source changed mid-run.
6. Writes GeoJSON and a SHA-256 manifest atomically.

Default output is under `build/`, not committed automatically. A successful local run is required before claiming the 83,760 geometries have been downloaded or imported.

## Map demonstration

`geography/houston-spatial-navigation-demo.html` now overlays the filtered official Houston centerlines over the OpenStreetMap basemap. The overlay can be toggled separately from the basemap. Road popups show the source road name, class, raw one-way/lanes/speed values, municipality sides, and source identifier.

The map loads features for the current view from the public ArcGIS FeatureServer; it is a live display overlay, not the canonical offline AO road snapshot.

## Not yet solved

- Full snapshot acquisition and storage in AO's canonical geographic registry.
- Validated centerline-to-node/link crosswalk.
- Graph construction and edge splitting at true intersections.
- Turn restrictions, access by travel mode, bridge/tunnel grade separation, and vertical connectivity.
- Pedestrian sidewalks and building entrance connections.
- Kernel-authorized movement and WorldHeart history commits.

**No Supabase migration or live-world mutation is included in this phase.**
