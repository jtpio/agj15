'use strict';

define([
    './qrcode',
    './node',
    './settings'
], function (QRCode, Node, Settings) {

    var game;
    var code;
    var grid;

    var PADDING = 25;

    var Level = function (g) {
        game = g;
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

        var nodes = [
            new Node(game.rnd.integerInRange(PADDING, game.world.width - PADDING), game.rnd.integerInRange(PADDING, game.world.height - PADDING)),
            new Node(game.rnd.integerInRange(PADDING, game.world.width - PADDING), game.rnd.integerInRange(PADDING, game.world.height - PADDING)),
            new Node(game.rnd.integerInRange(PADDING, game.world.width - PADDING), game.rnd.integerInRange(PADDING, game.world.height - PADDING))
        ];

        console.log(nodes);

        tiles.children.forEach(function (tile) {

            var dest = _.min(nodes, function (node) {
                return Math.pow(tile.position.x-node.x, 2) + Math.pow(tile.position.y-node.y, 2);
            })

            // game.add.tween(tile).to(dest, 5000, Phaser.Easing.Quadratic.In, true, 500);

        });
    };

    return Level;

});