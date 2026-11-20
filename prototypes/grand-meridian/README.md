# Sarrat — The Grand Meridian (3D prototype)

This folder contains the first browser-playable 3D blockout for Apotheosis Online.

## Run
Open `index.html` through a local static web server (for example, `python -m http.server 8000` from this directory), then visit `http://localhost:8000`. A modern browser and internet connection are required because Three.js is loaded from jsDelivr.

## Controls
- Desktop: click **Enter the Street**, WASD to move, mouse to look, E to inspect the hall, Esc to release pointer lock.
- Touch: left virtual pad to move, drag the right side to look, tap to inspect when near the entrance.

## Current scope
- Procedural 3D street/plaza, hall façade, entrance stairs, windows, banners, market stalls, lanterns, purple trees, skyline, moon and rain.
- First-person local movement, basic plaza bounds, a simple obstacle check, position readout and proximity inspection prompt.
- The generated concept image is a visual target; the scene is constructed from 3D primitives rather than a flat image.

## Explicit limitations
This is a visual/gameplay prototype only. It does **not** yet connect to the AO Kernel, WorldHeart, Supabase, authoritative continuous-space collision, durable event history, NPC simulation, or a walkable building interior. Position is local to the browser session and resets on reload. The hall inspection is descriptive only; it does not commit a world action.

## Next build steps
1. Replace primitive blockout pieces with authored modular meshes/materials matching the approved visual reference.
2. Implement robust capsule collision, stairs/ramp traversal, interaction raycasts and door/interior transition geometry.
3. Add an AO spatial scene manifest with continuous coordinates and chunk boundaries.
4. Route movement and interactions through Kernel validation and append-only committed events before claiming persistent world behavior.
