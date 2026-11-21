# Houston Spatial Navigation Demo

This browser prototype demonstrates an actual Houston street basemap with an Envoy position marker and basic spatial measurements.

## Run it

Open `geography/houston-spatial-navigation-demo.html` in a modern browser. An internet connection is required for the map tiles, Leaflet assets, and optional route request. Device GPS requires browser permission and a secure context (HTTPS).

## Data and services

- **Basemap:** OpenStreetMap raster tiles; attribution is displayed on the map.
- **City Hall address anchor:** City of Houston GIS `COH_ADDRESS_INFO` layer 0, address `901 BAGBY ST`, ZIP 77002. Point coordinates used: latitude 29.760193, longitude -95.369361.
- **Destination address anchor:** same official GIS layer, `6801 BACHER ST`, ZIP 77028. Point coordinates used: latitude 29.824681, longitude -95.277697.
- **Route:** public OSRM routing endpoint, based on OpenStreetMap road-network data. Route geometry is requested dynamically and drawn on the same map.
- **Coordinate reference:** displayed coordinates are WGS84 geographic coordinates (EPSG:4326), latitude/longitude.

Official address layer:
https://mycity2.houstontx.gov/gisweb01/rest/services/EGIS/HOUSTON_CITYINFO/MapServer/0

OpenStreetMap copyright and tile policy:
https://www.openstreetmap.org/copyright
https://operations.osmfoundation.org/policies/tiles/

OSRM demo service:
https://router.project-osrm.org/

## Interactions

- Drag the blue Envoy marker or click the map to set its position.
- Optionally request device GPS. Browser permission is required; no GPS coordinate is uploaded to AO by this prototype.
- Inspect live latitude/longitude, direct geodesic distance, and bearing to the fixed destination.
- Request a driving route and view its geometry, distance, and estimated duration.
- Toggle a coarse visual grid. The grid is only an overlay; it does not constrain continuous movement.

## Explicit limitations

This is a client-side spatial demonstration, not a connected AO Kernel or WorldHeart implementation. It does not commit movement, simulate collisions, validate access, or update persistent world state. The public OSRM demo service is best-effort and may impose usage limits. The Envoy marker starts at an official Houston GIS address point, but becomes simulated when moved manually; it becomes a device GPS reading only after the user grants permission. The destination is another official address point.

The map uses real street-map tiles. It does not infer building interiors, entrances, floorplans, or room-level position from a street address. The optional grid is not an S2 cell visualization and is not a movement lattice.
