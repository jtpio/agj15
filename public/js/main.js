'use strict';

requirejs([
    './resourceManager',
    './playerManager',
    './networkManager',
    './level'
], function (ResourceManager, PlayerManager, NetworkManager, Level) {

    var game = new Phaser.Game(800, 800, Phaser.AUTO, 'game', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

    var resourceManager = new ResourceManager(game);
    var playerManager = new PlayerManager(game);
    var networkManager = new NetworkManager(game, playerManager);
    var level = new Level(game);
    level.load(1);

    function preload () {
        resourceManager.preload();
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

        resourceManager.create();
        networkManager.setupServer();
    }

    function restart () {
        resourceManager.restart();
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
