'use strict';

define([
	'./settings'
], function (Settings) {

	var glyphs = Settings.GLYPHS_IDS;

	var Node = function (id, x, y, sprite) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.glyph = _.sample(glyphs, 1);
		this.sprite = sprite;
		// this.sprite.anchor.setTo(0.5);
		// this.sprite.position.x = x;
		// this.sprite.position.y = y;
	};

	return Node;

});