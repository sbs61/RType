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
Hud.prototype.highscore = localStorage.getItem("highscore");

Hud.prototype.incrementScore = function (scoreIncr) {
  this.score += scoreIncr;
};

Hud.prototype.decrementLife = function () {
  this.life -= 1;
  if (this.life < 1) {
    this.gameOver = true;
  }
}

Hud.prototype.updateHighscore = function() {
  // Saves highscore using localStorage

  if(this.highscore !== null){
    if (this.score > this.highscore) {
        localStorage.setItem("highscore", this.score);
    }
  }
  else{
    localStorage.setItem("highscore", this.score);
  }
    this.highscore = localStorage.getItem("highscore");
}




Hud.prototype.render = function () {

  g_ctx.font = "30px Courier New";

  g_ctx.save();
  g_ctx.fillStyle = "white"
  g_ctx.shadowColor = "deepskyblue";
  g_ctx.shadowOffsetX = 3;
  g_ctx.shadowOffsetY = 3;
  g_ctx.textAlign = "center";
  g_ctx.fillText(this.score, g_canvas.width / 3+50, g_canvas.height - 8);
  g_ctx.fillText("BEAM", g_canvas.width / 3+50, g_canvas.height - 35);
  this.updateHighscore();
  g_ctx.fillText("Highscore: ", g_canvas.width / 3+200, g_canvas.height - 8);
  g_ctx.fillText(this.highscore, g_canvas.width / 3+330, g_canvas.height - 8);
  g_ctx.restore();


  g_sprites.beamBar.drawCentredAt(g_ctx,
  g_canvas.width / 2.2+g_sprites.beamBar.width/4-10,
  g_canvas.height - 50+g_sprites.beamBar.height/4);
  util.fillBox(ctx, g_canvas.width / 2.2, g_canvas.height - 46, this.charge, 10, 'blue');
  util.fillBox(ctx, g_canvas.width / 2.2+50, g_canvas.height - 50, 3, 14, 'grey');
  util.fillBox(ctx, g_canvas.width / 2.2+110, g_canvas.height - 50, 3, 14, 'grey');
  util.fillBox(ctx, g_canvas.width / 2.2+180, g_canvas.height - 50, 3, 14, 'grey');
  util.fillBox(ctx, g_canvas.width / 2.2+240, g_canvas.height - 50, 3, 14, 'grey');

  this.drawLives(g_ctx);
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


Hud.prototype.drawLives = function(ctx){
    if(g_lives > 0)
        g_sprites.ship[2].drawCentredAt(ctx, 30, 700, this.rotation);
    if(g_lives > 1)
        g_sprites.ship[2].drawCentredAt(ctx, 70, 700, this.rotation);
    if(g_lives > 2)
        g_sprites.ship[2].drawCentredAt(ctx, 110, 700, this.rotation);
}
