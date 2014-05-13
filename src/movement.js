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

}
function ki(moveDirection, x, y, h, w, plX, plY) {
          if (moveDirection == 4 && 
                (
                    (detectNextBlock_CurrentLeftUp(x,y,h,w) == '-' || detectNextBlock_CurrentRightUp(x,y,h,w) == '-') || 
                    (detectNextBlock_CurrentLeftUp(x,y,h,w) == 'H' ||detectNextBlock_CurrentRightUp(x,y,h,w) == 'H')
                ) &&
                (
                    (detectNextBlock_CurrentLeftDown(x,y,h,w) == '.' || detectNextBlock_CurrentRightDown(x,y,h,w) == '.') || 
                    (detectNextBlock_CurrentLeftDown(x,y,h,w) == '-' || detectNextBlock_CurrentRightDown(x,y,h,w) == '-')
                ) 
             )
          {
              moveDirection = 4;
              
          }
          else if (moveDirection == 1 && 
                (
                    (
                        //( detectNextBlock_CurrentLeftUp() == '.' &&  detectNextBlock_CurrentRightUp() == '-') || 
                        (detectNextBlock_CurrentLeftUp(x,y,h,w) == '.' && detectNextBlock_CurrentRightUp(x,y,h,w) == 'H')
                    ) &&
                    (
                        (detectNextBlock_DownLeft(x,y,h,w) == '.' || detectNextBlock_DownRight(x,y,h,w) == '.' )
                        
                    )
                ) 
             )
          {
              moveDirection = 1;
          }
          else if (moveDirection == 3 && 
                (
                    (
                        //( detectNextBlock_CurrentLeftUp() == '-' &&  detectNextBlock_CurrentRightUp() == '.') || 
                        (detectNextBlock_CurrentLeftUp(x,y,h,w) == 'H' && detectNextBlock_CurrentRightUp(x,y,h,w) == '.')
                    ) &&
                    (
                        (detectNextBlock_DownLeft(x,y,h,w) == '.' || detectNextBlock_DownRight(x,y,h,w) == '.' )
                        
                    )
                ) 
             )
          {
              moveDirection = 3;
          }
          else //wirklicher Ki Teil
          {
              if (plY < y && ((detectNextBlock_CurrentRightUp(x,y,h,w) == 'H' || detectNextBlock_CurrentLeftUp(x,y,h,w) == 'H') ||
                      ((detectNextBlock_CurrentRightUp(x,y,h,w) != 'W' || detectNextBlock_CurrentLeftUp(x,y,h,w) != 'W') &&
                      (detectNextBlock_CurrentRightDown(x,y,h,w) == 'H' || detectNextBlock_CurrentLeftDown(x,y,h,w) == 'H'))
                      ))
              {
                  moveDirection = 2;
              }
              else if (plY > y && ((detectNextBlock_DownRight(x,y,h,w) == 'H' || detectNextBlock_DownRight(x,y,h,w) == 'H') || 
                                            ((detectNextBlock_CurrentRightUp(x,y,h,w) == '-' || detectNextBlock_CurrentLeftUp(x,y,h,w) == '-') &&
                                            (detectNextBlock_DownRight(x,y,h,w) == '.' || detectNextBlock_DownRight(x,y,h,w) == '.') &&
                                            ((plX-15) <=  x && (plX-15) >=  x)
                                            )
                                           )
                       )
              {
                  moveDirection = 4;
              }
              else if ((moveDirection == 1 || moveDirection == 3) && (plY !=  y))
              {
                  //bleibt moveDirection die Gleich
                  if( x == 24)
                      moveDirection = 3;
                  else if( x == 768)
                      moveDirection = 1;
              }
              else if(plX < x)//links
              {
                  if(detectNextBlock_CornerDownLeft(x,y,h,w) == '.' && (detectNextBlock_DownLeft(x,y,h,w) == 'H'))
                    moveDirection = 3;
                  /*else if( detectNextBlock_Left() == 'W' &&  detectNextBlock_CurrentLeftUp() == 'H' && (playerX%4) == 0)
                     moveDirection = 2;*/
                  else if(detectNextBlock_Left(x,y,h,w) == 'W')
                    moveDirection = 3;
                  else
                    moveDirection = 1;
              }
              else if(plX > x)// rechts
              {
                  if(detectNextBlock_CornerDownRight(x,y,h,w) == '.' && (detectNextBlock_DownRight(x,y,h,w) == 'H'))
                    moveDirection = 1;
                  /*else if( detectNextBlock_Right() == 'W' &&  detectNextBlock_CurrentLeftUp() == 'H' && (playerX%4) == 0)
                     moveDirection = 2;*/
                  else if(detectNextBlock_Right(x,y,h,w) == 'W')
                    moveDirection = 1;
                  else
                    moveDirection = 3;
              }
          }
          return (moveDirection);
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
        return;
    }
   
    var to_move; 
    if( m.x ){
        to_move = can_move_x(c)
    }
    if( m.y ){
        to_move = can_move_y(c);
    }
    if( to_move ){
        c.x += to_move[0] * s;
        c.y += to_move[1] * s;
    }

}
function move2 ( c ) {
    var m = c.move;
    var s = c.playerSpeed;

    if( !can_stand( c ) ){
        //fall !
        c.y += s;
        return;
    }



    //algorithm should be change to
    //if move requested
    //  find cell where we can move in requested  direction
    //  come close to cell, 
    //  move!

        console.log(m.x, m.y, can_stand(c), 'C',can_climb(c), 'D', can_drop(c) );

    //if( c.x < 0){ c.x = 0 }; //bounday!!
    //if( c.y < 0){ c.y = 0 }; 

    //validate move requested move
    if( m.x ){
        move_horizontal( c );
        //console.log( c.x % c.w )
        if( c.requireStop ){
           // && !(c.x % c.w ) ){
            c.move.x = 0;
        }
    }
    if( m.y ){
        move_vertical( c );
        //c.y += m.y * s;
        if( !can_climb( c ) ){ c.move.y = 0 }
    }
   
    if( c.requireStop ){ c.move.y = 0 }    

}
        
        
function movePlayer(x,y,h,w, moveDirection, playerSpeed)
        { 
           
            //fall
            if (
                (((detectNextBlock_DownLeft(x, y, h, w) == '.' && detectNextBlock_DownRight(x,y,h,w) == '.') || //when underneath is air
                  (detectNextBlock_DownLeft(x,y,h,w) == '-' && detectNextBlock_DownRight(x,y,h,w) == '-') || //or a pole
                  (detectNextBlock_DownLeft(x,y,h,w) == 'T' && detectNextBlock_DownRight(x,y,h,w) == 'T'))) &&// or a treasure
                  (detectNextBlock_CurrentLeftDown(x, y, h, w) != '-' || detectNextBlock_CurrentRightDown(x,y,h,w) != '-')//
                ) 
            {
               y += playerSpeed;
               moveDirection = 0;
            }
            //left
            else if(moveDirection == 1 && detectNextBlock_Left(x,y,h,w) != 'W' && x != 24 && detectNextBlock_LeftDown(x,y,h,w) != 'W')//left
            {
                //Pole little bit above
                if(detectNextBlock_Left(x,y, h, w) == '-' && detectNextBlock_LeftDown(x,y, h, w) != '-')
                {
                    y -=playerSpeed;
                }
                //Pole little bit underneath
                else if(detectNextBlock_Left(x,y, h, w) != '-' && detectNextBlock_LeftDown(x,y, h, w) == '-')
                {
                    //console.log("In Exeption");
                    y +=playerSpeed;
                }
                else
                {
                    x -= playerSpeed;
                }
            }
            //up
            else if(moveDirection == 2 &&                                        
                    (((detectNextBlock_UpLeft(x,y, h, w) == 'H' || detectNextBlock_UpRight(x, y, h, w) == 'H')//ladder above
                    ||
                    (detectNextBlock_CurrentRightDown(x, y, h, w) == 'H' || detectNextBlock_CurrentLeftDown(x, y, h, w) == 'H'))
                    ||
                    ((detectNextBlock_UpLeft(x, y, h, w) == 'h' || detectNextBlock_UpRight(x, y, h, w) == 'h')
                    && (detectNextBlock_CurrentRightDown(x, y, h, w) == 'H' || detectNextBlock_CurrentLeftDown(x, y, h, w) == 'H')))
               
                   )//on ladder
            {
                //ladder on rightside
                if (detectNextBlock_CurrentLeftUp(x, y, h, w) != 'H' && detectNextBlock_CurrentRightUp(x, y, h, w) == 'H')
                {
                    x += playerSpeed;
                }
                else if (detectNextBlock_CurrentLeftUp(x, y, h, w) == 'H' && detectNextBlock_CurrentRightUp(x, y, h, w) != 'H')
                {
                    x -= playerSpeed;
                }
                else
                {
                    y -= playerSpeed;
                }
            }
            //right
             else if(moveDirection == 3 && detectNextBlock_Right( x, y, h, w) != 'W' &&  x != 768 && detectNextBlock_RightDown( x, y, h, w) != 'W')//right
            {   
                //Frage
                //Pole little bit above
                if(detectNextBlock_Right(x,y, h, w) == '-' && detectNextBlock_RightDown(x,y, h, w) != '-')
                {             
                    y -= playerSpeed;
                }
                //Pole Little bit underneath
                else if(detectNextBlock_Right(x,y, h, w) != '-' && detectNextBlock_RightDown(x,y, h, w) == '-')
                {
                    //console.log("In Exeption");
                    y += playerSpeed;
                }
                //Nearly at top of ladder
                else if(detectNextBlock_Right(x,y, h, w) == '.' && detectNextBlock_CurrentRightDown(x,y,h,w) == 'H' && detectNextBlock_UpRight(x,y,h,w) != 'H')
                {
                    y -= playerSpeed;
                }
                else
                {
                    x +=  playerSpeed;
                }
            }
            //down
             else if( moveDirection == 4 &&
                     (detectNextBlock_DownLeft( x,  y,  h,  w) != 'W' || detectNextBlock_DownRight( x,  y,  h,  w) != 'W')
                    )//down
            {
                if ((detectNextBlock_DownLeft( x,  y,  h,  w) != 'W' && detectNextBlock_DownRight( x,  y,  h,  w) == 'W')||
                    (detectNextBlock_UpRight( x,  y,  h,  w)  == '-' && (detectNextBlock_CornerDownLeft(x,  y,  h,  w) == 'H' || detectNextBlock_Left(x,  y,  h,  w) == 'H')))
                {
                     x -=  playerSpeed;
                }
                else if ((detectNextBlock_DownLeft( x,  y,  h,  w) == 'W' && detectNextBlock_DownRight( x,  y,  h,  w) != 'W' )||
                         (detectNextBlock_UpLeft( x,  y,  h,  w)  == '-' && (detectNextBlock_CornerDownRight(x,  y,  h,  w) == 'H' || detectNextBlock_Right(x,  y,  h,  w) == 'H')))
                {
                     x +=  playerSpeed;
                }
                else
                {
                     y +=  playerSpeed;
                }
            }
            var xAndY = new Array();
            
            xAndY[0] = x;
            xAndY[1] = y;
            return(xAndY);
        }
        
        
