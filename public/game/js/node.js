'use strict';

define([], function () {

	var glyphs = [0, 1, 2, 3];

	var Node = function (x, y, sprite) {
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