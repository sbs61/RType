// =========
// R-Type
// =========
/*

*/

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
        cy : 200
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

var KEY_MIXED   = keyCode('M');;
var KEY_GRAVITY = keyCode('G');
var KEY_AVE_VEL = keyCode('V');
var KEY_SPATIAL = keyCode('X');

var KEY_HALT  = keyCode('H');
var KEY_RESET = keyCode('R');

var KEY_0 = keyCode('0');

var KEY_1 = keyCode('1');
var KEY_2 = keyCode('2');

var KEY_K = keyCode('K');

function processDiagnostics() {

    if (eatKey(KEY_MIXED))
        g_allowMixedActions = !g_allowMixedActions;

    if (eatKey(KEY_GRAVITY)) g_useGravity = !g_useGravity;

    if (eatKey(KEY_AVE_VEL)) g_useAveVel = !g_useAveVel;

    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    if (eatKey(KEY_HALT)) entityManager.haltShips();

    if (eatKey(KEY_RESET)) entityManager.resetShips();

    if (eatKey(KEY_0)) entityManager.toggleRocks();

    if (eatKey(KEY_1)) entityManager.generateShip({
        cx : g_mouseX,
        cy : g_mouseY,

        sprite : g_sprites.ship});

    if (eatKey(KEY_2)) entityManager.generateShip({
        cx : g_mouseX,
        cy : g_mouseY,

        sprite : g_sprites.ship2
        });

    if (eatKey(KEY_K)) entityManager.killNearestShip(
        g_mouseX, g_mouseY);
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
}


// =============
// PRELOAD STUFF
// =============

var g_images = {};

function requestPreloads() {

    var requiredImages = {
        ship   : "images/shipSprites.png",
        enemy1   : "https://notendur.hi.is/sbs61/tolvuleikjaforritun/mynd/enemy1.png",
        enemy2 : "images/enemy2sheet.png",
        bullet : "https://notendur.hi.is/phh4/Tolvuleikjaforritun/bullet.png",
        bigBullet : "https://notendur.hi.is/sbs61/tolvuleikjaforritun/mynd/bigBullet.png",
        background : "images/background_stars.png",
        charge : "images/charge.png",
        explode : "images/explode.png"
    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

var g_sprites = {};
function preloadDone() {

    g_sprites.ship  = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 5; ++col) {
            g_sprites.ship.push(new Sprite(g_images.ship,col*33, row*17, 33, 17));
        }
    }

    g_sprites.enemy1  = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 8; ++col) {
            g_sprites.enemy1.push(new Sprite(g_images.enemy1,col*33, row*36, 33, 36));
        }
    }

    g_sprites.enemy2  = [];
    for (var row = 0; row < 2; ++row) {
        for (var col = 0; col < 8; ++col) {
            g_sprites.enemy2.push(new Sprite(g_images.enemy2,col*33.25, row*34, 33.25, 34));
        }
    }

    g_sprites.charge  = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 8; ++col) {
            g_sprites.charge.push(new Sprite(g_images.charge,col*32, row*34, 32, 34));
        }
    }

    g_sprites.explode  = [];
    for (var row = 0; row < 1; ++row) {
        for (var col = 0; col < 6; ++col) {
            g_sprites.explode.push(new Sprite(g_images.explode,col*33, row*34, 33, 34));
        }
    }
    

    g_sprites.bullet = new Sprite(g_images.bullet, 0,0, g_images.bullet.width, g_images.bullet.height);
    g_sprites.bullet.scale = 2;

    g_sprites.background = new Sprite(g_images.background, 0,0, g_images.background.width, g_images.background.height);
    g_sprites.background.scale = 1;

    entityManager.init();
    environmentManager.init();
    createInitialShips();

    main.init();
}

// Kick it off
requestPreloads();
