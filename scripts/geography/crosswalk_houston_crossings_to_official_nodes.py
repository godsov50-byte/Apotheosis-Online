#!/usr/bin/env python3
"""Cross-reference geometric road-crossing candidates to official Houston node evidence.

This creates a review crosswalk only. A nearby official node does not prove two
roads connect (bridges, ramps, rail crossings, and other grade separation remain).
Requires Shapely 2.x and pyproj.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
from pyproj import Transformer
from shapely.geometry import Point, shape
from shapely.strtree import STRtree

WGS84_TO_HOUSTON = Transformer.from_crs("EPSG:4326", "EPSG:2278", always_xy=True)

def project_lonlat(lon, lat):
    return Point(*WGS84_TO_HOUSTON.transform(lon, lat))

def crosswalk(candidates_report, nodes_geojson, radius_m=15.0):
    nodes=[]
    geometries=[]
    for feature in nodes_geojson.get("features", []):
        geom=feature.get("geometry")
        if not geom: continue
        point=shape(geom)
        if point.geom_type != "Point": continue
        lon,lat=point.x,point.y
        p=project_lonlat(lon,lat)
        props=feature.get("properties") or {}
        nodes.append({"point":p,"properties":props,"lonlat":[lon,lat]})
        geometries.append(p)
    tree=STRtree(geometries) if geometries else None
    radius_ft=radius_m*3.280839895
    output=[]
    for cand in candidates_report.get("candidates", []):
        lon,lat=cand["point_wgs84"]
        target=project_lonlat(lon,lat)
        nearby=[]
        if tree is not None:
            for idx in tree.query(target.buffer(radius_ft)):
                node=nodes[int(idx)]
                dist_ft=target.distance(node["point"])
                dist_m=dist_ft/3.280839895
                if dist_m <= radius_m:
                    nearby.append({"distance_m":round(dist_m,3),"node_lonlat":node["lonlat"],
                                  "node_properties":node["properties"]})
        nearby.sort(key=lambda x:x["distance_m"])
        if not nearby: status="no_official_node_within_radius"
        elif len(nearby)==1: status="single_official_node_candidate"
        else: status="multiple_official_nodes_candidate"
        output.append({"candidate_id":cand.get("candidate_id"),"point_wgs84":cand["point_wgs84"],
          "roads":[cand.get("road_a"),cand.get("road_b")],"official_node_match_status":status,
          "nearby_official_nodes":nearby,"radius_m":radius_m,
          "topology_decision":"not_assumed",
          "review_note":"Spatial crosswalk only; official point proximity is not a connectivity assertion."})
    summary={"source_candidate_count":len(candidates_report.get("candidates",[])),
      "official_node_point_count":len(nodes),"search_radius_m":radius_m,
      "match_status_counts":{},"decision_policy":"no matches are automatically connected",
      "crosswalk":output}
    for row in output:
        key=row["official_node_match_status"]
        summary["match_status_counts"][key]=summary["match_status_counts"].get(key,0)+1
    return summary

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--candidates",type=Path)
    ap.add_argument("--nodes",type=Path)
    ap.add_argument("--output",type=Path)
    ap.add_argument("--radius-m",type=float,default=15.0)
    ap.add_argument("--self-test",action="store_true")
    a=ap.parse_args()
    if a.self_test:
        fake_candidates={"candidates":[{"candidate_id":"test","point_wgs84":[-95.0,29.7],"road_a":{},"road_b":{}}]}
        # Known coordinate and duplicate point tests are intentionally simple.
        lon,lat=-95.0,29.7
        projected=project_lonlat(lon,lat)
        back=Transformer.from_crs("EPSG:2278","EPSG:4326",always_xy=True).transform(projected.x,projected.y)
        assert abs(back[0]-lon)<1e-7 and abs(back[1]-lat)<1e-7
        nodes={"features":[{"geometry":{"type":"Point","coordinates":[lon,lat]},"properties":{"NODETYPE":"Intersection"}}]}
        out=crosswalk(fake_candidates,nodes,10)
        assert out["crosswalk"][0]["official_node_match_status"]=="single_official_node_candidate"
        assert out["crosswalk"][0]["topology_decision"]=="not_assumed"
        assert crosswalk(fake_candidates,{"features":[]},10)["crosswalk"][0]["official_node_match_status"]=="no_official_node_within_radius"
        print("self-test passed: projection, nearest-node crosswalk, conservative status")
        return
    if not a.candidates or not a.nodes or not a.output:
        ap.error("--candidates, --nodes, and --output are required unless --self-test is used")
    candidates=json.loads(a.candidates.read_text(encoding="utf-8"))
    nodes=json.loads(a.nodes.read_text(encoding="utf-8"))
    report=crosswalk(candidates,nodes,a.radius_m)
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({k:v for k,v in report.items() if k!="crosswalk"},indent=2))
if __name__=="__main__": main()
