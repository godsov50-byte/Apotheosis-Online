# AO Fresh Chunk-and-Connector World Foundation

Clean, independent AO physical-world model. It does not reuse prior AO maps, GIS/Houston geography, rooms, or legacy spatial implementations.

## Design
- Continuous planar geography is represented through a sparse coordinate address space; addresses do not require stored chunk records.
- Chunks are materialized only when data needs to be stored. The coordinate unit is abstract; world dimensions and physical chunk scale remain undecided.
- World overview shows symbolic center tokens/icons; icons are not terrain drawings.
- Each chunk has four boundary-midpoint connectors: north/east/south/west.
- Chunk links are reciprocal and must connect coordinate-adjacent chunks in the matching cardinal direction.
- Connectors can link to chunks or separate environment identifiers.
- Region claims reference chunk IDs; connector access is open, restricted (allow-list), or closed.
- This is a data structure only; no renderer or generated terrain artwork.

## Out of scope
Characters, creatures, NPCs, roads, buildings, resources, dungeon contents, combat, economy, time/ticks, simulation, notifications, AI, or integrations.

## API
createWorld, chunkAddress, getChunkAt, materializeChunk, createChunk, addChunk, setChunkToken, connectChunks, attachEnvironment, claimRegion, setConnectorAccess, canAccessConnector, validateWorld, exportWorld.
