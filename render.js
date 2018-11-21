// GENERIC RENDERING

var g_doClear = true;
var g_doBox = false;
var g_undoBox = false;
var g_doFlipFlop = false;
var g_doRender = true;
var g_showXTime = false;
var g_showMouseCrd = false;
var g_unPixelate = true;

var g_frameCounter = 1;

var TOGGLE_CLEAR = 'C'.charCodeAt(0);
var TOGGLE_BOX = 'B'.charCodeAt(0);
var TOGGLE_UNDO_BOX = 'U'.charCodeAt(0);
var TOGGLE_FLIPFLOP = 'F'.charCodeAt(0);
var TOGGLE_RENDER = 'R'.charCodeAt(0);
var TOGGLE_XTIME = 'N'.charCodeAt(0);
var TOGGLE_MouseCRD = 'M'.charCodeAt(0);
var TOGGLE_GRX = '9'.charCodeAt(0);

function render(ctx) {
    ctx.save();
    
    // Process various option toggles
    //
    if (eatKey(TOGGLE_CLEAR)) g_doClear = !g_doClear;
    if (eatKey(TOGGLE_BOX)) g_doBox = !g_doBox;
    if (eatKey(TOGGLE_UNDO_BOX)) g_undoBox = !g_undoBox;
    if (eatKey(TOGGLE_FLIPFLOP)) g_doFlipFlop = !g_doFlipFlop;
    if (eatKey(TOGGLE_RENDER)) g_doRender = !g_doRender;
    if (eatKey(TOGGLE_XTIME)) g_showXTime = !g_showXTime;
    if (eatKey(TOGGLE_MouseCRD)) g_showMouseCrd = !g_showMouseCrd;
    if (eatKey(TOGGLE_GRX)) g_pixelate = !g_pixelate;
    
    // I've pulled the clear out of `renderSimulation()` and into
    // here, so that it becomes part of our "diagnostic" wrappers
    //
    if (g_doClear) util.clearCanvas(ctx);
    
    // The main purpose of the box is to demonstrate that it is
    // always deleted by the subsequent "undo" before you get to
    // see it...
    //
    // i.e. double-buffering prevents flicker!
    //
    if (g_doBox) util.fillBox(ctx, 200, 200, 50, 50, "red");
    
    
    // The core rendering of the actual game / simulation
    //
    if (g_doRender) renderSimulation(ctx);
    
    
    // This flip-flip mechanism illustrates the pattern of alternation
    // between frames, which provides a crude illustration of whether
    // we are running "in sync" with the display refresh rate.
    //
    // e.g. in pathological cases, we might only see the "even" frames.
    //
    if (g_doFlipFlop) {
        var boxX = 250,
            boxY = g_isUpdateOdd ? 100 : 200;
        
        // Draw flip-flop box
        util.fillBox(ctx, boxX, boxY, 50, 50, "green");
        
        // Display the current frame-counter in the box...
        ctx.fillText(g_frameCounter % 1000, boxX + 10, boxY + 20);
        // ..and its odd/even status too
        var text = g_frameCounter % 2 ? "odd" : "even";
        ctx.fillText(text, boxX + 10, boxY + 40);
    }
    
    // Optional erasure of diagnostic "box",
    // to illustrate flicker-proof double-buffering
    //
    if (g_undoBox) ctx.clearRect(200, 200, 50, 50);


    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#008F11'

    if(g_showMouseCrd) ctx.fillText(Math.floor(g_mouseX) + ' : ' + 
                                    Math.floor(g_mouseY), 10, 80);

    if (g_showXTime) ctx.fillText('XTime : ' + Math.floor(g_XTime), 10, 50);

    ctx.restore();

    // Disable smooth scaling
    g_ctx.mozImageSmoothingEnabled = g_unPixelate;
    g_ctx.webkitImageSmoothingEnabled = g_unPixelate;
    g_ctx.imageSmoothingEnabled = g_unPixelate;

    ++g_frameCounter;
}
