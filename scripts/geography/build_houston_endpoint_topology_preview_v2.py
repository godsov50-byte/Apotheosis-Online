#!/usr/bin/env python3
"""Create distance-tolerant endpoint junction candidates (preview only).

Unlike the v1 floor-cell grouping, this stage clusters endpoints by Euclidean
distance using a spatial hash and deterministic union-find. It still does not
connect internal line crossings or validate grade separation/access.
"""
from __future__ import annotations
import argparse, hashlib, json
from collections import defaultdict
from pathlib import Path

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def paths(geom):
    if geom["type"] == "LineString":
        yield geom["coordinates"]
    elif geom["type"] == "MultiLineString":
        yield from geom["coordinates"]
    else:
        raise ValueError(f"Unsupported geometry type: {geom.get('type')}")

def build(data, manifest, tolerance_mm=1000):
    if data.get("type") != "AOGridInputFeatureCollection" or data.get("coordinate_space") != "houston-v2-local-mm-preview":
        raise ValueError("Only Houston v2 local-mm preview geometry is accepted.")
    if manifest.get("status") != "preview_only_not_importable" or manifest.get("profile_version") != 2:
        raise ValueError("A matching preview-only profile manifest is required.")
    if not isinstance(tolerance_mm,int) or tolerance_mm < 0:
        raise ValueError("tolerance_mm must be a nonnegative integer.")
    endpoints=[]; road_paths=[]
    for f in data.get("features",[]):
        props=f.get("properties") or {}; sid=props.get("ao_source_identity")
        if not sid or props.get("ao_geometry_role")!="centerline_candidate" or props.get("ao_preview_only") is not True:
            raise ValueError("Feature provenance/preview role is invalid.")
        for idx,line in enumerate(paths(f["geometry"])):
            if len(line)<2: raise ValueError("Line path needs >=2 vertices.")
            for p in line:
                if len(p)!=2 or any(not isinstance(v,int) for v in p): raise ValueError("Coordinates must be integer mm.")
            key=f"{sid}:{idx}"
            start_index=len(endpoints); endpoints.extend([
                {"road_path":key,"endpoint":"start","source_identity":sid,"xy":line[0]},
                {"road_path":key,"endpoint":"end","source_identity":sid,"xy":line[-1]}])
            road_paths.append({"road_path":key,"source_identity":sid,"source_object_id":props.get("ao_source_object_id"),
                "start_endpoint_index":start_index,"end_endpoint_index":start_index+1,"vertex_count":len(line),
                "source_name":props.get("FULLNAME") or props.get("fullname") or props.get("STREETNAME") or None,
                "source_properties":props})
    parent=list(range(len(endpoints)))
    def find(x):
        while parent[x]!=x:
            parent[x]=parent[parent[x]]; x=parent[x]
        return x
    def union(a,b):
        ra,rb=find(a),find(b)
        if ra!=rb: parent[max(ra,rb)]=min(ra,rb)
    cell=max(1,tolerance_mm)
    buckets=defaultdict(list)
    for i,e in enumerate(endpoints):
        x,y=e["xy"]; cx,cy=x//cell,y//cell
        for bx in range(cx-1,cx+2):
            for by in range(cy-1,cy+2):
                for j in buckets[(bx,by)]:
                    px,py=endpoints[j]["xy"]
                    if (x-px)**2+(y-py)**2<=tolerance_mm**2: union(i,j)
        buckets[(cx,cy)].append(i)
    clusters=defaultdict(list)
    for i,e in enumerate(endpoints): clusters[find(i)].append(i)
    ordered=sorted(clusters.values(),key=lambda ids:(min(endpoints[i]["xy"][0] for i in ids),min(endpoints[i]["xy"][1] for i in ids),min(ids)))
    endpoint_to_node={}
    nodes=[]
    for ni,ids in enumerate(ordered):
        node_id=f"endpoint-node:{ni}"
        for i in ids: endpoint_to_node[i]=node_id
        incidents=[{"road_path":endpoints[i]["road_path"],"endpoint":endpoints[i]["endpoint"],
            "source_identity":endpoints[i]["source_identity"],"coordinate_mm":endpoints[i]["xy"]} for i in ids]
        xs=[endpoints[i]["xy"][0] for i in ids]; ys=[endpoints[i]["xy"][1] for i in ids]
        nodes.append({"node_id":node_id,"representative_xy_mm":[round(sum(xs)/len(xs)),round(sum(ys)/len(ys))],
            "endpoint_count":len(ids),"degree":len(incidents),"incidents":incidents,
            "role":"endpoint_junction_candidate","preview_only":True})
    for road in road_paths:
        road["start_node_candidate"]=endpoint_to_node[road.pop("start_endpoint_index")]
        road["end_node_candidate"]=endpoint_to_node[road.pop("end_endpoint_index")]
    out={"type":"AORoadEndpointTopologyPreview","schema_version":"2.0.0","profile_key":"houston","profile_version":2,
        "coordinate_space":data["coordinate_space"],"snap_tolerance_mm":tolerance_mm,"nodes":nodes,"road_paths":road_paths,
        "preview_only":True,"importable":False,
        "limitations":["Endpoints clustered by Euclidean tolerance; cluster chaining may exceed tolerance end-to-end.",
        "Internal geometric crossings are not split or connected.","Grade separation, bridge/tunnel, access, and turn restrictions are not validated.",
        "Endpoint clusters are candidates, not confirmed navigable intersections."]}
    raw=json.dumps(out,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()
    report={"artifact":"ao-houston-road-endpoint-topology-preview-v2","status":"preview_only_not_importable",
        "source_features":len(data.get("features",[])),"road_paths":len(road_paths),"endpoint_node_candidates":len(nodes),
        "candidate_degree_histogram":dict(sorted((str(k),sum(n["degree"]==k for n in nodes)) for k in set(n["degree"] for n in nodes))),
        "snap_tolerance_mm":tolerance_mm,"output_sha256":sha(raw),"authoritative_world_state":False,
        "limitations":out["limitations"]}
    return out,report

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input",type=Path,default=Path("build/houston-road-network-preview/grid/roads-local-mm.json"))
    ap.add_argument("--manifest",type=Path,default=Path("build/houston-road-network-preview/grid/roads-local-mm-manifest.json"))
    ap.add_argument("--output",type=Path,default=Path("build/houston-road-network-preview/grid/endpoint-topology-v2.json"))
    ap.add_argument("--report",type=Path,default=Path("build/houston-road-network-preview/grid/endpoint-topology-v2-report.json"))
    ap.add_argument("--tolerance-mm",type=int,default=1000)
    args=ap.parse_args()
    src=json.loads(args.input.read_text(encoding="utf-8")); man=json.loads(args.manifest.read_text(encoding="utf-8"))
    out,rep=build(src,man,args.tolerance_mm)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(out,sort_keys=True,separators=(",",":"),ensure_ascii=False)+"\\n",encoding="utf-8")
    args.report.write_text(json.dumps(rep,indent=2,ensure_ascii=False)+"\\n",encoding="utf-8")
    print(json.dumps(rep,indent=2))
if __name__=="__main__": main()
