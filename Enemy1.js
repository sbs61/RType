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
function Enemy1(descr) {

  // Common inherited setup logic from Entity
  this.setup(descr);

  this.randomisePosition();

  // Default sprite and scale, if not otherwise specified
  this.sprite = g_sprites.enemy1[0];
  this.scale = this.scale || 2;
  this.bulletVelX = 0;
  this.bulletVelY = 0;

};

Enemy1.prototype = new Entity();

Enemy1.prototype.randomisePosition = function () {
  // Enemy1 randomisation defaults (if nothing otherwise specified)
  this.cx = util.randRange(900,1400); //Spawn the enemy outside the canvas between 900 and 1400 px
  this.cy = util.randRange(120,600); //Spawn the enemy within 120 and 600 px on the y axis
};

Enemy1.prototype.interval = 100 / NOMINAL_UPDATE_INTERVAL; //update interval for the animation
Enemy1.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL; //update interval for the explosion animation
Enemy1.prototype.cel = 0; //store the sprite cell
Enemy1.prototype.explode = false; //check if the enemy is exploding
Enemy1.prototype.fireInterval = 1000 / NOMINAL_UPDATE_INTERVAL; //interval for firing the enemy bullets

Enemy1.prototype.update = function (du) {
  // TODO: YOUR STUFF HERE! --- Unregister and check for death
  spatialManager.unregister(this);

  //check if the enemy is dead
  if (this._isDeadNow || this.cx < 0) {
    return entityManager.KILL_ME_NOW;

    //check if the enemy is exploding
  } else if (this.isExploding) {
    //trigger the interval for the explosion animation, when it goes below zero then change the sprite and reset the interval
    this.eInterval -= du;
    if(this.eInterval < 0){
    this.nextExplodingSprite();
    this.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
    }

    //else if the enemy is alive
  } else {

    //move the enemy in a wave like motion
    this.cx -= 3 * du;
    this.cy += 3 * Math.cos(this.cx / 40) * du;

    //lower the animation interval, when it reaches zero, reset it and change the sprite cell
    this.interval -= du;
    if (this.interval < 0) {
      this.cel++;

      if (this.cel === 8) this.cel = 0;
      this.sprite = g_sprites.enemy1[this.cel];

      this.interval = 100 / NOMINAL_UPDATE_INTERVAL;
    }

    //lower the fire bullet interval, when it reaches zero there is a 1/10 chance to fire a bullet
    this.fireInterval -= du;
    if(this.fireInterval < 0){
      var x = Math.floor(Math.random() * 10);
      //if x === 0 then fire a bullet
      if(x === 0){
      //get the direction of where to shoot it
      this.bulletDirection();
      //then make the entitymanager fire a new bullet in that direction
      entityManager.fireEnemyBullet(this.cx, this.cy,
        this.bulletVelX, this.bulletVelY);
      }
      //reset the fire interval
      this.fireInterval = 1000 / NOMINAL_UPDATE_INTERVAL;
    }
    spatialManager.register(this);
  }
};

//function to get the radius of the enemy
Enemy1.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Enemy1.prototype.evaporateSound = new Audio("sounds/explosion.mp3");

//function for when the enemy is hit by a bullet, if you hit an enemy with a bullet increase the score
//and trigger the animation for the explosion
Enemy1.prototype.takeBulletHit = function () {
  entityManager._hud[0].incrementScore(25);
  //Check if we should generate powerup
  if(entityManager._hud[0].killCount % 2 == 0) {
    entityManager.generatePowerup(this.cx, this.cy, 'multiGun');
  }
  this.isExploding = true;
  this.evaporateSound.pause();
  this.evaporateSound.currentTime = 0;
  this.evaporateSound.play();
};

//calculate the direction of the enemy bullet
Enemy1.prototype.bulletDirection = function() {
  // Calculate a firing direction 
  var ship = entityManager._ships[0];

  // Simply takes the distance between itself and the ship
  this.bulletVelX = (this.cx - ship.cx)/100;
  this.bulletVelY = (this.cy - ship.cy)/100;

  // Prevent bullets being too fast when the ships are far away
  // and prevent the bullets being too slow if theyre close
  if (this.bulletVelX < 4 && this.bulletVelX > 0){
      this.bulletVelX = 4;
  }
  if (this.bulletVelX > 6) {
      this.bulletVelX = 6;
  }
  if (this.bulletVelX < 0 && this.bulletVelX > -4) {
    this.bulletVelX = -4;
  }
  if (this.bulletVelX < -6) {
    this.bulletVelX = -6;
  }
}

//render the enemy
Enemy1.prototype.render = function (ctx) {
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation);
};
