'use strict';

define([
    '../../lib/gameClient'
], function (GameClient) {

    var game;
    var client;

    var NetworkManager = function (g) {
        game = g;
    };

    NetworkManager.prototype.setupClient = function () {
        client = new GameClient();

        client.addEventListener('joined', function () {
            console.log('joined')
        });

        client.join(1);

    };

    return NetworkManager;

});