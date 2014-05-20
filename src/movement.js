/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * Movement 
 * - continius:
 *   block can take any pixel according to phisicks, hunters and player may have different speeed, 
 *   you can change direction at any time
 *
 * - for 
 * - by grids:
 *   player move from cell to cell, can dig on side cells (phisics is simplified)
 *
 * */
{
'use strict';
function moveAI2D( c ){
    var move = AI2D(c);
    if( move ){
        c.move.x = move[0];
        c.move.y = move[1];
    }
} 
function AI2D ( c ){
    if( in_x( c ) && in_y( c )  ){
        if(!pX && !pY ){
            return null;
        }
        //make desicion
        var x = c.x / c.w;
        var y = c.y / c.h;
        //console.log( 'desicion: for AI at:', x, y );

        //route reset!
        var routes = [
               [ [x, y] ]
        ];

        function distance(p){
            return Math.abs( p[0] - pX ) + Math.abs(p[1]- pY);
        }
        function clone( a ){
            var out = [];
            for( var i = 0; i< a.length; i++){
                out[i] = a[i]
            }
            return out;
        }
        var map = [];
        function was_here(p){
            if(!map[ p[0] ]){ map[ p[0] ]=[]; }
            if(map[ p[0] ][ p[1] ]){
                return 1
            }

            map[ p[0] ][ p[1] ] = 1;
            return 0;
        }
        was_here([x,y]);
        
        for(var i = 0 ; i < 10 ; i++){
            var new_routes = [];
            for( var r in routes ){
                var route = routes[r];
                var lp = route[ route.length - 1 ];
                var pv = posVision( lp );
                if( !pv.length ){ continue; }
                for( var j in pv ){
                    //test map
                    if( was_here( pv[j] ) ){ continue; }

                    var new_route = clone( route );
                    new_route.push( pv[j] );
                    if( pX === pv[j][0] && pY === pv[j][1] ){
                        return [ new_route[1][0] - x, new_route[1][1] - y ]; 
                    }

                    new_routes.push( new_route );
                }
            }
            routes = new_routes;
        }
        var min_i = 0;
        var min_d;
        for( var i = 0; i< routes.length ; i++ ){
            var p = routes[ i ][ routes[ i ].length -1  ];
            var d = distance( p );

            //console.log('check distance of: ', p, d);
            if( (min_d === undefined) || (d < min_d) ){ min_i = i; min_d = d }; 
        }

        //console.log("minimal distance: ", d , "for route: ", i);

        return [ routes[min_i][1][0] - x, routes[min_i][1][1] - y ]; 

    } else {
        //move in requested direction
        return null;
    }
}


function move_vertical(c) {
    var s = c.playerSpeed;
    

    if(in_y(c)){
        //on statirs move
        c.y += c.move.y * s;
    } else {
        if( c.move.y > 0 && can_drop( c )){
            //FIXME
            c.y += c.move.y * s;
            return;
        }
        //find witch one is a stair
        //
        var pos = get_baseline_cells( c )
        var dx = null;
        var dfx= null;
        for( var i in pos ){
            var p = pos[i];
            if(b_climb[ map[ p.y-1 + c.move.y ][ p.x ] ]){
                if( dx == null ){ dx = p.x }
                else if( dx ){ dx = -1 } 
            }
        }
        if( dx <  0 ){
            dx = Math.round( c.x / c.w ); 
        }
        //console.log( "CX:" , dx,  c.x / c.w  )
        c.x += (( ( c.x -(dx+1) * c.w ) > 0 ) ? -1 : +1 ) * s;
    }
}        
function move_horizontal(c ){

    var m = c.move;
    var s = c.playerSpeed;
    if( in_y(c) ){
        var pos = get_vertical_cells(c );
        for( var i in pos ){
            var p = pos[i];
            if( b_block[ map[ p.y ][ p.x + c.move.x ]]){
                c.move.x = 0;
            }
            if( c.x + c.move.x < 0 ){
                c.move.x = 0;
            }
            if( map[ p.y ][ p.x + c.move.x ]  == undefined ){
                c.move.x = 0;
            }
        }
    } 
    c.x += c.move.x * s;

}
function move( c  ){
    var m = c.move;
    var s = c.playerSpeed;
    

    if( !can_stand( c ) ){
        //fall !
        c.y += s;

        c.cy = c.y / c.h - 1;
        return;
    }
   
    var to_move; 
    if( m.x ){
        to_move = can_move_x(c)
    }
    if( m.y ){
        to_move = can_move_y(c);
    }
    var reel;
    if( to_move ){
        c.x += to_move[0] * s;
        c.y += to_move[1] * s;
        if( to_move[0] ){
            reel = to_move[0] < 0 ? 'walk_left': 'walk_right';
        }
        else if(to_move[1]) {
            reel = to_move[1] < 0 ? 'walk_up': 'walk_down';
        }
    }
    if( reel ){
        var cReel = c.getReel();
        if (!cReel || cReel.id !=  reel ){
            c.animate(reel, -1);
        } else {
            c.resumeAnimation();
        }
    } else {
        if( c.isPlaying() ) { 
            c.resetAnimation();
            c.pauseAnimation();
        }
    }
    c.cx = c.x / c.w - 1;
    c.cy = c.y / c.h - 1;
}

} //end of scope
