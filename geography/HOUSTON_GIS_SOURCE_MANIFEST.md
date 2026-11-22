# Houston GIS Source Manifest — Working Register

**Status:** source inventory for AO staging conversion. This is not an approval of any feature as canonical AO world state.
**Rule:** source availability is not verified coverage, legal access, physical connectivity, or accepted world truth. Preserve each source's own status and uncertainty.

## Registered ArcGIS sources

The machine-readable catalog is `houston-source-catalog.json`; the acquisition entry point is `../scripts/geography/acquire_houston_ao_sources.py`. The catalog currently contains 36 feature-layer entries across these groups.

| Group | Source layers | AO staging use | Important limitation |
|---|---|---|---|
| Municipal boundary | City of Houston City Limits View (FeatureServer layer 0) | Municipal boundary candidate | Public view omits pending annexation polygons; not a legal survey |
| Parcels | City of Houston Cadastral Parcels (MapServer layer 0) | Parcel polygons and selected land-use/address attributes | Tax/cadastral evidence only; output whitelist excludes owner and mailing-contact fields |
| Addresses | Houston Site Addresses (FeatureServer layer 0) | Address point candidates | Includes multiple address statuses and types; not every point is a building entrance |
| Roads | City of Houston COH Road Centerline (FeatureServer layer 0) | Road centerline candidates | Not road-surface polygons, sidewalks, or approved movement edges |
| Sidewalks | Houston Public Works Sidewalks HPW KL (FeatureServer layer 0) | Sidewalk centerline candidates | City-maintained roadway inventory, polyline geometry; not complete sidewalk surface coverage or verified passability |
| Bikeways | City of Houston Bikeways (FeatureServer layer 0) | Bikeway candidates | Existing and proposed facilities are combined; retain status and do not automatically route |
| Trails | Houston Parks Board shared-use/trails layers 0–4 | Existing, proposed, conceptual, and unofficial trail candidates | Each status is a separate source collection; none is automatically routing-approved |
| Hydrography | H-GAC Hydrography polygons and Major Rivers lines | Waterbody and watercourse candidates | Not a depth, navigability, flood, bridge, or crossing model |
| Transit | H-GAC Regional Public Transit Agencies layers: METRO bus stops/routes, rail lines/stations, transit centers, park-and-ride, METRO service area, regional service areas | Transit stops, route geometry, facilities, and service-area candidates | GIS snapshots do not provide live schedules, operating status, or guaranteed current service |
| Emergency-service geography | City of Houston Fire Districts layer 11; older Fire Stations point layer 7 | Administrative service-area and facility candidates | Does not prove staffing, dispatch rules, station response times, current operational status, or hospital coverage |\n| Flood hazard | FEMA NFHL H-GAC 8-County 2026 layer 0 | Flood-hazard polygon candidates | Not a real-time flood forecast; retain zone codes and effective dates |\n| Transportation safety | City Vision Zero 2022 high-injury, bicycle-dangerous, and pedestrian-dangerous road layers | Safety-risk overlay candidates | 2022 network snapshot; not a current crash feed and does not automatically block movement |\n| Historic geography | City Historic Sites and Landmarks layer 6 | Historic-site point candidates | Point locations are not full property boundaries; preserve designation attributes |
| Buildings | H-GAC 2018 LiDAR footprints; City/Harris 3D building footprints | Building footprint candidates and selected source height/address metadata | H-GAC footprint acquisition previously inspected only a subset of 523 features across 486 parcel references; that subset is not citywide and may contain classification errors |
| Downtown tunnels | City of Houston Downtown Tunnel System layers 0–5 | Tunnel businesses, access points, portal candidates, underground paths, restriction-area candidates, and tunnel-associated building footprints | No automatic portal-to-building or portal-to-street connection; preserve underground level as a semantic layer, not surveyed Z |

### Source identity and conversion

- Each feature receives an AO staging ID containing the catalog dataset ID and a stable source GlobalID when available, otherwise the source object ID.
- Source attributes are preserved by default. Catalog field whitelists are used where fields are unnecessary or inappropriate for AO use, including parcel owner/mailing-contact fields and trail project contact fields.
- ArcGIS geometry is requested in WGS84 (EPSG:4326). Original source spatial-reference metadata, item attribution/licence fields, source modification date, query extent, downloaded geometry extent, feature counts, null-geometry counts, and output SHA-256 are recorded in manifests.
- Acquisition uses object-ID enumeration and bounded object-ID batches. A run fails a layer if returned object IDs are missing/duplicated, stable identities collide, or source edit metadata changes during acquisition.
- All output is marked `source_evidence_only` and `ao_kernel_approved=false`. No Kernel, WorldHeart, Supabase, or live-world writes occur.

## Sources still requiring a separate adapter or more evidence

| Dataset | Current finding | Next step |
|---|---|---|
| HCAD tax parcel shapefile | Official quarterly GIS ZIP at https://download.hcad.org/data/GIS/Parcels.zip; HCAD GIS download page last updated 2026-10-05 | Add a dedicated ZIP/shapefile ingestion adapter after capturing snapshot date, CRS, schema, licence and checksum |
| H-GAC 2024 LiDAR/DEM | Official 2024 LiDAR is available through H-GAC's purchase portal; listed price is $100 per tile for 1–50 tiles | Confirm purchase/licence and tile index before acquisition; verify horizontal CRS, vertical datum, units, resolution and deliverables |
| Road nodes and links | Prior working notes refer to City GIS Nodes layer 10 and Links layer 12, but the exact service and schemas have not yet been confirmed | Locate and inspect the actual layer endpoints; do not create links from nearest-point heuristics |
| Road-surface polygons | No verified complete surface layer registered | Search City/Harris sources; do not substitute road centerlines |
| Drainage assets, stormwater network, culverts and bridges | Appropriate City Public Works / Harris County Flood Control source layers not yet verified | Locate the relevant asset layers and preserve their different physical meanings |
| Building entrances, floors and basements | No complete authoritative source | Keep address points and tunnel portals as candidates; add verified building-specific records separately |

## Important source caveats

- City limits public view excludes pending annexation polygons. Keep boundary feature categories, effective dates and legal-document references intact; do not silently fill gaps.
- City cadastral parcels expose tax and assessment fields. The AO conversion whitelist deliberately excludes owner names and mailing contact fields.
- City site-address records contain statuses such as permanent, preliminary, abandoned, reverse-geocoded and utility addresses. Keep those statuses; do not treat all address points as entrances.
- The City sidewalk inventory is a polyline asset inventory. It does not establish full sidewalk width/surface geometry, crossings, curb ramps, legal access, or current passability.
- The Houston Parks Board trail source separates existing, proposed, conceptual, and unofficial layers. These must remain distinct in AO.
- The H-GAC hydrography layer includes polygon waterbodies and major-river centerlines. Neither proves depth, bank geometry, seasonal flow, or traversability.
- Transit source geometry is not a live GTFS feed. Service, schedules and stops may change independently.
- Tunnel ingress/egress sample records previously inspected had null building and address fields. Keep them as unlinked portal candidates.
- H-GAC 2018 building footprint data previously inspected covered only a partial area; do not label it a citywide building inventory.

## Retracted topology figures

Earlier draft notes contained road extraction and graph counts (including 83,760 road features, 84,267 edges, 63,923 nodes, 607 components, and 2,672 crossing candidates). Those figures were explicitly retracted and are not accepted measurements. Do not use them in AO design, import manifests, or claims. Recompute from a fresh, checksummed source snapshot before reporting any road-graph metrics.

## Required fields for every source registration

- publisher, dataset title, ArcGIS item/service/layer URL and layer ID;
- source item ID, licence/terms and attribution requirements;
- retrieval timestamp, source item modification date, and service edit metadata;
- source CRS and vertical datum when applicable;
- AO target boundary and query bbox;
- source feature count, downloaded feature count, null-geometry count, duplicate/missing-ID checks and pagination status;
- actual downloaded geometry extent and raw output checksum;
- output field whitelist (when used), geometry role, vertical layer, confidence and known omissions;
- transformation pipeline/version and approval state.
