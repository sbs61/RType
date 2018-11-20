// ==========
// Wall
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A rectangle collision object for walls
function Wall(x,y,w,h) {

  // Common inherited setup logic from Entity
  this.setup();

  this.cx = x;
  this.cy = y;
  this.width = w;
  this.height = h;

  this.halt = false;
};

Wall.prototype = new Entity();

Wall.prototype.cx = 200; // Upper left corner
Wall.prototype.cy = 0; // Upper left corner
Wall.prototype.width = 100;
Wall.prototype.height = 75;
Wall.prototype.velX = g_XVel;

Wall.prototype.getRadius = function() {
    return {
        width: this.width,
        height: this.height
    };
};

Wall.prototype.update = function(du) {
    spatialManager.unregisterSq(this);
    
    if(this.cx + this.width <= 0) {
        return environmentManager.KILL_ME_NOW;
    };

    if (!this.halt) {
        this.cx -= this.velX * du;
    };

    spatialManager.registerSq(this);
};

Wall.prototype.render = function(ctx) {
    // Do nothing
    // The wall render is tied to the backgrounds
    // This is only the collission object
};