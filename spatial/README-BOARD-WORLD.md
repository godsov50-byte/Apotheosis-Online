# AO Board-Based Spatial Foundation v1

## Three layers
1. Terrain/land: tile terrain and land-use (wilderness, undeveloped, urban, rural, protected).
2. City/structures: buildings and structures occupy tile footprints with explicit entrances.
3. Connectivity/access: explicit nodes and edges connect streets, entrances, interiors, rooms, floors, bridges, stairs, boards, and portals. Adjacency alone does not create a connection.

## Boards
Boards use integer width/height and (x,y) tile coordinates. A board may represent a city, district, building interior, wilderness, dungeon, or tactical instance. No GPS, GIS, latitude/longitude, or real-world units are required.

## City expansion
expandCity() changes selected tile land-use to urban and assigns cityId. It does not move, resize, edit, remove, or change existing structure records or entrance coordinates. Expansion can grow around homes. Protected tiles are rejected. The operation returns a copy and leaves the original board unchanged.

## Layer 3 connectivity
Connectivity is explicit. Nodes refer to boardId and tile coordinates; links are typed (street, entrance, door, stairs, bridge, board-link, portal). Missing endpoints are rejected. No connectivity is inferred from visual adjacency.

## Scope
ao-board-world.mjs defines board/tile/structure/expansion/connectivity primitives.
ao-board-world.test.mjs covers the initial contract.
This first slice is not yet pathfinding, rendering, Kernel/WorldHeart integration, database persistence, NPC simulation, or a playable city UI.