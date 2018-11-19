// ==========
// SHIP STUFF
// ==========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Ship(descr) {

  // Common inherited setup logic from Entity
  this.setup(descr);

  this.rememberResets();

  // Default sprite, if not otherwise specified
  this.sprite = g_sprites.ship[2];

  // Set normal drawing scale, and warp state off
  this._scale = 3;
  this._isWarping = false;

  this.fire = false;
  this.timeStarted = false;
  this.time = performance.now();
};


Ship.prototype = new Entity();

Ship.prototype.rememberResets = function () {
  // Remember my reset positions
  this.reset_cx = this.cx;
  this.reset_cy = this.cy;
  this.reset_rotation = this.rotation;
};

Ship.prototype.KEY_UP = 'W'.charCodeAt(0);
Ship.prototype.KEY_DOWN = 'S'.charCodeAt(0);
Ship.prototype.KEY_LEFT = 'A'.charCodeAt(0);
Ship.prototype.KEY_RIGHT = 'D'.charCodeAt(0);

Ship.prototype.KEY_FIRE = ' '.charCodeAt(0);

// Initial, inheritable, default values
Ship.prototype.rotation = 0;
Ship.prototype.cx = 200;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;
Ship.prototype.cel = 2;
var interval = 100 / NOMINAL_UPDATE_INTERVAL;
Ship.prototype.interval = interval;
Ship.prototype.startCharge = false;
Ship.prototype.chargeTimer = 300 / NOMINAL_UPDATE_INTERVAL;

var chargeInterval = 70 / NOMINAL_UPDATE_INTERVAL;
var charge = 0;

Ship.prototype.update = function (du) {
  // TODO: YOUR STUFF HERE! --- Unregister and check for death
  spatialManager.unregister(this);

  if (this._isDeadNow || this.cx < 0) {
    //Hér viljum við líklega bæta við einhverju til að skipið hafi fleiri líf
    return entityManager.KILL_ME_NOW;
  } else if (this.isExploding) {
    this.nextExplodingSprite();
  } else {

    if (keys[this.KEY_UP] && this.cy > this.sprite.height / 2) {
      this.cy -= 4 * du;
      if (this.cel < 4) {
        this.interval -= du;
        if (this.interval < 0) {
          this.cel++;
          this.interval = interval;
        }
      }
      this.sprite = g_sprites.ship[this.cel];
    }


    // Í rauninni þá á skipið að springa ef það fer í botninn en það kemur seinna
    if (keys[this.KEY_DOWN] && this.cy < g_canvas.height - this.sprite.height / 2) {
      this.cy += 4 * du;
      if (this.cel > 0) {
        this.interval -= du;
        if (this.interval < 0) {
          this.cel--;
          this.interval = interval;
        }
      }
      this.sprite = g_sprites.ship[this.cel];
    }

    if (keys[this.KEY_LEFT] && this.cx > this.sprite.width / 2) {
      this.cx -= 3 * du;
    }
    if (keys[this.KEY_RIGHT] && this.cx < g_canvas.width - this.sprite.width / 2) {
      this.cx += 3 * du;
    }

    if (this.cel !== 2 && !keys[this.KEY_DOWN] && !keys[this.KEY_UP]) {
      if (this.cel > 2) {
        this.interval -= du;
        if (this.interval < 0) {
          this.cel--;
          this.interval = interval;
        }
        this.sprite = g_sprites.ship[this.cel];
      } else {
        this.interval -= du;
        if (this.interval < 0) {
          this.cel++;
          this.interval = interval;
        }
        this.sprite = g_sprites.ship[this.cel];
      }
    }

    if (this.fire) {
      this.chargeTimer -= du;
    }
    if (this.chargeTimer < 0) {
      this.startCharge = true;
      this.chargeTimer = 300 / NOMINAL_UPDATE_INTERVAL;
    }

    chargeInterval -= du;
    if (chargeInterval < 0) {
      charge++;
      chargeInterval = 70 / NOMINAL_UPDATE_INTERVAL;
    }
    if (charge > 7) {
      charge = 0;
    }


    // Handle firing
    this.maybeFireBullet();

    if (this.isColliding()) {
      this.isExploding = true;
    } else {
      spatialManager.register(this);
    }
  }
};

Ship.prototype.maybeFireBullet = function () {
  var hud = entityManager._hud[0];
  if (keys[this.KEY_FIRE]) {
    this.fire = true;
    hud.incrementBeam();
  }

  if (!keys[this.KEY_FIRE] && this.fire) {
    this.fire = false;
    this.startCharge = false;

    if (hud.charge < 50) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 25, 0, false, false, false, false);
    } else if (hud.charge < 100) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 15, 0, true, false, false, false);
    } else if (hud.charge < 150) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 15, 0, false, true, false, false);
    } else if (hud.charge < 240) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 15, 0, false, false, true, false);
    } else {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 15, 0, false, false, false, true);
    }
    hud.resetBeam();
  }

};

Ship.prototype.getRadius = function () {
  return this.sprite.width;
};

Ship.prototype.takeBulletHit = function () {
  this.isExploding = true;
};

Ship.prototype.reset = function () {
  this.setPos(this.reset_cx, this.reset_cy);
  this.rotation = this.reset_rotation;
  this.halt();
};

Ship.prototype.halt = function () {
  this.velX = 0;
  this.velY = 0;
};

Ship.prototype.render = function (ctx) {
  var origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  if (this.startCharge) {
    g_sprites.charge[charge].scale = 2;
    g_sprites.charge[charge].drawCentredAt(ctx, this.cx + 78, this.cy + 7, this.rotation);
  }

  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation
  );

  this.sprite.scale = origScale;
};
