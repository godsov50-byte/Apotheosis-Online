# Houston GIS Source Manifest — Working Register

**Status:** candidate inventory; coverage and suitability must be checked per target AO boundary.
**Rule:** source availability is not the same as verified coverage or accepted world truth.

| Dataset | Candidate source | Geometry / value | Current confidence and caveats |
|---|---|---|---|
| City limits | City of Houston public boundary view | Municipal boundary reference | FULL/LIMITED categories exposed; public view omits Pending polygons; not survey-grade |
| Parcels | Harris Central Appraisal District GIS downloads: https://hcad.org/pdata/pdata-gis-downloads.html | Tax parcel polygons | Current and historical snapshots published; select target extent and snapshot, verify licence and fields |
| City cadastral parcels | City of Houston Cadastral MapServer layer 0: https://mycity2.houstontx.gov/gisweb02/rest/services/HoustonMap/Cadastral/MapServer/0 | Parcel polygons and parcel attributes | Large broad-area layer; clip/filter to AO boundary and verify count/coverage; earlier bbox count response was ambiguous |
| Road centerlines | City road centerline FeatureServer layer 0: https://services.arcgis.com/NummVBqZSIJKUeVR/arcgis/rest/services/COH_RoadCenterline/FeatureServer/0 | Lines, names, class, address ranges, one-way and other attributes | Candidate for graph construction, not physical road surfaces; service-wide count does not prove target coverage |
| H-GAC 2018 footprints | https://services1.arcgis.com/euMKmvUChvyJxWq2/arcgis/rest/services/LiDAR_Building_Footprints_2018_gdb/FeatureServer | LiDAR-derived building footprint polygons | Existing inspected subset: 523 features, 486 distinct parcel references, 0 invalid geometries in inspected subset; subset covers only about 10.9 × 7.6 miles and is not citywide; misclassification/omissions possible |
| City/Harris 3D footprints | https://services6.arcgis.com/2yF1BNcZtu43QAOt/arcgis/rest/services/BldgDept3D_new_Jul282026/FeatureServer | Footprints with candidate height/address/parcel fields | Small downtown-focused extent; useful for pilot, not citywide coverage |
| Downtown tunnel system | https://www.arcgis.com/home/item.html?id=bcae89f9f17447a795bbba2f55d3650c | Tunnel businesses, access points, ingress/egress, paths, access restrictions, connected buildings | High-value vertical network source; validate current layer schema and feature coverage before import |
| H-GAC / official road nodes and links | City GIS Nodes layer 10 and Links layer 12; see City open data portal https://houston-mycity.opendata.arcgis.com/ | Road topology candidates | Use to audit crossings/connectivity; crossing candidates are not automatically at-grade connections |
| Elevation / terrain | To be selected from authoritative local elevation/LiDAR sources | Raster/point elevation and terrain | Source, vertical datum, resolution and coverage still require verification |
| Sidewalks / road surfaces | To be selected from authoritative city/county sources | Polygon surfaces | Not yet verified as complete in the current source inventory |
| Entrances / floors / basements | Building-specific records and tunnel access datasets | Points, levels and connections | Do not infer from footprints; source coverage remains incomplete |

## Coverage facts already established

- An earlier road-centerline extraction contained 83,760 features, 11 with null geometry. An endpoint-derived candidate graph had 84,267 edges, 63,923 nodes and 607 connected components, with a largest component of 58,010 nodes. This is an unvalidated topology result, not a production navigation graph.
- An earlier road-crossing audit identified 2,672 possible interior crossings using a 2.0 m endpoint exclusion threshold. These are candidates only; grade separation and at-grade connectivity require validation.
- The H-GAC footprint subset is partial. Its feature count must never be represented as Houston-wide coverage.
- Parcel references found alongside footprints are not equivalent to acquired parcel polygons.
- A service's total feature count or advertised bounding box is not a coverage proof. Record actual tile coverage, successful pagination, null/invalid geometry counts and clipping results for every import run.

## Required fields for every future source registration

- publisher and dataset title;
- exact service/item/layer URL and layer ID;
- retrieval timestamp and source snapshot/version;
- source CRS and vertical datum (if applicable);
- licence/terms and attribution requirement;
- target AO boundary and actual extracted coverage polygon;
- feature count, null/invalid/duplicate counts and pagination status;
- raw snapshot checksum;
- transformation pipeline/version;
- confidence/status and known omissions.
