# AO Integrated City Registry Console

Status: browser integration and reproducible building-footprint acquisition are implemented on this branch. Source snapshots are not bundled in the repository and the manual acquisition workflow has not yet been run.

## What the mock now supports

The city console can import two independent sourced datasets into a local IndexedDB registry:

1. **Streets:** the compiled `street-registry.json` artifact from the Houston street registry workflow. Each centerline segment remains its own record; same-name search groups do not merge segments.
2. **Buildings:** a GeoJSON FeatureCollection of building polygons. The importer preserves source properties and source identifiers, and tags the selected source dataset.

Imported line and polygon features are drawn on the same Leaflet map. The user can zoom into an area, click a street segment or building footprint, inspect source attributes and provenance, and search across the locally cached records. Only the current map viewport is rendered, with a feature cap to protect browser performance.

The registry cache uses IndexedDB, not localStorage, so a large city dataset is not serialized into the small demo settings store. Imported evidence persists in that browser until its site data is cleared. The existing reset-demo action clears only locally authored demo objects; it does not delete imported source evidence.

## Building footprint source

The reproducible acquisition script uses:

- H-GAC / Harris County 2018 Building Footprints, MapServer layer 0:
  `https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0`
- City of Houston limits polygon:
  `https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/City_of_Houston_Boundaries/FeatureServer/0`

The acquisition selects source footprints intersecting the Houston city-limit polygon and requests GeoJSON in EPSG:4326. It records the source and boundary service metadata, feature counts, acquisition time and SHA-256 digest. It checks the complete source object-ID set and retains null geometry records.

**Important source limitation:** the 2018 building layer is derived from LiDAR classifications. The publisher warns that misclassified LiDAR returns may produce erroneous footprints and that the data is approximate, not an on-the-ground survey. The city-boundary spatial query selects features that intersect the limit; it does not clip footprints to the municipal boundary, so a boundary-touching footprint can extend beyond it. `OBJECTID` is a source locator, not a guaranteed permanent building identity.

The City of Houston detailed 3D building-footprint dataset described in its service metadata is a separate, older snapshot with a much smaller central-Houston extent. It should not be represented as citywide coverage.

## Build the artifacts

From the repository root:

    python scripts/geography/acquire_houston_road_centerlines.py --output-dir build/houston-road-network
    python scripts/geography/build_houston_street_registry.py \
      --input build/houston-road-network/roads.geojson \
      --source-manifest build/houston-road-network/manifest.json \
      --output-dir build/houston-road-network

    python scripts/geography/acquire_houston_building_footprints.py \
      --output-dir build/houston-building-footprints

Or run the manual GitHub Actions workflows:

- `AO Houston street registry snapshot`
- `AO Houston building footprint snapshot`

Each workflow uploads an artifact with a GeoJSON/JSON payload and a provenance manifest. Download the artifacts, open the Admin tab in `ao-city-console.html`, import the street-registry JSON, then import `buildings.geojson`.

## Authority and integration boundaries

- Imported features are geographic evidence, not AO canon, Kernel state or WorldHeart commits.
- The map basemap is visual context; source geometries are the selectable registry overlays.
- No building entrance is inferred from a footprint boundary.
- No address, owner, business, resident, floor, room, access permission or condition is invented.
- The nearest street centerline is not automatically a verified frontage or entrance connection.
- Street centerlines are not yet a validated graph. Intersections, grade separation, sidewalks, travel modes, legal access and turn restrictions remain unverified.
- No route is calculated from these imported records. The existing direct-line preview remains a direct-line preview.
- The browser never receives a Supabase service-role credential. IndexedDB is a local cache, not trusted persistence or a multi-user registry.
- The source snapshot must be independently acquired and reviewed; no full building or street dataset is included in this branch.

## Rollback

The feature is isolated to the city-console browser adapter, one acquisition script, one manual workflow and documentation. Close the draft PR or revert the feature branch. No live AO world, Supabase schema, source GIS service or production dataset is changed.
