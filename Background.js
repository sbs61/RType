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
Background.prototype.cx = 0;
Background.prototype.cy = 0;
Background.prototype.velX = 0.33;
Background.prototype.halt = false;
    
Background.prototype.update = function (du) {
    
    if (!this.halt) {
        this.cx -= this.velX * du;
    }
    
    if (this.cx <= -this.sprite.width) {
        this.cx +=  this.sprite.width; 
    }
};

Background.prototype.render = function (ctx) {

    this.sprite.drawAt(
	    ctx, this.cx, 0
    );

    this.sprite.drawAt(
	    ctx, this.cx + this.sprite.width, 0
    );
};
