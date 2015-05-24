'use strict';

define([
    './qrcode',
    './node',
    './settings'
], function (QRCode, Node, Settings) {

    var codeColors = [0x000000];
    var xRange = { min: 0, max: 0};
    var yRange = { min: 0, max: 0};
    var nbNodes = 10;

    var bases = {
        0: {
            sprite: null,
            xPos: 0.10,
            yPos: 0.90,
            size: 50
        },
        1: {
            sprite: null,
            xPos: 0.90,
            yPos: 0.10,
            size: 50
        }
    };

    var game;

    var code;
    var grid;
    var nodes = [];
    var tiles = [];
    var nodesByGlyphID = {};

    // debug
    var debugGraphics;

    var Level = function (g) {
        game = g;
        xRange.min = 0.60 * game.world.width - Settings.CODE_SIZE / 2;
        xRange.max = 0.60 * game.world.width + Settings.CODE_SIZE / 2;
        yRange.min = 0.5 * game.world.height - Settings.CODE_SIZE / 2;
        yRange.max = 0.5 * game.world.height + Settings.CODE_SIZE / 2;

    };

    Level.prototype.getTopLeft = function () {
        return { x: xRange.min, y: yRange.min };
    };

    function buildURL(levelNumber) {
        var split = window.location.href.split('/');
        var root = split[2];
        return 'http://' + root + '/player/?gameID='+game.gameID+'&level='+levelNumber;
    }

    // cleanup
    Level.prototype.reset = function () {
        nodes.forEach(function (n) {
            n.sprite.destroy();
            for (var s in n.solved) {
                n.solved[s].destroy();
            }
        });
        if (debugGraphics) debugGraphics.destroy();
        grid = [];
        nodes = [];
        tiles = [];
        nodesByGlyphID = {};
    };

    Level.prototype.load = function (levelNumber, loaded) {
        this.reset();

        async.series({
            generateCode: function (next) {
                code = new QRCode(document.getElementById('game-canvas'), {
                    width : Settings.CODE_SIZE,
                    height : Settings.CODE_SIZE
                });

                var url = buildURL(levelNumber);
                code.makeCode(url);
                console.log(url);

                next();
            },
            drawCode: function (next) {
                var grid = code.getData();
                var side = Settings.CODE_SIZE;
                var size = Math.floor(side / grid.length);
                var color = _.sample(codeColors);

                tiles = game.add.group();
                grid.forEach(function (row, i) {
                    row.forEach(function (dark, j) {
                        if (dark) {
                            var tile = game.add.sprite(game.world.centerX - side/4 + i*size, game.world.centerY - side/2 + j*size, '1x1');
                            tile.scale.setTo(0);
                            game.add.tween(tile.scale).to({ x: size, y: size }, 500, Phaser.Easing.Quadratic.InOut, true, 100 * Math.random());
                            tile.anchor.set(0.5);
                            tile.tint = color;
                            tiles.add(tile);
                        }
                    });
                });

                next();
            },
            buildGraph: function (next) {

                var nodeID = 0;

                Object.keys(bases).forEach(function (baseID) {
                    var x = xRange.min + bases[baseID].xPos * (xRange.max - xRange.min);
                    var y = yRange.min + bases[baseID].yPos * (yRange.max - yRange.min);
                    nodes.push(new Node(game, nodeID++, x, y, baseID));
                });

                var targets = [];
                var margin = Math.floor(0.25 * tiles.children.length);
                var poll = tiles.children.slice(margin, tiles.children.length-margin);

                targets = _.sample(poll, nbNodes);

                targets.forEach(function (target) {
                    var x = target.x;
                    var y = target.y;
                    nodes.push(new Node(game, nodeID++, x, y));
                });

                for(var i = 0; i < nodes.length; i++){
                    var self = nodes[i];
                    if(self.base)continue;
                    for(var j = i+1; j < nodes.length; j++){
                        var other = nodes[j];
                        if(other.base)continue;

                        var dx = self.x - other.x;
                        var dy = self.y - other.y;

                        var d = Math.sqrt(dx*dx + dy*dy);

                        var md = 100;
                        if(d < md){
                            var dR = md-d;

                            var vx = dx/d;
                            var vy = dy/d;

                            self.sprite.position.x += vx * dR;
                            self.sprite.position.y += vy * dR;

                            other.sprite.position.x -= vx * dR;
                            other.sprite.position.y -= vy * dR;

                            if(self.sprite.position.x < xRange.min)self.sprite.position.x = xRange.min;
                            if(self.sprite.position.x > xRange.max)self.sprite.position.x = xRange.max;
                            if(self.sprite.position.y < yRange.min)self.sprite.position.y = yRange.min;
                            if(self.sprite.position.y > yRange.max)self.sprite.position.y = yRange.max;
                            if(other.sprite.position.x < xRange.min)other.sprite.position.x = xRange.min;
                            if(other.sprite.position.x > xRange.max)other.sprite.position.x = xRange.max;
                            if(other.sprite.position.y < yRange.min)other.sprite.position.y = yRange.min;
                            if(other.sprite.position.y > yRange.max)other.sprite.position.y = yRange.max;

                            self.x = self.sprite.position.x;
                            self.y = self.sprite.position.y;
                            other.x = other.sprite.position.x;
                            other.y = other.sprite.position.y;
                        }
                    }
                }

                async.each(tiles.children, function (tile, done) {
                    var nearest = _.min(nodes, function (node) {
                        return Math.pow(tile.position.x-node.x, 2) + Math.pow(tile.position.y-node.y, 2);
                    });
                    tile.nearest = nearest;
                    done();
                }, function(err) {
                    next();
                });
            },
        }, function (err, res) {
            console.log('level generated');
            if (loaded) {
                return loaded();
            }

        });
    };

    Level.prototype.transition = function (callback) {
        nodes.forEach(function (node) {
            game.add.tween(node.sprite.scale).to({ x: node.size, y: node.size }, 500, Phaser.Easing.Quadratic.InOut, true, 500 * Math.random())
            .onComplete.add(function () {
                if (node.hasOwnProperty('base')) { return; }
                game.add.tween(node.sprite.scale).to({ x: 1.1*node.size, y: 1.1*node.size }, 1000, Phaser.Easing.Cubic.InOut, true, 1000 * Math.random(), -1, true);
            });
        });

        async.each(tiles.children, function (tile, done) {
            game.add.tween(tile).to(tile.nearest, 1000, Phaser.Easing.Quadratic.InOut, true)
            .chain(
                game.add.tween(tile).to({ alpha: 0 }, 1000, Phaser.Easing.Quadratic.InOut, true)
            ).onComplete.add(function () {
                tile.destroy();
                done();
            });
        }, function(err) {
            callback();
        });
    };

    Level.prototype.positionPlayer = function (p, callback) {
        p.sprite.alpha = 0;

        game.add.tween(p.sprite.position).to({ x: nodes[p.base].x, y: nodes[p.base].y }, 500, Phaser.Easing.Quadratic.InOut, true)
            .chain(
                game.add.tween(p.sprite).to({ alpha:1 }, 1000, Phaser.Easing.Quadratic.InOut, true)
            )
            .chain(
                game.add.tween(p.sprite.scale).to({ x:3, y:3 }, 250, Phaser.Easing.Quadratic.InOut, true)
            )
            .onComplete.add(function () {
                p.currentNode = p.base;
                callback();
            });
    };

    Level.prototype.movePlayer = function (data, callback) {
        var self = this;
        var p = data.player;
        var glyph = data.glyph;
        var curr = nodes[p.currentNode];

        var candidates = _.uniq(
            _.sortBy(nodes.filter(function (n) {
                return curr.id !== n.id && !n.isSolved(p.base);
            }), function (n) {
                return Math.pow(curr.x-n.x, 2) + Math.pow(curr.y-n.y, 2);
            }), function (n) {
                return n.glyph;
        });

        if (candidates.length === 0) {
            return callback({});
        }

        var moveTo = candidates.filter(function (c) {
            return c.glyph === glyph;
        }).pop();

        if (moveTo && !p.isMoving) {
            p.isMoving = true;
            game.add.tween(p.sprite.position).to({ x: moveTo.x, y: moveTo.y }, 250, Phaser.Easing.Quadratic.InOut, true)
                .onComplete.add(function () {
                    self.landOnNode(p, moveTo, callback);
                });
        } else {
            callback({ node: null });
        }

    };

    Level.prototype.landOnNode = function (p, node, callback) {
        p.currentNode = node.id;
        p.isMoving = false;

        var res = { node: node.id };

        if (!node.isSolved(p.base)) {
            res.puzzle = node.difficulty;
        }

        callback(res);
    };

    Level.prototype.markPuzzleAsSolved = function (data, callback) {
        var node = data.node;
        var player = data.player;

        nodes[node].solve(player.base);

        if (callback) callback();
    };

    return Level;

});