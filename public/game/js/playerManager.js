'use strict';

define([
    './settings'
], function (Settings) {

    var game;
    var players = {};

    var PlayerManager = function (g) {
        game = g;
    };

    PlayerManager.prototype.loop = function () {
        async.forever(
            function (nextLoop) {
                var timer = game.time.create(true);
                console.log('start transition');
                timer.add(Settings.TRANSITION_TIME, function () {
                    console.log('start game');
                });

                timer.add(Settings.TRANSITION_TIME + Settings.PLAYING_TIME, function () {
                    console.log('end game');
                    nextLoop();
                });

                timer.start();
            },
            function (err) {

            }
        );
    };

    PlayerManager.prototype.add = function(netPlayer) {
        var self = this;
        if (Object.keys(players).length >= 2) {
            return netPlayer.sendCommand('disconnect', { 'message': 'full!' });
        }

        players[netPlayer.id] = netPlayer;

        // add listeners

        netPlayer.addEventListener('goto', function(data){
        	console.log(data);
        });

        netPlayer.addEventListener('disconnect', function () {
            var player = self.players[netPlayer.id];
            if (!player) return;

            player.removeAllListeners();
            player.sprite.destroy();
        });

        netPlayer.sendCommand('puzzle', ['a','b','c']);

        this.setupPlayer(netPlayer);
    };

    PlayerManager.prototype.setupPlayer = function (p) {
        var color = 'Red';
        p.sprite = game.add.sprite(0, 0, 'sprites', color + '001_idle.png');
        p.sprite.alpha = 0;
        p.sprite.animations.add('idle', Phaser.Animation.generateFrameNames(color, 1, 4, '_idle.png', 3), 7, true);
        p.sprite.animations.play('idle');
    };

    return PlayerManager;

});

