# AO Global Geographic Reference & GPS Contract

## Decision

AO uses **WGS84 / EPSG:4326** as its planet-wide geographic reference for latitude and longitude. GPS, GIS imports, surveyed coordinates, address points, and external map providers must normalize into this common reference before AO spatial resolution.

The global coordinate reference is not a single flat world grid. Earth-scale distances and distortions make that unsafe. AO keeps global geodetic coordinates and maps them into explicitly configured, bounded local metric frames for AO Regions. Large countries, continents, and other broad areas are covered by multiple AO spatial regions. Each local frame then uses the existing AO hierarchy:

**World → Region → Chunk → Tile → Cell → Position**

The existing default spatial sizes remain 1024m chunks, 64m tiles, and 1m cells unless an approved world configuration says otherwise.

## Geographic coverage

- The coordinate system is global: all valid WGS84 latitudes and longitudes are representable.
- Coverage is not automatically the same as map-data availability. Basemap imagery, street centerlines, pedestrian paths, addresses, parcels, buildings, elevation, hydrography, and indoor maps each have their own source and coverage.
- No country, state, city, continent, or test map is the boundary of the coordinate system.
- The United States is a geographic coverage area within the global system. Houston is one test location only.
- AO geographic region polygons/bounds and region IDs must be explicitly registered and reviewed. Do not invent an AO region ID from GPS.
- Overlapping region bounds are rejected as ambiguous until the boundary/priority rule is explicitly resolved. Gaps are reported as uncovered, not silently assigned.
- The current spatial resolver uses regional local metric frames. Keep each frame within its configured radius (default 250 km); divide large territories into multiple AO spatial regions rather than stretching one local projection across a continent.

## Canonical geographic observation

Every incoming coordinate observation preserves:
- CRS and datum: EPSG:4326 / WGS84.
- Latitude and longitude.
- Altitude, if supplied, otherwise null.
- Vertical datum and vertical accuracy, if known.
- Horizontal accuracy.
- Observation timestamp.
- Source type and optional source record identifier.

Do not silently convert unknown altitude to a claim of sea-level elevation. The existing local resolver may use its zero reference plane for horizontal addressing, but the observation retains unknown vertical status.

## GPS authority and privacy

- Device GPS is opt-in and requires explicit browser/device permission.
- GPS is a measurement of a device, not an Envoy identity or canonical character position.
- A GPS fix resolves to a **candidate** AO address. It cannot itself move an Envoy, spawn an entity, change a building, or commit a world event.
- The Kernel validates intent, permissions, world rules, collision, navigation, and any required identity/consent before an authorized movement.
- WorldHeart persists current state and append-only committed events only after Kernel authorization.
- Raw device coordinates must not be uploaded or retained by default. If a feature later needs location persistence, define purpose, consent, retention, and access rules separately.
- A GPS reading with poor accuracy or a region-boundary ambiguity must be marked uncertain and cannot be treated as exact cell-level proof.

## Map and source layers

The geographic reference is provider-neutral. AO may combine, where licensing permits:
- Global basemap tiles.
- Country/state/administrative boundaries.
- Road centerlines and road attributes.
- Pedestrian sidewalks, paths, crossings, bridges, tunnels, and access restrictions.
- Street intersections and routable network topology.
- Address points, parcels, building footprints, entrances, floors, and indoor geometry.
- Elevation, bathymetry, terrain, land cover, hydrography, and aerial imagery.

Every imported feature requires source, license/attribution, source ID, source version or retrieval date, geometry CRS, feature class, and confidence/quality metadata. Displaying a road line does not establish that pedestrians may legally or physically walk along it.

## Files

- `ao-global-geographic-reference.mjs`: global WGS84 observation validation and explicit AO-region selection, wrapping the existing spatial-addressing resolver.
- `ao-spatial-addressing.mjs`: existing local metric Region → Chunk → Tile → Cell address primitives and persistence boundary contract.
- `geography/ao-houston-gps-street-atlas.html`: Houston test map only; not the global atlas.

## Integration gates

1. Approve and load the global AO region registry and its authoritative boundaries.
2. Load source/coverage catalogs for each geography layer, with attribution and licensing.
3. Validate global coordinate ingestion, antimeridian cases, poles, region edges, overlaps, gaps, and local-frame radius limits.
4. Add GPS uncertainty handling and accuracy-aware cell confidence.
5. Build a globally addressable street/pedestrian graph; do not infer routability from centerlines alone.
6. Connect candidate addresses to Kernel-validated movement and atomic WorldHeart event/current-state commits.
7. Add Builder and Play map views over the same shared geographic registry.

This PR establishes the geographic contract and resolver boundary. It does not claim that worldwide GIS datasets have already been imported or that GPS movement is connected to the live world.
