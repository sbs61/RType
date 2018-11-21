// =======
// GLOBALS
// =======
/*

Evil, ugly (but "necessary") globals, which everyone can use.

*/

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

// The "nominal interval" is the one that all of our time-based units are
// calibrated to e.g. a velocity unit is "pixels per nominal interval"
//
var NOMINAL_UPDATE_INTERVAL = 16.666;

// Multiply by this to convert seconds into "nominals"
var SECS_TO_NOMINALS = 1000 / NOMINAL_UPDATE_INTERVAL;

var g_lives = 3;

var g_enemy1WaveInterval = 5000 / NOMINAL_UPDATE_INTERVAL;

var g_enemy2WaveInterval = 7000 / NOMINAL_UPDATE_INTERVAL;

var g_enemy1amount = 0;

var g_enemy2amount = 0;

var g_increaseDifficultyInterval = 15000 / NOMINAL_UPDATE_INTERVAL;

var g_bossInterval = 60000/NOMINAL_UPDATE_INTERVAL;

var g_bossHealth = 50;

var g_baseShipCel = 2;
