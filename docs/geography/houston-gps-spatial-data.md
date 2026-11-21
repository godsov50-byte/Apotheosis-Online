# Houston GPS and Spatial Data

**Scope:** City of Houston, Texas, United States  
**Status:** Source catalog defined; source geometries have not yet been downloaded or validated.

This phase is deliberately limited to Houston's geographic position data. It does not implement pedestrian routing, travel-time estimation, environmental simulation, or AO world-state persistence.

## What the dataset is for

The data foundation should allow AO to answer:

- What is this feature and where is it?
- What are its coordinates and geometry?
- Which administrative area contains it?
- What address, road, parcel, or building record corresponds to it?
- Which nearby mapped features are spatially related?

The canonical coordinate interchange is **WGS 84 (EPSG:4326)**. AO GeoJSON coordinates use longitude, latitude order. Source-native geometry and CRS must also be preserved.

## Initial Houston layers

| Layer | Purpose | Preferred source |
|---|---|---|
| City limits | Legal/administrative extent | Harris County GIS COH City Limit |
| ETJ | Separate extra-territorial geography | City of Houston ETJ |
| Address points | Geocoded site locations | City of Houston COH Site Addresses |
| Street intersections | Point reference for junction locations | City of Houston HOUSTON_CITYINFO |
| Road centerlines | Actual linear street geography | City GIS / Public Works; OSM fallback |
| Parcels | Property boundary geometry | HCAD Public Land Parcels |
| Building footprints | Building exterior outlines | Microsoft Texas Building Footprints; H-GAC LiDAR as limited-coverage cross-check |

The machine-readable catalog is `data/geography/houston-gps-spatial-data.json`. It records service URLs, layer IDs, source coordinate systems, known vintage and quality limitations, and current acquisition status.

## Important source distinctions

- City limits, ETJ, Harris County, postal city names, and service areas are different geographies. Keep them separate.
- The City address point dataset is described as its most complete official address repository, but the City also documents ongoing cleanup. Preserve address status values.
- The street-intersection layer has no permanent unique identifier. AO must assign its own stable feature IDs and retain source IDs only as provenance.
- Intersection points are not road centerlines. A road network cannot be reconstructed reliably from intersections alone.
- Parcels are not buildings. Building footprints are not entrances or indoor floor plans.
- The Microsoft statewide building-footprint layer is derived from 2019-2020 imagery and is licensed under ODbL. Preserve that vintage and license metadata.
- The H-GAC building footprint layer is derived from 2018 LiDAR and has limited published coverage; do not assume it covers all Houston.

## Coordinate handling

Some City and county datasets use NAD83 / Texas South Central (EPSG:2278), measured in US survey feet. These values are not GPS degrees. The acquisition pipeline must:

1. Read the source CRS from the service metadata.
2. Preserve original coordinates and CRS.
3. Transform a normalized copy to EPSG:4326.
4. Validate longitude/latitude ranges and axis order.
5. Record transformation software/version and retrieval timestamp.

Use EPSG:2278 for suitable local planar measurement operations where appropriate, while retaining EPSG:4326 for interchange and GPS-style positioning.

## Acquisition and validation status

The source endpoints and key metadata have been cataloged, but this repository change does **not** claim that geometries have been fetched, downloaded, imported, or spatially validated.

The next data-only acquisition step is to export the Houston boundary, address points, intersections, road centerlines, parcels, and building footprints to versioned source files; clip them to the Houston boundary plus a documented edge buffer; transform normalized copies to WGS84; then run geometry and coverage checks.

No live user location is included. The downtown Houston coordinate in the catalog is only a map-centering anchor.

## Sources

- City of Houston GIS Open Data: https://houston-mycity.opendata.arcgis.com/
- City of Houston HOUSTON_CITYINFO service: https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer
- City of Houston Site Addresses: https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_SiteAddresses/FeatureServer
- Harris County GIS COH City Limit: https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer/2
- City of Houston ETJ: https://services.arcgis.com/su8ic9KbA7PYVxPS/ArcGIS/rest/services/Houston_ETJ/FeatureServer/0
- HCAD Public Land Parcels: https://services.arcgis.com/su8ic9KbA7PYVxPS/ArcGIS/rest/services/Public_Land_Parcels/FeatureServer/0
- Microsoft Texas Building Footprints: https://services.arcgis.com/lqRTrQp2HrfnJt8U/ArcGIS/rest/services/Texas_BuildingFootprints/FeatureServer/0
- Houston-Galveston Area Council LiDAR building footprints: https://services.arcgis.com/NummVBqZSIJKUeVR/arcgis/rest/services/Damage_Assessment_by_Building_Foot_Prints/FeatureServer/0
- Houston Public Works GeoHub: https://geohub.houstontx.gov/
- Geofabrik Texas OpenStreetMap extract: https://download.geofabrik.de/north-america/us/texas.html
