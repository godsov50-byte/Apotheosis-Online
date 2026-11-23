# AO Houston Street Registry

Status: implementation branch, reproducible local acquisition/compiler, and SQL migration artifact. Not merged, not applied to Supabase, and not connected to Kernel or WorldHeart.

## Authoritative starting source

- Publisher: City of Houston GIS / COHGIS.
- Service: COH_RoadCenterline, FeatureServer layer 0.
- Query scope: munileft='HOUSTON' OR muniright='HOUSTON'.
- Source CRS: EPSG:2278 (US survey feet); acquisition requests GeoJSON in WGS84 / EPSG:4326.
- Stable source identity: GlobalID. OBJECTID remains a source locator, not permanent identity.
- Service URL: https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0

The City source describes Houston and ETJ centerlines assembled from Greater Harris County 911 roads and StarMap private/access/proposed roads, with later edits informed by approved plats, committee feedback and permit records. City GIS public-domain/reference data is reusable with attribution. The City disclaims suitability for survey or engineering use.

A previously audited snapshot dated 2026-11-21 contained 83,760 source feature records, of which 11 had null geometry. This is a historical snapshot count, not a current live count, not a distinct street-name count, and not a routable-edge count. Every acquisition reruns the count/ID checks and records a new content digest.

## Identity and name grouping

- Each source centerline feature receives a deterministic identity key from the source namespace plus GlobalID.
- Names, coordinates, OBJECTIDs, address ranges and road attributes are mutable properties, never identity.
- Multiple source segments with the same normalized name share a search group but remain separate segment records.
- A name-search group is not a physical street corridor. Same-name disconnected roads are never merged into one route.
- A source rename creates a new observation/revision; it does not replace the segment identity.
- A physical corridor identity is not inferred from a shared display name.

## Properties preserved

All values remain raw source observations and retain nulls.

| AO property | City source field |
|---|---|
| Name | fullname |
| Road class | roadclass |
| One-way | onewaydir |
| Lanes | lanes |
| Speed | speed |
| Functional class | funcclass |
| Source | source |
| Municipality left/right | munileft, muniright |
| Address ranges left/right | fromleft, fromright, toleft, toright |
| Actual address ranges | actfromleft, actfromright, acttoleft, acttoright |
| Parity | parityleft, parityright |
| ZIP | zipleft, zipright |
| Source edit date / shape length | last_edited_date, Shape__Length |

Properties not supplied here—sidewalk width/condition, pavement material, curb ramps, bike facilities, verified legal speed limits, turn restrictions, grade separation, ownership and access permissions—remain unknown until supported by a suitable source or AO-authorized observation.

## Reproducible local build

Run these commands from the repository root:

    python scripts/geography/acquire_houston_road_centerlines.py --output-dir build/houston-road-network

    python scripts/geography/build_houston_street_registry.py --input build/houston-road-network/roads.geojson --source-manifest build/houston-road-network/manifest.json --output-dir build/houston-road-network

The acquisition script captures the service edit timestamp before and after download, compares independent feature count and complete unique OBJECTID list, downloads bounded batches, rejects incomplete batches and invalid IDs/geometries, retains null-geometry source records, and writes a SHA-256 snapshot digest and manifest atomically.

The compiler rejects duplicate GlobalIDs/OBJECTIDs, assigns deterministic segment identities, retains raw geometry and source properties, creates name-search groups without merging segments, and reports feature, geometry, name-group, road-class and property-completeness counts.

A manually triggered GitHub Actions workflow builds and uploads the source snapshot and registry as versioned artifacts. Raw GIS snapshots are not committed to the repository.

## Database contract

Migration 20261121000400_ao_houston_street_registry.sql extends the shared ao_spatial source-feature store with stable segment records, append-only property/source revisions and versioned name observations. A SQL view provides derived name-search groups. This is a street-specific extension of the shared spatial and deterministic identity architecture, not a second global spatial database.

The migration depends on 00100 spatial features, 00200 spatial scaffold and 00300 deterministic registry. None of these migration artifacts is applied by this PR. The Houston AO origin remains unapproved, so this pipeline keeps geometry in source WGS84 and does not transform it into canonical AO local coordinates.

## Intersections and routing

This registry stores source centerline segments; it does not declare a routable street graph. Geometric line crossings are not automatically intersections. Endpoint proximity alone is not sufficient evidence of at-grade connectivity. The topology stage must cross-reference official City Nodes/Links, grade-separated structures, turn restrictions and access classes, with ambiguous cases left for review.

No driving, pedestrian, bicycle, emergency or Envoy route should rely on this evidence registry until the relevant graph and mode rules have been validated and authorized by the Kernel.

## Authority, security and rollback

- GIS data is evidence, not AO canon or world state.
- SQL tables deny public, anon and authenticated roles; trusted service-role access only.
- Browser code must never receive service-role credentials.
- Importing source records into a database does not authorize Kernel world-state creation.
- No source service is edited. No Supabase migration is applied. No production data is changed.
- Rollback: close this draft PR or revert its isolated feature branch; no live data has been changed.
