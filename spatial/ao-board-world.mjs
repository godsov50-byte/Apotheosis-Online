/* AO-native board spatial primitives: terrain, structures, explicit connectors. */
export const AO_BOARD_SCHEMA_VERSION=1;
export const TERRAIN=['grass','forest','water','mountain','sand','road','paved','floor','void'];
export const LAND_USE=['wilderness','undeveloped','urban','rural','protected'];
export const STRUCTURE_KINDS=['building','home','business','public','wall','bridge','stairs','other'];
export const CONNECTOR_KINDS=['street','entrance','door','stairs','bridge','board-link','portal','other'];
const int=n=>Number.isInteger(n), key=(x,y)=>x+','+y, copy=x=>structuredClone(x);
const req=(s,n)=>{if(typeof s!=='string'||!s.trim())throw new TypeError(n+' required');return s.trim()};
const inside=(b,x,y)=>int(x)&&int(y)&&x>=0&&y>=0&&x<b.width&&y<b.height;
function validate(b){
 req(b.worldId,'worldId');req(b.boardId,'boardId');if(!int(b.width)||!int(b.height)||b.width<1||b.height<1)throw new RangeError('invalid dimensions');
 if(!Array.isArray(b.tiles)||b.tiles.length!==b.width*b.height)throw new Error('tile count mismatch');const ts=new Set();
 for(const t of b.tiles){if(!inside(b,t.x,t.y))throw new RangeError('tile out of bounds');const k=key(t.x,t.y);if(ts.has(k))throw new Error('duplicate tile '+k);ts.add(k);if(!TERRAIN.includes(t.terrain)||!LAND_USE.includes(t.landUse))throw new Error('bad tile class');}
 if(!Array.isArray(b.structures))throw new TypeError('structures required');const ids=new Set(),occupied=new Map();
 for(const s of b.structures){req(s.id,'structure id');if(ids.has(s.id))throw new Error('duplicate structure');ids.add(s.id);if(!STRUCTURE_KINDS.includes(s.kind)||!Array.isArray(s.footprint)||!s.footprint.length)throw new Error('invalid structure');for(const p of s.footprint){if(!inside(b,p.x,p.y))throw new RangeError('footprint out of bounds');const k=key(p.x,p.y);if(occupied.has(k))throw new Error('footprint overlap');occupied.set(k,s.id);}if(!Array.isArray(s.entrances))throw new TypeError('entrances required');const es=new Set();for(const e of s.entrances){req(e.id,'entrance id');if(es.has(e.id))throw new Error('duplicate entrance');es.add(e.id);if(!inside(b,e.x,e.y)||!s.footprint.some(p=>p.x===e.x&&p.y===e.y))throw new RangeError('entrance must be on footprint');}}
 return true;
}
export function createBoard({worldId,boardId,width,height,terrain='grass',landUse='wilderness',tiles=null,structures=[]}){
 req(worldId,'worldId');req(boardId,'boardId');if(!int(width)||!int(height)||width<1||height<1)throw new RangeError('positive dimensions required');if(!TERRAIN.includes(terrain)||!LAND_USE.includes(landUse))throw new Error('unknown tile/land-use');
 const b={schemaVersion:AO_BOARD_SCHEMA_VERSION,worldId,boardId,width,height,tiles:tiles?copy(tiles):Array.from({length:width*height},(_,i)=>({x:i%width,y:Math.floor(i/width),terrain,landUse})),structures:copy(structures)};validate(b);return b;
}
export function validateBoard(b){return validate(b)}
export function getTile(b,x,y){validate(b);if(!inside(b,x,y))throw new RangeError('tile outside board');return b.tiles.find(t=>t.x===x&&t.y===y)}
export function addStructure(b,s){validate(b);const n=copy(b);if(n.structures.some(v=>v.id===s.id))throw new Error('structure ID exists');n.structures.push(copy(s));validate(n);return n}
/* Expansion only updates land-use; established structure and entrance records remain identical. */
export function expandCity(b,{cityId,tiles}){validate(b);req(cityId,'cityId');if(!Array.isArray(tiles)||!tiles.length)throw new TypeError('tiles required');const n=copy(b),seen=new Set();for(const p of tiles){if(!inside(n,p.x,p.y))throw new RangeError('claim out of bounds');const k=key(p.x,p.y);if(seen.has(k))throw new Error('duplicate claim');seen.add(k);const t=n.tiles.find(v=>v.x===p.x&&v.y===p.y);if(t.landUse==='protected')throw new Error('protected tile');t.landUse='urban';t.cityId=cityId;}return n;}
/* Layer 3: connectivity must be declared; it is not inferred from adjacency. */
export function createConnectivity({nodes=[],edges=[]}={}){if(!Array.isArray(nodes)||!Array.isArray(edges))throw new TypeError('nodes and edges arrays required');const ns=new Map(),es=new Map();for(const n of nodes){req(n.id,'node ID');if(ns.has(n.id))throw new Error('duplicate node');req(n.boardId,'boardId');if(!int(n.x)||!int(n.y))throw new TypeError('integer node coordinates required');req(n.kind,'node kind');ns.set(n.id,Object.freeze(copy(n)));}for(const e of edges){req(e.id,'edge ID');if(es.has(e.id))throw new Error('duplicate edge');if(!ns.has(e.from)||!ns.has(e.to))throw new Error('missing connector endpoint');if(!CONNECTOR_KINDS.includes(e.kind))throw new Error('unknown connector type');const cost=e.cost??1;if(!Number.isFinite(cost)||cost<=0)throw new RangeError('connector cost must be positive');es.set(e.id,Object.freeze({...copy(e),cost});}return Object.freeze({nodes:ns,edges:es});}
export function addConnection(c,e){return createConnectivity({nodes:[...c.nodes.values()],edges:[...c.edges.values(),copy(e)]})}
export function exportBoard(b){validate(b);return copy(b)}