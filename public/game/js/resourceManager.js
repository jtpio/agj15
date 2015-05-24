'use strict';

define([], function () {

    var game = null;

    var ResourceManager = function (g) {
        game = g;
    };

    ResourceManager.prototype.preload = function() {
        // graphics
        game.load.atlasJSONHash('sprites', '../assets/img/game_spritesheet.png', '../assets/img/game_spritesheet.json');
        game.load.image('1x1', '../assets/img/1x1.png');
        game.load.image('RedFace', '../assets/img/redFace.png');
        game.load.image('BlueFace', '../assets/img/blueFace.png');

        // audio
        game.load.audio('lobby', ['../assets/sounds/lobby001.mp3']);
        game.load.audio('wind', ['../assets/sounds/wind.mp3']);
    };

    ResourceManager.prototype.create = function() {
        // load the sounds
        // sound.loadSounds('hit02', 1, false);


        // game.add.tween(octopus).to({ y: 250 }, 4000, Phaser.Easing.Quadratic.InOut, true, 0, 10000, true);

    };

    ResourceManager.prototype.restart = function() {

    };

    return ResourceManager;

});

