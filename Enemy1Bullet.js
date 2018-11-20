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
    this.fireSound.pause();
    this.fireSound.currentTime = 0;
    this.fireSound.play();

/*
    // Diagnostics to check inheritance stuff
    this._bulletProperty = true;
    console.dir(this);
*/

}

Enemy1Bullet.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
Enemy1Bullet.prototype.fireSound = new Audio(
    "sounds/bulletFire.ogg");
Enemy1Bullet.prototype.zappedSound = new Audio(
    "sounds/bulletZapped.ogg");

// Initial, inheritable, default values
Enemy1Bullet.prototype.cx = 200;
Enemy1Bullet.prototype.cy = 200;
Enemy1Bullet.prototype.velX = 1;
Enemy1Bullet.prototype.velY = 1;

// Convert times from milliseconds to "nominal" time units.
Enemy1Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Enemy1Bullet.prototype.update = function (du) {


    spatialManager.unregister(this);

    //Check if the bullet is dead, if so return the KILL_ME_NOW to the entity manager

    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }
    if(this.cx < 10)
        return entityManager.KILL_ME_NOW;

    this.cx -= this.velX* du;
    this.cy -= this.velY* du;
    
    //this.cy += 2 * du;
    //this.wrapPosition();

    // Handle collisions
    //
    
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        console.log(hitEntity);
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
            return entityManager.KILL_ME_NOW;
    }
    spatialManager.register(this);

};

Enemy1Bullet.prototype.getRadius = function () {
    return 4;
};

Enemy1Bullet.prototype.takeBulletHit = function () {
    this.kill();

    // Make a noise when I am zapped by another bullet
    //this.zappedSound.play();
};

Enemy1Bullet.prototype.render = function (ctx) {
    g_sprites.enemy1bullet.drawCentredAt(ctx, this.cx, this.cy);
};
