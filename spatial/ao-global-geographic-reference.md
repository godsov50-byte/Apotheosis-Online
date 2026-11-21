# AO Global Geographic Reference, GPS & Geographic Feature Bridge

## Purpose

AO uses **WGS84 / EPSG:4326** as its planet-wide geographic reference for latitude and longitude. GPS, GIS imports, surveyed coordinates, address points, and external map providers normalize into this common reference before AO spatial resolution.

The global coordinate reference is not one flat metric plane. AO keeps global geodetic coordinates and resolves them through explicitly configured, bounded local metric frames for AO Regions. Large countries, continents and broad territories require multiple approved AO regions. Each region uses the existing hierarchy:

**World → Region → Chunk → Tile → Cell → Position**

Default dimensions remain 1,024 m chunks, 64 m tiles and 1 m cells unless an approved world configuration says otherwise.

## Global coverage versus map-data coverage

- Every valid WGS84 latitude/longitude can be represented by the reference system.
- This does **not** mean every place already has road, path, address, parcel, building, elevation, hydrography or indoor-map data.
- No country, state, city, continent or test map defines the coordinate system's boundary.
- The United States is one geographic coverage area within the global system. Houston is a test location, not the system boundary.
- AO region IDs and geographic bounds must come from an approved region registry. GPS must never invent a region ID.
- Uncovered coordinates are rejected; overlapping region matches are rejected as ambiguous.
- Keep each local metric frame within its configured radius (250 km by default). Divide large territories into multiple AO regions.

No worldwide street/building dataset or final AO region registry is included in this change. Those are independent, provenance-tracked data acquisition and approval tasks.

## GPS and source observations

Every observation retains:
- CRS/datum: EPSG:4326 / WGS84.
- Latitude and longitude.
- Altitude, if supplied; otherwise null.
- Vertical datum and vertical accuracy, when known.
- Horizontal accuracy.
- Observation timestamp.
- Source type and optional source record ID.

Unknown altitude remains unknown in the observation. A local zero reference plane may be used to index a horizontal position, but it is not evidence of sea-level elevation.

The resolver also reports quality metadata:
- Whether horizontal accuracy is unknown, cell-scale, or coarser than the configured cell size.
- Whether the reported accuracy radius may reach the selected AO region boundary.

These values describe measurement quality; they do not convert GPS into proof of an exact cell or a legal route.

## GPS authority and privacy

- Device GPS is opt-in and requires explicit device/browser permission.
- A GPS fix measures a device, not an Envoy identity or canonical character position.
- GPS/GIS observations resolve only to `candidate-uncommitted` addresses.
- A candidate cannot move an Envoy, spawn an entity, change a building, or commit WorldHeart state/history.
- The Kernel validates intent, identity, permission, navigation, access, collision and world rules before any authorized movement.
- WorldHeart persists current state and append-only committed events only after Kernel authorization.
- Raw device coordinates are not uploaded or retained by default. Any future persistence requires a separate purpose, consent, retention and access policy.

## Geographic feature bridge

`spatial/ao-geographic-feature-registry.mjs` connects the global resolver to source GeoJSON used by the street and entrance work:

- Road centerlines and pedestrian paths can be imported as source geometries.
- Building footprints, entrance points, address points, intersections, crossings, bridges and tunnels retain their source properties and provenance.
- Each geometry coordinate resolves through the same WGS84 → AO Region → Chunk → Tile → Cell address system.
- Every feature requires source, license, source ID, source version or retrieval timestamp, feature class and confidence description.
- Imported roads remain unverified topology candidates. The bridge does not create a routable graph or assert sidewalk/pedestrian access.
- A feature spanning more than one AO region is flagged for explicit segmentation. It is not silently connected across region boundaries.
- Feature candidates cannot move entities or commit world state.

This is the data-contract bridge between the global reference and the street/entrance datasets developed in PRs #40 and #41. Their existing Houston browser workspace remains a staging/admin tool; it has not been converted into a global route engine or live Kernel adapter.

## Relationship to the four geographic projects

1. **PR #59 — Global geographic reference:** WGS84 observation, approved region selection, uncertainty metadata and geographic-feature bridge.
2. **PR #43 — Spatial addressing:** deterministic AO Region → Chunk → Tile → Cell → Position addressing.
3. **PR #40 — Street and entrance administration:** source road/building geometry, entrance placement and local admin workflows.
4. **PR #41 — Entrance-to-street connectors:** explicit candidate/confirmed entrance connectors. A nearby road is not proof of pedestrian access.

The shared flow is:

**GPS / GIS source → WGS84 validation → approved AO region → spatial address candidate → road/building/entrance feature candidate → topology/access validation → Kernel authorization → WorldHeart commit.**

The first five steps can prepare and inspect geographic candidates. Only the Kernel and WorldHeart authority path can commit gameplay state/history.

## Projection correctness

The existing spatial resolver uses a bounded local equirectangular approximation, not a global projection. Longitude deltas are normalized across the antimeridian. Regional radius checks use the horizontal AO ground plane (X/Z); altitude is the vertical Y axis and must not be counted as horizontal travel distance.

This remains a regional approximation, not survey-grade geodesy. Source CRS transformations must occur before import, and the original source CRS/provenance must be retained in the acquisition manifest.

## Validation

Run:

```bash
node --test spatial/ao-spatial-addressing.test.mjs
node --test spatial/ao-global-geographic-reference.test.mjs
node --check spatial/ao-geographic-feature-registry.mjs
```

The global suite covers WGS84 validation, region gaps/overlaps, antimeridian projection, north/south radius enforcement, altitude separation, observation accuracy, immutability, GPS metadata and GeoJSON road/entrance candidates.

## Not claimed complete by this PR

- No worldwide AO region boundaries or region IDs are invented or registered.
- No global roads, sidewalks, crossings, addresses, parcels, buildings, elevation or indoor datasets are imported.
- No road graph is automatically treated as pedestrian- or vehicle-routable.
- No live device GPS movement, anti-spoofing, Kernel movement adapter, WorldHeart spatial persistence adapter, Supabase migration or production deployment is included.
- Builder and Play do not yet share a deployed global geographic registry.

Those remaining tasks require authoritative datasets, explicit AO region approvals, and a tested Kernel/WorldHeart integration—not fabricated geographic records.
