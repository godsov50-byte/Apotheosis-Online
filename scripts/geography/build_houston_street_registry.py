#!/usr/bin/env python3
"""Compile a provenance-preserving street registry from a road snapshot.

Segment identities come from source GlobalIDs. Shared names create search groups,
not merged physical streets or route edges.
"""
from __future__ import annotations
import argparse,datetime as dt,hashlib,json,re,unicodedata
from collections import Counter
from pathlib import Path
from typing import Any
from urllib.parse import quote

NAMESPACE="coh_roadcenterline"
SOURCE_DATASET="ao-earth-houston-road-centerlines"
PROPERTY_FIELDS={
"official_or_source_name":"fullname","road_class_raw":"roadclass","one_way_raw":"onewaydir",
"lanes_raw":"lanes","speed_raw":"speed","functional_class_raw":"funcclass","source_record_raw":"source",
"municipality_left_raw":"munileft","municipality_right_raw":"muniright",
"address_from_left_raw":"fromleft","address_from_right_raw":"fromright",
"address_to_left_raw":"toleft","address_to_right_raw":"toright",
"actual_address_from_left_raw":"actfromleft","actual_address_from_right_raw":"actfromright",
"actual_address_to_left_raw":"acttoleft","actual_address_to_right_raw":"acttoright",
"address_parity_left_raw":"parityleft","address_parity_right_raw":"parityright",
"postal_code_left_raw":"zipleft","postal_code_right_raw":"zipright",
"source_last_edited_raw":"last_edited_date","source_shape_length_raw":"Shape__Length"}

def normalize_name(value: Any) -> str:
    if value is None: return ""
    return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(value))).strip().casefold()

def sha(value: str) -> str: return hashlib.sha256(value.encode("utf-8")).hexdigest()

def identity_key(global_id: str) -> str:
    return "ao:identity:v1:"+quote(NAMESPACE,safe="-_.!~*'()")+":"+quote(global_id,safe="-_.!~*'()")

def name_group_key(name: Any,left: Any,right: Any) -> str | None:
    normalized=normalize_name(name)
    if not normalized: return None
    municipalities=sorted({normalize_name(left),normalize_name(right)}-{""})
    material=json.dumps({"name":normalized,"municipalities":municipalities},
      ensure_ascii=False,sort_keys=True,separators=(",",":"))
    return "namegrp_"+sha(material)[:24]

def geometry_status(geometry: Any) -> str:
    if geometry is None: return "missing"
    if not isinstance(geometry,dict): raise ValueError("Geometry must be object or null.")
    kind=geometry.get("type")
    if kind not in ("LineString","MultiLineString"): raise ValueError(f"Unsupported geometry: {kind}")
    paths=[geometry.get("coordinates",[])] if kind=="LineString" else geometry.get("coordinates",[])
    if not paths: raise ValueError("Geometry has no paths.")
    for path in paths:
        if len(path)<2: raise ValueError("Road path has fewer than two vertices.")
        for point in path:
            if len(point)<2 or not (-180<=point[0]<=180 and -90<=point[1]<=90):
                raise ValueError("Malformed/non-WGS84 coordinate.")
    return "present"

def compile_registry(collection: dict[str,Any],source_manifest: dict[str,Any]|None=None):
    if collection.get("type")!="FeatureCollection" or not isinstance(collection.get("features"),list):
        raise ValueError("Input must be a GeoJSON FeatureCollection.")
    source_manifest=source_manifest or {}
    segments=[]; seen_gid=set(); seen_oid=set(); groups={}
    classes=Counter(); coverage=Counter(); missing_geom=0; unnamed=0
    for feature in collection["features"]:
        props=feature.get("properties") or {}; gid=props.get("GlobalID"); oid=props.get("OBJECTID")
        if gid is None or not str(gid).strip() or oid is None: raise ValueError("Each segment requires GlobalID and OBJECTID.")
        gid,oid=str(gid),str(oid)
        if gid in seen_gid or oid in seen_oid: raise ValueError("Duplicate source GlobalID or OBJECTID.")
        seen_gid.add(gid); seen_oid.add(oid)
        geom_state=geometry_status(feature.get("geometry"))
        if geom_state=="missing": missing_geom+=1
        name=props.get("fullname")
        if name is None or not str(name).strip(): unnamed+=1
        group_key=name_group_key(name,props.get("munileft"),props.get("muniright"))
        if group_key:
            group=groups.setdefault(group_key,{"name_group_key":group_key,"display_name":str(name).strip(),
              "normalized_name":normalize_name(name),"municipalities":sorted({str(v).strip() for v in
              (props.get("munileft"),props.get("muniright")) if v is not None and str(v).strip()}),
              "segment_identity_keys":[],"semantics":"search_index_only_not_physical_corridor_identity"})
            group["segment_identity_keys"].append(identity_key(gid))
        properties={key:props.get(field) for key,field in PROPERTY_FIELDS.items()}
        for key,value in properties.items():
            if value is not None and value!="": coverage[key]+=1
        road_class=props.get("roadclass")
        classes[str(road_class) if road_class not in (None,"") else "<unknown>"]+=1
        segments.append({"identity_key":identity_key(gid),"identity_namespace":NAMESPACE,
          "source_record_key":gid,"source_global_id":gid,"source_object_id":props["OBJECTID"],
          "source_centerline_id":props.get("centerlineid"),"name_group_key":group_key,
          "display_name":str(name).strip() if name is not None and str(name).strip() else None,
          "geometry_status":geom_state,"geometry":feature.get("geometry"),"properties":properties,
          "raw_source_attributes":props,"provenance":{"dataset_id":SOURCE_DATASET,
          "publisher":"City of Houston GIS / COHGIS","service_layer":"COH_RoadCenterline/0",
          "source_record_key":gid,"source_object_id":props["OBJECTID"],
          "source_data_last_edit_utc":source_manifest.get("source",{}).get("source_data_last_edit_utc"),
          "snapshot_sha256":source_manifest.get("geometry_sha256"),
          "property_values_are_source_reported_not_ao_verified":True}})
    segments.sort(key=lambda x:x["source_global_id"])
    for group in groups.values(): group["segment_identity_keys"].sort()
    group_list=sorted(groups.values(),key=lambda x:x["name_group_key"])
    report={"registry_id":"ao-houston-street-registry","registry_version":"1.0.0",
      "status":"compiled_local_artifact_not_imported_to_database","source_dataset":SOURCE_DATASET,
      "source_snapshot_sha256":source_manifest.get("geometry_sha256"),
      "source_acquired_at_utc":source_manifest.get("acquired_at_utc"),
      "compiled_at_utc":dt.datetime.now(dt.timezone.utc).isoformat(),
      "counts":{"source_segment_records":len(segments),"unique_source_global_ids":len(seen_gid),
      "unique_source_object_ids":len(seen_oid),"segments_with_geometry":len(segments)-missing_geom,
      "segments_missing_geometry":missing_geom,"unnamed_segments":unnamed,
      "distinct_name_groups":len(group_list),
      "distinct_named_labels":len({g["normalized_name"] for g in group_list})},
      "road_class_raw_counts":dict(sorted(classes.items())),
      "property_non_null_record_counts":dict(sorted(coverage.items())),
      "property_semantics":{"all_values":"raw source values; null means source supplied no value",
      "speed_lanes_one_way":"not decoded into routing rules","address_ranges":"source-side ranges, not verified address truth",
      "name_groups":"search grouping only; not a canonical physical corridor"},
      "identity_semantics":{"segment_identity":"source namespace + immutable source GlobalID",
      "names_coordinates_objectids":"mutable attributes or source locators, never identity"}}
    registry={"schema_version":"1.0.0","registry_id":"ao-houston-street-registry",
      "coordinate_reference":"EPSG:4326","coordinate_order":"longitude, latitude",
      "street_name_groups":group_list,"street_segments":segments,
      "intersections":{"status":"not_generated",
      "note":"Use reviewed official Nodes/Links and grade-separation evidence; do not infer intersections from line crossings."}}
    return registry,report

def self_test():
    data={"type":"FeatureCollection","features":[
      {"properties":{"OBJECTID":1,"GlobalID":"guid-a","fullname":"Main St","roadclass":"LOCAL","munileft":"HOUSTON","muniright":"HOUSTON"},
       "geometry":{"type":"LineString","coordinates":[[-95,29],[-95.001,29]]}},
      {"properties":{"OBJECTID":2,"GlobalID":"guid-b","fullname":" main   st ","roadclass":"LOCAL","munileft":"HOUSTON","muniright":"HOUSTON"},
       "geometry":{"type":"LineString","coordinates":[[-95.001,29],[-95.002,29]]}},
      {"properties":{"OBJECTID":3,"GlobalID":"guid-c","fullname":None},"geometry":None}]}
    registry,manifest=compile_registry(data,{"geometry_sha256":"a"*64})
    seg=registry["street_segments"]
    assert len(seg)==3 and len({x["identity_key"] for x in seg})==3
    assert seg[0]["identity_key"]!=seg[1]["identity_key"]
    assert seg[0]["name_group_key"]==seg[1]["name_group_key"]
    assert seg[2]["name_group_key"] is None
    assert manifest["counts"]["segments_missing_geometry"]==1
    assert manifest["counts"]["distinct_name_groups"]==1
    assert seg[0]["properties"]["speed_raw"] is None
    print("self-test passed: permanent segment identities, name grouping, null preservation")

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input",type=Path,default=Path("build/houston-road-network/roads.geojson"))
    p.add_argument("--source-manifest",type=Path,default=Path("build/houston-road-network/manifest.json"))
    p.add_argument("--output-dir",type=Path,default=Path("build/houston-road-network"))
    p.add_argument("--self-test",action="store_true"); a=p.parse_args()
    if a.self_test: self_test(); return 0
    source=json.loads(a.input.read_text(encoding="utf-8"))
    source_manifest=json.loads(a.source_manifest.read_text(encoding="utf-8")) if a.source_manifest.exists() else {}
    registry,report=compile_registry(source,source_manifest); a.output_dir.mkdir(parents=True,exist_ok=True)
    (a.output_dir/"street-registry.json").write_text(json.dumps(registry,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    (a.output_dir/"street-registry-manifest.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report["counts"],indent=2)); return 0
if __name__=="__main__":
    try: raise SystemExit(main())
    except Exception as exc: raise SystemExit(f"ERROR: {exc}")
