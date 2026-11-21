# Houston building footprint inventory and audit

**Status:** Reproducible partial-coverage count verified; citywide total remains unresolved.  
**Scope:** City of Houston Full Service and Limited Service boundary polygons, matching the existing Houston citywide geographic baseline. This is not the Houston metropolitan area, Harris County, or the separate downtown-only prototype extent.

## Purpose

Count mapped building-footprint source features inside the current Houston city boundary, while detecting when a footprint dataset does not cover the entire city. Never infer a building count from road segments, parcels, addresses, or businesses.

## Source used

[H-GAC 2018 Building Footprints, republished by City of Houston GeoHub, FeatureServer layer 4](https://geohwp.houstontx.gov/arcgis/rest/services/02_BaseData_Boundaries/Other/FeatureServer/4).

- Polygon footprints derived from 2018 LiDAR; Harris County delivery date stated by source: 2019-06-24.
- The City GeoHub layer was last updated 2022-01-25.
- Source attributes include ObjectID and parcel reference; a parcel reference is not a building identifier.
- The source warns that LiDAR classification can produce false positives and that the layer is informational, not a ground survey.
- Attribution to Houston-Galveston Area Council and Esri is required by the source notice.

Boundary source: [Harris County GIS City of Houston limits, layer 2](https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer/2). The acquisition script preserves service-type properties. The audit includes Full Service and Limited Service polygons and excludes Pending areas.

## Verified result and coverage limitation

The reproducible spatial query returned **523 unique source-footprint features** intersecting both the H-GAC layer's coverage and the selected Houston city-limit polygons.

**This is not the citywide building count.** The H-GAC layer's published spatial extent covers only part of the Houston city-limit geometry. The artifact inspection also confirmed that the returned footprint geometries occupy only a subset of the full city's geographic extent. The 523 figure is therefore a partial-coverage subtotal only.

A separate Microsoft Texas Building Footprints ArcGIS service was investigated because its indexed metadata advertised a statewide extent, but the live service endpoint returned an ArcGIS `Invalid URL` error during CI. It is not used for the reported result. The direct Microsoft Texas GeoJSON archive and other complete citywide sources still need retrieval and validation.

## Counting rules

1. Acquire the same official city-limit polygons used by the Houston geographic baseline.
2. Include only Full Service and Limited Service polygons; exclude Pending areas.
3. Dissolve the selected polygons into one spatial query geometry.
4. Query the H-GAC source for unique footprint features intersecting that geometry.
5. Preserve source metadata, source vintage, attribution, source extent, and coverage limitations in the report artifact.
6. Do not promote a partial-coverage subtotal to a citywide total.

## What the count does not mean

The 523 features are not 523 verified physical buildings across Houston. The source can omit structures or include misclassified polygons, and one source feature is not guaranteed to equal one physical building.

The source does not provide reliable citywide building use, occupancy, floors, entrances, internal divisions, or business tenancy. Parcels and buildings are different entities; businesses require separate establishment inventories.

## Reproduction

The workflow `.github/workflows/houston-building-footprint-audit.yml`:
- runs a script self-test;
- acquires the City of Houston legal/service boundary polygons;
- runs a spatial count query against the H-GAC source;
- uploads boundary geometry, source metadata, and the audit report as a CI artifact.

The workflow does not write to Supabase, the live AO world, or the geographic registry.

## Next data requirement

Before reporting a Houston-wide total, obtain a complete footprint source covering the entire legal city boundary. Candidate paths are the Texas Microsoft building-footprint archive, a complete Harris County structure/footprint dataset, and an OpenStreetMap building extract. Each source must be checked for full boundary coverage, vintage, licensing, omissions, false positives, and duplicate representation before counting or merging.

The 523 partial-source result remains a useful validation sample, not the answer to "how many buildings are in Houston?"
