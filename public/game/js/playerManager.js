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
                    CLOCK.setTime(Math.round(Settings.PLAYING_TIME/1000));
                    CLOCK.start();
                });

                timeline += Settings.CONSTRUCTION_TIME;
                CLOCK.setTime(Math.round(timeline/1000));
                CLOCK.start();

                timer.add(timeline + Settings.TRANSITION_TIME, function () {
                    // GAME STARTS
                    async.series([
                        function (callback) {
                            self.setupPlayers(callback);
                        },
                        function (callback) {
                            // add listeners
                            self.setupListeners();
                            callback();
                        }
                    ], function (err) {
                        // nothing to do
                    });
                });

                timeline += Settings.TRANSITION_TIME;
                timer.add(timeline + Settings.PLAYING_TIME, function () {
                    // GAME ENDS
                    self.clearListeners();
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

    PlayerManager.prototype.setupPlayers = function (done) {
        var self = this;
        var playerIds = Object.keys(this.players).slice(0, 2);
        var colors = ['Red', 'Blue'];
        var i = 0;
        async.each(playerIds, function (pid, callback) {
            var color = colors[i];
            var p = self.players[pid];
            p.sprite = game.add.sprite(100, 100, 'sprites', color + '001_idle.png');
            p.sprite.alpha = 0;
            p.sprite.anchor.setTo(0.5);
            p.sprite.scale.setTo(1);

            p.sprite.animations.add('idle', Phaser.Animation.generateFrameNames(color, 1, 4, '_idle.png', 3), 7, true);
            p.sprite.animations.play('idle');

            p.base = i;
            level.positionPlayer(p);
            i++;

            game.add.tween(p.sprite).to({ alpha:1 }, 500, Phaser.Easing.Quadratic.InOut, true)
                .chain(
                    game.add.tween(p.sprite.scale).to({ x: 2, y: 2 }, 500, Phaser.Easing.Quadratic.InOut, true)
                ).onComplete.add(function() {
                    callback();
                });
        }, function (err) {
            done();
        });
    };

    PlayerManager.prototype.setupListeners = function () {
        var self = this;
        Object.keys(this.players).forEach(function (pid) {
            var p = self.players[pid];
            p.addEventListener('goto', function (data){
                level.movePlayer( {
                    player: p,
                    glyph: data.glyph
                }, function (response) {
                    console.log(response);
                });
            });
        });
    };

    PlayerManager.prototype.clearListeners = function () {
        var self = this;
        Object.keys(this.players).forEach(function (pid) {
            var p = self.players[pid];
            p.removeAllListenersBut(['disconnect']);
        });
    };

    PlayerManager.prototype.removePlayers = function () {
        var self = this;
        console.log('removePlayers', this.players);
        Object.keys(this.players).forEach(function (pid, i) {
            var p = self.players[pid];
            if (p.sprite) {
                p.sprite.destroy();
            }
        });
    };

    PlayerManager.prototype.add = function(netPlayer) {
        var self = this;
        if (Object.keys(this.players).length >= 2) {
            return netPlayer.sendCommand('disconnect', { 'message': 'full!' });
        }

        this.players[netPlayer.id] = netPlayer;

        // handle the disconnect event
        netPlayer.addEventListener('disconnect', function () {
            console.log('PLAYER DISCONNECTED', netPlayer.id);
            var player = self.players[netPlayer.id];
            if (!player) return;

            player.removeAllListeners();
            player.sprite.destroy();
            delete self.players[netPlayer.id];
        });

        netPlayer.sendCommand('puzzle', ['a','b','c']);

        console.log('added player', netPlayer);
    };

    return PlayerManager;

});

