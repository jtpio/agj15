'use strict';

define([
    '../../lib/gameServer'
], function (GameServer) {

    var game;
    var server;
    var playerManager;

    var NetworkManager = function (g, pm) {
        game = g;
        playerManager = pm;
    };

    NetworkManager.prototype.setupServer = function () {
        server = new GameServer('server');

        server.addEventListener('newPlayer', function (player) {
            playerManager.add(player);
        });

        server.addEventListener('gameID', function (gameID) {
            console.log(gameID);
        });

    };

    return NetworkManager;

});