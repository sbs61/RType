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
function Powerup(cx, cy) {

  // Common inherited setup logic from Entity
  this.setup();
  this.sprite = g_sprites.bullet3;
  this.lifeSpan = 5000 / NOMINAL_UPDATE_INTERVAL;
  this.cx = cx;
  this.cy = cy;
  this.typeOf = 'powerup';
};

Powerup.prototype = new Entity();
Powerup.prototype.velX = 3;

Powerup.prototype.getRadius = function () {
  return {
    width: this.sprite.width,
    height: this.sprite.height
  };
};

Powerup.prototype.update = function (du) {
  spatialManager.unregisterSq(this);
  //Update position
  if (!this.halt) {
    this.cx -= this.velX * du;
  }
  
  //Decrease the lifespan and check if powerup should be killed
  this.lifeSpan -= du;
  if (this.lifeSpan < 0) {
    return entityManager.KILL_ME_NOW;
  }

  spatialManager.registerSq(this);
};

Powerup.prototype.collideWithShip = function () {
  //Kill the powerup entity
  this.lifeSpan = 0;
}

Powerup.prototype.render = function (ctx) {
  this.sprite.drawAt(ctx, this.cx, this.cy, this.rotation);
};
