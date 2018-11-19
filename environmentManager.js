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

var g_XTime = 0;
var g_XVel = 0.75;

/* Manager sem heldur utan um umhverfi; árekstrarumhverfi(kannski) og bakgrunn */

var environmentManager = {

// "PRIVATE" DATA

_particles : [],
_backgrounds : [],
_walls : [],
_dustTimer : 0,
_halt : false,

// this._categories : [],

// "PRIVATE" METHODS

_generateBackground : function() {
    this._backgrounds[0] = new Background();
},

_generateWalls : function() {
    this._backgrounds[1] = new Background({
        sprite : g_sprites.walls,
        velX : g_XVel,
        x : 350,
        scale : 0.8
    });

    this._walls.push(new Wall({
        x : 1080,
        y : 0,
        width : 155,
        height : 170
    }));

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
