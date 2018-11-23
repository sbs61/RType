// ======
// BOSS BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function BossBullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Make a noise when I am created (i.e. fired)
    this.fireSound.pause();
    this.fireSound.currentTime = 0;
    this.fireSound.play();
    this.sprite = g_sprites.bossBullet[0];
    this.sprite.scale = 2;
    this.radius = 15;
}

BossBullet.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
BossBullet.prototype.fireSound = new Audio(
    "sounds/bossBulletSound.mp3");

// Initial, inheritable, default values
BossBullet.prototype.cx = 200;
BossBullet.prototype.cy = 200;
BossBullet.prototype.velX = -6;
BossBullet.prototype.velY = 0;
BossBullet.prototype.animationInterval = 0;
BossBullet.prototype.cel = 0;

//update the boss bullet
BossBullet.prototype.update = function (du) {

    // unregister the bullet to the spatial manager
    spatialManager.unregister(this);

    //Check if the bullet is dead or outside the canvas, if so return the KILL_ME_NOW to the entity manager
    if (this._isDeadNow || this.cx < 0) {
        return entityManager.KILL_ME_NOW;
    }

    //update the boss bullet position
    this.cx += this.velX* du;
    this.cy += this.velY* du;

    //register bullet to spatial manager
    spatialManager.register(this);
};

//get the radius of the enemy bullet
BossBullet.prototype.getRadius = function () {
    return this.radius;
};

//render the enemy bullet
BossBullet.prototype.render = function (ctx) {
    this.sprite.drawCentredAt(ctx, this.cx, this.cy);
};
