'use strict';

define([
    './level',
    './settings'
], function (Level, Settings) {

    var game;
    var level;
    var bmd;
    var bmdUrl;
    var heads = [];
    var scores = [0, 0];

    var PlayerManager = function (g) {
        game = g;
        level = new Level(g);
        this.players =  {};
    };

    PlayerManager.prototype.loop = function () {
        var self = this;

        var levelNumber = 1;

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

        var positions = [{x:0, y:game.height*0.25}, {x:0, y:game.height*0.75}];

        var colors = ['Red', 'Blue'];

        function newHead(index){
            var head = game.add.sprite(0, 0, colors[index]+'Face');
            head.scale.setTo(4);
            head.position = positions[index];
            head.position.x += head.width / 2;
            head.rotation = -0.5;
            head.anchor.setTo(0.5);
            return head;
        }

        heads.push(newHead(0));
        heads.push(newHead(1));

        var happyTween = game.add.tween(heads[0]).from({rotation: -0.5}).to({rotation: 0.5}, 250, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
        var happyTween2 = game.add.tween(heads[1]).from({rotation: -1}).to({rotation: 1}, 1000, Phaser.Easing.Cubic.InOut, true, 0, -1, true);

        bmd = game.add.bitmapData(game.width, game.height);
        bmd.addToWorld();

        bmdUrl = game.add.bitmapData(game.width, game.height);
        bmdUrl.addToWorld();

        this.redrawScores();

        async.forever(
            function (nextLoop) {
                var timer = game.time.create(true);
                console.log('start transition');

                // CONSTRUCTION
                level.load(levelNumber++);
                lobbySound.resume();
                windSound.pause();

                bmdUrl.clear();
                var pos = level.getBottomLeft();
                var text = game.make.text(pos.x, pos.y, level.getURL(), { font: 'bold 32px Arial', fill: '#fff' });
                text.anchor.set(0, 0.5);
                bmdUrl.draw(text);

                CLOCK.setTime(Math.round(Settings.TRANSITION_TIME/1000));
                CLOCK.start();

                timer.add(Settings.TRANSITION_TIME, function () {
                    CLOCK.setTime(Math.round(Settings.PLAYING_TIME/1000));
                    CLOCK.start();
                    // GAME STARTS
                    bmdUrl.clear();
                    if (!lobbySound.paused) {
                        lobbySound.pause();
                    }
                    happyTween.pause();
                    happyTween2.pause();
                    game.add.tween(heads[0]).to({rotation: 0}, 250, Phaser.Easing.Cubic.InOut, true, 0);
                    game.add.tween(heads[1]).to({rotation: 0}, 250, Phaser.Easing.Cubic.InOut, true, 0);

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
                    happyTween.resume();
                    happyTween2.resume();
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
        var colors = _.shuffle([['Red', 0], ['Blue', 1]]);
        var i = 0;
        async.each(playerIds, function (pid, callback) {
            var color = colors[i];
            var p = self.players[pid];
            p.sendCommand('init');
            p.sprite = game.add.sprite(100, 100, 'sprites', color[0] + '001_idle.png');
            p.sprite.alpha = 0;
            p.sprite.anchor.setTo(0.5);
            p.sprite.scale.setTo(1);

            p.sprite.animations.add('idle', Phaser.Animation.generateFrameNames(color[0], 1, 4, '_idle.png', 3), 7, true);
            p.sprite.animations.play('idle');

            p.base = color[1];
            i++;

            p.sendCommand('color', { colorID: p.base });

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
                if (!data.win) {
                    level.positionPlayer(p, _.noop);
                    return;
                }
                level.markPuzzleAsSolved({ node: data.node, player: p });
                scores[p.base]+=data.points;
                self.redrawScores();
            });

        });
    };
    PlayerManager.prototype.redrawScores = function(){
        console.log("redrawing text...");
        bmd.clear();
        var text = game.make.text(heads[0].position.x+heads[0].width*1.5, heads[0].position.y, ''+scores[0], { font: "bold 64px pixelArt", fill: "#fff" });
        text.anchor.set(0, 0.5);
        bmd.draw(text);
        text = game.make.text(heads[1].position.x+heads[1].width*1.5, heads[1].position.y, ''+scores[1], { font: "bold 64px pixelArt", fill: "#fff" });
        text.anchor.set(0, 0.5);
        bmd.draw(text);
    }

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
            if (p.sprite) p.sprite.destroy();
            if(p.steps) _.forEach(p.steps, function(n){n.destroy()});

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
            var p = self.players[netPlayer.id];
            if (!p) return;

            if (p.steps) _.forEach(p.steps, function(n){n.destroy()});

            p.removeAllListeners();
            if (p.sprite) p.sprite.destroy();
            delete self.players[netPlayer.id];
        });

        console.log('added player', netPlayer);
    };

    return PlayerManager;

});

