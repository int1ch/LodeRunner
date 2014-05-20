// // The Grid component allows an element to be located
// on a grid of tiles
Crafty.c('Grid', {
    init: function() {
        this.attr({
            w: Game.map_grid.tile.width,
            h: Game.map_grid.tile.height
        })
    },
// Locate this entity at the given position on the grid
    at: function(x, y) {
        if (x === undefined && y === undefined) {
            return {x: this.x / Game.map_grid.tile.width, y: this.y / Game.map_grid.tile.height}
        } else {
            this.attr({x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height});
            this.attr({cx: x-1, cy: y-1 } );
            return this;
        }
    }
});

// // An "Actor" is an entity that is drawn in 2D on canvas
// via our logical coordinate grid
Crafty.c('Actor', {
    init: function() {
        this.requires('2D, Canvas, Grid');
    },
});
Crafty.c('Frame', {
    init: function() {
        this.requires('Actor, Color, Solid')
                .color('rgb(254, 254, 254)');
    },
});

 
Crafty.c('Stone', {   //ohne spritemapping
    init: function() {
        this.requires('Actor, Solid, spr_stone')                
                .bind('EnterFrame', this.onFrame )
                .attr({z:200})

    },
    holeSize: 0, //hole timer
    holeSt  : 0, //0 no hole, 1 digging, 2 digged
    digging: 0,
    speed: 3,
    onFrame: function(){
        if(this.holeSt){
            this.holeSize -= this.speed;
            if( this.holeSize <= 0 ){
                this.holeSize = 0;
                this.holeSt   = 0;
                this.sprite(3,1);
                map[this.cy][this.cx] = 'W';
                //kill every one one in touch collision
                this.addComponent('Collision');
                var data = this.hit('PC');
                for( var i in data ){
                    var e = data[i].obj 
                    var d = Math.abs( this.x - e.x ) + Math.abs( this.y - e.y );
                    if( d < this.h - 1 ){
                        e.kill();
                    }
                }
                console.log(data);
                this.removeComponent('Collision');
            }  else if(this.holeSize == this.w / 4 ){
                this.sprite(2,1);
            }  else if(this.holeSize == this.w / 2 ){
                this.sprite(1,1);
            }  else if(this.holeSize == this.w / 4 * 3 ){
                this.sprite(0,1);
            }
            if( this.holeSt == 1 && this.holeSize >= this.h ){
                this.holeSt = 2; //hole digged
                this.sprite(5,1);
                this.holeSize += this.w * 4 * this.speed ; //speed defined by 
                map[this.cy][this.cx] = '_';
            }
        }
    },
    digged: function(){
        return this.holeSt >= this.w ? 1 : 0;
    },
    dig: function( ){
        if( !this.holeSt ) this.holeSt = 1;
        if( this.holeSt == 1 ){
            this.holeSize += this.speed * 2;
        }
    },
    unDig: function ( data ) {
        if(this.holeSt == 1 ){
            this.holeSt = 3; //hole pevented from digging
        }
    },
});
	/*Crafty.c('Concrete', {    not in use yet
    init: function() {
        this.requires('Actor, Solid, Image')                
                .image('assets/concrete.png');
    },
}); */
Crafty.c('Ladder', {
    init: function() {
        this.requires('Actor, spr_ladder')                
    },
});
Crafty.c('Pole', {
    init: function() {
        this.requires('Actor, spr_pole')
    },
});
 
 
var playerX = 0;
var playerY = 0;
var playerW = 0;
var playerH = 0;

Crafty.c('PC', {
    init: function() {
        this.requires('Collision');
    }
} );

Crafty.c('Enemy', 
    {
        //x - xpixel (absolute)
        //y - ypixel (pos)
        //w - width
        //h - height
        init: function() {
            this.requires('Actor, PC, Gravity, spr_enemy, SpriteAnimation')
                    //.stopOnSolids()
                    .bind('EnterFrame', this.onFrame)

                    .reel("walk_left",  500, 0, 0, 5)
                    .reel("walk_right", 500, 6, 0, 5)
                    .reel("walk_up",    500, 0, 1, 2)
                    .reel("walk_down",  500, 0, 1, 2)
                    .reel("climb_right",500, 0, 2, 4) 
                    .reel("climb_left", 500, 4, 2, 4) 
                    .reel("stand",      500, 4, 2, 4) 
                    .attr( { move: {x:0, y:0} , z:99 })
                    //.animate('climb_left', 5, -1)
                    .onHit('PlayerCharacter', this.killPlayer)
                    //.onHit('Enemy', this.enemyCollision )
                    ;  
                    //.onHit('Treasure', this.collectTreasure);
        },
        //Frage: kann irgendwie playerX und Y nicht lesen (sind aber global und beim spieler funktionierts(siehe console)
        //Wenn man eine move Direction vorher festlegt hängt er sich bei detect Block auf!
        enemy           : 1,
        moveDirection   : 0,
        skipFrames      : 0,
        lift            : 0,
        cx              : 0,
        cy              : 0,
        playerSpeed     : 1.5,
        move            : null,
        onFrame: function(){
            if( this.skipFrames > 0){
                this.skipFrames--;
                return;
            }
            if( this.lift > 0){
                this.lift -- ;
            }


            if(in_x(this) && in_y(this) ){
                //map conversion
                //console.log( this.y / this.h, this.cy, this.cx );

                if( map[ this.cy ][ this.cx ] == '^' ){
                    map[ this.cy ][ this.cx ] = '_';
                    this.lift = (this.h + this.w )/ this.playerSpeed -1 ;
                    this.y -= 2*this.playerSpeed;
                    this.move.y = -1
                    this.move.x = 1
                    return;
                }

                if( map[ this.cy ][ this.cx ] == '_' ){
                    map[ this.cy ][ this.cx ] = '^';
                    this.skipFrames = this.w / this.playerSpeed;
                    return ;
                }
            }

            moveAI2D( this );
            move( this ); //test for colision with enemy
        },
        kill: function(){
            this.destroy();
        },
        enemyCollision: function(data){
            console.log('EC', this);
        },
        killPlayer: function(data) {
            var player = data[0].obj;

            if( Math.abs(this.x - player.x) + Math.abs(this.y - player.y ) < this.w - 3 ){
                Crafty.trigger('EnemyCollison', this);
            }
            //playerCharacter = data[0].obj;
            //playerCharacter.collect();
        },
        mapPos: function (){
            return {
                x: Math.round( this.x / this.w ),
                y: Math.round( this.y / this.h ),
            }
        }
        
 });
 


var levelReady = 0;
var pX = null, pY = null;
//var level = Scene.level1;



// This is the player-controlled character
Crafty.c('PlayerCharacter', {
    init: function() {
        // Multiway: Character goes in the direction of the degree number. Right Arrow = 0 (Clockwise). Number in the Beginnig is the speed.           
        this.requires('Actor, Multiway, PC, Gravity, spr_player, SpriteAnimation, Keyboard')
            .bind('KeyDown'     , this.keyTester)
            .bind('KeyUp'       , this.keyTester)
            .bind('EnterFrame'  , this.toDoList)     //enter frame called on each time tic;
            .reel('stand', 0, 0, 3 )
            .reel("walk_left",  200,   0, 0, 4)
            .reel("walk_right", 300,   5, 0, 4)
            .reel("walk_up",    200,    0, 1, 3)
            .reel("walk_down",  200 ,   0, 1, 3)
            .reel("climb_right", 0, 2, 3) 
            .reel("climb_left", 4, 2, 7) 
          //  .animate('stand', 5)
           // .animate("fall", 5) 
            .onHit('Treasure'   , this.collectTreasure)
            .onHit('Exit'       , this.hitExit)
            .attr({z: 100 } )
            ;
				
		var animation_speed = 5;
        this.bind('NewDirection', function(data) {
            if (data.x > 0) {
                this.animate('walk_right', animation_speed, -1);
        } else if (data.x < 0) {
                this.animate('walk_left', animation_speed, -1);
            } else if (data.y > 0) {
                this.animate('walk_down', animation_speed, -1);
            } else if (data.y < 0) {
                this.animate('walk_up', animation_speed, -1);
            } else {
                this.stop();
            }
        }); 
        this.move = {x : 0, y : 0 };

        pX = Math.round( this.x / this.w );
        pY = Math.round( this.y / this.h );
    },

    /*
      Move Left(1) or Right(3) possible,
       * when map-wall not hitted
       * player above BLOCK, above LEDER, on POLE
       * player have place to move(next grid), EMPTY, POLE, LEDDER 
       *
      Move UP(2) is possible
       * where player on LEDDER
       * where next is LEDDER, empty pole 
      Move DOWN(4) is possible, when stand on POLE, LEDDER
          or dot
    */
    move     : null,
    requireStop: 0,

    keyTester: function(){
        //function triggers on KeyUpOr KeyDown
        //so i need to save STATE

        /* Move:
         * . 2
         * 1 0 3
         * . 4
         * */

        
        this.requireStop = 0;
        if(         this.isDown('Q')            || this.isDown('J') ){
            this.move= {x: 0, y: 0, dig: -1 };
        } else if(  this.isDown('E')            || this.isDown('K') ){
            this.move= {x: 0, y: 0, dig: 1 };
        } else if ( this.isDown('LEFT_ARROW')   || this.isDown('A') ){
            this.move= {x: -1, y: 0};
        } else if(  this.isDown('RIGHT_ARROW')  || this.isDown('D') ){
            this.move= {x: +1, y: 0};
        } else if(  this.isDown('UP_ARROW')     || this.isDown('W') ){
            this.move= {x:  0, y: -1 };
        } else if(  this.isDown('DOWN_ARROW')   || this.isDown('S') ){
            this.move= {x:  0, y: 1 };
        } else {
            this.requireStop = 1;
            this.move= {x:0, y: 0};
          //  this.stop();
        }
        //console.log({ move : this.move, rs: this.requireStop, stand: can_stand( this ), clibm: can_climb( this ), })
 
    },
    moveDirection : 0,
    playerSpeed : 2,
    toDoList: function(){
          //this.moveDirection = keyTester(this.x, this.y, this.w ,this.h, this.moveDirection);
          //movePlayer(this.x, this.y, this.w, this.h, this.moveDirection, this.playerSpeed); 
            //DIG = move to next frame, and dig!
            //if dig is possible? dig, if dig is not possible, do not dig
            //
            if( this.move.dig ){ 
                if( in_y( this )){
                    //start dig!
                    this.move.x = 0;
                    this.dig( );
                } else {
                    this.move.x = -this.move.dig;
                }
            }   
            move( this );
            playerX = this.x;
            playerY = this.y;
            pX = Math.round( this.x / this.w );
            pY = Math.round( this.y / this.h );
          //this.applyXandY();
        },
    dig: function(){
        if( !this.move.dig || !(in_x(this) && in_y(this) ) ) return;
        var x = this.x / this.w;
        var y = this.y / this.h;
        var block = map_comp[y][x - 1 + this.move.dig ];
        //console.log( block );
        if( block && block.dig ){ block.dig() }
    },
    kill: function(){
        this.destroy();
        Crafty.trigger('EnemyCollison', this);
        //Crafty.trigger('PlayerKilled', this);
    },

        
        applyXandY: function(){
            var xAndY = movePlayer(this.x, this.y, this.h, this.w, this.move, this.playerSpeed);
            this.x = xAndY[0];
            this.y = xAndY[1];
            playerX = this.x;
            playerY = this.y; 
            playerW = this.w;
            playerH = this.h;
            //console.log("Player x/y " + playerX + "/" +playerY);
        },
        
        // Respond to this player collecting a Treasure
        collectTreasure: function(data) {
            treasure = data[0].obj;
            treasure.collect();
        },
        
        // Respond to this player hitting the exit
        hitExit: function(data) {
            exit = data[0].obj;
            exit.collect();
        },
        collect: function() {
            this.destroy();
            Crafty.trigger('PlayerKilled', this);
        },
        mapPos: function (){
            return {
                x: Math.round( this.x / this.w ),
                y: Math.round( this.y / this.h ),
            }
        }

}) 
 //   .reel("walk_left", 0, 0, 4)
 //   .reel("walk_right", 5, 0, 9)
;

var treasureCollected = 0;

Crafty.c('Treasure', {
    init: function() {
        this.requires('Actor, spr_treasure')
    },
	
    collect: function() {
        treasureCollected += 1;
        this.destroy();
        Crafty.trigger('TreasureCollected', this);
    }
});

Crafty.c('Exit', {
    init: function() {
        this.requires('Actor, Image')
            .image('assets/ladder.png');
    },
	
    collect: function() {
        Crafty.trigger('EndLevel', this);
    }
});

//treasure container class. Saves number of treasures as the size of the array and the state of them as data in it.
Crafty.c('TreasureContainer', {

    init: function() {
		this._treasures  = new Array();
	},
		
	initialize: function() {
		this._treasures = [];
	},
	
	reset: function() {
		for(var i = 0; i < this._treasures.length; i++) {
			if( this._treasures[i] == "Collected") {
				this._treasures[i] = "Uncollected";
			}		
		}
	},
	
    add: function() {
		this._treasures.push("Uncollected");
    },
       
	getLength: function() {
		return this._treasures.length;
	},

	// a function to check if all treasures have been collected;
	//returns true if they are, otherwise returns false
	checkTreasures: function() {
	
		var result = true;
	
		for(var i = 0; i < this._treasures.length; i++) {
			if( this._treasures[i] != "Collected") {
				result = false;
			}
		}
		return result;
	},
	
	//a function to safe that a treasure has been collected by the player
	collectTreasure: function() {
		for(var i = 0; i < this._treasures.length; i++) {
			if( this._treasures[i] == "Uncollected") {
				this._treasures[i] = "Collected";
				break;
			}		
		}
	},
	
	//a function to safe an enemy collecting a treasure
	stealTreasure: function() {
		for(var i = 0; i < this._treasures.length; i++) {
			if( this._treasures[i] == "Uncollected") {
				this._treasures[i] = "Stolen";
				break;
			}		
		}
	},
	
	//a function to safe an enemy dropping a treasure
	dropTreasure: function() {
		for(var i = 0; i < this._treasures.length; i++) {
			if( this._treasures[i] == "Stolen") {
				this._treasures[i] = "Uncollected";
				break;
			}		
		}
	}
});

