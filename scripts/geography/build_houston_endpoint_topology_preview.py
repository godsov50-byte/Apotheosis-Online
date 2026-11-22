#!/usr/bin/env python3
"""Build a conservative endpoint topology preview from Houston-local centerlines.

No internal geometric crossings are connected in this stage. Only endpoints that
fall into the same AO grid cell are grouped as node candidates. Elevation/bridge/
tunnel and access metadata are preserved for later review. Output is preview-only.
"""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
from collections import defaultdict

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def iter_lines(geom):
    if geom["type"] == "LineString":
        yield geom["coordinates"]
    elif geom["type"] == "MultiLineString":
        yield from geom["coordinates"]
    else:
        raise ValueError(f"Unsupported centerline geometry {geom.get('type')}")

def build(data, manifest, snap_mm=1000):
    if data.get("type") != "AOGridInputFeatureCollection" or data.get("coordinate_space") != "houston-v2-local-mm-preview":
        raise ValueError("Only Houston v2 local-mm preview geometry is accepted.")
    if manifest.get("status") != "preview_only_not_importable" or manifest.get("profile_version") != 2:
        raise ValueError("Source manifest must be a matching Houston v2 preview.")
    if not isinstance(snap_mm,int) or snap_mm < 1:
        raise ValueError("snap_mm must be a positive integer.")
    nodes=defaultdict(list); roads=[]; endpoint_records=[]
    for f in data.get("features",[]):
        props=f.get("properties") or {}
        sid=props.get("ao_source_identity")
        if not sid or props.get("ao_geometry_role")!="centerline_candidate" or props.get("ao_preview_only") is not True:
            raise ValueError("Feature provenance or preview role is invalid.")
        for line_no,line in enumerate(iter_lines(f["geometry"])):
            if len(line)<2: raise ValueError("Line path needs at least two coordinates.")
            for p in line:
                if len(p)!=2 or any(not isinstance(v,int) for v in p): raise ValueError("Coordinates must be integer millimetres.")
            road_key=f"{sid}:{line_no}"
            start,end=line[0],line[-1]
            def node_key(p): return (p[0]//snap_mm,p[1]//snap_mm)
            a,b=node_key(start),node_key(end)
            nodes[a].append({"road_path":road_key,"endpoint":"start","source_identity":sid,"coordinate_mm":start})
            nodes[b].append({"road_path":road_key,"endpoint":"end","source_identity":sid,"coordinate_mm":end})
            roads.append({"road_path":road_key,"source_identity":sid,"source_object_id":props.get("ao_source_object_id"),
              "start_node_candidate":list(a),"end_node_candidate":list(b),"vertex_count":len(line),
              "source_name":props.get("FULLNAME") or props.get("fullname") or props.get("STREETNAME") or None,
              "source_properties":props})
    node_list=[{"node_id":f"candidate-node:{u}:{v}","cell":[u,v],"degree":len(incidents),"incidents":incidents,
       "role":"endpoint_snap_candidate","preview_only":True} for (u,v),incidents in sorted(nodes.items())]
    output={"type":"AORoadEndpointTopologyPreview","schema_version":"1.0.0","profile_key":"houston","profile_version":2,
       "coordinate_space":data["coordinate_space"],"snap_cell_mm":snap_mm,"nodes":node_list,"road_paths":roads,
       "preview_only":True,"importable":False,
       "limitations":["Endpoints grouped by floor-divided grid cells, not distance-to-node tolerance.",
       "No internal segment intersections are split or connected.","No bridge/tunnel/elevation/access/turn validation.",
       "Endpoint candidate groups are not confirmed navigable intersections."]}
    raw=json.dumps(output,sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()
    report={"artifact":"ao-houston-road-endpoint-topology-preview","status":"preview_only_not_importable",
       "source_features":len(data.get("features",[])),"road_paths":len(roads),"endpoint_node_candidates":len(node_list),
       "candidate_degree_histogram":dict(sorted((str(k),sum(n["degree"]==k for n in node_list)) for k in set(n["degree"] for n in node_list))),
       "snap_cell_mm":snap_mm,"output_sha256":digest(raw),"authoritative_world_state":False,
       "limitations":output["limitations"]}
    return output,report

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input",type=Path,default=Path("build/houston-road-network-preview/grid/roads-local-mm.json"))
    ap.add_argument("--manifest",type=Path,default=Path("build/houston-road-network-preview/grid/roads-local-mm-manifest.json"))
    ap.add_argument("--output",type=Path,default=Path("build/houston-road-network-preview/grid/endpoint-topology.json"))
    ap.add_argument("--report",type=Path,default=Path("build/houston-road-network-preview/grid/endpoint-topology-report.json"))
    ap.add_argument("--snap-cell-mm",type=int,default=1000)
    args=ap.parse_args()
    source=json.loads(args.input.read_text(encoding="utf-8")); source_manifest=json.loads(args.manifest.read_text(encoding="utf-8"))
    out,rep=build(source,source_manifest,args.snap_cell_mm)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    raw=json.dumps(out,sort_keys=True,separators=(",",":"),ensure_ascii=False)+"\n"
    args.output.write_text(raw,encoding="utf-8")
    args.report.write_text(json.dumps(rep,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(rep,indent=2))
if __name__=="__main__": main()
