#!/usr/bin/env python3
"""Build a conservative, deterministic endpoint graph from AO's Houston road snapshot.

This creates a topology candidate, not a driving-authority graph. Only road
endpoints within the configured metric tolerance are joined. Interior crossings
are deliberately NOT connected: they may be bridges, tunnels, rail crossings,
or other grade-separated geometry. Raw direction/access fields are preserved.
"""
from __future__ import annotations
import argparse, hashlib, json, math, sys
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

def haversine(a: list[float], b: list[float]) -> float:
    r=6371008.8
    p1,p2=math.radians(a[1]),math.radians(b[1])
    dp=p2-p1; dl=math.radians(b[0]-a[0])
    h=math.sin(dl/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dp/2)**2
    return 2*r*math.asin(min(1.0,math.sqrt(h)))

def digest_id(prefix: str, value: str) -> str:
    return prefix + "_" + hashlib.sha256(value.encode()).hexdigest()[:20]

class UnionFind:
    def __init__(self,n:int): self.p=list(range(n)); self.rank=[0]*n
    def find(self,x:int)->int:
        while self.p[x]!=x:
            self.p[x]=self.p[self.p[x]]; x=self.p[x]
        return x
    def union(self,a:int,b:int)->None:
        a,b=self.find(a),self.find(b)
        if a==b:return
        if self.rank[a]<self.rank[b]:a,b=b,a
        self.p[b]=a
        if self.rank[a]==self.rank[b]:self.rank[a]+=1

def build(collection:dict[str,Any], tolerance_m:float)->tuple[dict[str,Any],dict[str,Any]]:
    endpoints=[]; raw_edges=[]; skipped=0
    for feature in collection.get("features",[]):
        props=feature.get("properties") or {}; geom=feature.get("geometry") or {}
        oid=props.get("GlobalID") or props.get("OBJECTID")
        if oid is None: skipped+=1; continue
        paths=[geom.get("coordinates",[])] if geom.get("type")=="LineString" else geom.get("coordinates",[]) if geom.get("type")=="MultiLineString" else []
        for pi,coords in enumerate(paths):
            if len(coords)<2: skipped+=1; continue
            start,end=coords[0],coords[-1]
            if len(start)<2 or len(end)<2: skipped+=1; continue
            ei=len(endpoints); endpoints.extend([
                {"coord":[float(start[0]),float(start[1])],"edge_index":len(raw_edges),"side":"from","source":str(oid),"path":pi},
                {"coord":[float(end[0]),float(end[1])],"edge_index":len(raw_edges),"side":"to","source":str(oid),"path":pi},
            ])
            length=sum(haversine(coords[i-1],coords[i]) for i in range(1,len(coords)))
            raw_edges.append({"source_id":str(oid),"source_object_id":props.get("OBJECTID"),
                "source_centerline_id":props.get("centerlineid"),"path_index":pi,
                "name":props.get("fullname"),"road_class":props.get("roadclass"),
                "oneway_raw":props.get("onewaydir"),"lanes_raw":props.get("lanes"),
                "speed_raw":props.get("speed"),"municipality_left":props.get("munileft"),
                "municipality_right":props.get("muniright"),"length_m":round(length,3),
                "geometry":{"type":"LineString","coordinates":coords},
                "from_endpoint":ei,"to_endpoint":ei+1})
    if not endpoints: raise ValueError("No valid road endpoints found.")
    lat0=sum(e["coord"][1] for e in endpoints)/len(endpoints)
    coslat=max(0.01,math.cos(math.radians(lat0)))
    def xy(c): return ((c[0])*111320*coslat,c[1]*110574)
    cell=max(tolerance_m,0.1); buckets=defaultdict(list); uf=UnionFind(len(endpoints))
    for i,e in enumerate(endpoints):
        x,y=xy(e["coord"]); gx,gy=math.floor(x/cell),math.floor(y/cell)
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                for j in buckets[(gx+dx,gy+dy)]:
                    x2,y2=xy(endpoints[j]["coord"])
                    if math.hypot(x-x2,y-y2)<=tolerance_m: uf.union(i,j)
        buckets[(gx,gy)].append(i)
    groups=defaultdict(list)
    for i in range(len(endpoints)): groups[uf.find(i)].append(i)
    nodes=[]; endpoint_node={}
    for members in groups.values():
        lon=sum(endpoints[i]["coord"][0] for i in members)/len(members)
        lat=sum(endpoints[i]["coord"][1] for i in members)/len(members)
        key=f"{lon:.6f},{lat:.6f}"
        nid=digest_id("hn",key)
        node={"id":nid,"coordinate":[round(lon,7),round(lat,7)],
              "degree":len(members),"endpoint_count":len(members),
              "endpoint_refs":[{"source_id":endpoints[i]["source"],"path_index":endpoints[i]["path"],"side":endpoints[i]["side"]} for i in members]}
        nodes.append(node)
        for i in members: endpoint_node[i]=nid
    edges=[]; adjacency=defaultdict(set)
    for raw in raw_edges:
        a=endpoint_node[raw.pop("from_endpoint")]; b=endpoint_node[raw.pop("to_endpoint")]
        eid=digest_id("he",f'{raw["source_id"]}:{raw["path_index"]}')
        edge={**raw,"id":eid,"from_node":a,"to_node":b,
              "topology_status":"endpoint_connected_candidate",
              "routing_status":"not_enabled_raw_direction_unvalidated"}
        edges.append(edge); adjacency[a].add(b); adjacency[b].add(a)
    unseen=set(adjacency); components=[]
    while unseen:
        start=unseen.pop(); q=deque([start]); members=[start]
        while q:
            n=q.popleft()
            for nxt in adjacency[n]:
                if nxt in unseen: unseen.remove(nxt); q.append(nxt); members.append(nxt)
        components.append(len(members))
    degree_counts=defaultdict(int)
    for n in nodes: degree_counts[str(n["degree"])]+=1
    report={"status":"endpoint_graph_built_needs_topology_review",
      "source_feature_count":len(collection.get("features",[])),
      "edge_count":len(edges),"node_count":len(nodes),"skipped_paths_or_features":skipped,
      "snap_tolerance_m":tolerance_m,"connected_component_count":len(components),
      "largest_component_nodes":max(components,default=0),
      "degree_histogram":dict(sorted(degree_counts.items(),key=lambda kv:int(kv[0]))),
      "isolated_nodes":sum(1 for n in nodes if n["degree"]==1),
      "limitations":["Only polyline endpoints are clustered; interior line crossings are not split or joined.",
       "No bridge/tunnel/rail/grade-separation attributes were validated; endpoint proximity is a candidate, not proof of at-grade connectivity.",
       "Raw one-way, speed, lane, and access values are preserved but not decoded.",
       "This undirected graph is not yet suitable for authoritative driving or pedestrian routing.",
       "Official City Nodes/Links remain separate until a verified ID/geometry crosswalk is established."]}
    graph={"schema_version":"1.0.0","graph_id":"ao-houston-road-endpoint-graph",
      "source_dataset":"ao-earth-houston-road-centerlines","coordinate_system":"EPSG:4326",
      "topology_method":"metric_endpoint_clustering_only","nodes":nodes,"edges":edges}
    return graph,report

def self_test()->None:
    c={"features":[
      {"properties":{"GlobalID":"a","OBJECTID":1,"fullname":"A"},"geometry":{"type":"LineString","coordinates":[[-95.0,29.0],[-94.999,29.0]]}},
      {"properties":{"GlobalID":"b","OBJECTID":2,"fullname":"B"},"geometry":{"type":"LineString","coordinates":[[-94.999,29.0],[-94.998,29.0]]}},
      {"properties":{"GlobalID":"c","OBJECTID":3,"fullname":"C"},"geometry":{"type":"LineString","coordinates":[[-94.997,29.0],[-94.996,29.0]]}},
    ]}
    g,r=build(c,1.5)
    assert r["edge_count"]==3 and r["node_count"]==4
    assert r["connected_component_count"]==2
    assert next(e for e in g["edges"] if e["source_id"]=="a")["to_node"]==next(e for e in g["edges"] if e["source_id"]=="b")["from_node"]
    print("self-test passed")

def main()->int:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input",type=Path,default=Path("build/houston-road-network/roads.geojson"))
    p.add_argument("--output-dir",type=Path,default=Path("build/houston-road-network"))
    p.add_argument("--snap-tolerance-m",type=float,default=1.5)
    p.add_argument("--self-test",action="store_true")
    a=p.parse_args()
    if a.self_test:self_test();return 0
    if not 0.1<=a.snap_tolerance_m<=5: p.error("--snap-tolerance-m must be between 0.1 and 5 metres")
    source=json.loads(a.input.read_text(encoding="utf-8"))
    graph,report=build(source,a.snap_tolerance_m)
    a.output_dir.mkdir(parents=True,exist_ok=True)
    (a.output_dir/"graph.json").write_text(json.dumps(graph,separators=(",",":"))+"\n",encoding="utf-8")
    (a.output_dir/"topology-report.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k!="limitations"},indent=2))
    return 0
if __name__=="__main__":
    try: raise SystemExit(main())
    except Exception as exc: print(f"ERROR: {exc}",file=sys.stderr); raise SystemExit(1)
