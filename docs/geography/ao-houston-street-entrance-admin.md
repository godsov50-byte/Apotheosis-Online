# AO Houston Street & Entrance Admin

**Status:** Isolated browser prototype on `feature/houston-street-entrance-admin`, stacked from the existing Houston admin builder PR #39.

## Purpose
A single admin workspace for loading Houston road-centerline GeoJSON, building a provisional connected street graph, placing an admin avatar, drawing or inspecting structures, recording entrance points, and previewing a route from the avatar to a selected entrance.

## Included
- Live viewport-based City of Houston road-centerline queries, with a connected candidate graph built from the returned road geometry.
- Live viewport-based City of Houston multi-county parcel polygons, rendered as a selectable GIS layer.
- Live viewport-based City Parcel Layer / Structures building-footprint queries, rendered as a separate selectable layer.
- Street-map and aerial/satellite basemap switching; independent layer visibility controls.
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
- Parcels: City of Houston EGIS HOUSTON_CITYINFO MapServer layer 2 (`https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer/2`). This is a multi-county parcel mapping layer with quarterly maintenance. Its own service disclaimer says it is for GIS reference and approximate relative property boundaries, not legal/survey use.
- Building footprints: City Parcel Layer and Building Footprints FeatureServer layer 1 (`https://services5.arcgis.com/FkDUU6xkZJTbBa9X/arcgis/rest/services/Parcels/FeatureServer/1`). Coverage is source-dependent and is not represented as complete citywide coverage.
- Basemaps: OpenStreetMap contributors and Esri World Imagery; attribution is displayed in the map controls.
- All three GIS feature layers are queried by the current viewport, with a 2,000-feature request cap. Zoom in and reload when a source reports a transfer limit. Counts are for the visible view, not a citywide inventory.

## Important truth and safety boundaries
- This is a Houston test/admin tool only. It does not write to the live AO world, Kernel, WorldHeart, Supabase or canonical geography.
- Live parcel and building geometry is rendered as 2D footprint data in this iteration. True 3D building extrusion/mesh rendering, complete citywide bulk ingestion, source snapshotting and durable shared persistence are not yet implemented.
- Road topology is inferred from 2D geometry. It does not yet model one-way restrictions, turn restrictions, sidewalks, pedestrian permissions, grade-separated bridges/tunnels, access restrictions or verified crossings.
- An entrance being near a road does not prove that the building is reachable. The route preview is a geometric candidate, not proof of legal or physical pedestrian access.
- “Verified by admin” means an admin manually asserted the entrance state; it is not third-party verification.
- Building footprints and entrance points remain source evidence or admin proposals, not automatically canon.
- The avatar movement preview is client-side and does not invoke Kernel validation or append committed world events.
- Browser-local save is not shared persistence. Export JSON for handoff.
- The map depends on Leaflet/OpenStreetMap CDN access.

## Validation
Static inspection is the only validation performed for this commit. A real-browser smoke test, mobile interaction test, full-Houston graph performance test and route/access audit remain required.
