// =========
// R-Type
// =========

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// ====================
// CREATE INITIAL SHIPS
// ====================

function createInitialShips() {

    entityManager.generateShip({
        cx : 200,
        cy : 360
    });

}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}


// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

    processDiagnostics();

    environmentManager.update(du);

    entityManager.update(du);

    // Prevent perpetual firing!
    //eatKey(Ship.prototype.KEY_FIRE);
}

// GAME-SPECIFIC DIAGNOSTICS

var g_allowMixedActions = true;
var g_useGravity = false;
var g_useAveVel = true;
var g_renderSpatialDebug = false;

var KEY_SPATIAL = keyCode('X');

function processDiagnostics() {
    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {

    environmentManager.render(ctx);

    entityManager.render(ctx);

    if (g_renderSpatialDebug) spatialManager.render(ctx);

    if(g_lives===0){
        util.gameOverScreen(ctx);
    }
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        ship   : "images/shipSprites.png",
        enemy1   : "images/enemy1.png",
        enemy1bullet : "images/enemy1bullet.png",
        enemy2 : "images/enemy2sheet.png",
        boss : "images/boss.png",
        bullet1 : "images/bullet1.png",
        bullet2 : "images/bullet2.png",
        bullet3 : "images/bullet3.png",
        bullet4 : "images/bullet4.png",
        bullet5 : "images/bullet5.png",
        background : "images/background_stars.png",
        charge : "images/charge.png",
        spaceDust : "images/spaceDust.png",
        wall1 : "images/w1.png",
        wall2 : "images/w2.png",
        wall3 : "images/w3.png",
        wall4 : "images/w4.png",
        explode : "images/explode.png",
        beamBar : "images/UI_Beam_bar.png",
        muzzleFlash : "images/muzzleflash.png",
        gameOver : "images/gameOver.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};
function preloadDone() {

    g_sprites.ship  = [];
    for (var row = 0; row < 5; ++row) {
        for (var col = 0; col < 5; ++col) {
            g_sprites.ship.push(
                new Sprite(g_images.ship,col*33, row*17, 33, 17)
            );
        }
    }

    g_sprites.enemy1  = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 8; ++col) {
            g_sprites.enemy1.push(
                new Sprite(g_images.enemy1,col*33, row*36, 33, 36)
            );
        }
    }

    g_sprites.enemy2  = [];
    for (var row = 0; row < 2; ++row) {
        for (var col = 0; col < 8; ++col) {
            g_sprites.enemy2.push(
                new Sprite(g_images.enemy2,col*33.25, row*34, 33.25, 34)
            );
        }
    }

    g_sprites.boss = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 2; ++col) {
            g_sprites.boss.push(
                new Sprite(g_images.boss,col*57.5, row*57, 57.5, 57)
            );
        }
    }

    g_sprites.charge  = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 8; ++col) {
            g_sprites.charge.push(
                new Sprite(g_images.charge,col*32, row*34, 32, 34)
            );
        }
    }

    g_sprites.explode  = [];

   g_sprites.explode.push(new Sprite(g_images.explode,0, 0, 22, 34));
   g_sprites.explode.push(new Sprite(g_images.explode,22, 0, 28, 34));
   g_sprites.explode.push(new Sprite(g_images.explode,50, 0, 35, 34));
   g_sprites.explode.push(new Sprite(g_images.explode,85, 0, 38, 34));
   g_sprites.explode.push(new Sprite(g_images.explode,123, 0, 38, 34));
   g_sprites.explode.push(new Sprite(g_images.explode,161, 0, 38, 34));

    g_sprites.spaceDust = new Sprite(g_images.spaceDust, 0, 0,
        g_images.spaceDust.width, g_images.spaceDust.height);
    
    // Walls
    g_sprites.walls = [];
    g_sprites.walls[1] = new Sprite(g_images.wall1, 0, 0,
        g_images.wall1.width, g_images.wall1.height);
    g_sprites.walls[2] = new Sprite(g_images.wall2, 0, 0,
        g_images.wall2.width, g_images.wall2.height);
    g_sprites.walls[3] = new Sprite(g_images.wall3, 0, 0,
        g_images.wall3.width, g_images.wall3.height);
    g_sprites.walls[4] = new Sprite(g_images.wall4, 0, 0,
        g_images.wall4.width, g_images.wall4.height);
    

    g_sprites.bullet1 = new Sprite(g_images.bullet1, 0, 0,
        g_images.bullet1.width, g_images.bullet1.height);
    g_sprites.bullet1.scale = 2;

    g_sprites.bullet2 = new Sprite(g_images.bullet2, 0, 0,
        g_images.bullet2.width, g_images.bullet2.height);

    g_sprites.bullet3 = new Sprite(g_images.bullet3, 0, 0,
        g_images.bullet3.width, g_images.bullet3.height);

    g_sprites.bullet4 = new Sprite(g_images.bullet4, 0, 0,
        g_images.bullet4.width, g_images.bullet4.height);

    g_sprites.bullet5 = new Sprite(g_images.bullet5, 0, 0,
        g_images.bullet5.width, g_images.bullet5.height);

    g_sprites.enemy1bullet = new Sprite(g_images.enemy1bullet, 0, 0,
        g_images.enemy1bullet.width, g_images.enemy1bullet.height);


    g_sprites.background = new Sprite(g_images.background, 0, 0,
        g_images.background.width, g_images.background.height);

    g_sprites.gameOver = new Sprite(g_images.gameOver, 0, 0,
        g_images.gameOver.width, g_images.gameOver.height);

    g_sprites.beamBar = new Sprite(g_images.beamBar, 0, 0,
        g_images.beamBar.width, g_images.beamBar.height);
    g_sprites.beamBar.scale = 0.5;

    g_sprites.muzzleFlash = new Sprite(g_images.muzzleFlash, 0, 0,
        g_images.muzzleFlash.width, g_images.muzzleFlash.height);
    g_sprites.muzzleFlash.scale = 2;

    entityManager.init();
    environmentManager.init();
    entityManager.displayHud();
    createInitialShips();

    main.init();
}

// Kick it off
requestPreloads();
