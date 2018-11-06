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
// _background

// "PRIVATE" METHODS

_generateBackground : function() {
    this._background = new Background();
},

// PUBLIC METHODS

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {
    this._categories = [this._particles];
},

init: function() {
    this._generateBackground();
},

toggleBgHalt : function() {
    this._background.halt = !this._background.halt;
},

update : function(du) {

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

    this._background.update(du);
},

render: function(ctx) {

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        for (var i = 0; i < aCategory.length; ++i) {
            aCategory[i].render(ctx);
        }
    }

    this._background.render(ctx);
}

}

// Some deferred setup which needs the object to have been created first
environmentManager.deferredSetup();
