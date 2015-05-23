'use strict';

define([
    './level',
    './settings'
], function (Level, Settings) {

    var game;
    var level;

    var PlayerManager = function (g) {
        game = g;
        level = new Level(g);
        this.players =  {};
    };

    PlayerManager.prototype.loop = function () {
        var self = this;

        async.forever(
            function (nextLoop) {
                var timer = game.time.create(true);
                console.log('start transition');

                // CONSTRUCTION
                level.load(1);

                var timeline = 0;
                timer.add(Settings.CONSTRUCTION_TIME, function () {
                    // TRANSITION
                    level.transition();
                });

                timeline += Settings.CONSTRUCTION_TIME;
                timer.add(timeline + Settings.TRANSITION_TIME, function () {
                    // GAME
                    self.setupPlayers();
                });

                timeline += Settings.TRANSITION_TIME;
                timer.add(timeline + Settings.PLAYING_TIME, function () {
                    // END OF GAME
                    self.removePlayers();
                    nextLoop();
                });

                timer.start();
            },
            function (err) {
                console.error('PROBLEM');
            }
        );
    };

    PlayerManager.prototype.setupPlayers = function () {
        var colors = ['Red', 'Blue'];
        Object.keys(this.players).forEach(function (pid, i) {
            var color = colors[i];
            var p = this.players[pid];
            p.sprite = game.add.sprite(0, 0, 'sprites', color + '001_idle.png');
            p.sprite.alpha = 0;
            p.sprite.animations.add('idle', Phaser.Animation.generateFrameNames(color, 1, 4, '_idle.png', 3), 7, true);
            p.sprite.animations.play('idle');
        });
    };

    PlayerManager.prototype.removePlayers = function () {
        Object.keys(this.players).forEach(function (pid, i) {
            var p = this.players[pid];
            p.sprite.destroy();
        });
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

    };

    return PlayerManager;

});

