# AO Houston Street & Entrance Admin

**Status:** Isolated browser prototype on `feature/houston-street-entrance-admin`, stacked from the existing Houston admin builder PR #39.

## Purpose
A single admin workspace for loading Houston road-centerline GeoJSON, building a provisional connected street graph, placing an admin avatar, drawing or inspecting structures, recording entrance points, and previewing a route from the avatar to a selected entrance.

## Included
- Road GeoJSON loader and 2D graph builder with endpoint clustering and inferred interior line intersections.
- Connected-component, source-segment and graph-node counts.
- Admin avatar placement on nearest road segment and Dijkstra route preview along graph edges.
- Optional building-footprint GeoJSON overlay and source-attribute inspection.
- Admin-authored structure footprints, names, types, floors and notes.
- Entrance placement associated with a selected structure; stores entrance type, access state, coordinates, nearest road distance, nearest graph edge and nearest road point.
- Entrance states: Candidate — unverified; Verified by admin; Blocked / unusable; Restricted access.
- Route preview to selected entrance, refusing entrances marked blocked.
- Browser-local save and portable JSON export/import.

## Important truth and safety boundaries
- This is a Houston test/admin tool only. It does not write to the live AO world, Kernel, WorldHeart, Supabase or canonical geography.
- Road topology is inferred from 2D geometry. It does not yet model one-way restrictions, turn restrictions, sidewalks, pedestrian permissions, grade-separated bridges/tunnels, access restrictions or verified crossings.
- An entrance being near a road does not prove that the building is reachable. The route preview is a geometric candidate, not proof of legal or physical pedestrian access.
- “Verified by admin” means an admin manually asserted the entrance state; it is not third-party verification.
- Building footprints and entrance points remain source evidence or admin proposals, not automatically canon.
- The avatar movement preview is client-side and does not invoke Kernel validation or append committed world events.
- Browser-local save is not shared persistence. Export JSON for handoff.
- The map depends on Leaflet/OpenStreetMap CDN access.

## Validation
Static inspection is the only validation performed for this commit. A real-browser smoke test, mobile interaction test, full-Houston graph performance test and route/access audit remain required.
