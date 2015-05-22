'use strict';

requirejs([
    './resourceManager',
    './playerManager',
    './networkManager',
    './level'
], function (ResourceManager, PlayerManager, NetworkManager, Level) {

    var game = new Phaser.Game(800, 800, Phaser.AUTO, 'game-canvas', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });

    var resourceManager;
    var playerManager;
    var networkManager;
    var level;

    function preload () {
        resourceManager = new ResourceManager(game);
        playerManager = new PlayerManager(game);
        networkManager = new NetworkManager(game, playerManager);
        level = new Level(game);

        resourceManager.preload();
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.backgroundColor = '#FFFFFF';

        resourceManager.create();
        networkManager.setupServer(function (gameID) {
            // generate level 1
            level.load(1);
        });

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
