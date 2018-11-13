// ===========
// BACKGROUND
// ===========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Background(descr) {

    for (var property in descr) {
        this[property] = descr[property];
    }
    
    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.background;
};

// Initial, inheritable, default values
Background.prototype.x = 0;
Background.prototype.y = 0;
Background.prototype.velX = 0.25;
Background.prototype.scale = 1;
Background.prototype.halt = false;
    
Background.prototype.update = function (du) {
    
    if (!this.halt) {
        this.x -= this.velX * du;
    }
    
    if (this.x <= -this.sprite.width) {
        this.x +=  this.sprite.width; 
    }
};

Background.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;

    this.sprite.scale = this.scale;

    this.sprite.drawAt(
	    ctx, this.x, this.y
    );

    this.sprite.drawAt(
	    ctx, this.x + this.sprite.width, this.y
    );

    this.sprite.scale = origScale;
};
