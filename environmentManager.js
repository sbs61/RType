// ==========
// ENVIROMENT MANAGER
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

/*jslint nomen: true, white: true, plusplus: true*/

/* A Manager thta handles the enviroment, it's collision and backgrounds*/

var environmentManager = {

// "PRIVATE" DATA

_particles : [],
_backgrounds : [],
_walls : [],
_wallCmbs : [],
//_wallTimer : 0,
_dustTimer : 0,
_halt : false,

// this._categories : [],

// "PRIVATE" METHODS

_generateBackground : function() {
    this._backgrounds[0] = new Background();
},

_generateWalls : function() {
    // Wall sets created, each sprite loaded in as a background
    // And hitboxes created for appropriate locations
    // Finished set is put in an array

    var cw = g_canvas.width;

    var Bckgr1 = this._createWallBckgr(1);
    var collisionSet1 = [];
    collisionSet1.push(new Wall(300+cw,0,181,199,'wall'));
    collisionSet1.push(new Wall(300+cw,521,181,199,'wall'));
    collisionSet1.push(new Wall(842+cw,0,118,58,'wall'));
    collisionSet1.push(new Wall(842+cw,662,118,58,'wall'));
    this._wallCmbs.push({
        Background : Bckgr1,
        Walls : collisionSet1,
        hasSpawned : false
    });

    var Bckgr2 = this._createWallBckgr(2);
    var collisionSet2 = [];
    collisionSet2.push(new Wall(148+cw,0,475,56,'wall'));
    collisionSet2.push(new Wall(360+cw,523,179,197,'wall'));
    collisionSet2.push(new Wall(940+cw,0,671,135,'wall'));
    collisionSet2.push(new Wall(940+cw,135,176,59,'wall'));
    collisionSet2.push(new Wall(1493+cw,135,118,59,'wall'));
    collisionSet2.push(new Wall(1012+cw,621,120,99,'wall'));
    collisionSet2.push(new Wall(1448+cw,661,474,59,'wall'));
    this._wallCmbs.push({
        Background : Bckgr2,
        Walls : collisionSet2,
        hasSpawned : false
    });

    var Bckgr3 = this._createWallBckgr(3);
    var collisionSet3 = [];
    collisionSet3.push(new Wall(416+cw,0,441,77,'wall'));
    collisionSet3.push(new Wall(416+cw,643,441,77,'wall'));
    collisionSet3.push(new Wall(857+cw,0,124,152,'wall'));
    collisionSet3.push(new Wall(857+cw,568,124,152,'wall'));
    collisionSet3.push(new Wall(981+cw,0,25,120,'wall'));
    collisionSet3.push(new Wall(981+cw,600,25,120,'wall'));
    collisionSet3.push(new Wall(1006+cw,0,25,98,'wall'));
    collisionSet3.push(new Wall(1006+cw,622,25,98,'wall'));
    collisionSet3.push(new Wall(1031+cw,0,23,75,'wall'));
    collisionSet3.push(new Wall(1031+cw,645,23,75,'wall'));
    this._wallCmbs.push({
        Background : Bckgr3,
        Walls : collisionSet3,
        hasSpawned : false
    });
   
},

_timeline : function() {
    // Spawn walls after certain length threshold has been reached
    // Reset in the end
    if (g_XTime >= 0 && !this._wallCmbs[0].hasSpawned) {
        var eWall = this._wallCmbs[0];
        this._backgrounds.push(eWall.Background);
        for (var i = 0; i < eWall.Walls.length; i++) {
            this._walls.push(eWall.Walls[i]);
        };
        eWall.hasSpawned = true;
        return;
    };

    var chk1 = this._wallCmbs[0].Background.sprite.width - 20;

    if (g_XTime >= chk1 && !this._wallCmbs[1].hasSpawned) {
        var eWall = this._wallCmbs[1];
        this._backgrounds.push(eWall.Background);
        for (var i = 0; i < eWall.Walls.length; i++) {
            this._walls.push(eWall.Walls[i]);
        };
        eWall.hasSpawned = true;
        return;
    };

    var chk2 = chk1 + this._wallCmbs[1].Background.sprite.width - 100;

    if (g_XTime >= chk2 && !this._wallCmbs[2].hasSpawned) {
       var eWall = this._wallCmbs[2];
       this._backgrounds.push(eWall.Background);
       for (var i = 0; i < eWall.Walls.length; i++) {
           this._walls.push(eWall.Walls[i]);
       };
       eWall.hasSpawned = true;
       return;
   };

   var chk3 = chk2 + this._wallCmbs[2].Background.sprite.width + 50;

   if (g_XTime >= chk3 + 750) {
       g_XTime = 0;
       for (var i = 0; i < this._wallCmbs.length; i++) {
           this._wallCmbs[i].Background.reset();
           for (var j; j < this._wallCmbs[i].Walls.length; i++) {
               this._wallCmbs[i].Walls[j].reset();
           }
           this._wallCmbs[i].hasSpawned = false;
       };
   };
},

_createWallBckgr : function(wallNumber) {
    // A function to create a custom Background for "inner backgrounds", 
    // ie. walls.. WallNumber dictates the sprite used
    var wallUpdate = function (du) {
        if (!this.halt) {
            this.x -= this.velX * du;
        };
        if (this.x + this.sprite.width <= 0) {
            return environmentManager.KILL_ME_NOW;
        };
    };
    var wallRender = function (ctx) {
        var origScale = this.sprite.scale;

        this.sprite.scale = this.scale;
    
        this.sprite.drawAt(
            ctx, this.x, this.y
        );
    
        this.sprite.scale = origScale;
    };

    return new Background({
        sprite : g_sprites.walls[wallNumber],
        x : g_canvas.width,
        velX : g_XVel,
        update : wallUpdate,
        render : wallRender
    });
},

_generateDust : function (du) {
    this._dustTimer -= du;

	if (this._dustTimer <= 0) {
        var cy = this._getDustY();
        this._particles.push(new SpaceDust(cy));
        this._dustTimer = Math.floor(Math.random()*4)*10 + 30;
    }
},

_getDustY : function () {

    var floor = g_canvas.height / 20;
    var ceil = g_canvas.height - floor;

    return floor + Math.random()*(ceil-floor);
},

// PUBLIC METHODS

KILL_ME_NOW : -1,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._backgrounds,this._walls,this._particles];
},

init: function() {
    this._generateBackground();
    this._generateWalls();
},

toggleHalt : function() {
    this._halt = !this._halt;
},

update : function(du) {
	
    this._generateDust(du);
    this._timeline();

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {
                // remove the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
            }
            else {
                ++i;
            }
        }
    }

    // Update g_Xtime
    if (!this._halt) {
        g_XTime += g_XVel * du;
    }
    
},

render: function(ctx) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {
            aCategory[i].render(ctx);
        }
    }

}

}

// Some deferred setup which needs the object to have been created first
environmentManager.deferredSetup();
