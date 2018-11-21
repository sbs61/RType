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
  this.cel = g_baseShipCel;
  this.sprite = g_sprites.ship[g_baseShipCel];

  // Set normal drawing scale, and warp state off
  this._scale = 3;
  this._isWarping = false;

  this.fire = false;
  this.timeStarted = false;
  this.time = performance.now();
  this.multiGun = false;
  this.superGun = false;
  this.powerUpTime = 10000 / NOMINAL_UPDATE_INTERVAL;
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
Ship.prototype.KEY_COLOUR = '1'.charCodeAt(0);

// Initial, inheritable, default values
Ship.prototype.rotation = 0;
Ship.prototype.cx = 200;
Ship.prototype.cy = 360;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;
Ship.prototype.cel = g_baseShipCel;
var interval = 100 / NOMINAL_UPDATE_INTERVAL;
Ship.prototype.interval = interval;
Ship.prototype.startCharge = false;
Ship.prototype.chargeTimer = 300 / NOMINAL_UPDATE_INTERVAL;

var chargeInterval = 70 / NOMINAL_UPDATE_INTERVAL;
var charge = 0;
Ship.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
Ship.prototype.muzzleTimer = 50 / NOMINAL_UPDATE_INTERVAL;
Ship.prototype.muzzle = false;

Ship.prototype.update = function (du) {
  spatialManager.unregister(this);
  this.eInterval -= du;

  if (this._isDeadNow || this.cx < 0) {
    //Hér viljum við líklega bæta við einhverju til að skipið hafi fleiri líf
    g_lives--;
    entityManager._hud[0].resetBeam();
    return entityManager.KILL_ME_NOW;

  } else if (this.isExploding) {
    if (this.eInterval < 0) {
      this.nextExplodingSprite();
      this.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
    }
  } else {

    if (eatKey(this.KEY_COLOUR)) {
      if (g_baseShipCel === 22) {
        g_baseShipCel = 2;
        this.cel = g_baseShipCel;
        this.sprite = g_sprites.ship[this.cel];
      } else {
        g_baseShipCel += 5;
        this.cel = g_baseShipCel;
        this.sprite = g_sprites.ship[this.cel];
      }
    }

    if (keys[this.KEY_UP] && this.cy > this.sprite.height / 2) {
      this.cy -= 4 * du;
      if (this.cel < g_baseShipCel + 2) {
        this.interval -= du;
        if (this.interval < 0) {
          this.cel++;
          this.interval = interval;
        }
      }
      this.sprite = g_sprites.ship[this.cel];
    }

    if (keys[this.KEY_DOWN] && this.cy < g_canvas.height - this.sprite.height / 2) {
      this.cy += 4 * du;
      if (this.cel > g_baseShipCel - 2) {
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

    if (this.cel !== g_baseShipCel && !keys[this.KEY_DOWN] && !keys[this.KEY_UP]) {
      if (this.cel > g_baseShipCel) {
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
      this.chargeSound.play();
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

    //Decreas power up time
    if (this.multiGun || this.superGun) {
      this.powerUpTime -= du;
    }

    //Check if power up is over and reset
    if (this.powerUpTime < 0) {
      this.disablePowerUp();
    }

    if (this.muzzle) {
      this.muzzleTimer -= du;
      if (this.muzzleTimer < 0) {
        this.muzzle = false;
        this.muzzleTimer = 50 / NOMINAL_UPDATE_INTERVAL;
      }
    }


    // Handle firing
    this.maybeFireBullet();
    var hitEntity = this.isColliding();
    if (hitEntity) {
      //Check if ship collides with normal entity or powerup
      if (hitEntity.typeOf == 'entity') {
        this.isExploding = true;

        this.evaporateSound.pause();
        this.evaporateSound.currentTime = 0;
        this.evaporateSound.play();
      } else if (hitEntity.typeOf == 'multiGun') {
        hitEntity.collideWithShip();
        this.multiGun = true;
        this.powerUpTime = 10000 / NOMINAL_UPDATE_INTERVAL;
        spatialManager.register(this);
      } else if (hitEntity.typeOf == 'superGun') {
        hitEntity.collideWithShip();
        this.superGun = true;
        this.powerUpTime = 10000 / NOMINAL_UPDATE_INTERVAL;
        spatialManager.register(this);
      }
    } else {
      spatialManager.register(this);
    }
  }

};

Ship.prototype.disablePowerUp = function () {
  this.multiGun = false;
  this.superGun = false;
  this.powerUpTime = 10000 / NOMINAL_UPDATE_INTERVAL;
};

Ship.prototype.maybeFireBullet = function () {
  var hud = entityManager._hud[0];
  if (keys[this.KEY_FIRE]) {
    this.fire = true;
    hud.incrementBeam();
  }

  if (!keys[this.KEY_FIRE] && this.fire) {
    // When the spacebar is released it triggers a shot
    // The type of bullet shot depends on the time the spacebar was held down
    this.fire = false;
    this.muzzle = true;
    this.startCharge = false;
    this.chargeSound.currentTime = 0;
    this.chargeSound.pause();
    var bulletType = [0, 0, 0, 0];


    if (hud.charge < 50) {
      bulletType = this.calculateBulletType(4);	
      entityManager.fireBullet(this.cx + 70,
		this.cy + 7, 4, 25, 0, 0, bulletType);
    } else if (hud.charge < 100) {
	  bulletType = this.calculateBulletType(0);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 8, 15, 0, 0, bulletType);
    } else if (hud.charge < 150) {
      bulletType = this.calculateBulletType(1);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 12, 15, 0, 0, bulletType);
    } else if (hud.charge < 240) {
	  bulletType = this.calculateBulletType(2);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 15, 15, 0, 0, bulletType);
    } else {
	  bulletType = this.calculateBulletType(3);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 7, 22, 15, 0, 0, bulletType);
    }
    this.handleMultiGun(bulletType);
    hud.resetBeam();
  }

};

Ship.prototype.calculateBulletType = function(type) {
	var bulletType = [0, 0, 0, 0];
	if (this.superGun){
		bulletType[3] = 1;
	}
	else{
		if (type === 0 ){
			bulletType[0] = 1;
		}
		else if (type === 1) {
			bulletType[1] = 1;
		}
		else if (type === 2) {
			bulletType[2] = 1;
		}
		else if (type === 3) {
			bulletType[3] = 1;
		}
	}
	return bulletType
	
}

Ship.prototype.handleMultiGun = function (bulletType) {
  // Handle multiGun
  if (this.multiGun) {
    if (bulletType[0]) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 10, 8, 15, 10, 120, bulletType);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 4, 8, 15, -10, -120, bulletType);
    } else if (bulletType[1]) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 10, 12, 15, 10, 120, bulletType);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 4, 12, 15, -10, -120, bulletType);

    } else if (bulletType[2]) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 20, 15, 15, 10, 120, bulletType);
      entityManager.fireBullet(this.cx + 70,
        this.cy - 6, 15, 15, -10, -120, bulletType);
    } else if (bulletType[3]) {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 40, 22, 15, 10, 120, bulletType);
      entityManager.fireBullet(this.cx + 70,
        this.cy - 26, 22, 15, -10, -120, bulletType);
    } else {
      entityManager.fireBullet(this.cx + 70,
        this.cy + 10, 4, 15, 10, 120, bulletType);
      entityManager.fireBullet(this.cx + 70,
        this.cy + 4, 4, 15, -10, -120, bulletType);
    }
  }
}

Ship.prototype.evaporateSound = new Audio("sounds/explosion.mp3");
Ship.prototype.chargeSound = new Audio("sounds/charge.mp3");

Ship.prototype.getRadius = function () {
  return this.sprite.width;
};

Ship.prototype.takeBulletHit = function () {
  this.isExploding = true;
};

Ship.prototype.getPosX = function () {
  return this.cx;
}

Ship.prototype.getPosY = function () {
  return this.cy;
}

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
  if (this.muzzle) {
    g_sprites.muzzleFlash.drawCentredAt(ctx, this.cx + 61, this.cy + 8)
  }
  this.sprite.drawCentredAt(
    ctx, this.cx, this.cy, this.rotation
  );

  this.sprite.scale = origScale;

};
