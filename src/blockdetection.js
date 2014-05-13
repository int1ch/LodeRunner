/*

   map has grid, but characters can some in beetwing two cells (or four cells when falling)
   0,0 is top left corner!
*/
var b_stand = {
    'W' : 1,
    'H' : 1,
    'C' : 1,
};
var b_block = {
    'W' : 1,
    'C' : 1,
};
var b_grab = {
    '-' : 1,
    'H' : 1,
}
var b_climb = {
    'H' : 1,
};

{
'use strict';
// return posible movements  from x,y coordinates (used for AI2D) 
function directionVision( x, y ){
    x --;
    y --;
    var v = {u:0, d:0, l:0, r:0 }
    if(     b_climb[ map[ y ][ x ] ] 
        && !b_block[ map[y-1][ x ] ]
    ){
        //has stair and hasn block above
        v.u = 1;
    }
    if( b_climb[ map[ y +1 ][ x ]] || b_grab[ map[ y ][ x ] ] ){
        //down stairs
        v.d = 1;
    }

    //console.log( y + 1 );
    if( b_stand[ map[ y+1 ][ x ] ] || b_grab[ map[ y ][ x ] ]){ //?
        v.l = 1;
        v.r = 1;
        if( x === 0 ){                      v.l = 0 };
        if( map[y][x+1] === undefined ){    v.r = 0 };
        if( b_block[ map[ y ][ x + 1 ] ]){  v.r = 0 };
        if( b_block[ map[ y ][ x - 1 ] ]){  v.l = 0 };
        if( b_block[ map[ y + 1 ][ x ] ]){  v.d = 0 };
    } else {
        //can fall or falling
        v.d = 1;
    }
        return v;
}
//return points (x,y) wher robot can go from statring point
function posVision( p ){
    var v = directionVision( p[0] , p[1] );
    
    var ps = [];
    if(v.u){ ps.push( [ p[0] , p[1]-1 ] )} 
    if(v.d){ ps.push( [ p[0] , p[1]+1 ] )} 
    if(v.l){ ps.push( [ p[0]-1 , p[1] ] )} 
    if(v.r){ ps.push( [ p[0]+1 , p[1] ] )} 
    return ps;
}


function get_baseline_cells(c){
    return [
        {
            x : Math.floor(c.x / c.w) - 1,
            y : Math.ceil(c.y / c.h) ,
        },
        {
            x : Math.ceil(c.x / c.w) - 1,
            y : Math.ceil(c.y / c.h) ,
        }
    ];
}
function get_vertical_cells(c){
    return [
        {
            x : Math.ceil(c.x / c.w) - 1,
            y : Math.ceil(c.y / c.h)  - 1,
        },
        {
            x : Math.ceil(c.x / c.w) - 1,
            y : Math.floor(c.y / c.h) - 1,
        }
    ];

}

//1, if character is absolutly in horisonal row
//
function in_x ( c ){
    return c.y % c.h ? 0 : 1
}
function in_y ( c ){
    return c.x % c.w ? 0 : 1
}
//v2 move function
//c.move.x - requsted move direction (by keyboard input or AI)
function can_move_x( c ){

    var x   = c.move.x;
    if(!can_stand(c)){
        return null;
    }
    if(!x){
        return null;
    }
    if( in_y( c ) ){
        var pos = get_vertical_cells(c );
        //console.log( pos[0], pos[1] );
        var d   = null;

        //if caracter between cells (somewheere on ledder), 
        //i find disirable horisontal cell, witch bestly move character in required direction
        //
        //d = desire cell, 
        //  d = null - no desirable cell
        //  d = -1   - both cell are okey
        //  d = xx   - instead of go left / right we shoud go up/down to place 
        //             character absolurly in x-horisontal-row 
        for(var i in pos){
            var p = pos[i];
            //end of map detection
            if( p.x + x < 0 ){
                return null;
            }

            //end of map detection
            if( map[ p.y ][p.x + x]  == undefined ){
                return null;
            }

            //test if character can go in requsted direction 
            //only block can block the way
            if( ! b_block[ map[p.y][p.x + x ] ] ){
                if( d ){            d = -1 }
                if( d === null ){   d = p.y }
            }
        }
        if( d === null ){
            //cannot move?
            return [0,0];
        }
        if( d > 0 ){
            return [ 0,  (  c.y -(d + 1) * c.h ) > 0 ? -1 : +1 ];
        }
        return [x, 0];
    } else {
        return [x,0];
    }
    return null;
}
function can_move_y(c) {
    if(!can_stand(c)){
        return null;
    }
    var y   = c.move.y;
    if(!y){
        return null;
    }

    if( in_x(c) ){
        var pos = get_baseline_cells( c );
        var d   = null;
        // d desirable cell - same as in can_move_y
        for(var i in pos){
            var p = pos[i];
            if( 
                (y > 0 && b_grab[   map[ p.y-1 ][ p.x ] ]) ||
                (y > 0 && b_climb[  map[ p.y   ][ p.x ] ]) ||
                (y < 0 && b_climb[  map[ p.y-1 ][ p.x ] ])
            ){
                if( d ){ d = -1 }
                if(d === null){ d = p.x }
            }

            //console.log(y, i, map[p.y-1][p.x], d );

        }

        if( d === null ){
            //no y move varints
            return [0,0];
        }
        if( d > 0 ){
            //variant found
            return [   (  c.x -(d + 1) * c.w ) > 0 ? -1 : +1 , 0 ];
        }
        //FIXME HACK
        if( b_block[ map[ c.y/c.h + y -1  ][ c.x/c.w - 1 ] ]){
            return [ 0, 0 ];
        }

        return [0, y ]


    } else {
        return [0, y]
    }
    return null;
}
//used for falling down
function can_stand( c ){
    var cells = get_baseline_cells( c )
    //console.log( c.x, c.y , cells );


    for (var i=0; i< cells.length; i++) {
        var p = cells[i];

        //console.log('THIS:',map[ p.y-1 ][ p.x ], 'ON:',  map[ p.y ][ p.x ]);
        if( ! (c.y % c.h) ){
            //base line
            if( b_stand[ map[ p.y ][ p.x ] ] ){
                return 1;
            }
            //current line
            if( b_grab[ map[ p.y-1 ][ p.x ] ] ){
                return 1;
            }
        }
        if( b_climb[ map[ p.y ][ p.x ] ] ){
            //return 1;
        }
        if( b_climb[ map[ p.y-1 ][ p.x ] ] ){
            return 1;
        }
    }
    return 0
}
}

//Detects the upcoming block in -x direction 
//x marks the point where something is detectet. '.' is for the space outside of the player and 'p' for the player. all p's are one full block.

        //.....
        //xppp.
        //.ppp.
        //.ppp.
        //.....

        function detectNextBlock_Left(x,y,h,w)
        {
            var mapCoordY = (y)/ h;
            var mapCoordX = (x - 1) /w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
             //console.log("Entitity: " + map_comp[mapCoordY-1][mapCoordX-1].toString());
             //console.log("Entitity: " + map_comp[mapCoordY-1][mapCoordX-1].getOwnPropertyNames());
            return map[mapCoordY-1][mapCoordX-1];
           
        
        }
        //.....
        //.ppp.
        //.ppp.
        //xppp.
        //.....
        function   detectNextBlock_LeftDown (x,y,h,w)
        {
            var mapCoordY = (y + h -1 )/ h;
            var mapCoordX = (x - 1) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];
        }
        //.x...
        //.ppp.
        //.ppp.
        //.ppp.
        //.....
        function detectNextBlock_UpLeft (x,y,h,w)
        {
            var mapCoordY = (y - 1)/ h;
            var mapCoordX = (x ) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];
           
        }
        //.....
        //.pppx
        //.ppp.
        //.ppp.
        //.....
        function detectNextBlock_Right (x,y,h,w)
        {
            var mapCoordY = (y)/ h;
            var mapCoordX = (x + w) / w;
           
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];
        }
        //...x.
        //.ppp.
        //.ppp.
        //.ppp.
        //.....
        function detectNextBlock_UpRight (x,y,h,w)
        {
            var mapCoordY = (y - 1)/ h;
            var mapCoordX = (x + w -1) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];
           
        }
        //.....
        //.ppp.
        //.ppp.
        //.pppx
        //.....
        function detectNextBlock_RightDown (x,y,h,w)
        {
            var mapCoordY = (y + h - 1)/ h;
            var mapCoordX = (x + w) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];
        }
        //.....
        //.ppp.
        //.ppp.
        //.ppp.
        //.x...
        function detectNextBlock_DownLeft (x,y,h,w)
        {
            var mapCoordY = (y + h)/ h;
            var mapCoordX = (x) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
           
            //Frage
            //var stoneBool =  (Crafty.e('Stone') == map_comp[mapCoordY-1][mapCoordX-1]);
            //console.log("Is Stone: " + stoneBool);
             return map[mapCoordY-1][mapCoordX-1];
        }
        //.....
        //.ppp.
        //.ppp.
        //.ppp.
        //x....
        function detectNextBlock_CornerDownLeft (x,y,h,w)
        {
            var mapCoordY = (y + h)/ h;
            var mapCoordX = (x -1) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
             return map[mapCoordY-1][mapCoordX-1];
        }
        //.....
        //.ppp.
        //.ppp.
        //.ppp.
        //....x
        function detectNextBlock_CornerDownRight (x,y,h,w)
        {
            var mapCoordY = (y + h)/ h;
            var mapCoordX = (x + w) / w;
            
            
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
             return level1[mapCoordY-1][mapCoordX-1];
        }
        //.....
        //.ppp.
        //.ppp.
        //.ppp.
        //...x.
        function detectNextBlock_DownRight (x,y,h,w)
        {
            var mapCoordY = (y + h)/ h;
            var mapCoordX = (x + w -1) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];      
        }
        //.....
        //.ppx.
        //.ppp.
        //.ppp.
        //.....
        function detectNextBlock_CurrentRightUp(x,y,h,w)
        {
            var mapCoordY = (y)/ h;
            var mapCoordX = (x + w -1) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];  
        }
        //.....
        //.xpp.
        //.ppp.
        //.ppp.
        //.....
        function detectNextBlock_CurrentLeftUp(x,y,h,w)
        {
            var mapCoordY = (y)/ h;
            var mapCoordX = (x) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];  
        }
        //.....
        //.ppp.
        //.ppp.
        //.ppx.
        //.....
        function detectNextBlock_CurrentRightDown(x,y,h,w)
        {
            var mapCoordY = (y + h -1)/ h;
            var mapCoordX = (x + w -1) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];  
        }
        //.....
        //.ppp.
        //.ppp.
        //.xpp.
        //.....
        function detectNextBlock_CurrentLeftDown(x,y,h,w)
        {
            var mapCoordY = (y + h -1)/ h;
            var mapCoordX = (x) / w;
            
            mapCoordX = Math.floor(mapCoordX);
            mapCoordY = Math.floor(mapCoordY);
            
            return map[mapCoordY-1][mapCoordX-1];  
        }
        
        function coord_DownLeft (x,y,h,w)
        {
            var mapCoord = {};
            
            mapCoord[0] = (x) / w;
            mapCoord[1] = (y + h)/ h;
            
            mapCoord[0] = Math.floor(mapCoord[0]-1);
            mapCoord[1] = Math.floor(mapCoord[1]-1);
            
            return mapCoord;
        }
        
         function coord_DownRight (x,y,h,w)
        {
            var mapCoord = {};
            
            mapCoord[0] = (x + w -1) / w;
            mapCoord[1] = (y + h)/ h;
            
            mapCoord[0] = Math.floor(mapCoord[0]-1);
            mapCoord[1] = Math.floor(mapCoord[1]-1);
            
            return mapCoord;      
        }
