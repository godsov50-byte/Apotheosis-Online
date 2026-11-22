/* AO geographic grid + road/entrance navigation preview.
 * Local prototype only: uses imported OSM centerlines and explicitly authored AO entrances.
 * Does not create entrances, infer sidewalks, or commit movement to Kernel/WorldHeart.
 */
(() => {
  "use strict";
  const runtime = window.AOCityConsoleRuntime;
  const map = window.AOCityConsoleMap;
  if (!runtime || !map || !window.L) return;
  const { state, updateEnvoy, renderObjects, updateNavigation, chat } = runtime;
  const DB_NAME = "ao-city-registry-cache-v1";
  const DB_VERSION = 2;
  const ENTRANCE_PINS_KEY = "ao-city-entrance-addresses-v1";
  const $ = (id) => document.getElementById(id);
  let gridLayer = null;
  let routeLayer = L.layerGroup().addTo(map);
  let routeBusy = false;
  let routeToken = 0;
  let activePath = null;
  const WALKABLE = new Set(["footway","path","pedestrian","steps","living_street","residential","service","tertiary","tertiary_link","secondary","secondary_link","primary","primary_link","unclassified","track","bridleway","cycleway"]);
  const RAD = Math.PI / 180;
  const meters = (a,b) => {
    const p1=a.lat*RAD,p2=b.lat*RAD,dp=(b.lat-a.lat)*RAD,dl=(b.lng-a.lng)*RAD;
    const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return 6371008.8*2*Math.asin(Math.sqrt(h));
  };
  function gridSpacing(zoom) {
    if (zoom >= 20) return 1;
    if (zoom >= 19) return 2;
    if (zoom >= 18) return 5;
    if (zoom >= 17) return 10;
    if (zoom >= 16) return 25;
    if (zoom >= 15) return 50;
    if (zoom >= 14) return 100;
    if (zoom >= 13) return 200;
    return 500;
  }
  const Grid = L.GridLayer.extend({
    createTile(coords) {
      const tile=document.createElement("canvas"),size=this.getTileSize();
      tile.width=size.x;tile.height=size.y;
      const ctx=tile.getContext("2d"),spacing=gridSpacing(map.getZoom());
      if(!spacing)return tile;
      const bounds=this._tileCoordsToBounds(coords),south=bounds.getSouth(),north=bounds.getNorth(),west=bounds.getWest(),east=bounds.getEast();
      const mid=(south+north)/2,latStep=spacing/111320,lngStep=spacing/(111320*Math.max(.1,Math.cos(mid*RAD)));
      const origin=this._map.project(bounds.getNorthWest(),coords.z);
      ctx.strokeStyle="rgba(33,112,151,.78)";ctx.lineWidth=1.25;
      ctx.beginPath();
      const firstLat=Math.ceil(south/latStep)*latStep;
      for(let lat=firstLat;lat<=north+latStep*.01;lat+=latStep){
        const p=this._map.project([lat,west],coords.z);const y=p.y-origin.y;
        ctx.moveTo(0,y);ctx.lineTo(size.x,y);
      }
      const firstLng=Math.ceil(west/lngStep)*lngStep;
      for(let lng=firstLng;lng<=east+lngStep*.01;lng+=lngStep){
        const p=this._map.project([north,lng],coords.z);const x=p.x-origin.x;
        ctx.moveTo(x,0);ctx.lineTo(x,size.y);
      }
      ctx.stroke();
      return tile;
    }
  });
  function installGrid(){
    if(!gridLayer){gridLayer=new Grid({pane:"overlayPane",opacity:1,updateWhenZooming:false,updateWhenIdle:true,keepBuffer:1});gridLayer.addTo(map);}
    gridLayer.redraw();
  }
  map.on("zoomend moveend",installGrid);
  installGrid();

  function openDB(){
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,DB_VERSION);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error("Could not open imported road registry."));
    });
  }
  async function loadRoads(){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction("features","readonly"),request=tx.objectStore("features").index("kind").getAll("street");
      request.onsuccess=()=>resolve(request.result||[]);
      request.onerror=()=>reject(request.error||new Error("Could not read imported street centerlines."));
    });
  }
  function roadAllowed(record){
    const p=record.rawProperties||record.properties||{},highway=String(p.highway||"").toLowerCase();
    if(!WALKABLE.has(highway))return false;
    if(String(p.foot||"").toLowerCase()==="no"||String(p.access||"").toLowerCase()==="no"||String(p.access||"").toLowerCase()==="private")return false;
    if(String(p.motor_vehicle||"").toLowerCase()==="no" && !p.foot)return false;
    return true;
  }
  function nodeKey(point,layer){const lat=Math.round(point[1]*1e5),lng=Math.round(point[0]*1e5);return layer+"|"+lat+"|"+lng;}
  function buildGraph(records){
    const nodes=new Map(),edges=[];
    for(const record of records){
      if(!roadAllowed(record)||record.geometry?.type!=="LineString")continue;
      const props=record.rawProperties||record.properties||{};
      const layer=String(props.layer||"0")+":"+(props.bridge||"")+":"+(props.tunnel||"");
      const coords=record.geometry.coordinates||[];
      for(let i=1;i<coords.length;i++){
        const a=coords[i-1],b=coords[i];
        if(!Array.isArray(a)||!Array.isArray(b)||a.length<2||b.length<2)continue;
        const ka=nodeKey(a,layer),kb=nodeKey(b,layer);
        if(ka===kb)continue;
        if(!nodes.has(ka))nodes.set(ka,{key:ka,lat:a[1],lng:a[0],edges:[]});
        if(!nodes.has(kb))nodes.set(kb,{key:kb,lat:b[1],lng:b[0],edges:[]});
        const edge={a:ka,b:kb,cost:meters(nodes.get(ka),nodes.get(kb)),recordId:record.id};
        edges.push(edge);nodes.get(ka).edges.push({to:kb,cost:edge.cost});nodes.get(kb).edges.push({to:ka,cost:edge.cost});
      }
    }
    return {nodes,edges};
  }
  function snapToNetwork(graph,point,maxMeters,keyPrefix){
    let best=null,bestDistance=Infinity;
    for(const node of graph.nodes.values()){
      const d=meters(point,node);
      if(d<bestDistance){best={kind:"node",node};bestDistance=d;}
    }
    // Project onto every imported centerline segment, not just sparse OSM vertices.
    const cos=Math.max(.1,Math.cos(point.lat*RAD));
    for(const edge of graph.edges){
      const a=graph.nodes.get(edge.a),b=graph.nodes.get(edge.b);
      const ax=(a.lng-point.lng)*111320*cos, ay=(a.lat-point.lat)*111320;
      const bx=(b.lng-point.lng)*111320*cos, by=(b.lat-point.lat)*111320;
      const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
      const t=den?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/den)):0;
      const x=ax+t*dx,y=ay+t*dy,d=Math.hypot(x,y);
      if(d<bestDistance){
        bestDistance=d;
        best={kind:"edge",edge,t,lat:point.lat+y/111320,lng:point.lng+x/(111320*cos)};
      }
    }
    if(!best||bestDistance>maxMeters)return null;
    if(best.kind==="node")return {node:best.node,distance:bestDistance};
    const {edge,t}=best;
    if(t<0.00001)return {node:graph.nodes.get(edge.a),distance:bestDistance};
    if(t>0.99999)return {node:graph.nodes.get(edge.b),distance:bestDistance};
    const key=keyPrefix+"|"+edge.a+"|"+edge.b;
    const node={key,lat:best.lat,lng:best.lng,edges:[]};
    const a=graph.nodes.get(edge.a),b=graph.nodes.get(edge.b);
    a.edges=a.edges.filter(e=>e.to!==edge.b);
    b.edges=b.edges.filter(e=>e.to!==edge.a);
    const costA=meters(a,node),costB=meters(node,b);
    a.edges.push({to:key,cost:costA});b.edges.push({to:key,cost:costB});
    node.edges.push({to:edge.a,cost:costA},{to:edge.b,cost:costB});
    graph.nodes.set(key,node);
    graph.edges.push({a:edge.a,b:key,cost:costA},{a:key,b:edge.b,cost:costB});
    return {node,distance:bestDistance};
  }
  function shortestPath(graph,startKey,endKey){
    const dist=new Map([[startKey,0]]),prev=new Map(),heap=[];
    const push=(item)=>{heap.push(item);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].cost<=item.cost)break;heap[i]=heap[p];i=p;}heap[i]=item;};
    const pop=()=>{if(!heap.length)return null;const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let l=i*2+1,r=l+1,c=i;if(l<heap.length&&heap[l].cost<last.cost)c=l;if(r<heap.length&&heap[r].cost<(c===i?last.cost:heap[c].cost))c=r;if(c===i)break;heap[i]=heap[c];i=c;}heap[i]=last;}return top;};
    push({key:startKey,cost:0});
    while(heap.length){
      const item=pop(),current=item.key,best=item.cost;
      if(best!==(dist.get(current)??Infinity))continue;
      if(current===endKey)break;
      for(const edge of graph.nodes.get(current).edges){
        const next=best+edge.cost;
        if(next<(dist.get(edge.to)??Infinity)){dist.set(edge.to,next);prev.set(edge.to,current);push({key:edge.to,cost:next});}
      }
    }
    if(!dist.has(endKey))return null;
    const keys=[endKey];while(keys[0]!==startKey){const p=prev.get(keys[0]);if(!p)return null;keys.unshift(p);}
    return keys.map(k=>graph.nodes.get(k));
  }
  function selectEntrance(destination){
    const authored=state.objects.filter(o=>o.kind==="entrance"&&Number.isFinite(o.lat)&&Number.isFinite(o.lng))
      .map(o=>({...o,entranceSource:"AO local building record"}));
    let pins=[];
    try{
      const stored=JSON.parse(localStorage.getItem(ENTRANCE_PINS_KEY)||"[]");
      if(Array.isArray(stored))pins=stored.filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng)))
        .map(p=>({id:p.id,kind:"entrance",name:p.address||"Recorded entrance",lat:Number(p.lat),lng:Number(p.lng),description:p.description||"",parentName:p.parentName||"",entranceSource:"User-authored map entrance pin"}));
    }catch{}
    const entrances=[...authored,...pins];
    if(!entrances.length)return null;
    let best=null,distance=Infinity;
    for(const e of entrances){const d=meters(destination,e);if(d<distance){best=e;distance=d;}}
    return best&&distance<=60?{entrance:best,distance}:null;
  }
  async function calculatePath(){
    if(!state.destination)throw new Error("Choose a purple destination point first.");
    const entranceMatch=selectEntrance(state.destination);
    if(!entranceMatch)throw new Error("No recorded entrance pin or AO entrance is within 60 m of that destination. Add a door pin in Admin, then select a destination beside it.");
    const records=await loadRoads(),graph=buildGraph(records);
    if(!graph.nodes.size)throw new Error("No walkable OSM centerlines are loaded here. Use Admin → Load OSM roads in current map view, then try again.");
    const start=snapToNetwork(graph,state.position,60,"route-start"),end=snapToNetwork(graph,entranceMatch.entrance,60,"route-end");
    if(!start||!end)throw new Error("The Envoy or entrance is more than 60 m from the imported road/path centerlines. The route is not connected.");
    const roadPath=shortestPath(graph,start.node.key,end.node.key);
    if(!roadPath)throw new Error("No connected road/path centerline route reaches that entrance. No direct-line fallback will be used.");
    return {points:[{lat:state.position.lat,lng:state.position.lng},...roadPath.map(n=>({lat:n.lat,lng:n.lng})),{lat:entranceMatch.entrance.lat,lng:entranceMatch.entrance.lng}],entrance:entranceMatch.entrance,roadMeters:roadPath.reduce((sum,n,i)=>i?sum+meters(roadPath[i-1],n):sum,0)};
  }
  function drawPath(path){
    routeLayer.clearLayers();
    L.polyline(path.points,{color:"#c69bff",weight:5,opacity:.95,lineCap:"round",lineJoin:"round"}).addTo(routeLayer);
    L.circleMarker([path.entrance.lat,path.entrance.lng],{radius:8,color:"#fff",weight:2,fillColor:"#75d3a4",fillOpacity:1}).addTo(routeLayer).bindTooltip("Recorded entrance · "+path.entrance.name);
    activePath=path;
    $("navStatus").textContent="Road/path centerline route → " + path.entrance.name + " (recorded door)";
    $("navDistance").textContent=Math.round(path.roadMeters)+" m road network";
    $("navDestination").textContent=path.entrance.name+" (recorded entrance)";
    $("moveToDestination").disabled=false;
  }
  $("previewRoute").onclick=async()=>{
    if(routeBusy)return;routeBusy=true;$("previewRoute").disabled=true;
    try{const path=await calculatePath();drawPath(path);map.fitBounds(L.latLngBounds(path.points.map(p=>[p.lat,p.lng])),{padding:[35,35]});}
    catch(error){routeLayer.clearLayers();activePath=null;$("navStatus").textContent="No connected route";chat("AO",error.message);}
    finally{routeBusy=false;$("previewRoute").disabled=false;}
  };
  async function walkActivePath(){
    if(routeBusy||!activePath)return;
    routeBusy=true;
    $("previewRoute").disabled=true;
    $("moveToDestination").disabled=true;
    const token=++routeToken;
    const path=activePath;
    chat("AO","Walking the mapped road/path route toward "+path.entrance.name+". The Envoy will stop at the recorded entrance. This is a local preview, not Kernel movement.");
    try{
      const points=path.points;
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i],distance=meters(a,b),steps=Math.max(1,Math.ceil(distance/1.2));
        for(let j=1;j<=steps;j++){
          if(token!==routeToken)return;
          const t=j/steps;
          state.position={lat:a.lat+(b.lat-a.lat)*t,lng:a.lng+(b.lng-a.lng)*t};
          state.positionSource="Road-route walking preview";
          updateEnvoy();
          await new Promise(resolve=>setTimeout(resolve,90));
        }
      }
      state.positionSource="At recorded entrance";
      updateEnvoy();
      chat("AO","Reached "+path.entrance.name+". You are at the recorded doorway; entering still requires the door/access rules to permit it.");
    } finally{
      routeBusy=false;
      $("previewRoute").disabled=false;
      $("moveToDestination").disabled=false;
    }
  }
  $("moveToDestination").onclick=async()=>{
    if(routeBusy)return;
    if(!activePath){
      routeBusy=true;
      $("moveToDestination").disabled=true;
      try{
        const path=await calculatePath();
        drawPath(path);
        map.fitBounds(L.latLngBounds(path.points.map(p=>[p.lat,p.lng])),{padding:[35,35]});
      }catch(error){
        routeLayer.clearLayers();
        activePath=null;
        $("navStatus").textContent="Route unavailable";
        chat("AO",error.message);
        routeBusy=false;
        $("moveToDestination").disabled=false;
        return;
      }
      routeBusy=false;
      $("moveToDestination").disabled=false;
    }
    await walkActivePath();
  };
  $("clearDestination").addEventListener("click",()=>{routeLayer.clearLayers();activePath=null;});
  $("navStatus").textContent="Ready · select a destination near a saved entrance, then preview a road route. Import OSM roads first if needed.";
  $("moveToDestination").disabled=false;
})();
