# AO Houston Kernel Road Lock Registry

**Status:** proposed database contract on this branch. It is not deployed, populated, or connected to the live Kernel.

## Accepted road geometry source

The yellow road overlay in the Houston City Builder is the City of Houston COHGIS **COH_RoadCenterline** layer (FeatureServer layer 0). The yellow colour is only the builder's display style; the underlying feature is a road centerline with source geometry and attributes.

- Source service: https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0
- Source CRS: EPSG:2278 (NAD83 / Texas South Central, US survey feet).
- Acquired interchange geometry: EPSG:4326 (WGS84), longitude/latitude order.
- Source identity fields: OBJECTID, GlobalID, and centerlineid. Names and addresses are attributes/observations, not road identity or geometry.
- The acquisition script is `scripts/geography/acquire_houston_road_centerlines.py`; it verifies ID/count completeness, paginates the source, preserves null geometries, and rejects a source edit timestamp change during acquisition.
- A prior acquisition audit recorded 83,760 source records, 83,749 geometries, and 11 records with missing geometry for its stated Houston-jurisdiction query scope. These are source-snapshot audit counts, not a claim that all records are currently loaded into the Kernel or locked there. See [PR #46](https://github.com/godsov50-byte/Apotheosis-Online/pull/46) and [PR #49](https://github.com/godsov50-byte/Apotheosis-Online/pull/49) for the snapshot-lock and reproducible-hash work.

For this implementation, the authoritative road line is the source centerline geometry, not the yellow pixels rendered on the map. The source coordinates are preserved as coordinates; styling, zoom-level simplification, display projection, or map rendering must never overwrite them. This record represents a centerline only—not road width, pavement boundary, lane geometry, sidewalk, curb, or a verified route.

## What this adds

Migration `20261121000500_ao_houston_kernel_road_lock_registry.sql` adds the lock lifecycle on top of the source-backed street registry (migrations 00100–00400):

1. A road lock proposal points to one exact segment, revision, and immutable source feature.
2. A separate append-only decision must carry both a Sovereign approval ID and a Kernel decision ID.
3. A locked record copies the source feature's WGS84 geometry. The insert guard verifies that the geometry is valid LineString/MultiLineString, has SRID 4326, and is byte-for-byte equal to the source feature geometry.
4. Locked records cannot be updated or deleted. Corrections require a new proposal and decision; the prior locked record remains intact.
5. Image references are stored against a specific locked road record, with image type, URI, provider, capture date, viewpoint, licence/usage, checksum, and verification status. An unresolved image type is allowed; verified images require a URI, provider, and usage terms.

## Agent retrieval contract

- AI agents and clients must read from one Kernel-authorized interface over `locked_road_records` and `road_image_references`.
- Retrieval returns the locked geometry, its revision/hash, and the exact linked image references. Consumers must not regenerate, redraw, geocode, or move a locked road.
- A client cache is valid only for the exact lock record/version and geometry digest returned by the Kernel.
- No public/anon/authenticated browser role receives direct table access. A server-side Kernel service must authenticate the caller and expose read-only retrieval. The service role key must never enter browser code.
- This migration does not implement that Kernel endpoint, AI connector, or shared cache invalidation.

## Geometry and image boundaries

- This stores road centerline geometry, not road-surface polygons, lane geometry, sidewalk geometry, or a navigation graph.
- A line crossing is not proof of an at-grade junction. Routing remains disabled until official topology, grade separation, access classes, and turn restrictions are validated.
- Images are evidence/reference assets, not geometry. Street-level versus aerial/satellite remains unresolved; each reference must be labelled from its actual source metadata.
- Street addresses and parcel links remain separate address/parcel records. They are never substituted for road coordinates.

## Apply order and safety

Apply only after reviewing and applying migrations 00100, 00200, 00300, and 00400 in order. This branch does not apply migrations or change Supabase, WorldHeart, Kernel, live world state, or GitHub Pages.

Before applying, the SQL must be tested against the actual PostGIS schema and import path. In particular, the source import must store the downloaded GeoJSON coordinates with SRID 4326 in `ao_spatial.source_features.source_geom`; the lock insert intentionally fails closed if that is not true.

Rollback before any lock rows exist: drop the four new tables and their indexes/functions/triggers in reverse dependency order. Once approved lock records exist, do not delete them as a routine rollback; use append-only supersession/correction records instead.
