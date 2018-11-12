// ====
// ROCK
// ====

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// A generic contructor which accepts an arbitrary descriptor object
function Rock(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

    this.randomisePosition();
    this.randomiseVelocity();
      
    // Default sprite and scale, if not otherwise specified
    this.sprite = g_sprites.rock[0];
    this.scale  = this.scale  || 2;

/*
    // Diagnostics to check inheritance stuff
    this._rockProperty = true;
    console.dir(this);
*/

};



Rock.prototype = new Entity();
var n = 40;
var spawnPoint = [];
var s = 0;
var l = 0;
for(var i = 0; i < 10; i++){
    for(var j = 0; j < 5; j++){
        spawnPoint.push(util.randRange(1000+s,1500+s));
        console.log(spawnPoint[l]);
        l++;
    }
    s+=500;
}

Rock.prototype.randomisePosition = function () {
    // Rock randomisation defaults (if nothing otherwise specified)
    this.cx = 800;//this.cx || Math.random() * g_canvas.width;
    this.cy = 200 + n;//this.cy || Math.random() * g_canvas.height;
    this.rotation = 0;
    n++;
};

Rock.prototype.randomiseVelocity = function () {
    var MIN_SPEED = 20,
        MAX_SPEED = 70;

    var speed = util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS;
    var dirn = Math.random() * consts.FULL_CIRCLE;

    this.velX = this.velX || speed * Math.cos(dirn);
    this.velY = 3;//this.velY || speed * Math.sin(dirn);

    var MIN_ROT_SPEED = 0.5,
        MAX_ROT_SPEED = 2.5;

    this.velRot = this.velRot ||
        util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS;
};

Rock.prototype.interval = 100 / NOMINAL_UPDATE_INTERVAL;
Rock.prototype.g_cel = 0;



Rock.prototype.update = function (du) {
    // TODO: YOUR STUFF HERE! --- Unregister and check for death
    spatialManager.unregister(this);

    //Check if the rock is dead, if so return the KILL_ME_NOW to the entity manager
    if (this._isDeadNow) {
        return entityManager.KILL_ME_NOW;
    }

    //this.cx += this.velX * du;
    //this.cy += this.velY * du;

    /*
    if(this.cy < 100)
        this.velY*=-1
    if(this.cy > 600)
        this.velY*=-1
    */

    this.cx -= 3 * du;
    this.cy += 3*Math.cos(this.cx/40)*du;

    //this.rotation += 1 * this.velRot;
    this.rotation = util.wrapRange(this.rotation,
                                   0, consts.FULL_CIRCLE);

    //this.wrapPosition();
    this.interval -= du;
    if(this.interval < 0){
    this.g_cel++;
 
    if (this.g_cel === 8) this.g_cel = 0;
    this.sprite = g_sprites.rock[this.g_cel];    
    this.interval = 100 / NOMINAL_UPDATE_INTERVAL;
    }

    // TODO: YOUR STUFF HERE! --- (Re-)Register
    spatialManager.register(this);

  

};

Rock.prototype.getRadius = function () {
    return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Rock.prototype.splitSound = new Audio(
  "sounds/rockSplit.ogg");
Rock.prototype.evaporateSound = new Audio(
  "sounds/rockEvaporate.ogg");

Rock.prototype.takeBulletHit = function () {
    this.kill();
    /*
    if (this.scale > 0.25) {
        this._spawnFragment();
        this._spawnFragment();
        
        this.splitSound.play();
    } else {
        */
        this.evaporateSound.play();
    //}
};



Rock.prototype.render = function (ctx) {
    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this.scale;
    this.sprite.drawCentredAt(
       ctx, this.cx, this.cy, this.rotation
    );
    
};
