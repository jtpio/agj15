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
        return 'http://' + game.serverIP + ':' + game.serverPort + '/player?gameID='+game.gameID+'&level='+levelNumber;
    }

    Level.prototype.load = function (levelNumber) {
        code = new QRCode(document.getElementById("game-canvas"), {
            width : 800,
            height : 800
        });

        var url = buildURL(levelNumber);
        code.makeCode(url);
        console.log(url);

        grid = code.getData();

        console.log(grid);
    };

    return Level;

});