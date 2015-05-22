'use strict';

define([
    './qrcode'
], function (QRCode) {

    var game;
    var code;
    var grid;

    var Level = function (g) {
        game = g;
    };

    function buildURL(levelNumber) {
        return 'http://' + game.serverIP + ':' + game.serverPort + '/player/?gameID='+game.gameID+'&level='+levelNumber;
    }

    Level.prototype.load = function (levelNumber) {
        code = new QRCode(document.getElementById("game-canvas"), {
            width : 800,
            height : 800
        });

        var url = buildURL(levelNumber);
        code.makeCode(url);

        grid = code.getData();

        var graphics = game.add.graphics();
        graphics.beginFill(0x000000);

        var size = 8;

        grid.forEach(function (row, i) {
            row.forEach(function (dark, j) {
                if (dark) {
                    graphics.drawRect(i * size, j * size , size, size);
                }
            });
        });
        graphics.endFill();
    };

    return Level;

});