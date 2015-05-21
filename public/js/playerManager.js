'use strict';

define([], function () {

    var game;

    var PlayerManager = function (g) {
        game = g;
    };

    PlayerManager.prototype.add = function(netPlayer) {
        console.log('add player', netPlayer);
    };

    return PlayerManager;

});

