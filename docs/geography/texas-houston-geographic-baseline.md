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
- Use an appropriate local projected CRS for distance, area, engineering-like geometry operations, and indoor/building measurements. The City of Houston COH Limits service reports spatial reference WKID 102740 / EPSG:2278 (NAD83 / Texas South Central, US survey feet); transform explicitly rather than treating its coordinates as longitude/latitude.
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
2. Harris County GIS City of Houston boundary layer: https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer/2
   - Layer 2: `COH_City_Limit`
   - Service description says the boundary was digitized from legal descriptions maintained by City Planning and Development GIS.
   - It distinguishes Full Service, Limited Service, and Pending polygons. Pending areas are under review and are not current city limits. Preserve these distinctions; do not union all three into one undifferentiated city polygon.
   - Service spatial reference: WKID 102740 / EPSG:2278, US survey feet.
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


## 12. Source metadata correction (2026-11-20)

A fresh review of the City of Houston ArcGIS service metadata confirms the service spatial reference is WKID 102740 (EPSG:2278), not EPSG:2277. EPSG:2278 is NAD83 / Texas South Central (US survey feet). Any prior references to EPSG:2277 for this city-limits service are superseded.

The service metadata describes the city-limit service types as Full Service, Limited Service, and Pending. A separate public view layer exposes the values FULL and LIMITED and was last edited in May 2025. Treat that view as a corroborating layer, not as proof that Pending records are absent from the authoritative source. Inspect the current source layer's actual fields and returned values during acquisition before filtering.

The U.S. Census Bureau's 2024 TIGER/Line release is now available; its legal boundaries and names are stated as of January 1, 2024, with release date September 25, 2024. Use the 2024 vintage for the state boundary baseline. The purpose is a stable baseline, not real-time administrative change tracking.


## 13. Upper Texas Gulf Coast natural geography extension

**Regional scope:** Texas → upper Texas Gulf Coast → Trinity–San Jacinto Estuary (Galveston Bay) and neighboring coastal systems → Houston metropolitan area → City of Houston.

Do not use the City of Houston boundary as the extent of the natural-geography model. Watersheds and river networks cross administrative boundaries and may extend hundreds of miles inland.

### Distinct systems to represent

- **Galveston Bay / Trinity–San Jacinto Estuary:** Trinity River, San Jacinto River, Buffalo Bayou, surrounding coastal watersheds, Trinity Bay, Galveston Bay, East Bay, West Bay, Houston Ship Channel, Gulf Intracoastal Waterway, and Gulf passes including Bolivar Roads and San Luis Pass.
- **Neighboring coastal drainage systems:** Brazos River and San Bernard River systems are separate neighboring drainage systems. Do not connect them to Galveston Bay as though they were tributaries of the estuary.
- **Coastal transition:** tidal rivers and bayous, estuarine waterbodies, wetlands, tidal flats, barrier islands, inlets/passes, nearshore Gulf waters, continental shelf, and deeper seafloor.
- **Urban hydrology:** Buffalo Bayou, Brays Bayou, White Oak Bayou, Sims Bayou, and tributaries must be mapped as connected hydrographic features, with actual flow-network topology retained where the source provides it.

### Data sources selected for the globe extension

| Layer | Selected source | Use and limitation |
|---|---|---|
| Major river basins | USGS WBD HUC-6, FeatureServer layer 3 | Major basin boundaries intersecting the regional study extent; neighboring basins remain separate. |
| Subbasins | USGS WBD HUC-8, FeatureServer layer 4 | Regional subbasin boundaries; not a substitute for a fully delineated Galveston Bay watershed polygon. |
| Rivers, canals, drainageways | USGS 3DHP_all Flowline, FeatureServer layer 50 | Flowline geometry and available feature type, flow direction, stream order, and length attributes. |
| Waterbody edges | USGS 3DHP_all Waterbody, FeatureServer layer 60 | River and ocean/waterbody polygon edges for visualization; not a surveyed tidal-datum shoreline. |
| Gulf seafloor visualization | Gulf of Mexico shaded-relief tile service maintained through GCOOS | Qualitative hillshade only. It is not an absolute-depth dataset. |
| Canonical coastal elevation/depth | NOAA NCEI Coastal Relief Model and source bathymetric grids | Preferred source family for a later measured elevation/depth surface, retaining horizontal/vertical datum, resolution, survey lineage, and uncertainty. |

USGS describes 3DHP as a national hydrography service with flowlines, hydrolocations, and waterbodies; where elevation-derived hydrography is not yet available, the service supplements with NHD data. The WBD provides hydrologic-unit boundaries. Preserve that source lineage and do not imply every feature is derived from a single uniform vintage.

### Current globe implementation

The downloadable globe has runtime layers for:
- HUC-6 major basin boundaries;
- HUC-8 subbasin boundaries;
- river, canal, and drainageway flowlines;
- clipped waterbody/ocean polygon boundary segments;
- a low-zoom Gulf bathymetry shaded-relief mosaic;
- focus controls for Houston, Galveston Bay, and the upper Gulf Coast;
- independent visibility toggles for each natural-geography layer.

The browser requests a bounded regional envelope (west -99.0°, south 25.2°, east -92.5°, north 34.5°). This is a visualization/query window, not the outer boundary of the Galveston Bay watershed. HUC-6 units returned by the service represent complete units intersecting the window; HUC-8 coverage is a regional subbasin view. The current view must not be described as a fully complete watershed inventory until upstream coverage and the exact estuary drainage-area definition are validated.

The browser overlays are not canonical AO geography. They do not write to the AO Kernel, WorldHeart, or Supabase. The bathymetry overlay is hillshade and cannot be used to infer absolute depth. The coast and estuary boundaries are hydrography visualization edges, not a legal coastline or tidal-datum shoreline. All runtime layers require internet access.

### Hydrologic integrity requirements

- A watershed is a terrain-derived drainage area, not a circular buffer or city outline.
- Basin/subbasin boundaries and flowline geometry must retain source IDs and hydrologic unit codes.
- Flow direction, confluences, divergences, terminals, waterbody outlets, and network connectivity must be represented as distinct relationships where source attributes support them.
- Do not infer flow connectivity merely because two lines visually touch; preserve grade, culvert, connector, and waterbody transitions where available.
- Freshwater inflow and tidal/saltwater exchange are different processes. Galveston Bay is an estuary, not a freshwater lake or a simple river mouth.
- The Trinity, San Jacinto, and Buffalo Bayou are major freshwater contributors identified by NOAA; the TWDB describes the estuary as including Trinity Bay, Galveston Bay, East Bay, West Bay, and Gulf passes at Bolivar Roads, San Luis Pass, and Rollover Pass.
- Neighboring Brazos and San Bernard coastal systems remain separate unless a validated hydrologic connection is present.
- Bathymetry must retain depth values, units, vertical datum, resolution, source surveys, interpolation method, and uncertainty. A shaded-relief image is visualization only.
- Coastlines, shorelines, tidal boundaries, wetlands, and barrier islands are separate feature types and must be versioned independently.

### Source references

- USGS 3DHP access and products: https://www.usgs.gov/3d-hydrography-program/access-3dhp-data-products
- USGS WBD/National Hydrography access: https://www.usgs.gov/national-hydrography/access-national-hydrography-products
- Texas Water Development Board, Trinity–San Jacinto Estuary: https://www.twdb.texas.gov/surfacewater/bays/major_estuaries/trinity_san_jacinto/
- NOAA NCEI Coastal Relief Model: https://www.ncei.noaa.gov/products/coastal-relief-model
- Gulf bathymetry shaded-relief service: https://tiles.arcgis.com/tiles/qr14biwnHA6Vis6l/arcgis/rest/services/Shaded_Relief_Visualization_of_Gulf_of_Mexico_Bathymetry/MapServer


### Wetlands and coastal habitat layer

The globe includes an optional USFWS National Wetlands Inventory (NWI) polygon-boundary overlay for:
- Estuarine and Marine Wetland;
- Freshwater Emergent Wetland;
- Freshwater Forested/Shrub Wetland.

Wetland boundaries are outlined and styled by broad class; they are not rendered as filled habitat polygons. The source is the USFWS NWI REST Map Service, which the Service says is updated biannually. NWI is a mapped inventory with scale and aerial-imagery detection limitations; it is not a complete ecological inventory and must not be used alone for regulatory wetland determinations. Retain project metadata, imagery dates, mapping scale, and source vintage when importing these features into the canonical registry.

Source: https://www.fws.gov/program/national-wetlands-inventory/web-mapping-services

## 14. Geographic positioning and pedestrian travel preview

The current implementation priority is to identify locations, determine their geographic positions, and estimate walking travel time between them. Advanced hydrologic, ecological, erosion, and bathymetric simulation is not required for this stage.

### Immediate navigation requirements

- Every place or geographic feature receives a stable AO identity and a geographic position or geometry appropriate to its type.
- A point is a locator; a road, path, city, building, river, or region retains its actual geometry.
- Pedestrian routing follows walkable streets, sidewalks, paths, crossings, bridges, and permitted connections. It must not assume that straight-line distance is a traversable route.
- Report route distance separately from straight-line distance.
- Estimate travel time from route distance and a baseline walking speed initially; later Kernel movement can modify speed using the character's capabilities, condition, terrain, and other relevant factors.
- If no valid pedestrian route exists, report that rather than inventing a route or falling back silently to straight-line distance.
- Preserve routing source, data vintage, route geometry, distance, duration, and calculation timestamp.

### Current browser preview

The downloadable globe now includes a coordinate-based pedestrian route preview using the FOSSGIS OSRM foot profile over OpenStreetMap data. It draws the returned route and reports route distance and the service's estimated walking duration. The route service requires internet access, has a published one-request-per-second usage limit, logs route requests, and is intended only for light, non-commercial use. It is a prototype dependency, not AO's production routing authority.

The preview currently accepts longitude/latitude coordinate pairs. It does not yet provide place-name search, a saved place directory, or an AO-owned pedestrian network. No route is stored in the Kernel or WorldHeart. The returned time is an external baseline estimate, not an individual character's authoritative movement time.

Source and usage policy: https://routing.openstreetmap.de/about.html
