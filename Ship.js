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
Ship.prototype.KEY_LEFT   = 'A'.charCodeAt(0);
Ship.prototype.KEY_RIGHT  = 'D'.charCodeAt(0);

Ship.prototype.KEY_FIRE   = ' '.charCodeAt(0);

// Initial, inheritable, default values
Ship.prototype.rotation = 0;
Ship.prototype.cx = 200;
Ship.prototype.cy = 200;
Ship.prototype.velX = 0;
Ship.prototype.velY = 0;
Ship.prototype.launchVel = 2;
Ship.prototype.numSubSteps = 1;

// HACKED-IN AUDIO (no preloading)
Ship.prototype.warpSound = new Audio(
    "sounds/shipWarp.ogg");

Ship.prototype.warp = function () {

    this._isWarping = true;
    this._scaleDirn = -1;
    this.warpSound.play();

    // Unregister me from my old posistion
    // ...so that I can't be collided with while warping
    spatialManager.unregister(this);
};

Ship.prototype._updateWarp = function (du) {

    var SHRINK_RATE = 8 / SECS_TO_NOMINALS;
    this._scale += this._scaleDirn * SHRINK_RATE * du;

    if (this._scale < 0.2) {

        this._moveToASafePlace();
        this.halt();
        this._scaleDirn = 1;

    } else if (this._scale > 3) {

        this._scale = 3;
        this._isWarping = false;

        // Reregister me from my old posistion
        // ...so that I can be collided with again
        spatialManager.register(this);

    }
};

Ship.prototype._moveToASafePlace = function () {

    // Move to a safe place some suitable distance away
    var origX = this.cx,
        origY = this.cy,
        MARGIN = 40,
        isSafePlace = false;

    for (var attempts = 0; attempts < 100; ++attempts) {

        var warpDistance = 100 + Math.random() * g_canvas.width /2;
        var warpDirn = Math.random() * consts.FULL_CIRCLE;

        this.cx = origX + warpDistance * Math.sin(warpDirn);
        this.cy = origY - warpDistance * Math.cos(warpDirn);

        this.wrapPosition();

        // Don't go too near the edges, and don't move into a collision!
        if (!util.isBetween(this.cx, MARGIN, g_canvas.width - MARGIN)) {
            isSafePlace = false;
        } else if (!util.isBetween(this.cy, MARGIN, g_canvas.height - MARGIN)) {
            isSafePlace = false;
        } else {
            isSafePlace = !this.isColliding();
        }

        // Get out as soon as we find a safe place
        if (isSafePlace) break;

    }
};
Ship.prototype.cel = 2;
var interval = 100 / NOMINAL_UPDATE_INTERVAL;
Ship.prototype.interval = interval;

var chargeInterval = 70/NOMINAL_UPDATE_INTERVAL;
var charge = 0;

Ship.prototype.update = function (du) {

    // Handle warping
    if (this._isWarping) {
        this._updateWarp(du);
        return;
    }

    // TODO: YOUR STUFF HERE! --- Unregister and check for death
    spatialManager.unregister(this);

    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    /*
    // Perform movement substeps
    var steps = this.numSubSteps;
    var dStep = du / steps;
    for (var i = 0; i < steps; ++i) {
        this.computeSubStep(dStep);
    }
    */
    if (keys[this.KEY_UP] && this.cy>this.sprite.height/2) {
        this.cy -= 4 * du;
        if(this.cel < 4){
            this.interval -= du;
            if(this.interval < 0){
                this.cel++;
                this.interval = interval;
            }
        }
        this.sprite = g_sprites.ship[this.cel];
    }
    
    
    // Í rauninni þá á skipið að springa ef það fer í botninn en það kemur seinna
    if (keys[this.KEY_DOWN] && this.cy<g_canvas.height-this.sprite.height/2) {
        this.cy += 4 * du;
        if(this.cel > 0){
            this.interval -= du;
            if(this.interval < 0){
                this.cel--;
                this.interval = interval;
            }
        }
        this.sprite = g_sprites.ship[this.cel];
    }

    if (keys[this.KEY_LEFT] && this.cx>this.sprite.width/2) {
        this.cx -= 3 * du;
    }
    if (keys[this.KEY_RIGHT]&& this.cx<g_canvas.width-this.sprite.width/2) {
        this.cx += 3 * du;
    }

    if(this.cel !== 2 && !keys[this.KEY_DOWN] && !keys[this.KEY_UP]){
        if(this.cel > 2){
            this.interval -= du;
            if(this.interval < 0){
                this.cel--;
                this.interval = interval;
            }
            this.sprite = g_sprites.ship[this.cel];
        }
        else{
            this.interval -= du;
            if(this.interval < 0){
                this.cel++;
                this.interval = interval;
            }
            this.sprite = g_sprites.ship[this.cel];
        }
    }

    chargeInterval -= du;
    if(chargeInterval < 0){
        charge++;
        chargeInterval = 70/NOMINAL_UPDATE_INTERVAL;
    } 
    if(charge > 7)
        charge = 0;


    // Handle firing
    this.maybeFireBullet();

    // TODO: YOUR STUFF HERE! --- Warp if isColliding, otherwise Register
    if (this.isColliding())
        this.warp();
    else
        spatialManager.register(this);

};

Ship.prototype.computeSubStep = function (du) {

    var thrust = this.computeThrustMag();

    // Apply thrust directionally, based on our rotation
    var accelX = +Math.sin(this.rotation) * thrust;
    var accelY = -Math.cos(this.rotation) * thrust;

    accelY += this.computeGravity();

    this.applyAccel(accelX, accelY, du);

    this.wrapPosition();

    if (thrust === 0 || g_allowMixedActions) {
        this.updateRotation(du);
    }
};

var NOMINAL_GRAVITY = 0.12;

Ship.prototype.computeGravity = function () {
    return g_useGravity ? NOMINAL_GRAVITY : 0;
};

var NOMINAL_THRUST = +0.2;
var NOMINAL_RETRO  = -0.1;

Ship.prototype.computeThrustMag = function () {

    var thrust = 0;

    if (keys[this.KEY_THRUST]) {
        thrust += NOMINAL_THRUST;
    }
    if (keys[this.KEY_RETRO]) {
        thrust += NOMINAL_RETRO;
    }


    return thrust;
};

Ship.prototype.applyAccel = function (accelX, accelY, du) {

    // u = original velocity
    var oldVelX = this.velX;
    var oldVelY = this.velY;

    // v = u + at
    this.velX += accelX * du;
    this.velY += accelY * du;

    // v_ave = (u + v) / 2
    var aveVelX = (oldVelX + this.velX) / 2;
    var aveVelY = (oldVelY + this.velY) / 2;

    // Decide whether to use the average or not (average is best!)
    var intervalVelX = g_useAveVel ? aveVelX : this.velX;
    var intervalVelY = g_useAveVel ? aveVelY : this.velY;

    // s = s + v_ave * t
    var nextX = this.cx + intervalVelX * du;
    var nextY = this.cy + intervalVelY * du;

    // bounce
    if (g_useGravity) {

	var minY = g_sprites.ship.height / 2;
	var maxY = g_canvas.height - minY;

	// Ignore the bounce if the ship is already in
	// the "border zone" (to avoid trapping them there)
	if (this.cy > maxY || this.cy < minY) {
	    // do nothing
	} else if (nextY > maxY || nextY < minY) {
            this.velY = oldVelY * -0.9;
            intervalVelY = this.velY;
        }
    }

    // s = s + v_ave * t
    this.cx += du * intervalVelX;
    this.cy += du * intervalVelY;
};

Ship.prototype.maybeFireBullet = function () {
    if (keys[this.KEY_FIRE]) {
        this.fire = true;
        entityManager._hud[0].incrementBeam();
           
    }

    if (this.fire&&!this.timeStarted){
        this.timeStarted = true;
        this.time = performance.now();
        entityManager.fireBullet(this.cx + 70,
            this.cy+7, 12, 0, false);
    }

    if (!keys[this.KEY_FIRE]&&this.fire) {
        this.fire = false;
        this.timeStarted = false;
        var timeEnd = performance.now();
        var TimeHeld = (timeEnd-this.time)/1000;
        entityManager._hud[0].resetBeam();

        if (TimeHeld>0.85){
            entityManager.fireBullet(this.cx + 70,
                this.cy+7, 12, 0, true);
        }
    }
};

Ship.prototype.getRadius = function () {
    return this.sprite.width;
};

Ship.prototype.takeBulletHit = function () {
    this.warp();
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

var NOMINAL_ROTATE_RATE = 0.1;

Ship.prototype.updateRotation = function (du) {
    if (keys[this.KEY_LEFT]) {
        this.cx -= 3 * du;
    }
    if (keys[this.KEY_RIGHT]) {
        this.cx += 3 * du;
    }
};

Ship.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    if(this.fire){
        g_sprites.charge[charge].scale = 2;
        g_sprites.charge[charge].drawCentredAt(ctx, this.cx+78, this.cy+7, this.rotation);
    }

    this.sprite.drawCentredAt(
	ctx, this.cx, this.cy, this.rotation
    );

    this.sprite.scale = origScale;
};
