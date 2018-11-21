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
  _powerups: [],


  // "PRIVATE" METHODS
  //generate enemies of type 1
  _generateEnemies1: function () {
    var i,
      //generate random number of 2-7 enemies plus a global amount that is incremented every 15 seconds to increase difficulty
      NUM_ENEMIES = Math.floor(Math.random() * 5) + 2 + g_enemy1amount;

    //generate the random amount of enemies
    for (i = 0; i < NUM_ENEMIES; ++i) {
      this.generateEnemy1();
    }
  },
   //generate enemies of type 2
  _generateEnemies2: function () {
    var i,
      //generate random number of 2-7 enemies plus a global amount that is incremented every 15 seconds to increase difficulty
      NUM_ENEMIES = Math.floor(Math.random() * 4) + 3 + g_enemy2amount;

    //base coords of the first enemy in the wave
    var base_cx = util.randRange(900, 1400);
    var base_cy = util.randRange(300,500);

    //space between each enemy
    var space_x = 0, space_y = 0;

    //generate the number of enemies, put a space between them so they move as a unit in a wave formation
    for (i = 0; i < NUM_ENEMIES; ++i) {
      this.generateEnemy2(base_cx+space_x, base_cy+space_y);
      space_x += 30;
      space_y += 10;
    }
  },

  //generate new ship
  _generateShip: function(){
    this.generateShip();
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
    this._categories = [this._enemies, this._enemy1bullets, this._bullets, this._ships, this._hud, this._powerups];
  },

  init: function () {
  },

  fireBullet: function (cx, cy, radius, velX, velY, big1, big2, big3, big4) {
    this._bullets.push(new Bullet({
      cx: cx,
      cy: cy,
      radius: radius,
      velX: velX,
      velY: velY,
      big1: big1,
      big2: big2,
      big3: big3,
      big4: big4
    }));
  },

  fireEnemyBullet: function (cx, cy, velX, velY) {
    this._enemy1bullets.push(new Enemy1Bullet({
      cx: cx - 35,
      cy: cy,
      velX: velX,
      velY: velY
    }));
  },


  generateEnemy1: function (descr) {
    this._enemies.push(new Enemy1(descr));
  },

  generateEnemy2: function (cx, cy) {
    this._enemies.push(new Enemy2({
      cx : cx,
      cy : cy
    }));
  },

  generateShip: function (descr) {
    this._ships.push(new Ship(descr));
  },

  generatePowerup: function (cx, cy) {
    this._powerups.push(new Powerup(cx, cy));
  },
  
  displayHud: function (descr) {
    this._hud.push(new Hud(descr));
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

    //if your ship dies but you still have lives left
    if(g_lives !== 0 && this._ships.length === 0) {
      //unregister all enemies from spatial manager
      for(var k = 0; k < this._enemies.length; k++){
        spatialManager.unregister(this._enemies[k]);
      }
      //unregister all enemy1 bullets from spatial manager
      for(var k = 0; k < this._enemy1bullets.length; k++){
        spatialManager.unregister(this._enemy1bullets[k]);
      }

      //remove all enemies and enemy bullets
      this._enemies.splice(0,this._enemies.length);
      this._enemy1bullets.splice(0,this._enemy1bullets.length);

      //reset next wave of enemy 1 to start in 3 seconds
      g_enemy1WaveInterval = 3000/NOMINAL_UPDATE_INTERVAL;

      //generate a new ship
      this._generateShip();
    }

    //if you lose all your lives pause the game
    if(g_lives === 0){
      g_isUpdatePaused = true;
    }
    
    //------------GENERATE ENEMIES ----------------

    //lower the enemy1 wave interval
    g_enemy1WaveInterval -= du;
    
    //when the interval reaches 0 then generate a new wave of enemy 1 and reset the interval
    if(g_enemy1WaveInterval < 0){
      this._generateEnemies1();
      g_enemy1WaveInterval = 3000/NOMINAL_UPDATE_INTERVAL;
    }

    //lower the enemy2 wave interval
    g_enemy2WaveInterval -= du;

    //when the interval reaches 0 generate a new wave of enemies 2 and reset the interval
    if(g_enemy2WaveInterval < 0){
      this._generateEnemies2();
      g_enemy2WaveInterval = 5000/NOMINAL_UPDATE_INTERVAL;
    }

    //lower the difficulty interval
    g_increaseDifficultyInterval -= du;

    //when it reaches zero add raise the random range of enemies generated by 1 and reset the interval
    if(g_increaseDifficultyInterval < 0){
      g_increaseDifficultyInterval = 15000 / NOMINAL_UPDATE_INTERVAL;
      g_enemy1amount++;
      g_enemy2amount++;
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
