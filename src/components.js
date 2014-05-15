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
            this.attr({xc: x, yc: y } );
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
                .sprite(1,0);
        
    },
    digState: 0,
    speed: 3,
    onFrame: function(){
        if(this.digState ){

            this.digState -= this.speed;
            console.log(this.digState );
            this.checkState();
        }
    },
    digged: function(){
        return this.digState >= this.w ? 1 : 0;
    },
    dig: function(){
        //Called by player
        if( this.digged() ) return;

        console.log('1DIG STATE:', this ,'xxx', this.digState, this.speed, this.w);
        this.digState += this.speed * 2; //double speed for prevent redigging
        console.log('2DIG STATE:', this.digState, this.speed, this.w);

        this.checkState();

        if( this.digState >= this.w  ){
            this.digState += this.w * 10; //speed defined by 
            return 1;
        }
        //console.log('diggin block', this);
    },
    enemyUnDig: function () {
        if(this.digState && !this.digged ){
            console.log('undiggin');
            this.gitState =- this.speed * 2;
            this.checkState();
        }
    },
    checkState: function () {
        if( this.digState <= 0 ){
            this.digState = 0;
            this.sprite(1,0);
            map[this.yc-1][this.xc-1] = 'W';
        }
        if( this.digState >= this.w ){
            this.sprite(0,1);
            map[this.yc-1][this.xc-1] = '_';
        }
    },

       //Frage         
       /* digged[]: {0, 0},
        
        checkDigging: function(){
            if (this.digged[0] == 1 && this.digged [1] >= 50)
            {
                this.sprite,(0,0);
                this.digged[1] -= 1;
            }
            else if (this.digged[0] == 1 && this.digged [1] >= 1 )
            {
                this.sprite,(0,1);
                this.digged[1] -= 1;
            }
            else(this.digged[0]  == 1)
            {
                digged[0] = 0;
            }
        }
        */
       
       digged0: 0,
               
       digged1: 0,        
       
       checkDigging: function(){
            if (this.digged0 == 1 && this.digged1 >= 50)
            {
                this.sprite(0,0);
                this.digged1 -= 1;
            }
            else if (this.digged0 == 1 && this.digged1 >= 1 )
            {
                this.sprite(0,1);
                this.digged1 -= 1;
            }
            else(this.digged0 == 1)
            {
                this.digged0 = 0;
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
               // .image('assets/Leiter_oK_24x24_72ppi.png');
				.sprite(0,1);
               
    },
});
Crafty.c('Pole', {
    init: function() {
        this.requires('Actor, spr_pole')
                .sprite(1,1);
    },
});
 
 
var playerX = 0;
var playerY = 0;
var playerW = 0;
var playerH = 0;

 
Crafty.c('Enemy', 
    {
        //x - xpixel (absolute)
        //y - ypixel (pos)
        //w - width
        //h - height
        init: function() {
            this.requires('Actor, Collision, Gravity, spr_enemy, SpriteAnimation')
                    //.stopOnSolids()
                    .bind('EnterFrame', this.toDoList)
                    .animate("walk_right", 5, 0, 9)
                    .animate("walk_up", 0, 1, 2)
                    .animate("walk_down", 2, 1, 0)
                    .animate("climb_right", 0, 2, 3) 
                    .animate("climb_left", 4, 2, 7) 
                    .onHit('PlayerCharacter', this.killPlayer)
                    .onHit('Stone', this.reDigging)
                    ;  
                    //.onHit('Treasure', this.collectTreasure);
            this.move = {x:0,y:0};
        },
        //Frage: kann irgendwie playerX und Y nicht lesen (sind aber global und beim spieler funktionierts(siehe console)
        //Wenn man eine move Direction vorher festlegt hängt er sich bei detect Block auf!
        moveDirection : 0,
        playerSpeed     : 1.5,
        move            : null,
        toDoList: function(){

            moveAI2D( this );
            move( this );
            //this.x += 10;
            /*
            this.moveDirection = ki(this.moveDirection, this.x, this.y, this.h, this.w, playerX, playerY);        
            this.killPlayerWithCoord();
            this.applyXandY();
            */
        },
        reDigging: function( data ){
            var block = data[0].obj;
            block.enemyUnDig();
        },
        killPlayer: function(data) {

            Crafty.trigger('EnemyCollison', this);
            //playerCharacter = data[0].obj;
            //playerCharacter.collect();
        },
        killPlayerWithCoord: function ()
        { 
            if(playerX >= this.x && playerY == this.y && playerX <= (this.x + this.w))
            {	
				Crafty.trigger('EnemyCollison', this);
            }
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
        this.requires('Actor, Multiway, Collision, Gravity, spr_player, SpriteAnimation, Keyboard')
            .bind('KeyDown'     , this.keyTester)
            .bind('KeyUp'       , this.keyTester)
            .bind('EnterFrame'  , this.toDoList)     //enter frame called on each time tic;
            .animate("walk_left", 0, 0, 4)
            .animate("walk_right", 5, 0, 9)
            .animate("walk_up", 0, 1, 2)
            .animate("walk_down", 2, 1, 0)
            .animate("climb_right", 0, 2, 3) 
            .animate("climb_left", 4, 2, 7) 
            .onHit('Treasure'   , this.collectTreasure)
            .onHit('Exit'       , this.hitExit);
				
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

});

var treasureCollected = 0;

Crafty.c('Treasure', {
    init: function() {
        this.requires('Actor, spr_treasure')
            .sprite(0,0);
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

