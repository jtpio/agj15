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
                    var tile = game.add.sprite(game.world.centerX - side/2 + i*size, game.world.centerY - side/2 + j*size, 'test', 'whitepx.png');
                    tile.scale.setTo(size);
                    tile.anchor.set(0.5);
                    tile.tint = '#0000FF';
                    tiles.add(tile);
                }
            });
        });

        for (var i = 0; i < nbNodes; i++) {
            nodes.push(new Node(game.rnd.integerInRange(xRange.min, xRange.max), game.rnd.integerInRange(yRange.min, yRange.max)));
        }

        tiles.children.forEach(function (tile) {
            var nearest = _.min(nodes, function (node) {
                return Math.pow(tile.position.x-node.x, 2) + Math.pow(tile.position.y-node.y, 2);
            })
            game.add.tween(tile).to(nearest, 1000, Phaser.Easing.Quadratic.In, true, 500);

        });
    };

    return Level;

});