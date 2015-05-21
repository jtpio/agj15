'use strict';

define([], function () {

    var game = null;

    var ResourceManager = function (g) {
        game = g;
    };

    ResourceManager.prototype.preload = function() {
        // graphics
        game.load.atlas('seacreatures', '../assets/img/seacreatures_json.png', '../assets/img/seacreatures_json.json');

        // audio
        // game.load.audio('hit02', ['assets/sound/hit02.mp3']);
    };

    ResourceManager.prototype.create = function() {
        // load the sounds
        // sound.loadSounds('hit02', 1, false);
        var octopus = game.add.sprite(330, 100, 'seacreatures');
        octopus.animations.add('swim', Phaser.Animation.generateFrameNames('octopus', 0, 24, '', 4), 30, true);
        octopus.animations.play('swim');

        game.add.tween(octopus).to({ y: 250 }, 4000, Phaser.Easing.Quadratic.InOut, true, 0, 10000, true);

    };

    ResourceManager.prototype.restart = function() {

    };

    return ResourceManager;

});

