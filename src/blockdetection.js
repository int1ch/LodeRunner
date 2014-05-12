/*

   map has grid, but characters can in beetwing two grid pos

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
function in_x ( c ){
    return c.y % c.h ? 0 : 1
}
function in_y ( c ){
    return c.x % c.w ? 0 : 1
}

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
        console.log( pos[0], pos[1] );
        var d   = null;
        for(var i in pos){
            var p = pos[i];
            if( p.x + x < 0 ){
                return null;
            }
            if( map[ p.y ][p.x + x]  == undefined ){
                return null;
            }
            if( ! b_block[ map[p.y][p.x + x ] ] ){
                if( d ){ d = -1 }
                if(d === null){ d = p.y }
            }
        }
        if( d === null ){
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
        for(var i in pos){
            var p = pos[i];
            //FIXME
            if( 
                (y > 0 && b_grab[   map[ p.y-1 ][ p.x ] ]) ||
                (y > 0 && b_climb[  map[ p.y   ][ p.x ] ]) ||
                (y < 0 && b_climb[  map[ p.y-1 ][ p.x ] ])
            ){
                if( d ){ d = -1 }
                if(d === null){ d = p.x }
            }

            console.log(y, i, map[p.y-1][p.x], d );

        }

        if( d === null ){
            //no y move varints
            return [0,0];
        }
        if( d > 0 ){
            //variant found
            return [   (  c.x -(d + 1) * c.w ) > 0 ? -1 : +1 , 0 ];
        }
        return [0, y ]


    } else {
        return [0, y]
    }
    return null;
}
function can_stand( c ){
    //theres a block bellow unit
    //L----L----L----L----L
    //  x----
    //
    //1.3 = 1 grid 2 grid
    //Flooor - max
    //round
    //ceil - minimal 
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

function can_climb( c ){
    var cells = get_baseline_cells( c );

    for (var i=0; i< cells.length; i++) {
        var p = cells[i];
        //console.log( p.y, p.x )
        if( in_x(c) ){
            //test if there any hard block above head
            if(b_block[ map[ p.y-2 ][p.x ] ] ){
                return 0;
            }
        }
        //test if this cell climbeble
        if( b_climb[ map[ p.y-1 ][ p.x ] ] ){
            return 1;
        }
    }
    return 0;
}
function can_drop(c ){
    var cells = get_baseline_cells( c );
    
    for (var i=0; i< cells.length; i++) {
        var p = cells[i];
        if( in_x(c) ){
            //test if block bellow allows to drop
            if( b_block[ map[ p.y ][ p.x ] ] ){
                return 0;
            }
            //
            if( b_grab[ map[ p.y-1 ][ p.x ] ] ){
                return 1;
            }
        }

        if( b_climb[ map[ p.y ][ p.x ] ] ){
            return 1;
        }
    }
    return 0
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
