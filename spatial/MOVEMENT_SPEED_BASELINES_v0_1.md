# AO Movement Speed & Spatial Grid Baseline v0.1

**Status:** Engineering baseline proposed in the AO Spatial Addressing PR. It is grounded in published real-world transportation design/operating speeds, but is not yet wired into Kernel movement resolution and is not a claim about every individual's capability.

## Decision

Use a metric spatial hierarchy with these default dimensions:

| Spatial level | Default size | Primary purpose |
|---|---:|---|
| Cell | 1 m × 1 m × 1 m | Fine position indexing, occupancy and tactical-space reference |
| Tile | 64 m × 64 m × 64 m | Local spatial grouping and streaming |
| Chunk | 1,024 m × 1,024 m × 1,024 m | Regional loading, persistence and simulation partitioning |

A chunk contains 16 × 16 × 16 tiles; a tile contains 64 × 64 × 64 cells. These are address/index units, not movement steps. Entities retain continuous metric positions and are never forced to snap to cell centres. Collision and occupancy use each entity's actual footprint/volume, not the fact that its anchor occupies a 1 m cell.

The 1 m cell is selected because it is a useful human-scale spatial index: at ordinary walking pace an entity moves approximately one cell per second. The 64 m tile and 1,024 m chunk create useful locality without making the map's travel speed depend on zoom or storage boundaries.

## Reference movement speeds

Use the following initial planning speeds, in metres per second of elapsed movement time:

| Movement profile | Baseline | Approx. km/h | Notes |
|---|---:|---:|---|
| Accessible / cautious walk | 0.9 m/s | 3.2 | Conservative route and crossing estimate |
| Normal walk | 1.2 m/s | 4.3 | Default unencumbered pedestrian |
| Brisk walk | 1.6 m/s | 5.8 | Purposeful walking |
| Jog | 2.3 m/s | 8.3 | Sustained light run, not a sprint |
| Bicycle | 4.7 m/s | 16.9 | Typical urban operating baseline |
| Urban bus | 5.0 m/s | 18.0 | Average urban operating baseline, including interruptions |
| Urban car | 7.5 m/s | 27.0 | Average urban operating baseline, not posted speed or free-flow maximum |

These are starting reference values, not hard limits. Individual attributes, load, injury, fatigue, terrain, weather, crowding, vehicle condition, road class, traffic, stops, signals, and access restrictions modify the resolved speed or route cost. A route planner must use the relevant network and mode; it must not let a car use a pedestrian-only edge or assume that a geometric road line proves pedestrian access.

For movement modes without reliable evidence or a suitable route graph, speed is UNKNOWN until an explicit rule or validated source is supplied. Do not silently borrow the speed of a superficially similar mode.

## Why these values

- The Ohio Department of Transportation Multimodal Design Guide uses 3.5 ft/s (about 1.07 m/s) as a default pedestrian design speed and 7.5 ft/s (about 2.29 m/s) as an assumed jogging speed. The 1.2 m/s normal-walk baseline is close to the standard pedestrian crossing/design value, while 0.9 m/s provides a slower accessible/cautious route estimate.
- Transport for NSW's 2024 road/street design guidance reports urban operating ranges of 5–7 km/h for walking, 15–20 km/h for cycling and buses, and 25–30 km/h for cars. The selected bicycle, bus and car baselines are rounded midpoints of those ranges.
- FHWA pedestrian guidance describes a broad range of pedestrian speeds and recommends lower assumptions where slower pedestrians need to be accommodated. AO should therefore keep a slower accessible profile rather than treating the normal-walk value as universal.

## Travel-time interpretation

For an unobstructed segment:

`travelSeconds = distanceMetres / resolvedSpeedMetresPerSecond`

Examples using the baseline speeds:

| Distance | Normal walk (1.2 m/s) | Bicycle (4.7 m/s) | Urban car (7.5 m/s) |
|---|---:|---:|---:|
| 64 m (one tile width) | 53 s | 14 s | 9 s |
| 1,024 m (one chunk width) | 14 min 13 s | 3 min 38 s | 2 min 17 s |

These are straight-line/constant-speed illustrations only. Actual journey time is calculated along valid route edges and includes turns, intersections, crossing waits, congestion, stops, slope, surface, doors, stairs, obstacles and other delays. A route may be longer than the geometric shortest path.

## Movement time and AO calendar time

Movement speeds are metres per elapsed movement-simulation second. In the online server, movement delta should be measured with a monotonic clock, so the baseline reflects real-world travel speed (for example, 1.2 metres per elapsed second for normal walking). Movement must not be multiplied or divided by the AO calendar ratio.

The AO calendar runs independently: one AO day (86,400 AO seconds) elapses over three real days (259,200 elapsed real seconds). Therefore AO calendar seconds = elapsed real seconds / 3. Three real seconds of normal walking advances the character 3.6 metres while the AO calendar advances by one AO second. This prevents characters from moving at one-third real-world speed merely because the fictional calendar is slower.

Movement integration may run at any server tick rate; it must integrate the measured elapsed delta and preserve sub-cell position. It must not use UI frame time or snap an entity to a whole-metre coordinate.

## Authority and limitations

- These defaults are movement-model inputs, not permission to move.
- The Kernel still validates route legality, access, collision, occupancy, movement capability, speed changes and transitions.
- WorldHeart stores committed current position separately from the append-only movement/transition ledger.
- GPS is an observation/input and may be inaccurate or unavailable; it does not directly move an entity.
- The current Houston road-centerline graph is not a validated pedestrian or vehicle routing graph. Road access, sidewalks, crossings, one-way rules, grade separation and travel restrictions remain separate evidence requirements.
- The grid dimensions remain configurable by world/region. Changing a production grid later requires a versioned migration/re-addressing plan; it must not silently rewrite historical addresses.

## Source references

- Ohio Department of Transportation, *Multimodal Design Guide*, §3.3.1 Pedestrians: https://dam.assets.ohio.gov/image/upload/transportation.ohio.gov/roadway/mdg/archive/2024-01-mdg.pdf
- Transport for NSW, *Design of Roads and Streets for all users*, 2024, §7.1.1.4 Speed: https://standards.transport.nsw.gov.au/_entity/annotation/8a614891-d384-afb8-8f9e-211fcd904ff3
- Federal Highway Administration, *Signalized Intersections: Informational Guide*, pedestrian characteristics: https://www.fhwa.dot.gov/publications/research/safety/04091/02.cfm
