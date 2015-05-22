'use strict';

requirejs([
    './networkManager',
], function (NetworkManager) {

    var game = new Phaser.Game(800, 800, Phaser.AUTO, 'player-canvas', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.backgroundColor = '#0000ff';
    }

    function restart () {
    }

    function update () {

    }

    function render () {
        // debug stuff maybe
    }

    function toggleFullScreen() {
        if (game.scale.isFullScreen) {
            game.scale.stopFullScreen();
        } else {
            game.scale.startFullScreen();
        }
    }

});
