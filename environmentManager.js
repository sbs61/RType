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

/* Manager sem heldur utan um umhverfi; árekstrarumhverfi(kannski) og bakgrunn */

var environmentManager = {

// "PRIVATE" DATA

_particles : [],
_backgrounds : [],
_dustTimer : 0,

// this._categories : [],

// "PRIVATE" METHODS

_generateBackground : function() {
    this._backgrounds[0] = new Background();
},

_generateWalls : function() {
    this._backgrounds[1] = new Background({
        sprite : g_sprites.walls,
        velX : 0.75,
        x : 350
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
    this._categories = [this._backgrounds,this._particles];
},

init: function() {
    this._generateBackground();
    this._generateWalls();
},

toggleBgHalt : function() {
    this._background.halt = !this._background.halt;
},

update : function(du) {

    // this._background.update(du);
	
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
    
},

render: function(ctx) {
	
	// Render background first
	// this._background.render(ctx);

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
