# Houston building footprint inventory and audit

**Status:** Statewide source query implemented; final count pending the latest CI run.  
**Scope:** City of Houston Full Service and Limited Service boundary polygons, matching the existing Houston citywide geographic baseline. This is not the Houston metropolitan area, Harris County, or the separate downtown-only prototype extent.

## Purpose

Produce a reproducible count of mapped building-footprint features inside the current Houston city boundary. Do not estimate the number from road counts, parcel counts, addresses, businesses, or map appearance.

## Primary source

[Microsoft Texas Building Footprints, ArcGIS FeatureServer layer 0](https://services.arcgis.com/lqRTrQp2HrfnJt8U/ArcGIS/rest/services/Texas_BuildingFootprints/FeatureServer/0).

- Building footprints extracted from 2019-2020 imagery.
- Texas-wide geographic extent, queried spatially using only the selected Houston city-limit geometry.
- The service identifies the dataset as licensed under the Open Database License (ODbL).
- The audit uses ArcGIS `returnCountOnly` against the dissolved Full/Limited Service city-limit geometry, avoiding a full statewide download.

Boundary source: [Harris County GIS City of Houston limits, layer 2](https://www.gis.hctx.net/arcgis/rest/services/CoH/CoH_Boundaries/MapServer/2). The existing acquisition script preserves service-type properties. The audit includes Full Service and Limited Service polygons and excludes Pending areas.

## Secondary source / coverage warning

The [H-GAC 2018 LiDAR building-footprint layer republished by Houston GeoHub](https://geohwp.houstontx.gov/arcgis/rest/services/02_BaseData_Boundaries/Other/FeatureServer/4) was tested. Its metadata describes Harris County delivery, but its published extent is only a subset of the citywide boundary. A trial spatial query returned 523 intersecting source features, so it is **not** suitable as a complete Houston-wide inventory. That 523 figure is retained only as a partial-source diagnostic and must not be reported as the city building count.

## Counting rules

1. Acquire the same official city-limit polygons used by the Houston geographic baseline.
2. Include only Full Service and Limited Service polygons; exclude Pending areas.
3. Dissolve the selected polygons into one spatial query geometry.
4. Ask the statewide Microsoft source for the number of unique footprint polygon features intersecting that geometry.
5. Preserve source metadata, source vintage, license, boundary classes, and count definition in the report artifact.

The result is a source-footprint feature count. It is not a survey-certified count of physically distinct structures. Some polygons may be missing, misclassified, or represent attached/complex structures in ways that do not map one-to-one to buildings.

## What the count does not provide

- Building use (residential, commercial, industrial, institutional).
- Occupancy, floors, entrances, internal divisions, or building condition.
- Businesses or tenants; one building may contain many businesses.
- Parcel count; parcels and buildings are different entities.
- A current ground-truth inventory; the imagery vintage is 2019-2020.

These require separate datasets and validation. Do not infer building use from footprint shape alone.

## Reproduction

The workflow `.github/workflows/houston-building-footprint-audit.yml`:
- runs a script self-test;
- acquires the City of Houston legal/service boundary polygons;
- runs a spatial count query against the statewide Microsoft footprint layer;
- uploads boundary geometry, source metadata, and the audit report as a CI artifact.

The workflow does not write to Supabase, the live AO world, or the geographic registry.

## Acceptance criteria

- Boundary classes and extent are explicit.
- Source metadata, CRS, vintage, license, and limitations are retained.
- The statewide layer's extent covers the Houston city boundary.
- The query completes without ArcGIS errors or transfer-limit ambiguity.
- The reported number is clearly labelled as a source-footprint feature count, not ground-truth buildings.
