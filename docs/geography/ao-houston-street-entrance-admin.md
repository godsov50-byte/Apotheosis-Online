# AO Houston Street & Entrance Admin

**Status:** Isolated browser prototype on `feature/houston-street-entrance-admin`, stacked from the existing Houston admin builder PR #39.

## Purpose
A single admin workspace for loading Houston road-centerline GeoJSON, building a provisional connected street graph, placing an admin avatar, drawing or inspecting structures, recording entrance points, and previewing a route from the avatar to a selected entrance.

## Included
- Live viewport-based City of Houston road-centerline queries, with a connected candidate graph built from the returned road geometry.
- Live viewport-based City of Houston multi-county parcel polygons, rendered as a selectable GIS layer.
- Live viewport-based City Parcel Layer / Structures building-footprint queries, rendered as a separate selectable layer.
- Street-map and aerial/satellite basemap switching; independent layer visibility controls.
- Optional MapLibre 3D inspection view. Uses a separate City of Houston / Harris County detailed building-footprint layer with source fields for building height, eave height, roof form, base elevation, building type, address and parcel number. If enriched features are present in the viewport, their raw height values drive a relative-height visual preview; generic footprints fall back to illustrative 8 m blocks. Return to the 2D map for admin editing.
- Road GeoJSON loader and 2D graph builder with endpoint clustering and inferred interior line intersections.
- Connected-component, source-segment and graph-node counts.
- Admin avatar placement on nearest road segment and Dijkstra route preview along graph edges.
- Optional building-footprint GeoJSON overlay and source-attribute inspection.
- Admin-authored structure footprints, names, types, floors and notes.
- Entrance placement associated with a selected structure; stores entrance type, access state, coordinates, nearest road distance, nearest graph edge and nearest road point.
- Entrance states: Candidate — unverified; Verified by admin; Blocked / unusable; Restricted access.
- Route preview to selected entrance, refusing entrances marked blocked.
- Browser-local save and portable JSON export/import.

## Live geographic data sources
- Roads: City of Houston COHGIS RoadCenterline FeatureServer layer 0 (`https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0`). The service includes road names, classes and one-way attributes, but this prototype's graph still treats the geometry as undirected and does not apply those restrictions.
- Parcels: City of Houston EGIS HOUSTON_CITYINFO MapServer layer 2 (`https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer/2`). This is a multi-county parcel mapping layer containing full HCAD parcels and partial FBCAD, MCAD and WCAD parcels; its metadata reports a September 2026 maintenance update. The service says it is intended for GIS mapping and should not be relied on for specific applications without independent verification; boundaries are not legal surveys.
- General building footprints: HCFCD Building Footprints 2018, layer 0 (`https://www.gis.hctx.net/arcgishcpid/rest/services/HCFCD/Building_Footprints_2018/MapServer/0`). This Harris County-wide polygon layer was derived from 2018 LiDAR acquired by H-GAC, TNRIS and USGS, delivered for Harris County in June 2019, and last updated in January 2022. It includes footprint class and H-GAC parcel reference fields. The source warns that LiDAR misclassification can produce erroneous footprints and that the data is informational, not a survey or legal/engineering source; H-GAC attribution is required.
- Height-enriched downtown building footprints: Harris County / City of Houston `BldgDept3D_new_Jul282026`, layer 0 (`https://services6.arcgis.com/2yF1BNcZtu43QAOt/ArcGIS/rest/services/BldgDept3D_new_Jul282026/FeatureServer/0`). WGS84 polygons cover a downtown subset (approximately longitude -95.4322 to -95.3613, latitude 29.7304 to 29.7616) and include `bldg_heigh`, `eave_heigh`, `roof_form`, `base_elev`, `bldg_types`, `bldg_addre`, `parcel_add`, and `hcad_num`. The service description identifies the detailed data as by Nov 30, 2022; service metadata reports edits in July 2026. The layer metadata does not specify height-field units, so AO uses the numeric value only to create relative visual variation, not as a metric height assertion.
- Basemaps: OpenStreetMap contributors and Esri World Imagery; attribution is displayed in the map controls.
- All four GIS feature layers are queried by the current viewport, with a 2,000-feature request cap. Zoom in and reload when a source reports a transfer limit. Counts are for the visible view, not a citywide inventory.

## Important truth and safety boundaries
- This is a Houston test/admin tool only. It does not write to the live AO world, Kernel, WorldHeart, Supabase or canonical geography.
- The 3D preview uses relative-height scaling from the height-enriched downtown dataset, but the source height units are undocumented; those extrusions are visual comparisons, not measured metric heights. Harris County LiDAR footprints outside the downtown height-enriched subset use illustrative 8 m extrusions. This is not a photogrammetric mesh; detailed roof/façade geometry, complete citywide height coverage, source snapshotting and durable shared persistence are not yet implemented.
- Road topology is inferred from 2D geometry. It does not yet model one-way restrictions, turn restrictions, sidewalks, pedestrian permissions, grade-separated bridges/tunnels, access restrictions or verified crossings.
- An entrance being near a road does not prove that the building is reachable. The route preview is a geometric candidate, not proof of legal or physical pedestrian access.
- “Verified by admin” means an admin manually asserted the entrance state; it is not third-party verification.
- Building footprints and entrance points remain source evidence or admin proposals, not automatically canon.
- The avatar movement preview is client-side and does not invoke Kernel validation or append committed world events.
- Browser-local save is not shared persistence. Export JSON for handoff.
- The map depends on Leaflet/OpenStreetMap CDN access.

## Validation
Static inspection is the only validation performed for this commit. A real-browser smoke test, mobile interaction test, full-Houston graph performance test and route/access audit remain required.
