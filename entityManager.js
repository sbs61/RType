/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops 
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/

var entityManager = {

  // "PRIVATE" DATA

  _enemies: [],
  _bullets: [],
  _enemy1bullets: [],
  _ships: [],
  _hud: [],


  // "PRIVATE" METHODS

  _generateEnemies1: function () {
    var i,
      NUM_ENEMIES = Math.floor(Math.random() * 10) + 3;

    for (i = 0; i < NUM_ENEMIES; ++i) {
      this.generateEnemy1();
    }
  },

  _generateEnemies2: function () {
    var i,
      NUM_ENEMIES = 0;
    for (i = 0; i < NUM_ENEMIES; ++i) {
      this.generateEnemy2();
    }
  },

  _generateShip: function(){
    this.generateShip();
  },

  _findNearestShip: function (posX, posY) {
    var closestShip = null,
      closestIndex = -1,
      closestSq = 1000 * 1000;

    for (var i = 0; i < this._ships.length; ++i) {

      var thisShip = this._ships[i];
      var shipPos = thisShip.getPos();
      var distSq = util.wrappedDistSq(
        shipPos.posX, shipPos.posY,
        posX, posY,
        g_canvas.width, g_canvas.height);

      if (distSq < closestSq) {
        closestShip = thisShip;
        closestIndex = i;
        closestSq = distSq;
      }
    }
    return {
      theShip: closestShip,
      theIndex: closestIndex
    };
  },

  _forEachOf: function (aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
      fn.call(aCategory[i]);
    }
  },

  // PUBLIC METHODS

  // A special return value, used by other objects,
  // to request the blessed release of death!
  //
  KILL_ME_NOW: -1,

  // Some things must be deferred until after initial construction
  // i.e. thing which need `this` to be defined.
  //
  deferredSetup: function () {
    this._categories = [this._enemies, this._enemy1bullets, this._bullets, this._ships, this._hud];
  },

  init: function () {
    //this._generateRocks();
    //this._generateShip();
  },

  fireBullet: function (cx, cy, velX, velY, big1, big2, big3, big4) {
    this._bullets.push(new Bullet({
      cx: cx,
      cy: cy,
      velX: velX,
      velY: velY,
      big1: big1,
      big2: big2,
      big3: big3,
      big4: big4
    }));
  },

fireEnemyBullet: function (cx, cy, velX, velY){
    this._enemy1bullets.push(new Enemy1Bullet({
        cx : cx-35,
        cy : cy,
        velX : velX,
        velY : velY
    }));
},


  generateEnemy1: function (descr) {
    this._enemies.push(new Enemy1(descr));
  },

  generateEnemy2: function (descr) {
    this._enemies.push(new Enemy2([descr]));
  },

  generateShip: function (descr) {
    this._ships.push(new Ship(descr));
  },

  displayHud: function (descr) {
    this._hud.push(new Hud(descr));
  },

  killNearestShip: function (xPos, yPos) {
    var theShip = this._findNearestShip(xPos, yPos).theShip;
    if (theShip) {
      theShip.kill();
    }
  },

  yoinkNearestShip: function (xPos, yPos) {
    var theShip = this._findNearestShip(xPos, yPos).theShip;
    if (theShip) {
      theShip.setPos(xPos, yPos);
    }
  },

  resetShips: function () {
    this._forEachOf(this._ships, Ship.prototype.reset);
  },

  haltShips: function () {
    this._forEachOf(this._ships, Ship.prototype.halt);
  },


  update: function (du) {

    for (var c = 0; c < this._categories.length; ++c) {

      var aCategory = this._categories[c];
      var i = 0;

      while (i < aCategory.length) {

        var status = aCategory[i].update(du);

        if (status === this.KILL_ME_NOW) {
          // remove the dead guy, and shuffle the others down to
          // prevent a confusing gap from appearing in the array
          aCategory.splice(i, 1);
        } else {
          ++i;
        }
      }
    }

    if(g_lives !== 0 && this._ships.length === 0) {
      this._generateShip();
    }

    if(g_lives === 0){
      g_isUpdatePaused = true;
      
    }
    
    g_enemy1WaveInterval -= du;

    if(g_enemy1WaveInterval < 0){
      this._generateEnemies1();
      g_enemy1WaveInterval = 3000/NOMINAL_UPDATE_INTERVAL;
    }
   

  },

  render: function (ctx) {

    var debugX = 10,
      debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

      var aCategory = this._categories[c];

      for (var i = 0; i < aCategory.length; ++i) {

        aCategory[i].render(ctx);

      }
      debugY += 10;
    }
  }

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
