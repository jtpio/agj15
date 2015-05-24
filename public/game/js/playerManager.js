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

        var lobbySound = game.add.audio('lobby', 1);
        var windSound = game.add.audio('wind', 1);
        lobbySound.play();
        lobbySound.onLoop.add(function () {
            lobbySound.play();
        });
        windSound.play();
        windSound.onLoop.add(function () {
            windSound.play();
        });

        var topLeft = level.getTopLeft();
        console.log(topLeft);
        var background = game.add.sprite(topLeft.x, topLeft.y, 'sprites', 'Background.png');

        background.scale.setTo(1.5);

        async.forever(
            function (nextLoop) {
                var timer = game.time.create(true);
                console.log('start transition');

                // CONSTRUCTION
                level.load(1);
                lobbySound.resume();
                windSound.pause();

                CLOCK.setTime(Math.round(Settings.TRANSITION_TIME/1000));
                CLOCK.start();

                timer.add(Settings.TRANSITION_TIME, function () {
                    CLOCK.setTime(Math.round(Settings.PLAYING_TIME/1000));
                    CLOCK.start();
                    // GAME STARTS
                    if (!lobbySound.paused) {
                        lobbySound.pause();
                    }
                    windSound.resume();

                    async.series([
                        function (callback) {
                            level.transition(function () {
                               callback();
                            });
                        },
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

                timer.add(Settings.TRANSITION_TIME + Settings.PLAYING_TIME, function () {
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
            i++;
            level.positionPlayer(p, function () {
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

            // to move somewhere
            p.addEventListener('goto', function (data){
                level.movePlayer( {
                    player: p,
                    glyph: data.glyph
                }, function (response) {
                    if (response.node) {
                        p.sendCommand('movedTo', response);
                    }
                });
            });

            // puzzle is solved
            p.addEventListener('puzzleSolved', function (data) {
                if (!data.win) { return; }
                level.markPuzzleAsSolved({ node: data.node, player: p });
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
            p.sendCommand('init');
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

        console.log('added player', netPlayer);
    };

    return PlayerManager;

});

