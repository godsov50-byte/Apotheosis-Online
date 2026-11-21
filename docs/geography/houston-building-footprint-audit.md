# Houston building footprint inventory and audit

**Status:** Acquisition workflow implemented; count pending successful source retrieval and QA.  
**Scope:** City of Houston Full Service and Limited Service boundary polygons, matching the existing Houston citywide geographic baseline. This is not the Houston metropolitan area, Harris County, or the separate downtown-only prototype extent.

## Purpose

Produce a reproducible count of building-footprint source features inside the current Houston city boundary. Do not estimate the number from road counts, parcel counts, addresses, businesses, or map appearance.

## Selected source

Primary source: [H-GAC Building Footprints 2018, Harris County layer](https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0).

- Polygon footprints derived from 2018 LiDAR.
- Harris County delivery date stated by the source: 2019-06-24.
- Attributes include source ObjectID, `GeomType`, and `HGAC_Parcel_Number`.
- Source explicitly warns that LiDAR classification can produce false positives and that the layer is informational, not a ground survey.
- Attribution to Houston-Galveston Area Council and Esri is required by the service notice.

Boundary source: [Harris County GIS City of Houston limits, layer 2](https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer/2). The existing acquisition script preserves service-type properties. The audit includes Full Service and Limited Service polygons and excludes Pending areas.

## Counting rules

1. Acquire the same official city-limit polygons used by the Houston geographic baseline.
2. Query source footprints intersecting those polygons, using paginated ArcGIS queries.
3. Deduplicate source features by the source ObjectID across boundary polygons.
4. Count a source footprint as inside when its representative point lies within the union of Full/Limited Service boundaries.
5. Report intersecting features whose representative point is outside separately. This avoids silently counting every edge-touching feature as an in-city building.
6. Report invalid/empty geometries separately.
7. Preserve the original source features and metadata as a downloadable CI artifact. Do not commit a large raw snapshot to Git.

## What the count means—and does not mean

The primary figure is a **unique source-footprint feature count**, not a verified count of physically distinct buildings. One structure may be represented by multiple polygons; attached structures may be merged; some footprints may be missing or misclassified. The 2018 source vintage also means demolitions and newer construction may not be reflected.

Do not infer residential/commercial/industrial use from `GeomType` unless the source domain is inspected and documented. Do not treat parcel IDs as building IDs. A parcel may contain multiple buildings; one building may span parcels. Businesses and institutions require separate address/establishment inventories.

A newer City of Houston/Harris County 3D building dataset describes parcel number, height, address, ZIP code, and department information but is limited to a downtown-area extent. It may be used later as a local cross-check, not as the citywide source or a duplicate count to add to H-GAC.

## Reproduction

The workflow `.github/workflows/houston-building-footprint-audit.yml`:
- runs a script self-test;
- acquires the City of Houston legal/service boundary polygons;
- queries the H-GAC building-footprint layer in pages;
- deduplicates, classifies, and counts features;
- uploads GeoJSON, source metadata, and the audit report as a CI artifact.

The workflow does not write to Supabase, the live AO world, or the geographic registry.

## Acceptance criteria

- Boundary classes and extent are explicit.
- Source metadata, CRS, vintage, attribution, and limitations are retained.
- Pagination completes without transfer-limit warnings or duplicate source IDs.
- Every returned feature has a source ObjectID and polygon geometry.
- The final report separates centroid-inside, boundary-intersection-only, and invalid geometry counts.
- No count is described as current/ground-truth or as unique physical buildings without independent validation.
