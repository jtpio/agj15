'use strict';

requirejs([
    './networkManager',
    '../../lib/jquery.min.js'
], function (NetworkManager, jquery) {

    var windowWidth = jQuery(window).width();
    var windowHeight = jQuery(window).height();

    var btnWidth = 16;
    var btnHeight = 16;

    var btn0 = null;
    var btn1 = null;
    var btn2 = null;
    var btn3 = null;
    var bmd = null;

    var check = null, cross = null;

    var btnLocations = {
        x:[0.25, 0.75, 0.25, 0.75],
        y:[0.25, 0.25, 0.75, 0.75]
    };

    var btnScale = Math.min(windowWidth / 2, windowHeight / 2) / btnHeight;

    var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'player-canvas', {
        preload: preload,
        create: create,
        update: update,
        render: render
    }, false, false);


    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {
        // Phaser.Canvas.setSmoothingEnabled(game.context, false);
        game.load.atlasJSONHash('controls', '../assets/img/game_spritesheet.png', '../assets/img/game_spritesheet.json');
        game.load.image('check', '../assets/img/check.png');
        game.load.image('cross', '../assets/img/cross.png');
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.backgroundColor = '#808080';

        createIcon(check, 'check');
        createIcon(cross, 'cross');

        btn0 = createButton(0);
        btn1 = createButton(1);
        btn2 = createButton(2);
        btn3 = createButton(3);

        // Drawing lines
        bmd = game.add.bitmapData(windowWidth, windowHeight);
        bmd.ctx.beginPath();
        bmd.ctx.lineWidth = "4";
        bmd.ctx.strokeStyle = 'white';
        bmd.ctx.stroke();

        game.add.sprite(0, 0, bmd);

        drawCross();

        networkManager.getClient().addEventListener('puzzle', function(data){
            console.log(data);
            var scale = (windowHeight/4)/btnHeight;
            var offsetY = (windowHeight/4);

            btnToOption(btn0, 0, data);
            btnToOption(btn1, 1, data);
            btnToOption(btn2, 2, data);
            btnToOption(btn3, 3, data);

            bmd.clear();
        });
    }
    function createIcon(sprite, name){
        sprite = game.add.sprite(0, 0, name);
        sprite.scale.setTo(btnScale);
        sprite.anchor.setTo(0.5);
        sprite.position.setTo(windowWidth/2, sprite.height);
    }
    function createButton(index){
        var btn = game.add.button(
            windowWidth * btnLocations.x[index],
            windowHeight * btnLocations.y[index],
            'controls',
            function(){
                console.log('Moving to '+index);
                networkManager.getClient().sendCommand('goto', {
                    glyph: index
                });
                resetButtons();
            },
            this,
            'Phone_Glyph00'+(index+1) + '.png',
            'Phone_Glyph00'+(index+1) + '.png',
            'Phone_Glyph00'+(index+1) + '.png'
        );
        btn.name = 'btn'+index;
        btn.anchor.setTo(0.5);
        btn.scale.setTo(btnScale);
        return btn;
    }
    function btnToOption(btn, index, data){
        var scale = (windowHeight/4)/(btnHeight*2);
        var offsetY = (windowHeight/4);
        game.add.tween(btn.scale).to({x:scale,y:scale}, 250, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(){
            game.add.tween(btn).to({x:btn.width/2,y:(index+1)*offsetY-offsetY/2}, 250, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(){
                var text = game.make.text(0, 0, data[index], { font: "bold "+btn.height/2+"px Arial", fill: "#fff" });
                text.anchor.set(0, 0.5);
                bmd.draw(text, btn.x+btn.width/2, btn.y);
            },this);
        }, this);
    }
    function optionToBtn(btn, index){
        game.add.tween(btn.scale).to({x:btnScale,y:btnScale}, 250, Phaser.Easing.Quadratic.InOut, true);
        game.add.tween(btn).to(
            {
                x:windowWidth*btnLocations.x[index],
                y:windowHeight*btnLocations.y[index]
            },
            250, Phaser.Easing.Quadratic.InOut, true);

    }
    function resetButtons(){
        optionToBtn(btn0, 0);
        optionToBtn(btn1, 1);
        optionToBtn(btn2, 2);
        optionToBtn(btn3, 3);
        drawCross();
    }
    function drawCross(){
        bmd.clear();
        bmd.ctx.beginPath();
        bmd.ctx.moveTo(windowWidth / 2, 0);
        bmd.ctx.lineTo(windowWidth / 2, windowHeight);
        bmd.ctx.lineWidth = 4;
        bmd.ctx.stroke();
        bmd.ctx.closePath();
        bmd.render();

        bmd.ctx.beginPath();
        bmd.ctx.moveTo(0, windowHeight / 2);
        bmd.ctx.lineTo(windowWidth, windowHeight / 2);
        bmd.ctx.lineWidth = 4;
        bmd.ctx.stroke();
        bmd.ctx.closePath();
        bmd.render();

    }
    function update () {

    }
    function render () {

    }

    function toggleFullScreen() {
        if (game.scale.isFullScreen) {
            game.scale.stopFullScreen();
        } else {
            game.scale.startFullScreen();
        }
    }
});
