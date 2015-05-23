'use strict';

define([], function () {

    var game;
    var players = {};

    var PlayerManager = function (g) {
        game = g;
    };

    PlayerManager.prototype.add = function(netPlayer) {

        console.log('add player', netPlayer);

        players[netPlayer.id] = netPlayer;

        netPlayer.addEventListener('goto', function(data){
        	console.log(data);
        });

        netPlayer.sendCommand('puzzle', ['a','b','c']);
    };

    return PlayerManager;

});

