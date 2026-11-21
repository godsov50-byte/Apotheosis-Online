# AO Place Connectivity — Houston outward

## Purpose

Start at Houston and build the geographic connection graph outward. The graph answers **which place is connected to which**. It is separate from the coordinate resolver and separate from building/interior geometry.

## Relationship types

- `located-in`: administrative containment (city → state/province → country).
- `shares-land-border-with`: two countries have a shared land boundary.
- `street-connected-to`: routable street-network edge, derived from source geometry.
- `crossing-connects`: a specific border crossing or bridge/tunnel connects network edges.
- `transport-connects`: a sourced ferry, maritime, rail, or air link. Mode and service constraints must be explicit.

Do not treat these relationship types as interchangeable. In particular, a shared border is not itself a usable travel route.

## Houston starter graph

```text
Houston
  └─ located-in → Texas
       └─ located-in → United States
            ├─ shares-land-border-with → Canada
            └─ shares-land-border-with → Mexico
                 ├─ shares-land-border-with → Belize
                 └─ shares-land-border-with → Guatemala
                      └─ shares-land-border-with → Belize
```

The machine-readable seed is `data/geography/ao-place-connectivity-starter.json`.

## Room interpretation

A geographic place is not automatically one giant room. AO uses the existing spatial hierarchy and global WGS84 resolver. Country/state/city/district records provide labels, containment, and search context. Playable rooms are spatial areas/regions derived from the street and geographic network. Buildings and interiors are attached after the geographic base is present.

## Data and safety rules

1. Load all country/territory identities and boundary geometries from a versioned, licensed global boundary source.
2. Derive shared-border adjacency from actual boundary geometry; record source version, retrieval date, license, geometry CRS, and confidence.
3. Load street centerlines, pedestrian paths, intersections, and crossing/access data independently. Do not infer a walkable connection from country adjacency.
4. Add island/non-contiguous country transport edges only from explicit sourced links; do not invent routes.
5. Preserve disputed/ambiguous boundaries with source status and uncertainty; do not silently force a single political interpretation.
6. Resolve each location through the existing global WGS84 → AO Region → Chunk → Tile → Cell → Position system. Do not introduce a second room-addressing hierarchy.
7. GPS remains an untrusted candidate observation. Only Kernel-authorized movement may update Envoy state; only WorldHeart records committed results.

## Current scope

This seed includes Houston → Texas → United States and the immediate continental land-border expansion through Canada, Mexico, Belize, and Guatemala. It is **not** a complete global country inventory, a global road graph, or production navigation data. The next ingestion step is to import the full boundary dataset and derive all country adjacency automatically rather than hand-maintaining a world list.
