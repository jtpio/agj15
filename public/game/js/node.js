'use strict';

define([
	'./settings'
], function (Settings) {

	var glyphs = Settings.GLYPHS_IDS;
	var baseSize = 16;

	var Node = function (id, x, y, sprite) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.glyph = _.sample(glyphs);
		this.sprite = sprite;
		this.size = Math.round(baseSize * Math.sqrt(glyphs.length - this.glyph + 1));
		// this.sprite.anchor.setTo(0.5);
		// this.sprite.position.x = x;
		// this.sprite.position.y = y;
	};

	return Node;

});