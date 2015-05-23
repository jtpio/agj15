'use strict';

define([
    '../../lib/gameClient'
], function (GameClient) {

    var game;
    var client;

    var NetworkManager = function (g) {
        game = g;
    };

    NetworkManager.prototype.getQueryVariable = function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
    };

    NetworkManager.prototype.setupClient = function () {
        client = new GameClient();

        client.addEventListener('joined', function () {
            console.log('Joined game');

            // client.sendCommand('goto', 'world');
        });

        
        console.log('Joining game ' + this.getQueryVariable('gameID') + '...');
        client.join(this.getQueryVariable('gameID'));

    };

    NetworkManager.prototype.getClient = function(){
        return client;
    };

    return NetworkManager;

});