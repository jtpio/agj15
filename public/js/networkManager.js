'use strict';

define([
	'./lib/gameServer'
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

        server.addEventListener('newPlayer', function (netPlayer) {
            playerManager.add(netPlayer);
        });

        server.addEventListener('gameID', function (id) {
            game.sessionID = id;
            console.log(game.sessionID);
        });

	};

	return NetworkManager;

});