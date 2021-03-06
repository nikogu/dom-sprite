
//Sprite Instance
var sister = new Sprite({
    ctx: document.getElementById('dom-sprite'),
    res: 'http://gtms04.alicdn.com/tps/i4/TB11wd2FVXXXXcbXXXXo12dMVXX-6555-285.png',
    count: 23,
    width: 285,
    height: 285,
    row: 1,
    spf: 50,
    anim: {
        //mapping frame to the image data
        'runRight': [15, 22],
        'runLeft': [7, 14],
        'static': [1],
        'jump': [0],
        'jumpFalling': [1, 6],
        'falling': [2, 6]
    },
    //custom property
    status: 'static'
});

console.log(sister.view);

//set transform property
sister.set({
    'scale': 0.5,
    'y': 200,
    opacity: 0
});

console.log(sister.view);

sister.run(50, ['static'], 1, function () {
    console.log(sister.cAnim.name);
    console.log(sister.cAnim.getName());
});


sister.tween({
    opacity: 1
}, 2000, 'easeIn');

//game ticke
var ticker = new Sprite.Ticker();
ticker.addTask(function() {
    switch (sister.status) {
        case 'run-left':
            sister.set('x', sister.get('x') - 4);
            break;
        case 'run-right':
            sister.set('x', sister.get('x') + 4);
            break;
        default:
            break;
    }
});
ticker.start();

//Interaction
window.addEventListener('keydown', function (e) {
    //39 ->
    //37 <-
    //38 u
    //40 d
    var x,
        y;

    switch (e.keyCode) {
        case 39:
            sister.status = 'run-right';
            if (sister.cAnim.name != 'runRight') {
                sister.run(100, 'runRight');
            }
            break;
        case 37:
            sister.status = 'run-left';
            if (sister.cAnim.name != 'runLeft') {
                sister.run('runLeft', 5, function () {
                });
            }
            break;
        case 38:
            if (!sister.isJumping) {

                sister.isJumping = true;
                y = sister.get('y');
                sister.run(sister.cAnim.name);
                sister.update();
                sister.pause();

                ticker.addTask(function(t, p) {
                    sister.set('y', y - Math.sin(p * Math.PI) * 240);
                    if (t >= 300 &&
                        sister.cAnim.name != 'jumpFalling' &&
                        sister.cAnim.name == 'jump') {

                        sister.run('jumpFalling');

                    }
                }, {
                    duration: 800,
                    callback: function() {
                        sister.start();
                        sister.set('y', y);
                        sister.isJumping = false;
                        if (sister.cAnim.name == 'jumpFalling'
                            || sister.cAnim.name == 'falling') {

                            sister.run('static');
                        }
                    }
                });
            }
            if (sister.cAnim.name == 'static') {
                sister.run('jump');
            }
            break;
        case 40:
            sister.status = 'falling';
            if (sister.cAnim.name != 'falling') {
                sister.run('falling');
            }
            break;
        default:
            break;
    }

});

//Interaction
window.addEventListener('keyup', function (e) {

    switch (e.keyCode) {
        case 39:
            sister.status = 'static';
            sister.run('static');
            break;
        case 37:
            sister.status = 'static';
            sister.run('static');
            break;
        case 38:
            //sister.status = 'static';
            break;
        case 40:
            sister.status = 'static';
            sister.run('static');
            break;
        default:
            break;
    }

});
