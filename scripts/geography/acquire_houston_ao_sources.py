#!/usr/bin/env python3
"""Acquire registered Houston ArcGIS layers as provenance-preserving AO staging GeoJSON.

This is a source conversion/cache step, not a Kernel importer. It preserves source
attributes and geometry in WGS84, adds AO staging identity/provenance, and emits
per-layer quality manifests. It never infers access or writes to AO persistence.
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, sys, time
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = ROOT / "geography/houston-source-catalog.json"

class AcquireError(RuntimeError): pass

def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")

def digest(value: Any) -> str:
    return hashlib.sha256(canonical_bytes(value)).hexdigest()

def get_json(url: str, params: dict[str, Any], timeout: int) -> dict[str, Any]:
    request_url = url + ("&" if "?" in url else "?") + urlencode(params)
    request = Request(request_url, headers={"User-Agent": "ApotheosisOnline-HoustonGIS/1.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise AcquireError(f"Request failed for {url}: {exc}") from exc
    if "error" in payload:
        raise AcquireError(f"ArcGIS error for {url}: {payload['error']}")
    return payload

def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_bytes(data)
    tmp.replace(path)

def layer_metadata(layer_url: str, timeout: int) -> dict[str, Any]:
    return get_json(layer_url, {"f": "pjson"}, timeout)

def acquire_layer(source: dict[str, Any], output_dir: Path, bbox: list[float] | None,
                  batch_size: int, timeout: int, pause: float) -> dict[str, Any]:
    url = source["layer_url"].rstrip("/")
    before = layer_metadata(url, timeout)
    object_id_field = before.get("objectIdField") or before.get("objectIdFieldName")
    if not object_id_field:
        fields = before.get("fields", [])
        object_id_field = next((f["name"] for f in fields if f.get("type") == "esriFieldTypeOID"), None)
    if not object_id_field:
        raise AcquireError(f"{source['id']}: layer metadata has no object ID field")
    query = {"where": "1=1", "returnIdsOnly": "true", "f": "json"}
    if bbox:
        west, south, east, north = bbox
        query.update({
            "geometry": json.dumps({"xmin":west,"ymin":south,"xmax":east,"ymax":north}),
            "geometryType": "esriGeometryEnvelope", "inSR": "4326",
            "spatialRel": "esriSpatialRelIntersects"
        })
    id_result = get_json(url + "/query", query, timeout)
    ids = sorted(set(id_result.get("objectIds") or []))
    features: list[dict[str, Any]] = []
    seen: set[str] = set()
    null_geometry = 0
    invalid_identity = 0
    for offset in range(0, len(ids), batch_size):
        batch = ids[offset:offset + batch_size]
        params = {
            "objectIds": ",".join(map(str, batch)), "outFields": "*",
            "returnGeometry": "true", "outSR": "4326", "f": "geojson"
        }
        if bbox:
            west, south, east, north = bbox
            params.update({
                "geometry": json.dumps({"xmin":west,"ymin":south,"xmax":east,"ymax":north}),
                "geometryType": "esriGeometryEnvelope", "inSR": "4326",
                "spatialRel": "esriSpatialRelIntersects"
            })
        result = get_json(url + "/query", params, timeout)
        returned = result.get("features", [])
        got = set()
        for feature in returned:
            props = feature.get("properties") or {}
            oid = props.get(object_id_field)
            if oid is None:
                raise AcquireError(f"{source['id']}: returned feature lacks {object_id_field}")
            key = str(oid)
            if key in seen:
                raise AcquireError(f"{source['id']}: duplicate object ID {key}")
            seen.add(key); got.add(str(oid))
            if feature.get("geometry") is None:
                null_geometry += 1
            source_global = props.get("GlobalID") or props.get("globalid")
            stable_source_id = str(source_global or oid)
            feature["id"] = f"ao:source:{source['id']}:{stable_source_id}"
            feature["properties"] = {
                **props,
                "ao_source_dataset": source["id"],
                "ao_source_object_id": oid,
                "ao_source_global_id": source_global,
                "ao_feature_class": source["ao_feature_class"],
                "ao_geometry_role": source["geometry_role"],
                "ao_vertical_layer": source.get("vertical_layer", "surface"),
                "ao_access_confidence": source.get("access_confidence", "not_assessed"),
                "ao_authority": "source_evidence_only",
                "ao_kernel_approved": False
            }
            features.append(feature)
        if got != {str(x) for x in batch}:
            missing = sorted({str(x) for x in batch} - got)
            raise AcquireError(f"{source['id']}: incomplete page; {len(missing)} IDs missing (first: {missing[:10]})")
        if pause:
            time.sleep(pause)
    after = layer_metadata(url, timeout)
    for key in ("lastEditDate", "dataLastEditDate"):
        if before.get(key) != after.get(key):
            raise AcquireError(f"{source['id']}: source changed during acquisition ({key}); rerun snapshot")
    features.sort(key=lambda f: str(f.get("id")))
    collection = {"type":"FeatureCollection","name":source["id"],"features":features}
    output_bytes = canonical_bytes(collection) + b"\n"
    layer_dir = output_dir / source["id"]
    atomic_write(layer_dir / "features.geojson", output_bytes)
    manifest = {
        "dataset_id": source["id"], "title": source["title"],
        "publisher": source["publisher"], "source_url": source["layer_url"],
        "source_service_item_id": before.get("serviceItemId"),
        "source_layer_id": source.get("layer_id"),
        "source_spatial_reference": before.get("extent",{}).get("spatialReference") or before.get("sourceSpatialReference") or before.get("spatialReference"),
        "output_crs": "EPSG:4326", "retrieved_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source_last_edit_date": before.get("lastEditDate"),
        "source_data_last_edit_date": before.get("dataLastEditDate"),
        "source_feature_id_count": len(ids), "downloaded_feature_count": len(features),
        "unique_source_id_count": len(seen), "null_geometry_count": null_geometry,
        "missing_source_ids": 0, "pagination_complete": True,
        "query_bbox_wgs84": bbox, "feature_sha256": hashlib.sha256(output_bytes).hexdigest(),
        "status": "staging_source_evidence_not_world_state",
        "geometry_role": source["geometry_role"],
        "limitations": source.get("limitations", [])
    }
    atomic_write(layer_dir / "manifest.json", json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2).encode()+b"\n")
    return manifest

def self_test() -> None:
    assert digest({"b":2,"a":1}) == digest({"a":1,"b":2})
    assert canonical_bytes({"z":1}) == b'{"z":1}'
    print("self-test passed: deterministic serialization and hashing")

def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config",type=Path,default=DEFAULT_CONFIG)
    parser.add_argument("--output-dir",type=Path,default=Path("build/houston-ao-source-data"))
    parser.add_argument("--bbox",help="Optional WGS84 west,south,east,north extent applied to all registered layers")
    parser.add_argument("--source",action="append",help="Acquire only this source ID; repeatable")
    parser.add_argument("--batch-size",type=int,default=500)
    parser.add_argument("--timeout",type=int,default=90)
    parser.add_argument("--pause",type=float,default=0.1)
    parser.add_argument("--self-test",action="store_true")
    args=parser.parse_args()
    if args.self_test:
        self_test(); return 0
    if not 1 <= args.batch_size <= 1000: raise AcquireError("--batch-size must be 1..1000")
    bbox=None
    if args.bbox:
        bbox=[float(x) for x in args.bbox.split(",")]
        if len(bbox)!=4 or not (bbox[0]<bbox[2] and bbox[1]<bbox[3]):
            raise AcquireError("--bbox must be west,south,east,north with positive area")
    config=json.loads(args.config.read_text(encoding="utf-8"))
    selected=[s for s in config["sources"] if not args.source or s["id"] in args.source]
    unknown=set(args.source or [])-{s["id"] for s in selected}
    if unknown: raise AcquireError("Unknown source IDs: "+", ".join(sorted(unknown)))
    results=[]; failures=[]
    for source in selected:
        try:
            print(f"Acquiring {source['id']}...",flush=True)
            results.append(acquire_layer(source,args.output_dir,bbox,args.batch_size,args.timeout,args.pause))
        except Exception as exc:
            failures.append({"dataset_id":source["id"],"error":str(exc)})
            print(f"FAILED {source['id']}: {exc}",file=sys.stderr,flush=True)
    run={"schema_version":"1.0.0","run_at_utc":dt.datetime.now(dt.timezone.utc).isoformat(),
         "target":"Houston staging; WGS84 source feature registry","bbox_wgs84":bbox,
         "completed":results,"failures":failures,
         "not_registered_yet":config.get("not_registered_yet",[]),
         "authority":"No Kernel/WorldHeart/Supabase writes; GIS source data is not canon world state"}
    atomic_write(args.output_dir/"run-manifest.json",json.dumps(run,ensure_ascii=False,sort_keys=True,indent=2).encode()+b"\n")
    print(json.dumps({"completed":[r["dataset_id"] for r in results],"failed":failures,
                      "output_dir":str(args.output_dir)},indent=2))
    return 1 if failures else 0

if __name__=="__main__":
    raise SystemExit(main())
