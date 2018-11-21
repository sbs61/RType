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
function Powerup(cx, cy, typeOf) {

  // Common inherited setup logic from Entity
  this.setup();
  this.sprite = g_sprites.multiPower;
  this.cx = cx;
  this.cy = cy;
  this.typeOf = typeOf;
  this.killMe = false;
};

Powerup.prototype = new Entity();
Powerup.prototype.velX = 0.75;

Powerup.prototype.getRadius = function () {
  return {
    width: this.sprite.width*1.5,
    height: this.sprite.height*1.5
  };
};

Powerup.prototype.update = function (du) {
  spatialManager.unregisterSq(this);
  if (this.killMe) {
    return entityManager.KILL_ME_NOW;
  }
  //Update position
  if (!this.halt) {
    this.cx -= this.velX * du;
  }
  
  if (this.cx < 0) {
    return entityManager.KILL_ME_NOW;
  }

  spatialManager.registerSq(this);
};

Powerup.prototype.collideWithShip = function () {
  //Kill the powerup entity
  this.killMe = true;
}

Powerup.prototype.render = function (ctx) {
  this.sprite.drawAt(ctx, this.cx, this.cy, this.rotation);
};
