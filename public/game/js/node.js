'use strict';

define([
	'./settings'
], function (Settings) {

	var glyphs = Settings.GLYPHS_IDS;
	var refSize = 16;
	var baseSize = 50;

	var Node = function (id, x, y, sprite, base) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.sprite = sprite;
		this.glyph = _.sample(glyphs);
		this.size = Math.round(refSize * Math.sqrt(glyphs.length - this.glyph + 1));
		if (base) {
			this.base = base;
			this.size = baseSize;
		}
	};

	return Node;

});