# AO Earth — Texas and Houston Globe

## Download and open

Download [`texas-houston-globe.html`](./texas-houston-globe.html) and open it in a modern browser with an internet connection.

The HTML is a single downloadable page. It loads Three.js and s2js from public CDNs, the Earth texture from the Three.js examples CDN, and the geographic boundaries from public ArcGIS REST services. It is not an offline package; the external services must be reachable when opened.

## Included

- Rotatable, zoomable 3D Earth with the existing S2 Level 1 grid (24 cells).
- Texas outline from the U.S. Census Bureau's 2024 generalized state-boundary service.
- Houston city-limit outlines from the City of Houston public boundary view, with Full and Limited service classes styled separately.
- Texas, Houston, and Whole Earth focus controls.
- Selectable S2 cells and four-child subdivision.
- Mobile-friendly layout.

## Geographic source notes

- Texas source: Census TIGERweb `Generalized_ACS2024/State_County`, States 20M layer (4), selected by `GEOID='48'`. This is intentionally generalized for globe-scale rendering, not detailed survey work.
- Houston source: City of Houston `COH_City_Limit_view` FeatureServer layer 0. The public view exposes FULL and LIMITED categories. It is a reference boundary layer, not a claim of survey-grade precision.
- The Houston service does not expose Pending polygons in this public view. Their absence here must not be interpreted as proof that no Pending areas exist in the authoritative city-limit source.

The globe's lines are source geometry rendered on the sphere; they are not painted into the Earth texture. The current browser prototype does not yet persist geography into the AO Kernel or WorldHeart.


## Upper Texas Gulf Coast natural geography

The globe now adds optional browser-rendered layers for the regional natural system around Houston:

- **Major basins:** USGS Watershed Boundary Dataset HUC-6 basin polygons intersecting the upper-coast study envelope.
- **Watersheds:** USGS Watershed Boundary Dataset HUC-8 subbasins intersecting the upper-coast study envelope. HUC units are hydrologic boundaries, not city/county boundaries. The view envelope is a query window, not the watershed's actual outer boundary.
- **Flowlines:** USGS 3D Hydrography Program Flowline layer, showing River, Canal, and Drainageway feature classes. The requested flow direction and stream-order attributes are retained in the service response; connectors are not drawn as ordinary rivers.
- **Waterbody edges:** USGS 3DHP river and ocean/waterbody polygon edges clipped visually to the regional extent. These are hydrography features, not a legal or tidal-datum shoreline.
- **Gulf bathymetry:** a low-zoom shaded-relief tile mosaic from the Gulf of Mexico visualization service, sourced from a mixture of public NOAA, USGS, GEBCO, BOEM, and academic bathymetric inputs. It is qualitative relief only, not absolute depth.

Use the **Galveston Bay** and **Upper Gulf Coast** focus controls and the independent layer checkboxes (major basins, subbasins, flowlines, waterbody edges, bathymetry) to inspect the new geography. All layers load from public services at runtime and therefore require internet access. They are visual overlays only: no source geometry has been downloaded into the canonical AO geography registry, and no AO Kernel/WorldHeart state is modified.

### Important geographic interpretation

The Trinity and San Jacinto river systems and Buffalo Bayou are major freshwater contributors to the Trinity–San Jacinto Estuary (Galveston Bay). The estuary includes Trinity Bay, Galveston Bay, East Bay, West Bay, and Gulf passes including Bolivar Roads and San Luis Pass. Neighboring Brazos and San Bernard coastal drainage systems remain separate from the Galveston Bay estuary. The current globe shows hydrologic units and flowlines across a regional envelope; it does not yet certify a complete watershed delineation, tidal connectivity model, or exact shoreline.

Sources:
- USGS 3DHP: https://www.usgs.gov/3d-hydrography-program/access-3dhp-data-products
- USGS WBD: https://www.usgs.gov/national-hydrography/access-national-hydrography-products
- Texas Water Development Board, Trinity–San Jacinto Estuary: https://www.twdb.texas.gov/surfacewater/bays/major_estuaries/trinity_san_jacinto/
- NOAA NCEI Coastal Relief Model: https://www.ncei.noaa.gov/products/coastal-relief-model
- Gulf bathymetry shaded-relief service: https://tiles.arcgis.com/tiles/qr14biwnHA6Vis6l/arcgis/rest/services/Shaded_Relief_Visualization_of_Gulf_of_Mexico_Bathymetry/MapServer


Latest upper Gulf Coast globe branch: https://github.com/godsov50-byte/Apotheosis-Online/raw/refs/heads/feature/upper-gulf-coast-geography/geography/texas-houston-globe.html
