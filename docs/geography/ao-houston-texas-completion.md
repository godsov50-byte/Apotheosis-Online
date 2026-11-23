# AO Houston + Texas Geographic Completion

**Implementation status:** Houston has an existing source-backed city road acquisition and deterministic street-registry compiler. This addition creates a reproducible Texas statewide road acquisition pipeline. Neither pipeline is itself a Kernel lock or proof of every road's physical/legal condition.

## Completion order

1. **Houston detailed layer:** acquire City of Houston COH road centerlines; compile stable segment identities; acquire Houston-intersecting 2018 H-GAC/Harris County building footprints. Keep municipal limits, parcels, official site addresses, entrances, tunnels and structures as separate datasets with independent coverage manifests.
2. **Texas statewide layer:** acquire all 254 county-based 2025 TIGER/Line road files. Preserve raw source archives, per-county source CRS, source fields/LINEARID, and transformed WGS84 GeoJSONL. Fail closed if any county archive is missing.
3. **Houston + Texas reconciliation:** use TIGER as statewide continuity/reference; retain COH local centerlines as a separate, more detailed Houston source. Never deduplicate on street name. Compare spatial coverage and source identity, then record overlap/conflict candidates for review.
4. **Boundary and property layers:** acquire and validate Texas state/county boundaries, Houston full/limited/pending municipal limits, parcel polygons, official site-address points, and building footprints independently. Addresses are point/metadata references, not road geometry or proof of a building entrance.
5. **Kernel lock:** only after source review, coverage audit, and Sovereign approval may road segments be locked. AI agents must retrieve the same locked geometry through the Kernel-authorized interface.

## Houston sources already in the repository

- City of Houston COH_RoadCenterline layer 0: https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0
- H-GAC / Harris County 2018 building footprints: https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0
- City boundary reference and municipal status distinctions are documented in `geography/AO_HOUSTON_GEOGRAPHIC_CANON_BASELINE_v0_1.md`.
- Existing reproducible scripts: `scripts/geography/acquire_houston_road_centerlines.py`, `scripts/geography/build_houston_street_registry.py`, and `scripts/geography/acquire_houston_building_footprints.py`.
- Existing manual workflows: `houston-street-registry-build.yml` and `houston-building-footprints-build.yml`.

The Houston COH road acquisition scope is defined by the source's municipality-left/right attributes. It must not be described as identical to the City municipal polygon, the full metropolitan area, or all Harris County roads.

## Texas statewide road source

The new pipeline uses the official U.S. Census Bureau 2025 TIGER/Line county-based Roads inventory:

- Official directory: https://www2.census.gov/geo/tiger/TIGER2025/ROADS/
- Product documentation: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html

It discovers the county ZIP files from the official directory and requires exactly 254 Texas county archives before processing. Each raw ZIP is retained. The shapefile CRS is read from its own .prj; output records are transformed to WGS84 / EPSG:4326 using pyproj. The manifest records each county file's checksum, source CRS, feature count, null/missing geometry count, unique LINEARID count, MTFCC counts, and output checksum. County source identities are namespaced by county FIPS and LINEARID; duplicates across county boundaries are not silently merged.

The pipeline writes per-county compressed GeoJSONL to avoid building one enormous in-memory FeatureCollection. Raw ZIPs and derived files are uploaded as a 90-day GitHub Actions artifact; this is an acquisition artifact, not permanent archival storage.

## What “complete” means—and does not mean

- **County inventory complete:** all 254 county source archives were discovered and downloaded.
- **Feature acquisition complete:** each county archive passed shapefile parsing, geometry transformation and per-file output checks.
- **Geographic coverage validated:** requires separate spatial comparison against authoritative TxDOT/local datasets and explicit treatment of source gaps, overlaps, private roads and roads absent from TIGER.
- **Houston detailed coverage validated:** requires comparing the COH city source with the TIGER county baseline and separately auditing municipal boundaries, parcels, site addresses and building-footprint completeness.
- **AO road locked:** requires the Kernel/Sovereign proposal-and-approval lifecycle. Data acquisition never silently makes world canon or enables routing.

TIGER centerlines are not surveyed pavement edges, lane geometry, sidewalks, legal crossings or a fully validated navigation graph. COH centerlines likewise remain source geometry, not proof of current traversability. Do not infer intersections from 2D line crossings where bridges, tunnels or grade separation may be involved.

## Run

```bash
python -m pip install pyshp pyproj
python scripts/geography/acquire_texas_tiger_roads.py --self-test
python scripts/geography/acquire_texas_tiger_roads.py --output-dir build/texas-roads
```

Run the new **AO Houston and Texas geography acquisition** workflow manually from GitHub Actions. It validates the existing Houston tools, acquires the Houston COH road snapshot and deterministic registry, acquires Houston-intersecting H-GAC building footprints, and acquires all 254 Texas county road archives. It uploads separate 90-day Houston and Texas artifacts. The workflow is deliberately manual because the source acquisitions are large and can take hours. Then compare and validate the two road layers; do not combine their feature identities into one untraceable geometry set.
