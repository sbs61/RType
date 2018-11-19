function Hud(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);
};

Hud.prototype = new Entity();
Hud.prototype.score = 0;
Hud.prototype.life = 2;
Hud.prototype.gameOver = false;
Hud.prototype.KEY_FIRE = ' '.charCodeAt(0);
Hud.prototype.charge = 0;


Hud.prototype.incrementScore = function (scoreIncr) {
  this.score += scoreIncr;
};

Hud.prototype.decrementLife = function () {
  this.life -= 1;
  if (this.life < 1) {
    this.gameOver = true;
  }
}



Hud.prototype.render = function () {
 
  g_ctx.font = "30px Courier New";
  
  g_ctx.save();  
  g_ctx.fillStyle = "white"
  g_ctx.shadowColor = "deepskyblue";
  g_ctx.shadowOffsetX = 3;
  g_ctx.shadowOffsetY = 3;
  g_ctx.textAlign = "center";
  g_ctx.fillText(this.score, g_canvas.width / 4, g_canvas.height - 8);
  g_ctx.fillText("BEAM", g_canvas.width / 4, g_canvas.height - 35);
  g_ctx.restore();
  

  g_sprites.beamBar.drawCentredAt(g_ctx, 
  g_canvas.width / 3.2+g_sprites.beamBar.width/4-10, 
  g_canvas.height - 37+g_sprites.beamBar.height/4);
  util.fillBox(ctx, g_canvas.width / 3.2, g_canvas.height - 34, this.charge, 10, 'blue');
  util.fillBox(ctx, g_canvas.width / 3.2, g_canvas.height - 30, this.charge, 2, 'grey');
  util.fillBox(ctx, g_canvas.width / 3.2+50, g_canvas.height - 37, 3, 14, 'grey');
  util.fillBox(ctx, g_canvas.width / 3.2+110, g_canvas.height - 37, 3, 14, 'grey');
  util.fillBox(ctx, g_canvas.width / 3.2+180, g_canvas.height - 37, 3, 14, 'grey');
  util.fillBox(ctx, g_canvas.width / 3.2+240, g_canvas.height - 37, 3, 14, 'grey');
  /*for (var i = 0; i < this.life; i++) {
    g_sprites.life.drawCentredAt(ctx, 18 + i * 32, g_canvas.height - 33);
  }*/
}

Hud.prototype.update = function () {
  
}

Hud.prototype.incrementBeam = function() {
  if (this.charge < 250)
    this.charge += 2;
}

Hud.prototype.resetBeam = function() {
  this.charge = 0;
}