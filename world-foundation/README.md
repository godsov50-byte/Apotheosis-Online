# AO Fresh Chunk-and-Connector World Foundation

Clean, independent AO physical-world model. It does not reuse prior AO maps, GIS/Houston geography, rooms, or legacy spatial implementations.

## Design
- Abstract continuous planar world organized by chunks; boundaries are bookkeeping, not terrain walls.
- World overview shows a token/icon at each chunk center. Icons are symbolic, not terrain drawings.
- Four boundary-midpoint connectors per chunk: north/east/south/west.
- Connectors explicitly connect chunks or open to separately identified environments.
- Region claims group chunks under an owner. Connector access is explicitly open, restricted (allow-list), or closed.
- This is data structure only; no renderer or generated terrain artwork.

## Out of scope
Characters, creatures, NPCs, roads, buildings, resources, dungeon contents, combat, economy, time/ticks, simulation, notifications, AI, or integrations.

## API
createWorld, createChunk, addChunk, setChunkToken, connectChunks, attachEnvironment, claimRegion, setConnectorAccess, canAccessConnector, validateWorld, exportWorld.
