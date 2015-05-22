'use strict';

define([
    '../../lib/qrcode'
], function () {

    var game;
    var code;

    var Level = function (g) {
        game = g;
    };

    Level.prototype.load = function (levelNumber) {
        /*code = new QRCode();
        var grid = code.makeCode();
        console.log(grid);*/
    };

    return Level;

});