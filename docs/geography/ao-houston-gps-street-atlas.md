# AO Houston GPS & Street Atlas

## Purpose
A geographic foundation for the isolated AO Houston test region. The page displays an interactive OpenStreetMap basemap, requests City of Houston road-centerline features for the current viewport, can load the City's street-intersection points, and can optionally request device GPS after an explicit user click and browser permission grant.

## Data sources
- City of Houston COHGIS RoadCenterline FeatureServer layer 0: https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/COH_RoadCenterline/FeatureServer/0
- City of Houston EGIS Houston City Info MapServer layer 3 (street intersections): https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer/3
- OpenStreetMap basemap tiles: https://www.openstreetmap.org/copyright

## Behavior
- Starts at Downtown Houston (29.7604, -95.3698), not at the user's inferred or private location.
- GPS is opt-in per session. No geolocation request occurs on page load. The browser permission prompt is triggered only by pressing **Use device GPS**.
- GPS coordinates and accuracy are displayed in the page and are not uploaded or persisted by this prototype.
- City road and intersection layers query only the current map extent. Pan/zoom causes the road layer to refresh; intersections load when explicitly requested and refresh after that.
- Road features can be selected to inspect source attributes.
- The OpenStreetMap basemap remains available if a City GIS query fails.

## Important limits
- City road centerlines are reference geometry, not a pedestrian routing graph. They do not by themselves prove sidewalks, legal crossings, public access, one-way rules, turn restrictions, bridge/tunnel connectivity, or accessible routes.
- The source service may limit results, be unavailable, or block browser cross-origin requests. If a query fails, the map reports the failure instead of silently inventing data.
- The street-intersection service warns that it has no permanent unique ID; do not treat its current field values as durable identifiers.
- GPS is a device measurement with variable accuracy. It must not silently become an AO canonical location or alter a character's in-world position.
- This page is a browser prototype. It does not write to AO Kernel, WorldHeart, Supabase, or the live world.
- AO coordinate resolution should use the existing WGS84-to-region spatial addressing module, then pass validated intents through the Kernel before any world-state commit.

## Validation checklist
1. Open over HTTPS in a supported mobile or desktop browser.
2. Confirm OSM basemap tiles render.
3. Confirm road-centerline viewport query returns GeoJSON and select a road feature.
4. Load street intersections and inspect returned points.
5. Pan and zoom; verify viewport data refreshes and stale requests are cancelled.
6. Press Use device GPS; verify browser permission is requested only after the click, then verify coordinates and accuracy update.
7. Deny permission and confirm the page reports denial without breaking map use.
8. Verify no location is uploaded or persisted and no AO world position is changed.
