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
