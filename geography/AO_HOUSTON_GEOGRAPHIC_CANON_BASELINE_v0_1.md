# AO Houston Geographic Canon Baseline v0.1

**Status:** Source-backed geographic reference facts locked; feature-level geometry remains evidence/provisional until a reproducible source snapshot is acquired, validated and registered.
**Scope:** Houston test geography only. This document does not establish AO Texas borders, a complete Houston city-region boundary, world geography, historical canon, building interiors, ownership, occupancy or live-world state.
**Authority:** Geographic source records are evidence. The AO Kernel remains authoritative for world state; WorldHeart persists approved state and append-only history. A GIS/GPS source does not directly write canon.

## 1. Canon lock decision

The following distinctions are locked:

1. Preserve source geometry and source attributes without silently rewriting them.
2. Preserve each dataset's publisher, layer, CRS, retrieval date, version/snapshot, licence/attribution, coverage and validation results.
3. A source feature is **source-backed geographic evidence**, not automatically a verified AO fact about current physical conditions.
4. Derived geometry, inferred intersections, graph connectivity, entrance connectors and inferred building attributes remain **candidate/provisional** until independently validated.
5. Missing coverage is UNKNOWN. It must not be filled with invented roads, buildings, entrances, floors, elevations, sidewalks, rooms or access.
6. Source corrections create versioned amendments; never silently overwrite the prior source snapshot or its history.
7. GPS coordinates are observations/inputs. They are not proof of legal access, physical traversability, occupancy or world-state authority.

## 2. Geographic reference facts

### 2.1 City limits

**Reference source:** City of Houston, COH_Limits FeatureServer, layer 0  
https://services.arcgis.com/su8ic9KbA7PYVxPS/ArcGIS/rest/services/COH_Limits/FeatureServer/0

The publisher describes the boundary as digitized from legal descriptions maintained by the City of Houston Planning and Development Department, with legality established through City Council approval. The layer distinguishes:
- **Full Service:** full-purpose City limits.
- **Limited Service:** limited-purpose City limits.
- **Pending:** area under review, not current City limits.

**Locked handling:** retain these categories as separate attributes. Pending polygons are not current municipal territory. Do not merge full-purpose, limited-purpose and pending areas into one undifferentiated boundary.

This is a municipal reference layer, not the AO Houston region boundary by automatic equivalence. The AO test-region extent must be explicitly declared separately.

### 2.2 Road centerlines

**Reference source:** City of Houston COH_RoadCenterline FeatureServer, layer 0  
https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0

The publisher describes this as its road-centerline database for Houston and its ETJ, compiled from Greater Harris County 911 roads and private, access and proposed roads from StarMap, with updates informed by committee feedback, approved plats and permit records.

The service metadata reports spatial reference **102740 / EPSG:2278 (Texas South Central, US survey feet)** and a maximum query record count of 2,000.

Acquired source snapshot (2026-11-21):
- 83,760 source records and 83,760 unique OBJECTIDs / GlobalIDs.
- 83,749 records with geometry; 11 records with null geometry (preserved, not fabricated).
- Source data last-edit timestamp reported by the service: 2026-09-25T18:08:41.727Z.
- Source CRS EPSG:2278 (US survey feet); downloaded geometry EPSG:4326, longitude/latitude.
- First acquisition raw GeoJSON SHA-256: `1de423c634c05a36e79df99e7e33710c799a0eb9d2abdbb10f18abbfa11c8b1d` (provisional; feature order was not canonical).
- A second acquisition returned the same 83,760 source IDs and feature content when matched by OBJECTID, but a different raw file hash (`fe9c03b3b8293d01de76abc86d54d6697827df16e1a40521d4caf1b866003206`) because service page ordering varied.
- The acquisition code now sorts features by source OBJECTID before serialization and hashing. A fresh canonical acquisition is running; its checksum will supersede both order-sensitive hashes.
- First source artifact archive SHA-256: `bf756e2658cbc8c924fad412ea128e3dbef7f1d78832a11f7d8f528f5c135c9c` (temporary workflow artifact).
- Deterministic registry: 83,760 segments, 17,287 name groups, 17,210 distinct named labels, 50 unnamed segments.
- Workflow run: https://github.com/godsov50-byte/Apotheosis-Online/actions/runs/44931115238; artifact ID `14717154555`.

**Locked handling:** this exact acquired snapshot is accepted as source-backed road-centerline evidence for the source query scope stated above. It is not a road-surface geometry or pedestrian navigation graph. Null geometries remain missing. Candidate graph intersections and connectivity are not confirmed legal or physical crossings. Private, access and proposed roads retain their source classifications and must not be assumed publicly traversable. The artifact is currently held in GitHub Actions with a 30-day expiry; a permanent archive copy is still required before calling the dataset durably archived.

### 2.3 Building footprints

**Reference source:** H-GAC / Harris County Flood Control District, Building Footprints 2018, MapServer layer 0  
https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0

Publisher metadata states that the polygons derive from 2018 LiDAR classifications/returns and warns that misclassification can produce erroneous footprints. The publisher also states that the data is informational, approximate, not an on-the-ground survey, and may not reflect actual ground conditions. Attribution to H-GAC is required.

Previously inspected subset recorded in the repository's working manifest:
- 523 features.
- 486 distinct parcel references.
- 0 invalid geometries in that inspected subset.
- Approximate inspected coverage: 10.9 × 7.6 miles.
- The inspected subset is partial, not citywide.

**Locked handling:** this layer is approximate, dated 2018 source evidence. Its inspected subset statistics do not establish citywide coverage. A footprint does not establish current existence, building identity, floor count, height, use, entrance, interior, occupancy, ownership or accessibility. Parcel references attached to footprints are not a substitute for acquired and validated parcel polygons.

### 2.4 Downtown 3D building footprints

**Candidate source:** City/Harris 3D building footprint service  
https://services6.arcgis.com/2yF1BNcZtu43QAOt/arcgis/rest/services/BldgDept3D_new_Jul282026/FeatureServer

The repository's working manifest describes this as a small downtown-focused dataset with candidate height, address and parcel fields.

**Status:** candidate source only. Its actual layer schema, date, coverage, vertical reference and licensing must be checked before use. It is not citywide coverage.

### 2.5 Downtown tunnel network

**Candidate source:** Downtown tunnel system item  
https://www.arcgis.com/home/item.html?id=bcae89f9f17447a795bbba2f55d3650c

The working manifest identifies possible tunnel businesses, access points, ingress/egress, paths, access restrictions and connected buildings.

**Status:** candidate source only. Validate live layer schemas, feature coverage, access states, levels and connectivity before import. Do not assume every mapped tunnel or building connection is currently open.


### 2.6 Official site-address points

**Reference source:** City of Houston COH_SiteAddresses, FeatureServer layer 0  
https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_SiteAddresses/FeatureServer/0

The City describes this as its most complete and official address repository. The layer is point geometry in EPSG:2278 (US survey feet), supports GeoJSON queries and has a 2,000-record service limit. The publisher explicitly warns that the dataset still requires cleanup and is continuously maintained. Address statuses distinguish permanent City addresses (COH), preliminary (PRE), reverse-geocoded (RVSG), utility (UTA), abandoned (ABD), county (CNTY), out-of-range (OOR) and CenterPoint (CP) addresses. Address types also distinguish residential, commercial, industrial, non-structural, parcel, park, vacant and other records.

**Locked handling:** candidate reference layer for address matching and geocoding only after a versioned full snapshot is acquired. Preserve status and type as separate fields. Do not treat every point as a building, inhabited location, entrance or valid current address. Preliminary, reverse-geocoded, abandoned and utility records must not be silently treated as permanent occupied addresses.

### 2.7 Multi-county parcel polygons

**Reference source:** City of Houston EGIS/HOUSTON_CITYINFO, COH_MULTI_COUNTY_PARCELS, MapServer layer 2  
https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer/2

The service describes the layer as full HCAD parcels plus partial parcels from FBCAD, MCAD and WCAD. It reports a quarterly maintenance cycle and a most recent update completed September 2026. The layer is polygon geometry in EPSG:3857, supports pagination and has a 2,000-record service limit. Its description says it is intended for GIS mapping and requires independent verification for specific applications.

**Locked handling:** source candidate for parcel context and spatial association. It is not automatically a legal boundary, ownership authority, building footprint or proof of access. Preserve county, tax ID, source date and coverage distinctions; do not imply full neighbouring-county coverage from the phrase “multi-county.” Acquire and validate a complete snapshot before accepting individual parcel geometries as source-backed features.

### 2.8 City street-intersection reference points

**Reference source:** City of Houston EGIS/HOUSTON_CITYINFO, COH_STREET_INTERSECTIONS, MapServer layer 3  
https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer/3

The City describes this as street-intersection points across Houston, with address-verification and city-service attributes. It reports an annual update cycle, most recently October 8, 2026. The publisher explicitly warns that the layer has no permanent unique ID; the PlusCode is unique only within a given layer snapshot and can change when an intersection shifts. The layer is point geometry in EPSG:3857.

**Locked handling:** use as an independent intersection-reference/cross-check layer only after snapshot acquisition. Never use OBJECTID, PlusCode, names or coordinates as a permanent cross-version identity. Derive an AO-stable identity only from a documented versioned matching process and retain the source locator separately. The point layer does not establish grade separation, legal crossing, pedestrian accessibility or current signal state.


### 2.9 Address-point entrance anchors and road-side relationships

**AO placement convention (design rule):** each eligible address point supplies the default entrance-anchor coordinate. The default anchor is placed at the exact coordinate of the address point—the point itself is the anchor. It is not offset to a building footprint, parcel centroid, road centerline or guessed doorway.

This is an AO spatial-placement convention, not a claim that the source address point is a surveyed physical doorway. Preserve the source address point and its status/type. Only address records eligible under the source's status/type rules may be used as active default anchors; preliminary, reverse-geocoded, abandoned, utility, out-of-range and other special records remain separately classified until explicitly accepted.

**Both sides of a road:** address points and their associated parcel/address records may lie on either side of a road. AO must preserve the actual source coordinates and represent each address independently. Do not assume addresses occur on only one side, synthesize a matching address on the opposite side, force equal spacing, infer a side from odd/even numbering without source support, or move an address point merely to make a map look regular. A road-side relationship is derived spatial context, not a replacement for the address coordinate.

**Road connection:** the default entrance anchor may be associated with a nearby road segment through a separately stored candidate connector. A connector does not prove a legal, pedestrian-accessible or physically traversable entrance. Route use requires the connector/access state to be validated or explicitly admin-confirmed under AO's access policy. If no defensible connection exists, retain the anchor and mark its road connection UNKNOWN rather than inventing one.

**Relationship model (many-to-many where evidence requires):**
- Road ↔ parcel: frontage, adjacency, crossing or proximity relationships; never infer ownership or strict parentage from proximity alone.
- Parcel ↔ address point: zero or more source-backed address associations; preserve match method, confidence and source version.
- Parcel ↔ structure footprint: zero or more structures; a parcel may be vacant, one parcel may contain multiple structures, and a structure may span multiple parcels.
- Address point ↔ default entrance anchor: one-to-one placement by coordinate under this AO convention, with provenance to the exact address record/version.
- Address point ↔ physical entrance / structure: only when independently supported or admin-confirmed. Do not equate an address point with a building, doorway, occupied unit or structure.
- Entrance anchor ↔ road segment: candidate or confirmed connector with its own evidence/access state; never silently treat geometric nearness as walkable access.

**Layer priority for the Houston geographic foundation:**
1. **Road network and parcel polygons** are the primary geographic framework: roads describe movement/connectivity references; parcels describe land divisions.
2. **Address points** are the location-identification and default entrance-anchor layer, retained on whichever side of the road the source places them.
3. **Building footprints and interiors** are supplementary physical layers. They can refine structure/entrance relationships but are not prerequisites for an address anchor and must not redefine the parcel or address.

The City site-address and multi-county parcel layers remain candidate sources until complete versioned snapshots pass the acquisition gate in §6. This design rule does not upgrade their unacquired features to source-backed or validated status.


### 2.10 Address location-sign coordinate and tile identity

The small location sign / map marker displayed above an address is a **rendered representation of that address's default entrance anchor**, not a separate geographic object and not an independently guessed location.

- **World position:** the marker inherits the exact address-anchor coordinate. Its geographic position must not be shifted to the center of a parcel, structure, road or screen.
- **Spatial address:** resolve that coordinate through AO's spatial hierarchy and store/reference the resulting World ID, Region ID, Chunk ID, Tile ID, Cell ID and local Position, together with the spatial layer and coordinate reference system. The coordinate remains the source of truth; tile/cell IDs are deterministic spatial indexes derived from it.
- **Visual offset:** the sign may be drawn slightly above the ground/address point for legibility, but that is a presentation-only screen/world-render offset. It must not change the stored geographic coordinate, tile/cell assignment, collision position, entrance anchor or route origin.
- **Boundary handling:** if the coordinate lies on a tile/chunk boundary, use one documented deterministic boundary rule so the same coordinate always resolves to the same address. Preserve sufficient coordinate precision to reproduce the assignment.
- **Layer and elevation:** retain the applicable spatial layer (for example, surface/outdoor) and elevation/vertical datum when known. Do not invent altitude or treat a 2D address point as an interior-floor, underground or aerial position.
- **Identity and updates:** bind the marker to the stable AO address-anchor record, with the source address ID/version retained as provenance. If a corrected source coordinate moves the anchor into another tile/cell, record a versioned spatial relocation; do not silently mutate history.
- **Provisional resolution parameters:** the Spatial Addressing prototype's 1,024 m chunk / 64 m tile / 1 m cell values are engineering defaults only, not approved AO canon. The authoritative tile scheme, origin, projection and boundary convention must be selected and validated before production indexing.

The marker may be hidden, clustered or visually displaced for interface clarity at different zoom levels, but its underlying address-anchor coordinate and resolved spatial address remain stable. This rule applies independently to addresses on both sides of a road.

## 3. Layers not yet established

The following are not locked as complete geographic truth because the current source inventory does not demonstrate adequate acquired and validated coverage:
- Sidewalks, curb ramps, crossings and pedestrian access.
- Road surfaces, lanes, turn restrictions and grade-separated topology.
- Complete citywide building footprints and authoritative building identities.
- Verified building entrances, floor counts, floor elevations, rooms and basements.
- Terrain/elevation raster or point cloud with a known vertical datum.
- Complete underground and tunnel connections.
- Water boundaries, bridges, culverts and navigable airspace.
- A complete parcel snapshot with licence, date, CRS and coverage validation.
- Actual device GPS tracks or surveyed control points.\n- Acquired, checksummed full snapshots of the official site-address, parcel and street-intersection candidate layers above.

## 4. Coordinate and spatial-addressing policy

- Preserve raw source coordinates and the source CRS for every imported feature.
- The road, H-GAC footprint and City limit sources above report **EPSG:2278** in their service metadata; do not reinterpret their numeric coordinates as latitude/longitude.
- GPS input is WGS84 latitude/longitude (EPSG:4326) when supplied by a device or source. Store the raw observation, timestamp, accuracy estimate and source metadata when available.
- A transformation into AO world coordinates must name the source CRS, target CRS, transformation pipeline/version, units and any vertical datum. Keep the raw source coordinates for audit.
- The vertical datum is UNKNOWN unless explicitly supplied and validated. GPS altitude must not be treated as surveyed elevation.
- The 1,024 m chunk / 64 m tile / 1 m cell defaults in the spatial-addressing prototype are engineering defaults only; they are **not locked canon**.
- The Houston test origin, bounds and local equirectangular fixture in the spatial prototype are test data only; they are **not locked geographic canon**.
- Do not establish a global AO coordinate projection from a single Houston-local approximation.

## 5. Evidence and acceptance states

Use these statuses independently for each source and each feature:
- **Source-backed:** faithfully acquired from a named source snapshot; not necessarily verified on the ground.
- **Validated geometry:** passed documented geometry/CRS/coverage checks.
- **Cross-checked:** corroborated by an independent authoritative source or survey.
- **Admin-confirmed:** a named authorized reviewer inspected and confirmed a specific fact or connection.
- **Provisional / inferred:** derived or proposed; not canon.
- **Unknown / unavailable:** evidence absent, incomplete, ambiguous or inaccessible.
- **Superseded:** retained historically but replaced by a newer version.

No status may be upgraded merely because a feature renders on the map or a route algorithm connects it.

## 6. Acquisition gate before feature-level geographic canon

A source snapshot is eligible for feature-level baseline acceptance only when its import manifest records:
1. Publisher, dataset title, exact service/item/layer URL and layer ID.
2. Retrieval timestamp and source snapshot/version or last-edit date.
3. Licence/terms and required attribution.
4. Source CRS, units and vertical datum where applicable.
5. Explicit AO target extent and actual extracted coverage polygon.
6. Successful pagination/completeness evidence, feature count, null/invalid/duplicate counts.
7. Raw snapshot checksum and immutable stored source artifact.
8. Transformation pipeline/version and validation report.
9. Known omissions, caveats and reviewer/status.

The road-centerline acquisition workflow has now completed successfully and produced the source snapshot and registry described in §2.2. This exact road snapshot is locked as source-backed evidence, subject to the source scope and limitations above. The artifact's current 30-day retention is temporary; a durable archive copy remains outstanding. The building-footprint acquisition is still running and is not yet accepted. No citywide completeness claim is made for buildings or other unacquired layers.

## 7. Relationship to AO spatial addressing

The spatial-addressing resolver PR is a standalone prototype, not yet merged or connected to Kernel, WorldHeart, Supabase or the Houston builder. Its resolver and grid defaults are not promoted to canon by this document.

When integrated:
- The Kernel validates movement, access, collision, speed, permissions and transitions.
- WorldHeart persists current derived spatial state and append-only committed history.
- GIS/GPS sources populate evidence and candidate geometry; they do not bypass Kernel authority.
- A room, battle instance, aerial layer or teleport destination must retain explicit links to its physical/source location and its own simulation context.
- Missing chunks may be loaded or marked unavailable; unloading must never delete persistent state.

## 8. Amendment rule

Any change to a locked source fact, source classification or boundary interpretation must include the prior value, proposed value, source snapshots checked, coverage and temporal implications, affected spatial references, rationale, confidence and review status. Keep the prior record and source snapshot available for audit.

---

## External source references

- City of Houston COH_Limits service metadata: https://services.arcgis.com/su8ic9KbA7PYVxPS/ArcGIS/rest/services/COH_Limits/FeatureServer
- City of Houston COH_RoadCenterline service metadata: https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer
- H-GAC / HCFCD 2018 building-footprint layer metadata: https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0
