# AO City Experience Console

**Status:** interactive browser prototype, isolated feature branch.
**Entry point:** `geography/ao-city-console.html`
**Purpose:** exercise the primary text, GPS, tactical/ASCII, navigation, narration, and admin place-development interfaces together against one small local demo state.

## Open it

Serve the repository root with any static HTTP server and open:

`/geography/ao-city-console.html`

The page uses Leaflet and OpenStreetMap tiles from public CDNs/services, so an internet connection is required. Device GPS is optional and requires browser permission plus a secure context.

## What works in this prototype

- **Text:** a command console with explicit handlers for look, location inspection, listing authored places, movement, destination selection, and entrance inspection/entry.
- **GPS:** geographic map centered on Houston, current WGS84 display coordinates, optional device GPS, map-point selection, and destination selection.
- **Tactical / ASCII:** a 21 × 21 local grid with 1 m preview cells, movement controls, authored building-footprint blocking, and recorded entrance openings.
- **Navigation:** direct-line distance and bearing, with a map overlay for a selected destination.
- **Narration:** deterministic preview text based on the current demo position, selection, and building-entry context.
- **Admin:** create a local building footprint, add an explicitly authored entrance with a door state, add interior room records, and inspect parent/child relationships.
- **Local continuity:** admin-authored demo objects and connections are saved in this browser's local storage and can be reset.

## Important boundaries

This is a UI/interaction prototype, not a live AO session.

- It does not connect to the Kernel, WorldHeart, Supabase, or the spatial database.
- Browser-local edits are not AO canon and are not shared with other users.
- The map basemap is not an imported or validated Houston GIS layer.
- The Houston AO coordinate profile remains draft with its origin unset. The tactical grid uses a local tangent approximation around the current displayed position; it is not the approved AO coordinate frame.
- Navigation currently provides direct-line previews only. It does not claim a verified street, sidewalk, crossing, or interior route.
- Building footprints and entrances are authored by the admin in the demo. No entrances, rooms, businesses, ownership, access rights, or occupants are invented from proximity.
- Entrance state is separate from access permission. An open door does not grant every character permission to enter.
- Interior room records are descriptive child locations only. Walkable interior geometry, stairs, elevators, collision, and room-to-room movement are not implemented.
- Tactical movement is local preview behavior. It is not a Kernel-validated movement action or committed event.
- Narration is deterministic placeholder output, not an AI perception pipeline. Production narration must use authorized character knowledge and perception.

## How this maps to the AO architecture

The interface is designed as multiple views over one intended authoritative world model:

- Geographic location and source geometry belong to the spatial/geography layer.
- Buildings, entrances, floors, rooms, and typed connections belong to the spatial-object graph.
- Access checks and consequential movement belong to the Kernel.
- Approved current state and append-only committed history belong to WorldHeart.
- The client renders authorized state and submits intent; it must not write canonical world state directly.

The existing `ao_spatial` migrations provide the proposed source/canonical feature store and empty spatial-object/connection/admin-queue schema. This page is not yet wired to those tables or to a trusted admin API.

## Next integration steps

1. Approve the Houston spatial profile origin, CRS operation, vertical reference policy, and accuracy budget.
2. Validate the PostGIS migrations in a disposable database and verify role/RLS behavior.
3. Implement a trusted backend read API for authorized map, object, connection, and development-queue views.
4. Implement authenticated admin mutations routed through the Kernel approval/commit path.
5. Import verified roads, address points, parcels, and building footprints with source provenance.
6. Add graph-based route finding over verified connections and traversal constraints.
7. Add indoor geometry and tactical collision/visibility rules.
8. Replace placeholder narration with authorized perception/knowledge context.
9. Test mobile browser behavior and accessibility.

No database migration, deployment, or live-world mutation is performed by this prototype.
