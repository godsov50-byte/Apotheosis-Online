import {createBoard,addStructure,expandCity,createConnectivity} from '../ao-board-world.mjs';
let board=createBoard({worldId:'ao-sample',boardId:'market-district',width:12,height:10,terrain:'grass'});
board.tiles=board.tiles.map(t=>t.y===5?{...t,terrain:'road',landUse:'urban',cityId:'sample-city'}:t);
board=addStructure(board,{id:'existing-home',kind:'home',footprint:[{x:7,y:3},{x:8,y:3}],entrances:[{id:'front-door',x:7,y:3,doorId:'front-door'}]});
board=expandCity(board,{cityId:'sample-city',tiles:[{x:6,y:3},{x:7,y:3},{x:8,y:3},{x:9,y:3}]});
const connectivity=createConnectivity({nodes:[{id:'street',boardId:'market-district',x:6,y:5,kind:'street'},{id:'front-door',boardId:'market-district',x:7,y:3,kind:'entrance'},{id:'room',boardId:'home-interior',x:1,y:1,kind:'room'}],edges:[{id:'street-to-door',from:'street',to:'front-door',kind:'entrance',cost:2},{id:'door-to-room',from:'front-door',to:'room',kind:'door',cost:1}]});
console.log({board,connectivity});