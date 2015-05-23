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
    var glyphs = Settings.GLYPHS_IDS;

    var Level = function (g) {
        game = g;
        xRange.min = game.world.width / 2 - Settings.CODE_SIZE / 2;
        xRange.max = game.world.width / 2 + Settings.CODE_SIZE / 2;
        yRange.min = game.world.height / 2 - Settings.CODE_SIZE / 2;
        yRange.max = game.world.height / 2 + Settings.CODE_SIZE / 2;
    };

    function buildURL(levelNumber) {
        return 'http://' + game.serverIP + ':' + game.serverPort + '/player/?gameID='+game.gameID+'&level='+levelNumber;
    }

    Level.prototype.load = function (levelNumber) {
        code = new QRCode(document.getElementById("game-canvas"), {
            width : Settings.CODE_SIZE,
            height : Settings.CODE_SIZE
        });

        var url = buildURL(levelNumber);
        code.makeCode(url);
        console.log(url);

        grid = code.getData();

        var side = Settings.CODE_SIZE;
        var size = Math.floor(side / grid.length);

        var tiles = game.add.group();

        grid.forEach(function (row, i) {
            row.forEach(function (dark, j) {
                if (dark) {
                    var tile = game.add.sprite(game.world.centerX - side/2 + i*size, game.world.centerY - side/2 + j*size, '1x1');
                    tile.scale.setTo(size);
                    tile.anchor.set(0.5);
                    tile.tint = 0x0000ff;
                    tiles.add(tile);
                }
            });
        });

        for (var i = 0; i < nbNodes; i++) {
            nodes.push(new Node(i, game.rnd.integerInRange(xRange.min, xRange.max), game.rnd.integerInRange(yRange.min, yRange.max)));
        }

        tiles.children.forEach(function (tile) {
            var nearest = _.min(nodes, function (node) {
                return Math.pow(tile.position.x-node.x, 2) + Math.pow(tile.position.y-node.y, 2);
            })
            game.add.tween(tile).to(nearest, 1000, Phaser.Easing.Quadratic.In, true, 500);

        });

        // Construct the graph.
        // Each node has a maximum of neighbors equal to the number of glyphs - 1
        var nodesByGlyphID = _.groupBy(nodes, 'glyph');
        console.log(nodes);

        nodes.forEach(function (node) {
            var glyph = node.glyph;
            graph[node.id] = [];
            var neighbors = glyphs.filter(function (g) {
                return glyph !== g;
            }).map(function (glyphID) {
                if (!nodesByGlyphID[glyphID]) {
                    return null;
                }

                var nearest = _.min(nodesByGlyphID[glyphID], function (next) {
                    return Math.pow(next.x-node.x, 2) + Math.pow(next.y-node.y, 2);
                });
                return nearest;
            });

            graph[node.id] = _.compact(neighbors);
        });

        // console.log(graph);
    };

    return Level;

});