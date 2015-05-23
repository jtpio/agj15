'use strict';

define([], function () {

    var game;

    var PlayerManager = function (g) {
        game = g;
    };

    PlayerManager.prototype.add = function(netPlayer) {
        console.log('add player', netPlayer);
        netPlayer.addEventListener('goto', function(data){
        	console.log(data);
        });
    };

    return PlayerManager;

});

