# Texas → Houston Geographic Baseline

**Status:** Approved geographic scope; source acquisition and geometry validation pending  
**AO geography phase:** First regional implementation  
**Repository branch:** `feature/texas-houston-geographic-baseline`

## 1. Scope decision

The first AO real-world geographic region is **Texas, United States**. The first city to receive detailed geographic treatment is **Houston, Texas**.

This is a data and implementation priority, not a claim that AO is limited to Texas or that Houston is the center of the world.

### Geographic hierarchy

```text
Earth
└── United States
    └── Texas
        └── Houston metropolitan reference area [separate extent]
            └── City of Houston legal/administrative boundary
                ├── Natural geography
                ├── Transportation network
                ├── Land parcels and addresses
                ├── Building footprints and structures
                └── Building interiors (later indoor layer)
```

The Houston metropolitan reference area and the incorporated City of Houston boundary are distinct geometries. Do not silently substitute one for the other. The metropolitan boundary definition must be selected and versioned when regional coverage is implemented.

## 2. Geographic identity and coordinate rules

- Canonical interchange coordinates: WGS 84 longitude/latitude (EPSG:4326).
- S2 cell indexing consumes geographic coordinates; S2 IDs remain fixed-width hexadecimal strings and must never be coerced into JavaScript Number.
- Preserve every source dataset's native CRS and source identifier in provenance metadata.
- Use an appropriate local projected CRS for distance, area, engineering-like geometry operations, and indoor/building measurements. The City of Houston COH Limits service reports spatial reference WKID 102740 / EPSG:2277 (US survey feet); transform explicitly rather than treating its coordinates as longitude/latitude.
- Keep vertical datum, elevation units, and vertical accuracy explicit. Do not mix ellipsoidal height, orthometric elevation, and arbitrary local floor height.
- A city centroid or representative point is only a locator, never a substitute for the city's boundary polygon.

## 3. Initial Houston anchor

Use the name **Houston, Texas, United States** as the initial city anchor.

A representative downtown coordinate may be used for map centering and prototype navigation only:
- latitude: 29.7604
- longitude: -95.3698

This point is not the city center by legal definition, not the user's location, and not a boundary or routing origin. The official boundary geometry must determine whether a point lies inside Houston city limits.

## 4. Source hierarchy

Prefer official government GIS sources for administrative boundaries and municipal infrastructure. Use OpenStreetMap as a complementary, versioned source for broad road/building coverage where official data is unavailable or unsuitable. Never merge sources without retaining provenance and resolving duplicates/conflicts.

### Texas

1. Texas Geographic Information Office (TxGIO), the state geospatial clearinghouse: https://www.tnris.org/
2. U.S. Census TIGER/Line state and county boundaries for consistent national reference geography: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html
3. TxDOT GIS/open data for transportation datasets where applicable: https://www.txdot.gov/

A generalized cartographic state outline may be used for the globe's overview rendering, but not as a survey-grade state boundary or as the clipping authority for detailed road geometry.

### Houston

1. City of Houston GIS Open Data: https://houston-mycity.opendata.arcgis.com/
2. City of Houston COHGIS limits FeatureServer: https://services.arcgis.com/su8ic9KbA7PYVxPS/ArcGIS/rest/services/COH_Limits/FeatureServer
   - Layer 0: `COH_Limits`
   - Service description says the boundary was digitized from legal descriptions maintained by City Planning and Development GIS.
   - It distinguishes Full Service, Limited Service, and Pending polygons. Pending areas are under review and are not current city limits. Preserve these distinctions; do not union all three into one undifferentiated city polygon.
   - Service spatial reference: WKID 102740 / EPSG:2277, US survey feet.
3. Harris County GIS boundary services: https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer
4. Houston Public Works GeoHub for municipal infrastructure datasets: https://geohub.houstontx.gov/
5. OpenStreetMap for complementary road, path, and building coverage: https://www.openstreetmap.org/

City of Houston GIS data is published for general reference and carries accuracy/completeness disclaimers. Validate geometry, currency, topology, and intended use before using it for precise navigation or simulation.

## 5. Houston data layers to acquire

Acquire and validate in this order:

| Priority | Layer | Geometry / content | Primary purpose |
|---|---|---|---|
| P0 | Texas state boundary | Polygon | State-scale globe and regional containment |
| P0 | Houston full-purpose city limits | Polygon | Authoritative city extent |
| P0 | Houston limited-purpose and pending areas | Separate polygons/classes | Preserve administrative distinctions |
| P1 | Major roads and highways | Lines, junctions, attributes | Initial road graph |
| P1 | Waterways, bayous, lakes, coast/wetlands | Lines/polygons | Natural barriers and crossings |
| P1 | Elevation/terrain | Raster or terrain mesh | Slope, drainage, vertical geography |
| P2 | Local streets, sidewalks, paths, bridges | Network lines and structures | Detailed routing |
| P2 | Parcels and address points | Polygons/points | Address-to-place linkage |
| P2 | Building footprints | Polygons, building IDs where available | Outdoor-to-building transitions |
| P3 | Building levels, entrances, floor plans, rooms | 3D/indoor graph | Indoor navigation and room connectivity |

Do not invent room geometry from a building footprint. Indoor geometry requires sourced floor plans, approved authored data, or an explicitly labelled estimated/procedural model. Store the source and confidence of every interior feature.

## 6. Road and building connectivity model

A road is not just a line drawn on the globe. The routing graph must model:
- road segments with stable feature IDs, directionality, access restrictions, mode permissions, surface, and level/bridge/tunnel context;
- junction nodes where travel is actually connected;
- grade-separated crossings that visually intersect but do not connect;
- bridges, ramps, underpasses, sidewalks, crossings, and private/restricted access;
- temporal/source version so changed roads do not silently rewrite historical journeys.

A building must link to:
- one or more footprint geometries;
- one or more entrances, each with a geographic position and access state;
- a connecting road/path node or pedestrian-access edge;
- optional vertical circulation links (stairs, elevators, ramps);
- floors, corridors, doors, rooms, and interior objects when indoor data exists.

An entrance-to-road connection must be a real graph edge or validated access relation, not a nearest-line guess. Nearest-road matching may propose a connection but must be validated against barriers, entrances, access rules, and geometry.

## 7. AO continuous-space rule

The geographic graph and S2 cells are indexing and routing structures, not movement tiles. A character occupies a continuous position in world coordinates. Movement resolves against actual geometry, terrain, capability, access, and AO physical/metaphysical rules.

S2 cells organize retrieval and spatial partitioning. They do not define walls, rooms, road connectivity, movement steps, or legal boundaries.

Buildings and interiors remain connected to the same continuous world through entrances and vertical/horizontal transitions. Local building/floor coordinate frames may optimize indoor geometry, but must transform to and from the global geographic frame.

## 8. Provenance and versioning

Every imported or derived feature must retain at least:
- `feature_id` (AO stable identity);
- `source_name`, `source_dataset_id`, and source feature identifier;
- `source_url`;
- `source_crs` and normalized CRS;
- `source_updated_at` (if supplied), `retrieved_at`, and dataset/version identifier;
- `geometry_type`, geometry, and coordinate precision;
- `provenance_type`: imported, calculated, AO-transformed, procedurally generated, authored/approved, player-created, or simulation-derived;
- `validation_status`, `confidence`, and any known limitations.

Keep source snapshots or immutable import manifests so later corrections can be compared. Updating a source geometry must not silently erase AO-authored changes or committed world history.

## 9. First implementation sequence

1. Register Texas and Houston as geographic scopes in the AO geographic registry.
2. Acquire the Texas boundary and the City of Houston boundary dataset; inspect service fields and geometry types before filtering.
3. Preserve Full Service, Limited Service, and Pending Houston boundary classes independently.
4. Normalize geometry to WGS 84 for global indexing and generate/associate S2 cells.
5. Validate polygon closure, self-intersections, duplicate features, gaps, overlaps, and coordinate transformations.
6. Add Houston road and waterway datasets, then build a routable graph with bridge/tunnel/grade separation rules.
7. Add parcels, addresses, and building footprints; connect only verified entrances.
8. Add interiors only when actual or explicitly labelled estimated indoor data is available.
9. Render the same registered geometry in the globe, map, route system, and later 3D world view.

## 10. Acceptance criteria

- Texas and Houston have stable AO geographic identities.
- City limits are represented by source geometry, not a guessed bounding box or centroid.
- Houston city limits, limited-purpose areas, pending areas, and metropolitan coverage are not conflated.
- Every geometry has source, CRS, version, and validation metadata.
- S2 IDs are generated from normalized geographic geometry without precision loss.
- Road intersections connect only when topology and level/access rules permit.
- Grade-separated road crossings do not become false junctions.
- Building footprints do not automatically imply room or floor geometry.
- Every accepted building entrance has a validated connection to the outdoor pedestrian network.
- Outdoor and indoor coordinates transform into one continuous AO spatial frame.
- Imported geography remains distinct from AO metaphysical transformation and player-created world changes.

## 11. Known limitations / not yet done

- No Houston or Texas geometry has been imported into the AO registry by this document.
- No city boundary has yet been independently validated against a legal survey.
- The metropolitan reference-area definition is intentionally unresolved.
- Road, parcel, address, building, and indoor datasets still require source selection, licensing/terms review, retrieval, normalization, and QA.
- GPS is an outdoor positioning signal, not a reliable room-level indoor positioning system. Indoor location requires separate positioning inputs or authored navigation context.
