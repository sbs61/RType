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
function Bullet(descr) {

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

Bullet.prototype = new Entity();

// HACKED-IN AUDIO (no preloading)
Bullet.prototype.fireSound = new Audio(
    "sounds/bulletFire.ogg");
Bullet.prototype.zappedSound = new Audio(
    "sounds/bulletZapped.ogg");

// Initial, inheritable, default values
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;
Bullet.prototype.big1 = false;
Bullet.prototype.big2 = false;
Bullet.prototype.big3 = false;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {

    spatialManager.unregister(this);

    //Check if the bullet is dead, if so return the KILL_ME_NOW to the entity manager
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }
    if(this.cx > g_canvas.width-20)
        return entityManager.KILL_ME_NOW;

    this.lifeSpan -= du;
    if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

    this.cx += this.velX * du;
    this.cy += this.velY * du;

    this.wrapPosition();

    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        if (!this.big1 && !this.big2 && !this.big3)
            return entityManager.KILL_ME_NOW;
    }

    spatialManager.register(this);

};

Bullet.prototype.getRadius = function () {
    return 4;
};

Bullet.prototype.takeBulletHit = function () {
    this.kill();

    // Make a noise when I am zapped by another bullet
    this.zappedSound.play();
};

Bullet.prototype.render = function (ctx) {

    var fadeThresh = Bullet.prototype.lifeSpan / 3;

    if (this.lifeSpan < fadeThresh) {
        ctx.globalAlpha = this.lifeSpan / fadeThresh;
    }


    if(this.big1){
      g_sprites.bullet = new Sprite(g_images.bullet2, 0,0, g_images.bullet2.width, g_images.bullet2.height);
      g_sprites.bullet.scale = 2;
    }
    else if(this.big2){
        g_sprites.bullet = new Sprite(g_images.bullet3, 0,0, g_images.bullet3.width, g_images.bullet3.height);
        g_sprites.bullet.scale = 2;
      }
    else if(this.big3){
        g_sprites.bullet = new Sprite(g_images.bullet4, 0,0, g_images.bullet4.width, g_images.bullet4.height);
        g_sprites.bullet.scale = 2;
      }
    else{
      g_sprites.bullet = new Sprite(g_images.bullet1, 0,0, g_images.bullet1.width, g_images.bullet1.height);
      g_sprites.bullet.scale = 2;
    }


    g_sprites.bullet.drawCentredAt(ctx, this.cx, this.cy);

    ctx.globalAlpha = 1;
};
