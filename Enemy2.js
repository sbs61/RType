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

  this.randomisePosition();


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
var n = 40;
var spawnPoint = [];
fill();
var s = 0;
var l = 0;

function fill() {
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 5; j++) {
      spawnPoint.push(util.randRange(1000 + s, 1500 + s));
      console.log(spawnPoint[l]);
      l++;
    }
    s += 500;
  }
}

Enemy2.prototype.randomisePosition = function () {
  // Enemy1 randomisation defaults (if nothing otherwise specified)
  this.cx = 1000; //this.cx || Math.random() * g_canvas.width;
  this.cy = 300 + n; //this.cy || Math.random() * g_canvas.height;
  this.rotation = 0;
  n++;
};

Enemy2.prototype.randomiseVelocity = function () {
  var MIN_SPEED = 20,
    MAX_SPEED = 70;

  var speed = util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS;
  var dirn = Math.random() * consts.FULL_CIRCLE;

  this.velX = this.velX || speed * Math.cos(dirn);
  this.velY = 3; //this.velY || speed * Math.sin(dirn);

  var MIN_ROT_SPEED = 0.5,
    MAX_ROT_SPEED = 2.5;

  this.velRot = this.velRot ||
    util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS;
};

Enemy2.prototype.interval = 70 / NOMINAL_UPDATE_INTERVAL;
Enemy2.prototype.g_cel = 8;
Enemy2.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;


Enemy2.prototype.update = function (du) {
  
  this.eInterval -= du;

  spatialManager.unregister(this);
  if (this._isDeadNow || this.cx < 0) {
    return entityManager.KILL_ME_NOW;
  } else if (this.isExploding) {
    if(this.eInterval < 0){
      this.nextExplodingSprite();
      this.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
      }
  } else {

    this.xVel = -3;
    this.yVel = 4 * Math.cos(this.cx / 100);

    var prevX = this.cx;
    var prevY = this.cy;

    var nextX = prevX + this.xVel * du;
    var nextY = prevY + this.yVel * du;

    this.interval -= du;
    if (this.interval < 0) {
      if (nextY > this.cy) {
        if (this.g_cel > 5)
          this.g_cel--;
        this.sprite = g_sprites.enemy2[this.g_cel];
      } else {
        if (this.g_cel < 11)
          this.g_cel++;
        this.sprite = g_sprites.enemy2[this.g_cel];
      }
      this.interval = 70 / NOMINAL_UPDATE_INTERVAL;
    }

    this.cx += this.xVel * du;
    this.cy += this.yVel * du;

  }
  spatialManager.register(this);
};

Enemy2.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Enemy2.prototype.splitSound = new Audio("sounds/Enemy1Split.ogg");
Enemy2.prototype.evaporateSound = new Audio("sounds/Enemy1Evaporate.ogg");

Enemy2.prototype.takeBulletHit = function () {
  entityManager._hud[0].incrementScore(50);
  this.isExploding = true;
  this.evaporateSound.play();
};



Enemy2.prototype.render = function (ctx) {
  var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation
  );

};
