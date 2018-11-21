function Hud(descr) {
	// Common inherited setup logic from Entity
	this.setup(descr);
	this.killCount = 0;
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
	this.killCount++;
};

Hud.prototype.decrementLife = function () {
	this.life -= 1;
	if (this.life < 1) {
		this.gameOver = true;
	}
}

Hud.prototype.updateHighscore = function () {
	// Saves highscore using localStorage

	if (this.highscore !== null) {
		// If there's a defined highscore and the current score is higher;
		// set highscore to current score
		if (this.score > this.highscore) {
			localStorage.setItem("highscore", this.score);
		}
	}
	else {
		// If there's no defined highscore, set current score as highscore
		localStorage.setItem("highscore", this.score);
	}
	this.highscore = localStorage.getItem("highscore");
}




Hud.prototype.render = function () {

	g_ctx.font = "30px Courier New";

	// Text in HUD
	g_ctx.save();
	g_ctx.fillStyle = "white"
	g_ctx.shadowColor = "deepskyblue";
	g_ctx.shadowOffsetX = 3;
	g_ctx.shadowOffsetY = 3;
	g_ctx.textAlign = "center";
	g_ctx.fillText(this.score, g_canvas.width / 3 + 50, g_canvas.height - 8);
	g_ctx.fillText("BEAM", g_canvas.width / 3 + 50, g_canvas.height - 35);
	this.updateHighscore();
	g_ctx.fillText("Highscore: ", g_canvas.width / 3 + 200, g_canvas.height - 8);
	g_ctx.fillText(this.highscore, g_canvas.width / 3 + 330, g_canvas.height - 8);

	// Power up timer
	if (entityManager._ships[0] !== undefined) { // Check if ship exists
		var powerUpTime = entityManager._ships[0].powerUpTime;
		powerUpTime = Math.ceil(powerUpTime / 100)
		if (entityManager._ships[0].multiGun) {
			g_ctx.fillText("Multigun", 100, 20)
			g_ctx.fillText(powerUpTime, 190, 20);
		}
	}
	g_ctx.restore();

	// Load texture for the beam bar
	g_sprites.beamBar.drawCentredAt(g_ctx,
		g_canvas.width / 2.2 + g_sprites.beamBar.width / 4 - 10,
		g_canvas.height - 50 + g_sprites.beamBar.height / 4);
	// Beam based on this.charge
	util.fillBox(ctx, g_canvas.width / 2.2, g_canvas.height - 46, this.charge, 10, 'blue');
	// Grey lines on beam bar to indicate where bullet type changes
	util.fillBox(ctx, g_canvas.width / 2.2 + 50, g_canvas.height - 50, 3, 14, 'grey');
	util.fillBox(ctx, g_canvas.width / 2.2 + 110, g_canvas.height - 50, 3, 14, 'grey');
	util.fillBox(ctx, g_canvas.width / 2.2 + 180, g_canvas.height - 50, 3, 14, 'grey');
	util.fillBox(ctx, g_canvas.width / 2.2 + 240, g_canvas.height - 50, 3, 14, 'grey');

	this.drawLives(g_ctx);
}

Hud.prototype.update = function () {

}

Hud.prototype.incrementBeam = function () {
	// Gets called in Ship when the player holds down the space bar
	if (this.charge < 250) // Max charge 
		this.charge += 2;
}

Hud.prototype.resetBeam = function () {
	// When the player releases the space bar the charge gets reset (or if the player dies)
	this.charge = 0;
}


Hud.prototype.drawLives = function (ctx) {
	if (g_lives > 0)
		g_sprites.ship[2].drawCentredAt(ctx, 30, 700, this.rotation);
	if (g_lives > 1)
		g_sprites.ship[2].drawCentredAt(ctx, 70, 700, this.rotation);
	if (g_lives > 2)
		g_sprites.ship[2].drawCentredAt(ctx, 110, 700, this.rotation);
}
