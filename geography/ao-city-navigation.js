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
    if (zoom >= 16) return 20;
    if (zoom >= 15) return 50;
    return 0;
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
      ctx.strokeStyle="rgba(31,83,105,.35)";ctx.lineWidth=1;
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
  function nearestNode(graph,point,maxMeters){
    let best=null,bestDistance=Infinity;
    for(const node of graph.nodes.values()){
      const d=meters(point,node);if(d<bestDistance){best=node;bestDistance=d;}
    }
    return best&&bestDistance<=maxMeters?{node:best,distance:bestDistance}:null;
  }
  function shortestPath(graph,startKey,endKey){
    const dist=new Map([[startKey,0]]),prev=new Map(),unvisited=new Set(graph.nodes.keys());
    while(unvisited.size){
      let current=null,best=Infinity;
      for(const key of unvisited){const d=dist.get(key);if(d!==undefined&&d<best){best=d;current=key;}}
      if(current===null||current===endKey)break;
      unvisited.delete(current);
      for(const edge of graph.nodes.get(current).edges){
        if(!unvisited.has(edge.to))continue;
        const next=best+edge.cost;if(next<(dist.get(edge.to)??Infinity)){dist.set(edge.to,next);prev.set(edge.to,current);}
      }
    }
    if(!dist.has(endKey))return null;
    const keys=[endKey];while(keys[0]!==startKey){const p=prev.get(keys[0]);if(!p)return null;keys.unshift(p);}
    return keys.map(k=>graph.nodes.get(k));
  }
  function selectEntrance(destination){
    const entrances=state.objects.filter(o=>o.kind==="entrance"&&Number.isFinite(o.lat)&&Number.isFinite(o.lng));
    if(!entrances.length)return null;
    let best=null,distance=Infinity;
    for(const e of entrances){const d=meters(destination,e);if(d<distance){best=e;distance=d;}}
    return best&&distance<=30?{entrance:best,distance}:null;
  }
  async function calculatePath(){
    if(!state.destination)throw new Error("Choose a purple destination point first.");
    const entranceMatch=selectEntrance(state.destination);
    if(!entranceMatch)throw new Error("No explicitly recorded entrance is within 30 m of that destination. Add or select the correct entrance first.");
    const records=await loadRoads(),graph=buildGraph(records);
    if(!graph.nodes.size)throw new Error("No walkable OSM centerlines are loaded here. Use Admin → Load OSM roads in current map view, then try again.");
    const start=nearestNode(graph,state.position,60),end=nearestNode(graph,entranceMatch.entrance,60);
    if(!start||!end)throw new Error("The Envoy or entrance is more than 60 m from the imported walkable network. The route is not connected.");
    const roadPath=shortestPath(graph,start.node.key,end.node.key);
    if(!roadPath)throw new Error("No connected walkable road/path route reaches that entrance. No direct-line fallback will be used.");
    return {points:[{lat:state.position.lat,lng:state.position.lng},...roadPath.map(n=>({lat:n.lat,lng:n.lng})),{lat:entranceMatch.entrance.lat,lng:entranceMatch.entrance.lng}],entrance:entranceMatch.entrance,roadMeters:roadPath.reduce((sum,n,i)=>i?sum+meters(roadPath[i-1],n):sum,0)};
  }
  function drawPath(path){
    routeLayer.clearLayers();
    L.polyline(path.points,{color:"#c69bff",weight:5,opacity:.95,lineCap:"round",lineJoin:"round"}).addTo(routeLayer);
    L.circleMarker([path.entrance.lat,path.entrance.lng],{radius:8,color:"#fff",weight:2,fillColor:"#75d3a4",fillOpacity:1}).addTo(routeLayer).bindTooltip("Recorded entrance · "+path.entrance.name);
    activePath=path;
    $("navStatus").textContent="Walkable road route → recorded entrance";
    $("navDistance").textContent=Math.round(path.roadMeters)+" m road network";
    $("navDestination").textContent=path.entrance.name+" (entrance)";
    $("moveToDestination").disabled=false;
  }
  $("previewRoute").onclick=async()=>{
    if(routeBusy)return;routeBusy=true;$("previewRoute").disabled=true;
    try{const path=await calculatePath();drawPath(path);map.fitBounds(L.latLngBounds(path.points.map(p=>[p.lat,p.lng])),{padding:[35,35]});}
    catch(error){routeLayer.clearLayers();activePath=null;$("navStatus").textContent="No connected route";chat("AO",error.message);}
    finally{routeBusy=false;$("previewRoute").disabled=false;}
  };
  $("moveToDestination").onclick=async()=>{
    if(routeBusy)return;
    if(!activePath){$("previewRoute").click();return;}
    routeBusy=true;$("moveToDestination").disabled=true;const token=++routeToken;
    const points=activePath.points;
    chat("AO","Walking the mapped route toward "+activePath.entrance.name+". The Envoy will stop at the recorded entrance.");
    try{
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
      chat("AO","Reached "+activePath.entrance.name+". You are at the recorded doorway; entering still requires the door/access rules to permit it.");
    } finally{routeBusy=false;$("moveToDestination").disabled=false;}
  };
  $("clearDestination").addEventListener("click",()=>{routeLayer.clearLayers();activePath=null;});
  $("navStatus").textContent="Select a destination near a recorded entrance; import walkable roads to route.";
  $("moveToDestination").disabled=false;
})();
