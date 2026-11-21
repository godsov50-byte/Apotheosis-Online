#!/usr/bin/env python3
"""Acquire all county-based 2025 TIGER/Line road centerlines for Texas.

Raw county ZIPs are preserved. Each county also gets a compressed GeoJSONL
view in WGS84 with source attributes and source identity retained.
"""
from __future__ import annotations
import argparse, concurrent.futures, datetime as dt, gzip, hashlib, io, json, re, sys, urllib.request, zipfile
from pathlib import Path
from typing import Any
from html.parser import HTMLParser

YEAR = 2025
STATE_FIPS = "48"
ROADS_INDEX = f"https://www2.census.gov/geo/tiger/TIGER{YEAR}/ROADS/"
EXPECTED_COUNTIES = 254
UA = "ApotheosisOnline-Geography/1.0 (+source-preserving acquisition)"

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.hrefs=[]
    def handle_starttag(self, tag, attrs):
        if tag.lower()=="a":
            href=dict(attrs).get("href")
            if href: self.hrefs.append(href)

def county_archive_names(index_html: str) -> list[str]:
    parser=Links(); parser.feed(index_html)
    names=sorted({h.rsplit("/",1)[-1] for h in parser.hrefs
      if re.fullmatch(r"tl_2025_48\d{3}_roads\.zip",h.rsplit("/",1)[-1])})
    if len(names)!=EXPECTED_COUNTIES:
        raise RuntimeError(f"Expected {EXPECTED_COUNTIES} Texas county road archives; found {len(names)}.")
    return names

def get(url: str, timeout: int=120) -> bytes:
    req=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(req,timeout=timeout) as r: return r.read()

def sha(data: bytes) -> str: return hashlib.sha256(data).hexdigest()

def transform_coords(coords: Any, transformer):
    if isinstance(coords,(list,tuple)) and len(coords)>=2 and isinstance(coords[0],(int,float)) and isinstance(coords[1],(int,float)):
        x,y=transformer.transform(float(coords[0]),float(coords[1]))
        return [x,y]
    if isinstance(coords,(list,tuple)): return [transform_coords(v,transformer) for v in coords]
    raise ValueError("Malformed shapefile coordinate tree")

def acquire_one(name: str, output: Path, timeout: int) -> dict[str,Any]:
    url=ROADS_INDEX+name; raw=get(url,timeout); raw_hash=sha(raw)
    county_fips=re.search(r"tl_2025_(48\d{3})_roads",name).group(1)
    county_dir=output/"raw"; county_dir.mkdir(parents=True,exist_ok=True)
    raw_path=county_dir/name; raw_path.write_bytes(raw)
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        members=set(z.namelist())
        shp=next((x for x in members if x.lower().endswith(".shp")),None)
        if not shp: raise RuntimeError(f"{name}: no .shp in archive")
        stem=shp[:-4]
        def member(ext):
            return next((x for x in members if x.lower()==(stem+ext).lower()),None)
        shp_bytes=z.read(shp); shx_bytes=z.read(member(".shx")); dbf_bytes=z.read(member(".dbf"))
        prj_name=member(".prj")
        prj=z.read(prj_name).decode("utf-8",errors="replace") if prj_name else ""
    import shapefile
    from pyproj import CRS, Transformer
    source_crs=CRS.from_wkt(prj) if prj.strip() else CRS.from_epsg(4269)
    transformer=Transformer.from_crs(source_crs,CRS.from_epsg(4326),always_xy=True)
    reader=shapefile.Reader(shp=io.BytesIO(shp_bytes),shx=io.BytesIO(shx_bytes),dbf=io.BytesIO(dbf_bytes),encoding="utf-8",encodingErrors="replace")
    fields=[f[0] for f in reader.fields[1:]]
    out_dir=output/"geojsonl"; out_dir.mkdir(parents=True,exist_ok=True)
    out_path=out_dir/(Path(name).stem+".geojsonl.gz")
    count=0; missing=0; linear_ids=set(); mtfcc={}
    with gzip.open(out_path,"wt",encoding="utf-8",newline="\n") as stream:
        for shape_rec in reader.iterShapeRecords():
            attrs=dict(zip(fields,list(shape_rec.record)))
            geom=shape_rec.shape.__geo_interface__
            if not geom.get("coordinates"): missing+=1; continue
            geom={"type":geom["type"],"coordinates":transform_coords(geom["coordinates"],transformer)}
            linear=str(attrs.get("LINEARID") or "")
            if linear: linear_ids.add(linear)
            code=str(attrs.get("MTFCC") or "<unknown>"); mtfcc[code]=mtfcc.get(code,0)+1
            feature={"type":"Feature","id":f"tl2025:{county_fips}:{linear or count+1}",
              "properties":{"source_dataset":f"tl-2025-roads-{county_fips}","county_geoid":county_fips,
                "source_linearid":linear or None,"source_attributes":attrs,
                "source_crs":source_crs.to_string(),"output_crs":"EPSG:4326"},
              "geometry":geom}
            stream.write(json.dumps(feature,separators=(",",":"),ensure_ascii=False)+"\n"); count+=1
    reader.close()
    digest=sha(out_path.read_bytes())
    return {"county_fips":county_fips,"archive":name,"archive_bytes":len(raw),"archive_sha256":raw_hash,
      "source_crs":source_crs.to_string(),"feature_count":count,"missing_geometry_count":missing,
      "unique_linearid_count":len(linear_ids),"mtfcc_counts":mtfcc,
      "geojsonl_gzip":str(out_path.relative_to(output)),"geojsonl_gzip_sha256":digest}

def acquire(output: Path, workers: int=6, timeout: int=120) -> dict[str,Any]:
    output.mkdir(parents=True,exist_ok=True)
    index=get(ROADS_INDEX,timeout).decode("utf-8",errors="replace")
    names=county_archive_names(index)
    started=dt.datetime.now(dt.timezone.utc).isoformat()
    results=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures={pool.submit(acquire_one,n,output,timeout):n for n in names}
        for future in concurrent.futures.as_completed(futures):
            result=future.result(); results.append(result)
            print(f"Texas counties acquired: {len(results)}/{len(names)}",file=sys.stderr)
    results.sort(key=lambda x:x["county_fips"])
    total=sum(x["feature_count"] for x in results)
    manifest={"dataset_id":"ao-texas-tiger-2025-roads","status":"acquired_source_snapshot",
      "publisher":"U.S. Census Bureau","product":"2025 TIGER/Line county-based Roads",
      "index_url":ROADS_INDEX,"source_state_fips":STATE_FIPS,"expected_counties":EXPECTED_COUNTIES,
      "acquired_counties":len(results),"coverage_complete_by_archive_inventory":len(results)==EXPECTED_COUNTIES,
      "source_crs_note":"Per-county .prj is retained and recorded; output GeoJSONL is transformed to EPSG:4326.",
      "coordinate_order":"longitude, latitude","acquired_at_utc":started,
      "feature_count":total,"missing_geometry_count":sum(x["missing_geometry_count"] for x in results),
      "counties":results,"limitations":[
        "TIGER/Line is a generalized geographic road reference, not surveyed pavement geometry.",
        "It does not by itself establish current road condition, public access, sidewalks, legal crossings, turn restrictions, or routability.",
        "County edge duplicates or adjacent-county split segments are preserved; do not merge by name.",
        "Houston local COH centerlines are a higher-detail supplemental source and must remain separate source records.",
        "A complete 254-county archive inventory is not proof of every road's real-world completeness; compare with TxDOT and local authoritative sources."
      ]}
    encoded=(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n").encode()
    (output/"manifest.json").write_bytes(encoded)
    return manifest

def self_test():
    html="".join(f'<a href="tl_2025_48{i:03d}_roads.zip">x</a>' for i in range(1,255))
    assert len(county_archive_names(html))==254
    try: county_archive_names('<a href="tl_2025_48001_roads.zip">x</a>')
    except RuntimeError: pass
    else: raise AssertionError("Incomplete county inventory was accepted")
    print("self-test passed: Texas county archive inventory completeness gate")

def main():
    p=argparse.ArgumentParser(description=__doc__); p.add_argument("--output-dir",type=Path,default=Path("build/texas-roads"))
    p.add_argument("--workers",type=int,default=6); p.add_argument("--timeout",type=int,default=120)
    p.add_argument("--self-test",action="store_true"); a=p.parse_args()
    if a.self_test: self_test(); return 0
    m=acquire(a.output_dir,a.workers,a.timeout)
    print(json.dumps({"counties":m["acquired_counties"],"features":m["feature_count"],
      "missing_geometry":m["missing_geometry_count"],"complete":m["coverage_complete_by_archive_inventory"]},indent=2))
    return 0
if __name__=="__main__":
    try: raise SystemExit(main())
    except Exception as exc: print(f"ERROR: {exc}",file=sys.stderr); raise SystemExit(1)
