'use strict';

requirejs([
    './resourceManager',
    './playerManager',
    './networkManager',
    './settings'
], function (ResourceManager, PlayerManager, NetworkManager, Settings) {

    var game = new Phaser.Game(Settings.WIDTH, Settings.HEIGHT, Phaser.AUTO, 'game-canvas', {
        preload: preload,
        create: create,
        update: update,
        render: render
    }, false, false);

    var resourceManager;
    var playerManager;
    var networkManager;

    var pauseKey;

    function preload () {
        resourceManager = new ResourceManager(game);
        playerManager = new PlayerManager(game);
        networkManager = new NetworkManager(game, playerManager);

        resourceManager.preload();
    }

    function create () {

        // maybe remove that
        game.stage.disableVisibilityChange = true;

        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.backgroundColor = '#afa03a';
        resourceManager.create();

        async.series([
            function (callback) {
                networkManager.setupServer(function (gameID) {
                    callback();
                });
            }
        ], function (err, results) {
            console.log('ready');
            playerManager.loop();
        });


        // debug
        pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        pauseKey.onUp.add(function () {
            game.paused = !game.paused;
            CLOCK.running ? CLOCK.stop() : CLOCK.start();
        });

        // game.sound.setMute(true);
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
