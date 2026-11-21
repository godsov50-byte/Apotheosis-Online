# AO Houston Locked Road Foundation

**Status: approved design rule; implementation proposal on this branch.** This document does not claim that the entire Houston road network has already been captured or that a shared Kernel registry is live.

## Lock rule

1. Every accepted road is stored as a stable AO road record with its source identity, source/version metadata, exact coordinate geometry, coordinate reference system, available names, address references, image references, and integrity hash.
2. Once `lock_state=locked`, the road geometry is immutable to builders and AI agents. It is read-only spatial truth for movement, placement, pathfinding, scene rendering, and world construction.
3. No agent may drag, snap, simplify, reproject, rotate, reshape, or silently replace locked geometry. Display generalization may be used for rendering only; it must never overwrite canonical coordinates.
4. Corrections are append-only proposals. A correction creates a reviewed successor record, preserves the previous record and its hash, records why it changed, and requires Sovereign approval before the successor becomes authoritative. Never silently edit a locked record.
5. All AO AI agents retrieve road geometry and its attached metadata from one Kernel-authorized read interface. They must not independently redraw, geocode, or infer road locations when a locked record exists. The client may cache records only with their revision/hash and must refresh when the Kernel reports a newer approved revision.

## Coordinate and address rules

- Canonical interchange coordinates use WGS84 longitude/latitude (EPSG:4326), with source CRS and transformation provenance retained.
- Preserve original source coordinates and geometry precision. Do not round canonical coordinates for display.
- Street addresses are address references, not road coordinates. Preserve source address strings, parcel identifiers, and address points separately; distinguish source records from geocoded candidates and verified addresses.
- A road can have multiple names, address ranges, frontage addresses, and parcel relationships. Do not collapse them into one guessed address.
- Road centerlines, parcel boundaries, building footprints, entrances, and street imagery are distinct linked records. A parcel boundary is not a road boundary; a building footprint is not an address point.

## Image rule

Each road record carries one or more image references linked to the road or a specific segment and, when available, a camera/viewpoint coordinate and capture date. Images are references/evidence, never substitutes for geometry. Preserve source URL, provider, capture date, and license/usage metadata. Image type remains unresolved until the Sovereign specifies whether the required reference is street-level, aerial, or both; no image is invented or mislabeled.

## Coverage and quality

A lock applies only to road features actually ingested, validated, and recorded. A viewport query, transfer-limited response, or live map overlay is not proof of complete citywide coverage. Track geographic coverage, source version, retrieval time, record count, transfer-limit state, missing attributes, and validation status. Do not mark an area complete until coverage is checked at the required scale.

## Authority and storage

The Kernel is the authority. A static GitHub Pages browser and localStorage are not the shared registry and cannot enforce cross-agent immutability. The eventual registry must be stored in WorldHeart/Kernel-authorized persistence, with read-only retrieval for agents and proposal-only writes. This branch documents the contract; it does not deploy a database, alter the live world, or make the public static builder a secure admin portal.

## Schema

See [locked-road-record.schema.json](../../schemas/locked-road-record.schema.json). The schema is a record contract, not proof that records have been populated.
