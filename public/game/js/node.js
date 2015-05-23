'use strict';

define([
	'./settings'
], function (Settings) {

	var game;
	var glyphs = Settings.GLYPHS_IDS;
	var difficulties = Settings.DIFFICULTIES;
	var difficultyColors = Settings.DIFFICULTY_COLORS;

	var Node = function (g, id, x, y, base) {
		game = g;
		this.id = id;
		this.x = x;
		this.y = y;
		if (base) {
			this.base = base;
			var color = (parseInt(base,10) === 0 ? 'Red' : 'Blue');
			this.baseColor = color;
			this.glyph = 0;
	        this.sprite = game.add.sprite(x, y, 'sprites', color + '001_tent.png');
	        this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames(color, 1, 4, '_tent.png', 3), 7, true);
	        this.sprite.animations.play('idle');
	        this.size = 3;
		} else {
			// this.glyph = _.sample(glyphs); // will be back later
			this.glyph = glyphs[id % glyphs.length];
			this.sprite = game.add.sprite(x, y, 'sprites', 'Glyph00' + (this.glyph+1) + '.png');

	        // difficulty
	        this.difficulty = _.sample(difficulties);
	        this.size = 3;
	        this.sprite.tint = difficultyColors[this.difficulty];
		}
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(0);

        this.solved = {};
	};

	Node.prototype.solve = function (player) {
		var flag = game.add.sprite(this.x, this.y, 'sprites', (player.base === 1 ? 'Red' : 'Blue') + '001_Flag.png');
		flag.scale.setTo(0);
		flag.anchor.setTo(0.5);
        game.add.tween(flag.scale).to({ x: 4, y: 4 }, 500, Phaser.Easing.Bounce.InOut, true);
		this.solved[player] = flag;
	};

	Node.prototype.isSolved = function (player) {
		return this.solved[player];
	};

	return Node;

});