// ======
// BULLET
// ======

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Enemy1Bullet(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    // Make a noise when I am created (i.e. fired)
    this.fireSound.play();
}

Enemy1Bullet.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
Enemy1Bullet.prototype.fireSound = new Audio(
    "sounds/bulletFire.ogg");

// Initial, inheritable, default values
Enemy1Bullet.prototype.cx = 200;
Enemy1Bullet.prototype.cy = 200;
Enemy1Bullet.prototype.velX = 1;
Enemy1Bullet.prototype.velY = 1;

//update the enemy bullet
Enemy1Bullet.prototype.update = function (du) {

    spatialManager.unregister(this);

    //Check if the bullet is dead or outside the canvas, if so return the KILL_ME_NOW to the entity manager
    if (this._isDeadNow || this.cx < 0) {
        return entityManager.KILL_ME_NOW;
    }

    //update the enemy bullet position
    this.cx -= this.velX* du;
    this.cy -= this.velY* du;

    spatialManager.register(this);
};

//get the radius of the enemy bullet
Enemy1Bullet.prototype.getRadius = function () {
    return 4;
};

//render the enemy bullet
Enemy1Bullet.prototype.render = function (ctx) {
    g_sprites.enemy1bullet.drawCentredAt(ctx, this.cx, this.cy);
};
