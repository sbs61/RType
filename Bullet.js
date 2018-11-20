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
Bullet.prototype.big4 = false;
Bullet.prototype.radius = 4;

Bullet.prototype.update = function (du) {

    //unregister the bullet from spatial manager
    spatialManager.unregister(this);

    //Check if the bullet is dead or goes outside the canvas return the KILL_ME_NOW to the entity manager
    if (this._isDeadNow || this.cx > g_canvas.width) {
        return entityManager.KILL_ME_NOW;
    }

    //update the position of the bullet according to the velocity
    this.cx += this.velX * du;
    this.cy += this.velY * du;

    //this.wrapPosition();

    // Handle collisions
    //
    var hitEntity = this.findHitEntity();
    if (hitEntity) {
        var canTakeHit = hitEntity.takeBulletHit;
        if (canTakeHit) canTakeHit.call(hitEntity);
        if (!this.big1 && !this.big2 && !this.big3 && !this.big4)
            return entityManager.KILL_ME_NOW;
    }

    //register the bullet in the spatial maanager
    spatialManager.register(this);

};

Bullet.prototype.getRadius = function () {
    return this.radius;
};

Bullet.prototype.render = function (ctx) {

    //Check if the bullet is big, if it is then push in the sprite for big bullet nr 1
    if(this.big1){
      g_sprites.bullet = new Sprite(g_images.bullet2, 0,0, g_images.bullet2.width, g_images.bullet2.height);
      g_sprites.bullet.scale = 2;
    }
    //Check if the bullet is bigger, if it is then push in the sprite for big bullet nr 2
    else if(this.big2){
        g_sprites.bullet = new Sprite(g_images.bullet3, 0,0, g_images.bullet3.width, g_images.bullet3.height);
        g_sprites.bullet.scale = 2;
      }
    //Check if the bullet is even bigger, if it is then push in the sprite for big bullet nr 3
    else if(this.big3){
        g_sprites.bullet = new Sprite(g_images.bullet4, 0,0, g_images.bullet4.width, g_images.bullet4.height);
        g_sprites.bullet.scale = 2;
      }
    //Check if the bullet is the biggest, if it is then push in the sprite for big bullet nr 4
    else if(this.big4){
        g_sprites.bullet = new Sprite(g_images.bullet5, 0,0, g_images.bullet5.width, g_images.bullet5.height);
        g_sprites.bullet.scale = 2;
      }
    //Else push the sprite for a normal bullet
    else{
      g_sprites.bullet = new Sprite(g_images.bullet1, 0,0, g_images.bullet1.width, g_images.bullet1.height);
      g_sprites.bullet.scale = 2;
    }

    //draw the bullet
    g_sprites.bullet.drawCentredAt(ctx, this.cx, this.cy);

    ctx.globalAlpha = 1;
};
