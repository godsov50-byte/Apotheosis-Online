# AO Houston City Builder — prototype foundation

## What this adds
A standalone browser prototype that layers mapped building footprints onto the existing Houston GPS work and introduces a first construction-planning interaction.

- Leaflet map centered on Houston, using OpenStreetMap tiles.
- Queries OpenStreetMap Overpass for building ways inside the current map bounds.
- Caps each visible-area response at 300 ways and renders mapped footprints separately from proposed plans.
- Selects mapped buildings and displays available OSM tags.
- Lets the user place a clearly labeled 20 m × 30 m *proposed footprint* and advance its local planning stage.
- Saves proposed plans in browser localStorage so a refresh on the same browser retains the sandbox plans.

## Important data boundaries
- The 300 figure is a per-scan response cap, **not** a claim that Houston has only 300 buildings or that 300 records have been preloaded.
- OSM coverage is community-mapped and is not a complete cadastral, occupancy, ownership, or building-permit dataset.
- The proposed footprint is a sketch, not a surveyed parcel or approved structure.
- Planning stages are local prototype state. They do not consume real resources or represent real labor, permits, construction progress, or Kernel-authorized world changes.
- No Supabase, WorldHeart, AO Kernel, live world-state, or production deployment is connected.
- The app uses public OSM tile and Overpass endpoints; usage policies and availability apply.

## Run
Open `geography/ao-houston-city-builder.html` in a modern browser with internet access. Zoom to a small Houston area and select **Scan visible area**. Choose a structure type, activate **Place building plan**, and click the map.

## Next integration steps
1. Acquire a stable building-footprint snapshot for the chosen AO region and retain source IDs, timestamps, license, coordinate system, and geometry validation.
2. Crosswalk building footprints to official address points and road topology; never infer entrances from address centroids.
3. Add verified entrances, floors, rooms, and indoor navigation only from reliable source data or explicitly authored AO geometry.
4. Define the authoritative building/entity schema and construction resource rules in the Kernel before connecting persistence.
5. Persist committed events and derived current state separately through WorldHeart/Supabase; browser-local plans must remain proposals until authorized.
