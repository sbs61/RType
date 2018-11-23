// ==========
// SPACE DUST
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

function SpaceDust(cy) {
    this.sprite = g_sprites.spaceDust;
    this.cy = cy;
    this.cx = g_canvas.width;
    this._scale = Math.floor(Math.random() * 4)*0.25 + 1;
    this.vel = this._generateVel();
};

SpaceDust.prototype._generateVel = function () {
    var slow = Math.floor(Math.random() * 3)*0.5 + 1;
    var fast = Math.floor(Math.random() * 3) + 4;

    return (Math.random() < 0.5) ? slow : fast;
};

SpaceDust.prototype.update = function (du) {

    this.cx -= (this.vel * du);

    if (this.cx <= -2) {
        return -1;
    };
};

SpaceDust.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;

    this.sprite.drawCentredAt(
	    ctx, this.cx, this.cy, 0
    );

    this.sprite.scale = origScale;
};
