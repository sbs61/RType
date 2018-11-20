// ====
// Enemy1
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Enemy2(descr) {

  // Common inherited setup logic from Entity
  this.setup(descr);



  // Default sprite and scale, if not otherwise specified
  this.sprite = g_sprites.enemy2[8];
  this.scale = this.scale || 2;

  /*
      // Diagnostics to check inheritance stuff
      this._Enemy1Property = true;
      console.dir(this);
  */

};

Enemy2.prototype = new Entity();

Enemy2.prototype.interval = 70 / NOMINAL_UPDATE_INTERVAL; //interval for the animation 
Enemy2.prototype.cel = 8; //sprite cells
Enemy2.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL; //explosion animation interval


Enemy2.prototype.update = function (du) {
  
  spatialManager.unregister(this);

  //check if the enemy is dead
  if (this._isDeadNow || this.cx < 0) {
    return entityManager.KILL_ME_NOW;

  //trigger explosion
  //when the interval for the explosion animation goes below zero then change the sprite and reset the interval  
  } else if (this.isExploding) {
    this.eInterval -= du;
    if(this.eInterval < 0){
      this.nextExplodingSprite();
      this.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
      }

  //enemy is alive
  } else {

    //update the enemy 2 velocity and make it move in a wave like motion
    this.xVel = -3;
    this.yVel = 4 * Math.cos(this.cx / 100);

    //get previous position
    var prevX = this.cx;
    var prevY = this.cy;

    //calculate next position
    var nextX = prevX + this.xVel * du;
    var nextY = prevY + this.yVel * du;

    //animate enemy 2
    this.interval -= du;
    if (this.interval < 0) {
      //if the next position is above the previous position, animate the enemy to go up
      if (nextY > this.cy) {
        if (this.cel > 5)
          this.cel--;
        this.sprite = g_sprites.enemy2[this.cel];
      } else {
        //if the next position is below the previous position, animate the enemy to go down
        if (this.cel < 11)
          this.cel++;
        this.sprite = g_sprites.enemy2[this.cel];
      }
      this.interval = 70 / NOMINAL_UPDATE_INTERVAL;
    }

    //actually move enemy 2 according to the velocity
    this.cx += this.xVel * du;
    this.cy += this.yVel * du;

    spatialManager.register(this);
  }
};

Enemy2.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Enemy2.prototype.splitSound = new Audio("sounds/Enemy1Split.ogg");
Enemy2.prototype.evaporateSound = new Audio("sounds/Enemy1Evaporate.ogg");

//function for taking a bullet hit, increment the score and trigger the explosion
Enemy2.prototype.takeBulletHit = function () {
  entityManager._hud[0].incrementScore(50);
  this.isExploding = true;
  this.evaporateSound.play();
};

//render enemy 2
Enemy2.prototype.render = function (ctx) {
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation
  );

};
