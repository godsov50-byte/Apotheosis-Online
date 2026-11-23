#!/usr/bin/env python3
"""Acquire a complete, provenance-preserving City of Houston road snapshot."""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, os, sys, tempfile, time
import urllib.error, urllib.parse, urllib.request
from pathlib import Path
from typing import Any

LAYER_URL = ("https://services.arcgis.com/NummVBqZSIJKUeVR/ArcGIS/rest/services/"
             "COH_RoadCenterline/FeatureServer/0")
WHERE = "munileft='HOUSTON' OR muniright='HOUSTON'"
OUT_FIELDS = ["OBJECTID","GlobalID","centerlineid","fullname","roadclass","onewaydir",
"lanes","speed","funcclass","source","munileft","muniright","fromleft","fromright",
"toleft","toright","actfromleft","actfromright","acttoleft","acttoright",
"parityleft","parityright","zipleft","zipright","last_edited_date","Shape__Length"]

def request_json(url: str, timeout: int, data: bytes | None = None, retries: int = 4) -> dict[str, Any]:
    method = "POST" if data is not None else "GET"
    headers = {"User-Agent":"ApotheosisOnline-Geography/1.0"}
    if data is not None: headers["Content-Type"]="application/x-www-form-urlencoded"
    request=urllib.request.Request(url,data=data,headers=headers,method=method)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request,timeout=timeout) as response:
                payload=json.loads(response.read().decode("utf-8"))
            if "error" in payload: raise RuntimeError(f"ArcGIS error: {payload['error']}")
            return payload
        except urllib.error.HTTPError as exc:
            detail=exc.read(1200).decode("utf-8",errors="replace")
            raise RuntimeError(f"ArcGIS HTTP {exc.code}: {detail}") from exc
        except (urllib.error.URLError,TimeoutError,json.JSONDecodeError) as exc:
            if attempt+1==retries: raise RuntimeError(f"ArcGIS request failed: {exc}") from exc
            time.sleep(2**attempt)
    raise AssertionError("unreachable")

def get_json(url: str, timeout: int) -> dict[str, Any]:
    return request_json(url,timeout)

def post_json(url: str, params: dict[str,Any], timeout: int) -> dict[str,Any]:
    return request_json(url,timeout,data=urllib.parse.urlencode(params).encode("utf-8"))

def query_url(params: dict[str,Any]) -> str:
    return LAYER_URL+"/query?"+urllib.parse.urlencode(params)

def validate_feature(feature: dict[str,Any]) -> None:
    props=feature.get("properties") or {}
    if props.get("OBJECTID") is None or not props.get("GlobalID"):
        raise ValueError("Every source record must have OBJECTID and GlobalID.")
    geometry=feature.get("geometry")
    if geometry is None: return
    kind=geometry.get("type")
    if kind not in ("LineString","MultiLineString"): raise ValueError(f"Unsupported geometry: {kind}")
    paths=[geometry["coordinates"]] if kind=="LineString" else geometry["coordinates"]
    if not paths: raise ValueError("Road geometry has no paths.")
    for path in paths:
        if len(path)<2: raise ValueError("Road path has fewer than two vertices.")
        for point in path:
            if len(point)<2: raise ValueError("Malformed coordinate.")
            lon,lat=point[:2]
            if not (-180<=lon<=180 and -90<=lat<=90): raise ValueError("Coordinates are not WGS84.")

def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=path.name+".",dir=str(path.parent))
    try:
        with os.fdopen(fd,"wb") as stream:
            stream.write(content); stream.flush(); os.fsync(stream.fileno())
        os.replace(tmp,path)
    except Exception:
        try: os.unlink(tmp)
        except FileNotFoundError: pass
        raise

def canonical_feature_order(features: list[dict[str,Any]]) -> list[dict[str,Any]]:
    """Return source features in stable OBJECTID order before hashing/serialization."""
    return sorted(features,key=lambda feature:int((feature.get("properties") or {})["OBJECTID"]))

def acquire(output_dir: Path,batch_size: int=500,timeout: int=90,pause: float=0.15) -> dict[str,Any]:
    if not 1<=batch_size<=1000: raise ValueError("batch_size must be 1..1000")
    acquired_at=dt.datetime.now(dt.timezone.utc).isoformat()
    metadata=get_json(LAYER_URL+"?f=pjson",timeout)
    edit_start=metadata.get("editingInfo",{}).get("dataLastEditDate")
    ids_data=get_json(query_url({"where":WHERE,"returnIdsOnly":"true","returnGeometry":"false","f":"json"}),timeout)
    ids=sorted(set(ids_data.get("objectIds") or []))
    count=get_json(query_url({"where":WHERE,"returnCountOnly":"true","f":"json"}),timeout).get("count")
    if count is None or len(ids)!=count or not ids:
        raise RuntimeError(f"Source count/ID mismatch: count={count}, unique IDs={len(ids)}")
    features=[]; seen=set(); null_geometry=[]
    for offset in range(0,len(ids),batch_size):
        batch=ids[offset:offset+batch_size]
        page=post_json(LAYER_URL+"/query",{"objectIds":",".join(map(str,batch)),
          "outFields":",".join(OUT_FIELDS),"returnGeometry":"true","outSR":"4326","f":"geojson"},timeout).get("features")
        if not isinstance(page,list) or len(page)!=len(batch): raise RuntimeError(f"Incomplete batch at {offset}")
        for feature in page:
            validate_feature(feature); oid=int(feature["properties"]["OBJECTID"])
            if oid in seen: raise RuntimeError(f"Duplicate OBJECTID: {oid}")
            seen.add(oid)
            if feature.get("geometry") is None: null_geometry.append(oid)
            features.append(feature)
        print(f"Acquired {len(features):,}/{len(ids):,}",file=sys.stderr)
        if pause: time.sleep(pause)
    edit_end=get_json(LAYER_URL+"?f=pjson",timeout).get("editingInfo",{}).get("dataLastEditDate")
    if edit_start!=edit_end: raise RuntimeError("Source changed during acquisition; refusing mixed-time snapshot.")
    if len(features)!=count or seen!=set(ids): raise RuntimeError("Final features do not match source IDs.")
    features=canonical_feature_order(features)
    collection={"type":"FeatureCollection","name":"ao_houston_road_centerlines",
      "crs":{"type":"name","properties":{"name":"EPSG:4326"}},"features":features}
    data=(json.dumps(collection,ensure_ascii=False,separators=(",",":"))+"\n").encode()
    digest=hashlib.sha256(data).hexdigest()
    edit_utc=dt.datetime.fromtimestamp(edit_start/1000,dt.timezone.utc).isoformat() if edit_start else None
    manifest={"dataset_id":"ao-earth-houston-road-centerlines","dataset_version":"source-snapshot",
      "status":"acquired_local_snapshot","source":{"provider":"City of Houston GIS / COHGIS",
      "service":"COH_RoadCenterline","layer_id":0,"url":LAYER_URL,"query_filter":WHERE,
      "source_object_id":"OBJECTID","source_global_id":"GlobalID","source_centerline_id":"centerlineid",
      "source_crs":"EPSG:2278","source_units":"US survey feet","download_crs":"EPSG:4326",
      "coordinate_order":"longitude, latitude","source_data_last_edit_epoch_ms":edit_start,
      "source_data_last_edit_utc":edit_utc,"fields_requested":OUT_FIELDS},
      "scope":{"jurisdiction":"Houston on either side of each road segment",
      "includes_city_boundary_connectors":True,"excludes_segments_with_neither_side_identified_as_houston":True},
      "acquired_at_utc":acquired_at,"feature_count":len(features),"unique_object_id_count":len(seen),
      "null_geometry_feature_count":len(null_geometry),"null_geometry_object_ids":sorted(null_geometry),
      "geometry_sha256":digest,"limitations":[
      "Reference data only; not warranted for survey or engineering use.",
      "Centerlines are not lane-level driving surfaces or pedestrian/sidewalk networks.",
      "One-way, speed, lane and access values remain raw; they are not routing rules.",
      "Line crossings do not prove at-grade intersections; grade separation and turn restrictions need review."]}
    atomic_write(output_dir/"roads.geojson",data)
    atomic_write(output_dir/"manifest.json",(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n").encode())
    return manifest

def main() -> int:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output-dir",type=Path,default=Path("build/houston-road-network"))
    p.add_argument("--batch-size",type=int,default=500); p.add_argument("--timeout",type=int,default=90)
    p.add_argument("--pause",type=float,default=0.15); a=p.parse_args()
    m=acquire(a.output_dir,a.batch_size,a.timeout,a.pause)
    print(json.dumps({"feature_count":m["feature_count"],"null_geometry_feature_count":m["null_geometry_feature_count"],
      "snapshot_sha256":m["geometry_sha256"],"output_dir":str(a.output_dir)},indent=2))
    return 0
if __name__=="__main__":
    try: raise SystemExit(main())
    except Exception as exc: print(f"ERROR: {exc}",file=sys.stderr); raise SystemExit(1)
