# Houston endpoint topology preview

Builds a conservative endpoint graph candidate from AO-local centerline preview geometry.

```bash
python scripts/geography/build_houston_endpoint_topology_preview.py \
  --input build/houston-road-network-preview/grid/roads-local-mm.json \
  --manifest build/houston-road-network-preview/grid/roads-local-mm-manifest.json
```

Outputs `endpoint-topology.json` and `endpoint-topology-report.json`.

## Semantics
- Only road-path endpoints are grouped by the floor-divided 1m grid cell.
- Groups are endpoint *candidates*, not confirmed intersections or navigable junctions.
- Internal geometric crossings are intentionally not connected yet.
- Elevation, bridge/tunnel, access, and turn restrictions are preserved as source metadata for later validation.
- Output is preview-only and not importable into Kernel or persistent WorldHeart state.
