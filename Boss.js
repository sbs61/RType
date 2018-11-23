// ====
// BOSS
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
  this.radius = 6;

  /*
      // Diagnostics to check inheritance stuff
      this._Enemy1Property = true;
      console.dir(this);
  */

};

Boss.prototype = new Entity();

// Initial, inheritable, default values
Boss.prototype.interval = 70 / NOMINAL_UPDATE_INTERVAL; //interval for the animation 
Boss.prototype.cel = 0; //sprite cells
Boss.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL; //explosion animation interval
Boss.prototype.cx = 700;
Boss.prototype.cy = 360;
Boss.prototype.xVel = 0;
Boss.prototype.yVel = 0;
Boss.prototype.fireInterval = 11000 / NOMINAL_UPDATE_INTERVAL;
Boss.prototype.health = g_bossHealth;

//Update function for the boss
Boss.prototype.update = function (du) {

  // unregister the boss in the spatial manager
  spatialManager.unregister(this);

  //check if the boss is dead
  if (this._isDeadNow || this.cx < 0) {
    return entityManager.KILL_ME_NOW;

    //trigger explosion
    //when the interval for the explosion animation goes below zero then change the sprite and reset the interval  
  } else if (this.isExploding) {
    this.eInterval -= du;
    if (this.eInterval < 0) {
      this.nextExplodingBossSprite();
      this.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
    }

    //When the boss is alive
  } else {

    //When the boss reaches x coords 750 then he should stop and do this
    if (this.cx < 750) {
        this.xVel = 0;

    // Make the boss follow the players ship position, if the spaceship is higher than the boss then move the boss up, else move him down
    if (entityManager._ships[0].cy < this.cy) {
        if (this.yVel > -1)
          this.yVel -= 0.1 * du;
        this.cel = 0;
        this.sprite = g_sprites.boss[this.cel];
      }
      else {
        if (this.yVel < 1)
          this.yVel += 0.1 * du;
        if (entityManager._ships[0].cy > this.cy + 30) {
          this.cel = 1;
          this.sprite = g_sprites.boss[this.cel];
        }
      }
    }

    //move the boss into the screen until x coords are 750
    else
        this.xVel = -2;


    // subtract du from the fire interval
    this.fireInterval -= du;

    // make the boss shoot when the fireInterval is less than zero and reset the interval
    if (this.fireInterval < 0) {
      entityManager.fireBossBullet(this.cx - 65, this.cy - 18);
      this.fireInterval = 800 / NOMINAL_UPDATE_INTERVAL;
    }


    //actually move the boss according to the velocity
    this.cx += this.xVel * du;
    this.cy += this.yVel * du;

    //register him from the spatial manager
    spatialManager.register(this);
  }
};

//get the radius of the boss
Boss.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Boss.prototype.evaporateSound = new Audio("sounds/bossExplode.mp3");

//function for taking a bullet hit, increment the score and trigger the explosion. Also increment the boss's health for next round.
Boss.prototype.takeBulletHit = function () {
  this.health--;
  this.sprite = g_sprites.bossHit[this.cel];
  console.log(this.health);
  if (this.health < 0) {
    entityManager._hud[0].incrementScore(1000);

    this.isExploding = true;

    this.evaporateSound.play();

    g_bossHealth += 100;
  }
};

//render enemy 2
Boss.prototype.render = function (ctx) {
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation
  );

};
