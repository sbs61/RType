// ==========
// SHIP
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
Ship.prototype.KEY_GODMODE = 'G'.charCodeAt(0);

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

Ship.prototype.chargeInterval = 70 / NOMINAL_UPDATE_INTERVAL; // interval between each charge animation
Ship.prototype.chargeCel = 0; //base charge sprite cell
Ship.prototype.eInterval = 50 / NOMINAL_UPDATE_INTERVAL; // interval between each explosion animation
Ship.prototype.muzzleTimer = 50 / NOMINAL_UPDATE_INTERVAL; // how long to render the ship muzzle
Ship.prototype.muzzle = false; // keep track of when to render the ships fire muzzle
Ship.prototype.godMode = false;
//update the ships
Ship.prototype.update = function (du) {

	// unregister ship in spatial manager
	spatialManager.unregister(this);

	// if the ship has been hit, lower the lives by 1, reset the charge beam and kill the ship
	if (this._isDeadNow) {
		g_lives--;
		entityManager._hud[0].resetBeam();
		return entityManager.KILL_ME_NOW;

	// if the ship is exploding then do the explosion animation
	} else if (this.isExploding) {
		this.eInterval -= du;
		if (this.eInterval < 0) {
			this.nextExplodingSprite();
			this.eInterval = 50 / NOMINAL_UPDATE_INTERVAL;
		}

	// else if the ship is alive do this
	} else {

		// press 1 to change the colour of the ship by choosing a different sprite row
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

		if (eatKey(this.KEY_GODMODE)){
			// Enables godmode which removes hit detection on ship (except powerups)
			// enabling godmode also disabled highscores
			this.godMode = !this.godMode;
			if (this.godMode){
				console.log("Godmode enabled. Highscores have been disabled");
			}
			else console.log("Godmode disabled");
		}

		//if you press up then move the ship up and do the "move up" sprite animation
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

		// if you press down then move the ship down and do the "move down" sprite animation
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

		// if you press left move the ship left
		if (keys[this.KEY_LEFT] && this.cx > this.sprite.width / 2) {
			this.cx -= 3 * du;
		}

		// if you press right move the ship right
		if (keys[this.KEY_RIGHT] && this.cx < g_canvas.width - this.sprite.width / 2) {
			this.cx += 3 * du;
		}

		// if neither up or down is being pressed then animate the ship back to the base position relative to its last position
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

		// if you press fire, lower the charge timer
		if (this.fire) {
			this.chargeTimer -= du;
		}

		// if the charge timer goes below zero, start the charge animation and play the charge sound.
		if (this.chargeTimer < 0) {
			this.startCharge = true;
			this.chargeSound.play();
			this.chargeTimer = 300 / NOMINAL_UPDATE_INTERVAL;
		}

		// animate the charge
		this.chargeInterval -= du;
		if (this.chargeInterval < 0) {
			this.chargeCel++;
			this.chargeInterval = 70 / NOMINAL_UPDATE_INTERVAL;
		}

		// if the charge sprite goes above seven reset it back to the first sprite
		if (this.chargeCel > 7) {
			this.chargeCel = 0;
		}

		//Decrease power up time
		if (this.multiGun || this.superGun) {
			this.powerUpTime -= du;
		}

		//Check if power up is over and reset
		if (this.powerUpTime < 0) {
			this.disablePowerUp();
		}

		// set how long to show the fire muzzle
		if (this.muzzle) {
			this.muzzleTimer -= du;
			if (this.muzzleTimer < 0) {
				this.muzzle = false;
				this.muzzleTimer = 50 / NOMINAL_UPDATE_INTERVAL;
			}
		}


		// Handle firing
		this.maybeFireBullet(du);
		var hitEntity = this.isColliding();
		if (hitEntity) {
			//Check if ship collides with normal entity or powerup
			if ((hitEntity.typeOf === 'entity' || hitEntity.typeOf === 'wall') && (!this.godMode)) {
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


var normalBulletRadius = 4;

Ship.prototype.maybeFireBullet = function (du) {
	var hud = entityManager._hud[0];
	if (keys[this.KEY_FIRE]) {
		this.fire = true;
		hud.incrementBeam(du);
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


		// Normal bullet
		if (hud.charge < 50) {
			bulletType = this.calculateBulletType(4);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 7, normalBulletRadius, 25, 0, 0, bulletType, true);

		// charge 1
		} else if (hud.charge < 100) {
			bulletType = this.calculateBulletType(0);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 7, 8, 15, 0, 0, bulletType, true);
		}

		// Charge 2
		else if (hud.charge < 150) {
			bulletType = this.calculateBulletType(1);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 7, 12, 15, 0, 0, bulletType, true);
		}

		// Charge 3
		else if (hud.charge < 240) {
			bulletType = this.calculateBulletType(2);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 7, 15, 15, 0, 0, bulletType, true);
		}

		// Charge 4
		else {
			bulletType = this.calculateBulletType(3);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 7, 22, 15, 0, 0, bulletType, true);
		}
		this.handleMultiGun(bulletType);
		hud.resetBeam();
	}

};

Ship.prototype.calculateBulletType = function (type) {
	// Function to calculate which type of bullet should be fired
	var bulletType = [0, 0, 0, 0];
	if (this.superGun) { // If supergun is enabled all shots are the biggest type
		bulletType[3] = 1;
		normalBulletRadius = 22;
	}
	else {
		normalBulletRadius = 4;
		if (type === 0) {
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
	// Function that shoots two new bullets at angles if multigun is enabled
	if (this.multiGun) {
		if (bulletType[0]) {
			entityManager.fireBullet(this.cx + 70,
				this.cy + 10, 8, 15, 10, 120, bulletType, false);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 4, 8, 15, -10, -120, bulletType, false);
		} else if (bulletType[1]) {
			entityManager.fireBullet(this.cx + 70,
				this.cy + 10, 12, 15, 10, 120, bulletType, false);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 4, 12, 15, -10, -120, bulletType, false);

		} else if (bulletType[2]) {
			entityManager.fireBullet(this.cx + 70,
				this.cy + 20, 15, 15, 10, 120, bulletType, false);
			entityManager.fireBullet(this.cx + 70,
				this.cy - 6, 15, 15, -10, -120, bulletType, false);
		} else if (bulletType[3]) {
			entityManager.fireBullet(this.cx + 70,
				this.cy + 40, 22, 15, 10, 120, bulletType, false);
			entityManager.fireBullet(this.cx + 70,
				this.cy - 26, 22, 15, -10, -120, bulletType, false);
		} else {
			entityManager.fireBullet(this.cx + 70,
				this.cy + 10, 4, 15, 10, 120, bulletType, false);
			entityManager.fireBullet(this.cx + 70,
				this.cy + 4, 4, 15, -10, -120, bulletType, false);
		}
	}
}

//sounds for the ship
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
	// render the charge sprite animation
	if (this.startCharge) {
		g_sprites.charge[this.chargeCel].scale = 2;
		g_sprites.charge[this.chargeCel].drawCentredAt(ctx, this.cx + 78, this.cy + 7, this.rotation);
	}
	// render the muzzle
	if (this.muzzle) {
		g_sprites.muzzleFlash.drawCentredAt(ctx, this.cx + 61, this.cy + 8)
	}
	// draw the ship
	this.sprite.drawCentredAt(
		ctx, this.cx, this.cy, this.rotation
	);

	this.sprite.scale = origScale;

};
