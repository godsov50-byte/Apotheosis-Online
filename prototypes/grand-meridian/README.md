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
- First-person local movement, local body-clearance checks around stalls, trees and columns, with wall sliding and a doorway gate, position readout, and proximity inspection.
- Desktop and basic touch movement/look controls.

## Explicit limitations
This is a local visual/gameplay prototype. It is **not** connected to the AO Kernel, WorldHeart, Supabase, authoritative continuous-space collision, durable event history, NPC simulation, or an authoritative building-interior state. Position and door state reset on reload. Geometry and collision are blockout quality: the controller uses approximate circular clearances rather than a true capsule/mesh solver; the raised gallery is visual and not traversable. No browser runtime or device test was run as part of this GitHub edit.

## Next build steps
1. Run on desktop and phone, then fix real-device movement, camera and rendering issues.
2. Replace primitive blockout geometry with modular authored assets and a proper collision mesh/capsule controller.
3. Make the interior navigable in full, including stair traversal and upper gallery.
4. Define the location's spatial manifest and continuous coordinates.
5. Route movement and interactions through Kernel validation and append-only committed events before claiming persistent world behavior.
