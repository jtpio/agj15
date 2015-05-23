'use strict';

requirejs([
    './networkManager',
    '../../lib/jquery.min.js'
], function (NetworkManager, jquery) {

    var windowWidth = jQuery(window).width();
    var windowHeight = jQuery(window).height();

    var btn0 = null;
    var btn1 = null;
    var btn2 = null;
    var btn3 = null;

    var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'player-canvas', {
        preload: preload,
        create: create,
        update: update,
        render: render
    });


    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {
        // Phaser.Canvas.setSmoothingEnabled(game.context, false);
        game.load.atlasJSONHash('controls', 'sprites/game_spritesheet.png', 'sprites/game_spritesheet.json');
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.backgroundColor = '#808080';


        var btnWidth = 16;
        var btnHeight = 16;

        // Init buttons
        btn0 = game.add.button(
            windowWidth * 0.25, 
            windowHeight * 0.25, 
            'controls', 
            function(){
                console.log('Moving to 0');
                networkManager.getClient().sendCommand('goto', 0);
            }, 
            this, 
            'Phone_Glyph001.PNG', 
            'Phone_Glyph001.PNG', 
            'Phone_Glyph001.PNG'
        );
        btn0.name = 'btn0';
        btn0.anchor.setTo(0.5, 0.5);
        btn0.scale.setTo(4, 4);

        btn1 = game.add.button(
            windowWidth * 0.75, 
            windowHeight * 0.25, 
            'controls', 
            function(){
                console.log('Moving to 1');
                networkManager.getClient().sendCommand('goto', 1);
            }, 
            this, 
            'Phone_Glyph002.png', 
            'Phone_Glyph002.png', 
            'Phone_Glyph002.png'
        );
        btn1.name = 'btn1';
        btn1.anchor.setTo(0.5, 0.5);
        btn1.scale.setTo(4, 4);


        btn2 = game.add.button(
            windowWidth * 0.25, 
            windowHeight * 0.75, 
            'controls', 
            function(){
                console.log('Moving to 2');
                networkManager.getClient().sendCommand('goto', 2);
            }, 
            this, 
            'Phone_Glyph003.PNG', 
            'Phone_Glyph003.PNG', 
            'Phone_Glyph003.PNG'
        );
        btn2.name = 'btn2';
        btn2.anchor.setTo(0.5, 0.5);
        btn2.scale.setTo(4, 4);


        btn3 = game.add.button(
            windowWidth * 0.75, 
            windowHeight * 0.75, 
            'controls', 
            function(){
                console.log('Moving to 3');
                networkManager.getClient().sendCommand('goto', 3);
            }, 
            this, 
            'Phone_Glyph004.PNG', 
            'Phone_Glyph004.PNG', 
            'Phone_Glyph004.PNG'
        );
        btn3.name = 'btn3';
        btn3.anchor.setTo(0.5, 0.5);
        btn3.scale.setTo(4, 4);
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
