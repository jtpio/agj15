'use strict';

define(function () {

	var Settings = {
		WIDTH: 1280,
		HEIGHT: 720,
		CODE_SIZE: 700,
		DIFFICULTIES: [0, 1, 2],
	    DIFFICULTY_COLORS: [0x00ff99, 0xffff00, 0xff6666],
		GLYPHS_IDS: [0, 1, 2, 3],
		GLYPHS_NAMES: ['', '', '', ''],
		CONSTRUCTION_TIME: 1000 * 4,
		TRANSITION_TIME: 1000 * 3,
		PLAYING_TIME: 1000 * 40
	};

	return Settings;

});