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

    NetworkManager.prototype.setupServer = function (ready) {
        server = new GameServer('server');

        server.addEventListener('newPlayer', function (player) {
            playerManager.add(player);
        });


        server.addEventListener('gameID', function (res) {
            console.log('ready', res.gameID);
            game.gameID = res.gameID;
            game.serverIP = res.serverIP;
            game.serverPort = res.serverPort;
            return ready();
        });

    };

    return NetworkManager;

});