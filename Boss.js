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
function Boss(descr) {

  // Common inherited setup logic from Entity
  this.setup(descr);



  // Default sprite and scale, if not otherwise specified
  this.sprite = g_sprites.boss[0];
  this.scale = this.scale || 2;
  this.cx = 2000;
  this.cy = 360;

  /*
      // Diagnostics to check inheritance stuff
      this._Enemy1Property = true;
      console.dir(this);
  */

};

Boss.prototype = new Entity();

Boss.prototype.interval = 70 / NOMINAL_UPDATE_INTERVAL; //interval for the animation 
Boss.prototype.cel = 8; //sprite cells
Boss.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL; //explosion animation interval
Boss.prototype.cx = 700;
Boss.prototype.cy = 360;
Boss.prototype.xVel = 0;
Boss.prototype.yVel = 0;
Boss.prototype.health = g_bossHealth;


Boss.prototype.update = function (du) {
  
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
    if(this.cx < 750){
        this.xVel = 0;
        if(entityManager._ships[0].cy < this.cy){
            if(this.yVel > -1)
                this.yVel-=0.1*du;
            this.sprite = g_sprites.boss[0];
        }
        else{
            if(this.yVel < 1)
                this.yVel+=0.1*du;
            if(entityManager._ships[0].cy > this.cy+30)
                this.sprite = g_sprites.boss[1];
        }
    }
    else   
        this.xVel = -2;


    //get previous position
    var prevX = this.cx;
    var prevY = this.cy;

    //calculate next position
    var nextX = prevX + this.xVel * du;
    var nextY = prevY + this.yVel * du;
    

    //actually move enemy 2 according to the velocity
    this.cx += this.xVel * du;
    this.cy += this.yVel * du;

    spatialManager.register(this);
  }
};

Boss.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Boss.prototype.evaporateSound = new Audio("sounds/explosion.mp3");

//function for taking a bullet hit, increment the score and trigger the explosion
Boss.prototype.takeBulletHit = function () {
  this.health--;
  console.log(this.health);
  if(this.health < 0){
  entityManager._hud[0].incrementScore(50);
  
  //Check if we should generate powerup
  if(entityManager._hud[0].killCount % 2 == 0) {
    console.log('power2');
    entityManager.generatePowerup(this.cx, this.cy);
  }
  this.isExploding = true;

  this.evaporateSound.pause();
  this.evaporateSound.currentTime = 0;
  this.evaporateSound.play();
}
};

//render enemy 2
Boss.prototype.render = function (ctx) {
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation
  );

};
