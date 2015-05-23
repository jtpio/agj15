'use strict';

define([
	'./settings'
], function (Settings) {

	var game;
	var glyphs = Settings.GLYPHS_IDS;
	var refSize = 16;
	var baseSize = 50;

	var Node = function (g, id, x, y, base) {
		game = g;
		this.id = id;
		this.x = x;
		this.y = y;
		this.glyph = _.sample(glyphs);
		if (base) {
			var color = (base == 1 ? "Red" : "Blue");
	        this.sprite = game.add.sprite(x, y, 'sprites', color + "001_tent.png");
	        this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames(color, 1, 4, '_tent.png', 3), 7, true);
	        this.sprite.animations.play('idle');
		} else {
			this.spriteName = 'Glyph00' + (this.glyph+1) +'.PNG';
			this.sprite = game.add.sprite(x, y, 'sprites', this.spriteName);
		}
        this.sprite.anchor.set(0.5);
        this.sprite.scale.setTo(0);
        this.size = 2;
	};

	return Node;

});