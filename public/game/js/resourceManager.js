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

        // audio
        // game.load.audio('hit02', ['assets/sound/hit02.mp3']);
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

