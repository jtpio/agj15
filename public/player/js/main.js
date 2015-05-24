'use strict';

requirejs([
    './networkManager',
    '../../lib/jquery.min.js',
    '../../lib/lodash.min.js'
], function (NetworkManager, jquery, lodash) {

    var windowWidth = jQuery(window).width();
    var windowHeight = jQuery(window).height();

    var btnWidth = 16;
    var btnHeight = 16;

    var btn0 = null;
    var btn1 = null;
    var btn2 = null;
    var btn3 = null;
    var bmd = null;
    var dico = null;
    var puzzle = false;
    var node = 0;
    var words = [];
    var animating = false;
    var sounds = [];
    var check = null, cross = null;

    var btnLocations = {
        x:[0.25, 0.75, 0.25, 0.75],
        y:[0.25, 0.25, 0.75, 0.75]
    };

    var btnScale = Math.min(windowWidth / 2, windowHeight / 2) / btnHeight;

    var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'player-canvas', {
        preload: preload,
        create: create
    }, false, false);


    var networkManager = new NetworkManager(game);
    networkManager.setupClient();

    function preload () {
        // Phaser.Canvas.setSmoothingEnabled(game.context, false);
        game.load.atlasJSONHash('controls', '../assets/img/game_spritesheet.png', '../assets/img/game_spritesheet.json');
        game.load.image('check', '../assets/img/check.png');
        game.load.image('cross', '../assets/img/cross.png');
        game.load.json('dico', 'res/rhymes.json');
        game.load.audio('wrong001', '../assets/sounds/wrong001.mp3');
        game.load.audio('wrong002', '../assets/sounds/wrong002.mp3');
        game.load.audio('correct', '../assets/sounds/correct.mp3');
    }

    function create () {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.stage.backgroundColor = '#afa03a';

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

        check = createIcon('check');
        cross = createIcon('cross');

        sounds.push(game.add.audio('wrong001'));
        sounds.push(game.add.audio('wrong002'));
        sounds.push(game.add.audio('correct'));

        dico = game.cache.getJSON('dico');
    }
    function createIcon(name){
        var sprite = game.add.sprite(0, 0, name);
        sprite.scale.setTo(btnScale);
        sprite.anchor.setTo(0.5);
        sprite.position.setTo(windowWidth/2, -sprite.height/2);
        return sprite;
    }
    function createButton(index){
        var btn = game.add.button(
            windowWidth * btnLocations.x[index],
            windowHeight * btnLocations.y[index],
            'controls',
            function(){
                if(!animating){
                    if(puzzle){
                        networkManager.getClient().sendCommand('puzzleSolved', {node:node, win:words[index].win});
                        if(words[index].win){
                            sounds[2].play();
                            check.position.setTo(windowWidth/2, -check.height/2);
                            game.add.tween(check.position).to({y:windowHeight/2}, 800, Phaser.Easing.Quintic.Out, true).onComplete.add(function(){
                                game.add.tween(check.position).to({y:windowHeight+check.height/2}, 800, Phaser.Easing.Quintic.In, true);
                            });
                        }else{
                            sounds[_.random(0, 1)].play();
                            cross.position.setTo(windowWidth/2, windowHeight/2);
                            cross.scale.setTo(0);
                            game.add.tween(cross.scale).to({x:btnScale, y:btnScale}, 800, Phaser.Easing.Elastic.InOut, true).onComplete.add(function(){
                                game.add.tween(cross.scale).to({x:0,y:0}, 800, Phaser.Easing.Elastic.InOut, true);
                            });
                        }
                        puzzle = false;
                        resetButtons();
                    }else{
                        networkManager.getClient().sendCommand('goto', {
                            glyph: index
                        });
                    }
                }
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
        animating = true;
        var scale = (windowHeight/4)/(btnHeight*2);
        var offsetY = (windowHeight/4);
        game.add.tween(btn.scale).to({x:scale,y:scale}, 250, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(){
            game.add.tween(btn).to({x:btn.width/2,y:(index+1)*offsetY-offsetY/2}, 250, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(){
                var text = game.make.text(0, 0, data, { font: "bold "+btn.height/2+"px pixelArt", fill: "#fff" });
                text.anchor.set(0, 0.5);
                bmd.draw(text, btn.x+btn.width/2, btn.y);
                animating = false;
            },this);
        }, this);
    }
    function optionToBtn(btn, index){
        animating = true;
        game.add.tween(btn.scale).to({x:btnScale,y:btnScale}, 250, Phaser.Easing.Quadratic.InOut, true);
        game.add.tween(btn).to(
            {
                x:windowWidth*btnLocations.x[index],
                y:windowHeight*btnLocations.y[index]
            },
            250, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(){
                animating = false;
            });

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
    networkManager.getClient().addEventListener('movedTo', function(data){
        var dif = dico[data.puzzle];
        var wrongWords = _.pullAt(dif, Math.floor(Math.random()*dif.length));
        var correctWord = _.pullAt(dif, Math.floor(Math.random()*dif.length));
        words = [];
        for(var i = 0; i < wrongWords[0].length; i++){
            words.push({word:wrongWords[0][i], win:false});
        }
        words.push({word:correctWord[0][0], win:true});
        words = _.shuffle(words);

        btnToOption(btn0, 0, words[0].word);    
        btnToOption(btn1, 1, words[1].word);
        btnToOption(btn2, 2, words[2].word);
        btnToOption(btn3, 3, words[3].word);

        puzzle=true;

        node = data.node;

        bmd.clear();
    });

    networkManager.getClient().addEventListener('init', function(){
        resetButtons();
        animating = false;
        puzzle = false;
        if(bmd)bmd.clear();
    });

    function toggleFullScreen() {
        if (game.scale.isFullScreen) {
            game.scale.stopFullScreen();
        } else {
            game.scale.startFullScreen();
        }
    }
});
