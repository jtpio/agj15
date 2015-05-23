'use strict';

define([
    './qrcode',
    './node',
    './settings'
], function (QRCode, Node, Settings) {

    var game;
    var code;
    var grid;
    var xRange = { min: 0, max: 0};
    var yRange = { min: 0, max: 0};
    var nbNodes = 5;
    var nodes = [];
    var graph = {};
    var tiles = [];
    var glyphs = Settings.GLYPHS_IDS;

    var Level = function (g) {
        game = g;
        xRange.min = 0.75 * game.world.width - Settings.CODE_SIZE / 2;
        xRange.max = 0.75 * game.world.width + Settings.CODE_SIZE / 2;
        yRange.min = 0.5 * game.world.height - Settings.CODE_SIZE / 2;
        yRange.max = 0.5 * game.world.height + Settings.CODE_SIZE / 2;
    };

    function buildURL(levelNumber) {
        return 'http://' + game.serverIP + ':' + game.serverPort + '/player/?gameID='+game.gameID+'&level='+levelNumber;
    }

    Level.prototype.load = function (levelNumber, loaded) {

        async.series({
            generateCode: function (next) {
                code = new QRCode(document.getElementById("game-canvas"), {
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

                tiles = game.add.group();

                grid.forEach(function (row, i) {
                    row.forEach(function (dark, j) {
                        if (dark) {
                            var tile = game.add.sprite(game.world.centerX - side/4 + i*size, game.world.centerY - side/2 + j*size, '1x1');
                            tile.scale.setTo(size);
                            tile.anchor.set(0.5);
                            tile.tint = 0x0000ff;
                            tiles.add(tile);
                        }
                    });
                });

                next();
            },
            buildGraph: function (next) {
                for (var i = 0; i < nbNodes; i++) {
                    nodes.push(new Node(i, game.rnd.integerInRange(xRange.min, xRange.max), game.rnd.integerInRange(yRange.min, yRange.max)));
                }
                // Construct the graph.
                // Each node has a maximum of neighbors equal to the number of glyphs - 1
                var nodesByGlyphID = _.groupBy(nodes, 'glyph');

                nodes.forEach(function (node) {
                    var glyph = node.glyph;
                    graph[node.id] = [];
                    var neighbors = glyphs.filter(function (g) {
                        return glyph !== g;
                    }).map(function (glyphID) {
                        if (!nodesByGlyphID[glyphID]) {
                            return null;
                        }
                        var nearest = _.min(nodesByGlyphID[glyphID], function (c) {
                            return Math.pow(c.x-node.x, 2) + Math.pow(c.y-node.y, 2);
                        });
                        return nearest;
                    });

                    graph[node.id] = _.compact(neighbors);
                });

                async.each(tiles.children, function (tile, done) {
                    var nearest = _.min(nodes, function (node) {
                        return Math.pow(tile.position.x-node.x, 2) + Math.pow(tile.position.y-node.y, 2);
                    })
                    game.add.tween(tile).to(nearest, 1000, Phaser.Easing.Quadratic.InOut, true, 500)
                    .chain(
                        game.add.tween(tile).to({ alpha: 0 }, 1000, Phaser.Easing.Quadratic.InOut, true, 500)
                    ).onComplete.add(function () {
                        tile.kill();
                        done();
                    });
                }, function(err) {
                    next();
                });

                // console.log(graph);
            },
            spawnNodes: function (next) {
                nodes.forEach(function (node) {
                    var city = game.add.sprite(node.x, node.y, '1x1');
                    city.scale.setTo(0);
                    city.anchor.set(0.5);
                    city.tint = 0xff00ff;
                    game.add.tween(city.scale).to({ x: node.size, y: node.size }, 500, Phaser.Easing.Quadratic.InOut, true)

                });

                next();
            }
        }, function (err, res) {
            console.log('level generated');
            if (loaded) {
                return loaded();
            }

        });
    };

    return Level;

});