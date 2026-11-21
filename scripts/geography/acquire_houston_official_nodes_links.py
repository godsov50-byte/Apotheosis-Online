#!/usr/bin/env python3
"""Download Houston official road Nodes and Links as provenance-preserving GeoJSON.

Diagnostic evidence only; does not modify the road graph or assert routing connectivity.
"""
from __future__ import annotations
import argparse, datetime as dt, json, time, urllib.parse, urllib.request
from pathlib import Path

BASE = "https://geogimsms.houstontx.gov/arcgis/rest/services/HPC/LandbaseAndRoads_hpc/MapServer"
LAYERS = {"nodes": 10, "links": 12}

def request_json(url, post=None, timeout=90):
    data = urllib.parse.urlencode(post).encode() if post is not None else None
    req = urllib.request.Request(url, data=data, headers={"User-Agent":"AO-Houston-Topology-Audit/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        obj=json.loads(res.read())
    if "error" in obj: raise RuntimeError(f"ArcGIS error: {obj['error']}")
    return obj

def get_json(url, timeout=90): return request_json(url, timeout=timeout)
def post_json(url, params, timeout=90): return request_json(url, params, timeout)

def acquire(name, layer_id, outdir, batch_size=500, timeout=90, pause=0.1):
    layer=f"{BASE}/{layer_id}"
    meta=get_json(layer+"?f=pjson", timeout)
    ids_payload=get_json(layer+"/query?"+urllib.parse.urlencode({
        "where":"1=1","returnIdsOnly":"true","returnGeometry":"false","f":"json"
    }), timeout)
    ids=sorted(set(ids_payload.get("objectIds") or []))
    count_payload=get_json(layer+"/query?"+urllib.parse.urlencode({
        "where":"1=1","returnCountOnly":"true","f":"json"
    }), timeout)
    expected=count_payload.get("count")
    if expected is None or len(ids)!=expected: raise RuntimeError(f"{name} ID/count mismatch: {len(ids)} vs {expected}")
    features=[]
    seen=set()
    for off in range(0,len(ids),batch_size):
        batch=ids[off:off+batch_size]
        payload=post_json(layer+"/query",{
            "objectIds":",".join(map(str,batch)),"outFields":"*","returnGeometry":"true",
            "outSR":"4326","f":"geojson"
        },timeout)
        page=payload.get("features")
        if not isinstance(page,list) or len(page)!=len(batch): raise RuntimeError(f"{name} incomplete batch at {off}")
        for f in page:
            oid=f.get("properties",{}).get("OBJECTID")
            if oid is None or oid in seen: raise RuntimeError(f"{name} missing/duplicate OBJECTID {oid}")
            seen.add(oid)
            features.append(f)
        print(f"{name}: {len(features):,}/{len(ids):,}")
        if pause: time.sleep(pause)
    if len(features)!=expected: raise RuntimeError(f"{name} final count mismatch")
    collection={"type":"FeatureCollection","name":name,"features":features}
    outdir.mkdir(parents=True,exist_ok=True)
    (outdir/f"{name}.geojson").write_text(json.dumps(collection),encoding="utf-8")
    return {"layer_id":layer_id,"service_url":BASE,"feature_count":len(features),
            "object_id_field":meta.get("objectIdField"),"global_id_field":meta.get("globalIdField"),
            "fields":[{"name":x["name"],"type":x["type"]} for x in meta.get("fields",[])],
            "source_spatial_reference":meta.get("spatialReference") or meta.get("extent",{}).get("spatialReference"),
            "output_spatial_reference":"EPSG:4326","snapshot_utc":dt.datetime.now(dt.timezone.utc).isoformat()}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--output-dir",type=Path,default=Path("build/houston-road-network"))
    ap.add_argument("--batch-size",type=int,default=500)
    ap.add_argument("--timeout",type=int,default=90)
    ap.add_argument("--pause",type=float,default=0.1)
    ap.add_argument("--self-test",action="store_true")
    a=ap.parse_args()
    if a.self_test:
        assert LAYERS=={"nodes":10,"links":12}
        print("self-test passed: official Nodes/Links layer mapping")
        return
    manifest={"dataset":"Houston official Nodes and Links","status":"raw_snapshot_only_not_routing_authority",
      "source_note":"City of Houston GIS landbase/roads service. Layer IDs checked against public layer catalog.",
      "acquired_at_utc":dt.datetime.now(dt.timezone.utc).isoformat(),"datasets":{}}
    for name,lid in LAYERS.items():
        manifest["datasets"][name]=acquire(name,lid,a.output_dir,a.batch_size,a.timeout,a.pause)
    (a.output_dir/"official-nodes-links-manifest.json").write_text(json.dumps(manifest,indent=2)+"\\n",encoding="utf-8")
    print(json.dumps({k:v["feature_count"] for k,v in manifest["datasets"].items()},indent=2))
if __name__=="__main__": main()
