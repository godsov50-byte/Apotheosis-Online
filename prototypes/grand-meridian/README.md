# Sarrat — The Grand Meridian (3D prototype)

A browser-playable first-person 3D environment blockout for Apotheosis Online.

## Run
Serve this folder with a local static web server (for example, run `python -m http.server 8000` from this directory) and open `http://localhost:8000`. A modern browser and internet connection are required because Three.js is loaded from jsDelivr.

## Controls
- Desktop: click **Enter the Street**, WASD to move, mouse to look, E to open/close the entrance doors or inspect the hall, Esc to release pointer lock.
- Touch: left virtual pad to move, drag the right side to look, tap near the entrance to open/close the doors.

## Built in this pass
- Procedural 3D street/plaza, façade, stairs, lit windows, banners, market stalls, lanterns, purple trees, skyline, moonlight, wet-look patches and animated rain.
- A split front structure with an actual central passage, openable double-door leaf, and a walk-in ceremonial hall.
- Interior nave with columns, gold trim, chandeliers, side chapel recesses, sconces and a raised rear gallery.
- Paired staircases with locally computed elevation, allowing the player to climb to and walk across the upper gallery.
- First-person local movement, local body-clearance checks around stalls, trees and columns, with wall sliding and a doorway gate, position readout, and proximity interaction.
- Four inspectable exhibit cases (Meridian Seal, Founder's Ledger, Rain Vessel and Star Map), reading benches, and six independently toggleable wall sconces. Approach an object and press E; on touch devices, tap to interact when the start overlay is dismissed.
- A proximity prompt selects the nearest eligible object or entrance door. Signed-in door, exhibit and sconce interactions are submitted to the isolated Grand Meridian experimental API, validated against the authenticated Envoy and server-tracked position, and appended to the experimental event ledger.
- Supabase Auth sign-in/sign-up is available in the start panel. First authenticated use provisions a provisional **Grand Meridian Visitor** Envoy at the plaza spawn; no Tier or attributes are assigned.
- Scene state is hydrated from `exp_entities`; door and individual sconce state reconstruct from saved state after reload. The API also accepts rate-limited position updates for range validation.
- Desktop and basic touch movement/look controls.

## Explicit limitations
This remains an isolated experiment, not the main AO Kernel or WorldHeart. The browser scene now connects to the separate `ao-grand-meridian-experiment` Supabase project through the `grand-meridian-api` Edge Function. Authenticated door, exhibit and sconce actions are server-validated and ledgered; the scene reloads those persisted states. Position updates are server rate-limited and used for interaction-range checks, but collision geometry is still enforced only by the local browser controller. This is not yet authoritative spatial movement or a full AO Kernel. The provisional Visitor Envoy is an experimental test identity with no Tier or attributes. Geometry and collision remain blockout quality: approximate circular clearances, not a true capsule/mesh solver. No real browser or mobile device test has been completed.

## Next build steps
1. Run the connected experiment in a browser; test account confirmation, sign-in, scene reconstruction and action rejection cases.
2. Replace primitive blockout geometry with modular authored assets and a proper collision mesh/capsule controller.
3. Move collision and traversal validation into the experimental Kernel before calling movement authoritative.
4. Make the interior navigable in full, including stair traversal and upper gallery.
5. Expand the spatial manifest and event-driven reconstruction only after test coverage is in place.
