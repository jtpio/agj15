'use strict';

define([
    './qrcode',
    './node',
    './settings'
], function (QRCode, Node, Settings) {

    var glyphs = Settings.GLYPHS_IDS;
    var codeColors = [0x000066, 0x006600, 0x660000];
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
    var graph = {};
    var tiles = [];

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
        return 'http://' + game.serverIP + ':' + game.serverPort + '/player/?gameID='+game.gameID+'&level='+levelNumber;
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
        graph = {};
        tiles = [];
    };

    Level.prototype.load = function (levelNumber, loaded) {
        var self = this;
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

                var targets = _.sample(tiles.children, nbNodes);

/*                var targets = [
                    tiles.children[50],
                    tiles.children[100],
                    tiles.children[200],
                    tiles.children[320],
                ];
    */
                targets.forEach(function (target) {
                    var x = target.x;
                    var y = target.y;
                    nodes.push(new Node(game, nodeID++, x, y));
                });
                // Construct the graph.
                // Each node has a maximum of neighbors equal to the number of glyphs - 1
                var nodesByGlyphID = _.groupBy(nodes, 'glyph');

                nodes.forEach(function (node) {
                    graph[node.id] = glyphs.map(function (glyphID) {
                        if (!nodesByGlyphID[glyphID]) {
                            return -1;
                        }
                        var nearest = _.min(nodesByGlyphID[glyphID], function (c) {
                            return Math.pow(c.x-node.x, 2) + Math.pow(c.y-node.y, 2);
                        });
                        return nearest.id;
                    });
                    _.remove(graph[node.id], function (n) { return n === node.id || n < 0; });
                });

                // self.debug();

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
            game.add.tween(node.sprite.scale).to({ x: node.size, y: node.size }, 500, Phaser.Easing.Quadratic.InOut, true, 500 * Math.random());
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

        var candidates = graph[p.currentNode];

        var moveTo = candidates.map(function (c) {
            return nodes[c];
        }).filter(function (n) {
            return n.glyph === glyph;
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

    Level.prototype.debug = function () {
        debugGraphics = game.add.graphics();
        debugGraphics.lineStyle(2, 0x000000);

        Object.keys(graph).forEach(function (node) {
            debugGraphics.moveTo(nodes[node].x, nodes[node].y);
            graph[node].forEach(function (to) {
                debugGraphics.lineTo(nodes[to].x, nodes[to].y);
            });
        });
    };

    return Level;

});