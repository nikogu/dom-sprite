(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Game Sprite
 *
 * @url http://nikogu.github.io/game-sprite/
 * @date 2015-02-28
 * @author niko
 *
 */
var Transform = require('./mod/sprite-transform'),
    Ticker = require('./mod/sprite-ticker'),
    Easing = require('./mod/sprite-easing');

var U = require('./mod/sprite-util'),
    SpriteAnimation = require('./mod/sprite-animation'),
    SpriteRender = require('./mod/sprite-render');

function Sprite(_o) {

    var o = _o || {};

    //基本属性设置
    for (var prop in o) {
        if (o.hasOwnProperty(prop)) {
            this[prop] = o[prop];
        }
    }

    //一般情况指非tp数据使用
    //其中tp===texturepicker

    /**
     * 资源对象
     * 一般来说是图片路径，在canvas模式下是image对象
     * 如果是使用tp数据，则需要json数据和图片路径
     *
     * @property res
     * @type {Object}
     * @default {}
     */
    //this.res = o.res;

    /**
     * 一般情况下表示总帧数
     *
     * @property count
     * @type {Number}
     * @default 0
     */
    this.count = o.count || 0;

    /**
     * 动画SPF
     *
     * @property spf
     * @type {Number}
     * @default 100
     */
    this.spf = o.spf || 100;

    /**
     * 表示每帧的的宽度
     *
     * @property width
     * @type {Number}
     * @default 0
     */
    this.width = o.width || 0;

    /**
     * 表示每帧的的高度
     *
     * @property height
     * @type {Number}
     * @default 0
     */
    this.height = o.height || 0;

    /**
     * Sprite图片资源的行数
     * 可以通过设置row来设置一张图片的换行
     *
     * @property row
     * @type {Number}
     * @default 1
     */
    this.row = o.row || 1;

    /**
     * Sprite动画是否暂停
     *
     * @property isPause
     * @type {Boolean}
     * @default false
     */
    this.isPause = false;

    /**
     * Spirte帧数在图片中每行的个数
     *
     * @property rowNumber
     * @type {Number}
     * @default 1
     */
    this.rowNum = Math.ceil(this.count / this.row);

    /**
     * 一般情况下 Sprite动画信息对象
     *
     * @property anim
     * @type {Object}
     * @default undefined
     */
    //this.anim = o.anim || undefined;

    /**
     * 当前动画
     *
     * @property cAnim
     * @type {SpriteAnimation}
     * @default undefined
     */
    //this.cAnim = undefined;

    /**
     * 一般情况下 当前帧数
     *
     * @property cFrame
     * @type {Number}
     * @default 0
     */
    this.cFrame = 0;

    /**
     * 动画播放的次数
     *
     * @property playCount
     * @type {Number}
     * @default 0
     */
    this.playCount = 0;

    /**
     * 当前动画已经播放的次数
     *
     * @property playCurrentCount
     * @type {Number}
     * @default 0
     */
    this.playCurrentCount = 0;

    /**
     * 规定次数的动画播放完执行的回调
     *
     * @property playCallback
     * @type {Function}
     * @default undefined
     */
    this.playCallback = undefined;

    //私有成员变量
    /**
     * Sprite私有动画对象
     *
     * @property _animation
     * @type {Object}
     * @default {}
     * @private
     */
    this._animation = {};

    /**
     * Sprite当前动画队列
     *
     * @property _animQueue
     * @type {Object}
     * @default {}
     * @private
     */
    this._animQueue = {};

    /**
     * 缓存时间
     *
     * @property _otime
     * @property _ntime
     * @type {Number}
     * @default new Date().getTime()
     * @private
     */
    this._otime = new Date().getTime();
    this._ntime = this._otime;

    /**
     * 单个动画repeat次数
     *
     * @property _sRepeatCount
     * @type {Number}
     * @default 0
     * @private
     */
    this._sRepeatCount = 0;

    /**
     * 用于标示在渲染周期中是否更新视图
     * 主要兼容canvas的每帧渲染
     *
     * @property _isUpdate
     * @type {Boolean}
     * @default false
     * @private
     */
    this._isUpdate = false;

    /**
     * 用于标示Sprite是否已经渲染
     *
     * @property _isRendered
     * @type {Boolean}
     * @default false
     * @private
     */
    this._isRendered = false;


    /**
     * 表示Sprite是否销毁
     *
     * @property _isRendered
     * @type {Boolean}
     * @default false
     * @private
     */
    this._isRendered = false;

    /**
     * 渲染方式
     *
     * @property _renderType
     * @type {String}
     * @default ''
     * @private
     */
    this._renderType = '';

    //初始化
    //如果使用了texturepick
    if (this.res.json) {
        this._isTexturePicker = true;
        this._setData();
    }

}

//++++++++++++++++++++++
//私有方法
//++++++++++++++++++++++
U.method(Sprite, {
    /**
     * 整理texture导出的json数据便于操作
     *
     * @method _setDate
     * @return {this}
     * @private
     */
    _setData: function () {
        //私有
        this._data = this.res.json;

        var o = {},
            name = '',
            num = 0,
            frames = '',
            k = '';

        if (!this._data._gamasprite) {
            this._data._gamasprite = {};

            for (var anim in this._data.frames) {

                frames = this._data.frames[anim].frame;

                name = anim.replace(/\.\w*/ig, '');
                k = name.replace(/-\d+$/ig, '');

                if (!this._data._gamasprite[k]) {
                    this._data._gamasprite[k] = [];
                }

                num = /-(\d+)$/ig.exec(name);

                if (!num || num[1] === undefined) {
                    this._data._gamasprite[k][0] = frames;
                } else {
                    this._data._gamasprite[k][num[1]] = frames;
                }

            }
        }

        this.pickData = this._data._gamasprite;

        return this;
    },
    /**
     * 拼完整的anim数据
     * [0, 1, 'next', 100]
     */
    _perfectAnim: function (anims, spf) {
        var ao = U.clone(this.anim),
            res = {},
            count = 0,
            a,
            first;

        if (U.isString(anims)) {
            anims = [anims];
        }
        if (!anims || anims.length < 1) {
            throw new Error('need animation');
        }

        first = anims[0];

        for (var i = 0, len = anims.length; i < len; i++) {
            a = ao[anims[i]].concat();
            if (!a[1]) {
                a[1] = a[0];
            }
            if (anims[i + 1]) {
                a.push(anims[i + 1]);
            } else if (i == len - 1) {
                a.push(first);
            } else {
                a.push(anims[i]);
            }
            a.push(spf);

            //已存在此动画
            if (res[anims[i]]) {
                res[anims[i] + '_gcount_' + count] = a.concat();
                //修改上一个动画的下一个动画的名称
                if (res[anims[i - 1]]) {
                    res[anims[i - 1]][2] = anims[i] + '_gcount_' + count;
                }
                count++;
            } else {
                res[anims[i]] = a.concat();
            }
        }

        return {
            first: first,
            anims: res,
            length: len
        };

    },
    /**
     * 一般情况下，根据参数设置Sprite动画
     *
     * @method _setAnim
     * @return {this}
     * @private
     */
    _setAnim: function (anims, spf) {

        var perfectAnim = this._perfectAnim(anims, spf),
            ao = perfectAnim.anims,
            first = perfectAnim.first,
            next;

        if (ao) {
            for (var anim in ao) {
                this._animation[anim] = new SpriteAnimation(anim, ao);
            }

            //设置下一动画对象
            for (var anim in this._animation) {
                next = this._animation[anim].nextAnimationName;
                if (next) {
                    this._animation[anim].setNextAnim(this._animation[next]);
                }
            }
        }

        this.cAnim = this._animation[first];
        this._animation.length = perfectAnim.length;
        this.cFrame = this.cAnim.ocFrame + this.cAnim.firstFrame;

        return this;
    },
    /**
     * 适配texturepicker数据的动画
     *
     * @method _setAnimOfTP
     * @return {this}
     * @private
     */
    _setAnimOfTP: function (anims, spf) {

        this.anim = {};
        if (U.isString(anims)) {
            anims = [anims];
        }
        //转换anim
        for (var i = 0; i < anims.length; i++) {
            try {
                if (!this.anim[anims[i]]) {
                    this.anim[anims[i]] = [0, this.pickData[anims[i]].length - 1];
                }
            } catch (e) {
                throw new Error('there is no ' + anims[i] + ' animation');
            }
        }

        //设置动画
        this._setAnim(anims, spf);

        for (var a in this._animation) {
            this._animation[a]._data = this.pickData[a];
        }

        return this;
    },
    /**
     * 动画进行操作
     *
     * @method _playAnim
     * @return {this}
     * @private
     */
    _playAnim: function () {

        if (this.cAnim.rate < 0) {
            this.pause();
            this._update();
            return this;
        }
        this._ntime = new Date().getTime();
        //如果已经超过规定的速率，则进行下一帧
        if (this._ntime - this._otime >= this.cAnim.rate) {
            this._nextFrame();

            //更新时间
            this._otime = this._ntime;
        }

        return this;

    },
    //渲染器会重写两个方法
    _render: function () {
    },
    _update: function () {
    },
    /**
     * 进行下一帧的计算
     *
     * @method _nextFrame
     * @return {this}
     * @private
     */
    _nextFrame: function (callback) {

        this.cAnim.ocFrame++;

        //当前是最后一帧
        if (this.cAnim.ocFrame == this.cAnim.totalFrame - 1 || this.cAnim.totalFrame == 1) {
            this._sRepeatCount++;
            if (this._sRepeatCount % this._animation.length == 0) {
                //有计数需求
                if (this.playCount > 0) {
                    this.playCurrentCount++;
                    if (this.playCurrentCount >= this.playCount) {
                        this.playCurrentCount = 0;
                        this.playCount = 0;
                        this.stop();
                        this.cFrame = this.cAnim.lastFrame;
                        this._update();
                        this.playCallback.call(this);
                        return this;
                    }
                }
            }
        }

        //超过应有的帧数
        if (this.cAnim.ocFrame >= this.cAnim.totalFrame) {

            if (this.cAnim.nextAnimation) {
                this.cAnim = this.cAnim.nextAnimation;
                this.cAnim.ocFrame = 0;
                this.cFrame = this.cAnim.ocFrame + this.cAnim.firstFrame;
                this._update();
            } else {
                this.pause();
                this._update();
            }

            return this;

        }

        this.cFrame = this.cAnim.ocFrame + this.cAnim.firstFrame;
        this._update();

        return this;
    },
    /**
     * 创造动画序列
     */
    _createAnimQueue: function (anims, count, callback, spf) {
        var spf = spf || this.spf;

        this._sRepeatCount = 0;
        this.playCount = count;
        this.playCallback = callback || function () {
            };

        if (this._isTexturePicker) {
            this._setAnimOfTP(anims, spf);
        } else {
            this._setAnim(anims, spf);
        }

        return this;
    }
});

//++++++++++++++++++++++
//公有方法
//++++++++++++++++++++++
U.method(Sprite, {
    /**
     * 设置属性
     *
     * @method set
     * @return {this}
     */
    set: function (arg1, arg2) {
        Transform.set(this, arg1, arg2);
        return this;
    },
    /**
     * 读取属性
     *
     * @method get
     * @return {Object} 值
     */
    get: function (arg) {
        return Transform.get(this, arg);
    },
    /**
     * 方便用户直接跑起来
     *
     * @method run
     * @return {this}
     */
    run: function () {
        var that = this;

        that.play.apply(this, arguments);

        if (!that.tm) {
            that.tm = new Ticker();
        }
        if (!that.tk) {
            that.tm.addTask(function (t, percent) {
                that.update();
            });
        }

        that.tm.start();
    },
    /**
     * 渲染视图
     * 调用此方法就根据上下文绘制sprite
     * 通过SpritRender进行渲染处理
     *
     * @method draw
     * @param {Object} name 动画名称
     * @param {Function} [crender] 用户自定义渲染函数
     * @param {Function} [cdistroy] 用户自定义销毁函数
     * @return {this}
     */
    draw: function (name, crender, cdistroy) {

        if (this._isRendered) {
            return this;
        }
        this._isRendered = true;

        if (this.cAnim === undefined) {
            try {
                this.play(name);
            } catch (e) {
                throw new Error('need animation name');
            }
        }

        if (!this.ctx) {
            throw new Error('need render ctx');
        }

        SpriteRender.setRender.call(this, crender, cdistroy);

        this._render();

        if (this._gattr_) {
            this._gattr_._setTransform = undefined;
            Transform.setTransform(this);
        }

        this.update();

        return this;
    },
    /**
     * 销毁Sprite视图
     *
     * @method destroy
     * @return {this}
     */
    destroy: function () {
        this._isRendered = false;

        SpriteRender.setDestroy.call(this);

        this.stop();

        return this;
    },
    /**
     * 进行精灵动画
     *
     * @method play
     * @return {this}
     */
    play: function () {

        var args = arguments;

        if (U.isNumber(args[0])) {
            this._createAnimQueue(args[1], args[2], args[3], args[0]);
        } else {
            this._createAnimQueue(args[0], args[1], args[2]);
        }

        if (!this._isRendered) {
            this.draw();
        }

        this.start();

        return this;
    },
    /**
     * 开始动画
     *
     * @method start
     * @return {this}
     */
    start: function () {
        this.isPause = false;
        return this;
    },
    /**
     * 暂停动画
     *
     * @method pause
     * @return {this}
     */
    pause: function () {
        this.isPause = true;
        return this;
    },
    /**
     * 停止时间轴
     *
     * @method stop
     * @return {this}
     */
    stop: function () {

        this.pause();

        if (this.tk && this.tk.stop) {
            this.tk.stop();
            this.tk = undefined;
        }

        return this;
    },
    /**
     * 更新Sprite动画帧
     *
     * @method update
     * @return {this}
     */
    update: function (t) {
        if (!this._isRendered) {
            return this;
        }
        this._isUpdate = false;

        //针对于canvas没帧强制渲染
        if (this.isPause) {
            if (this._force) {
                this._update();
            }
            return this;
        }

        //播放动画
        if (this.cAnim) {
            this._playAnim();
        }

        if (this._force && !this._isUpdate) {
            this._update();
        }

        return this;
    }
});

//only apply on dom
U.method(Sprite, {
    hide: function () {
        this.view.style.opacity = 0;
        this.view.style.display = 'none';
    },
    show: function () {
        this.view.style.opacity = 1;
        this.view.style.display = 'block';
    },
    tween: function (o, duration, easing, callback, delay) {
        var that = this,
            duration = duration || 1000,
            easing = easing || 'easeIn';

        var oldVal = {},
            diff = {};
        for (var i in o) {
            oldVal[i] = that.get(i);
            diff[i] = o[i] - oldVal[i];
        }

        var ticker = new Ticker();
        ticker.addTask(function (t, percent) {
            for (var i in oldVal) {
                that.set(i, Easing[easing](percent) * diff[i] + oldVal[i]);
            }
        }, {
            delay: delay || 0,
            duration: duration,
            callback: function () {
                for (var i in o) {
                    that.set(i, o[i]);
                }
                if (callback) {
                    callback.call(that);
                }
            }
        });
        ticker.start();
    }
});

Sprite.Ticker = Ticker;
Sprite.Transform = Transform;
if (window) {
    window.Sprite = Sprite;
}
module.exports = Sprite;

},{"./mod/sprite-animation":2,"./mod/sprite-easing":3,"./mod/sprite-render":5,"./mod/sprite-ticker":6,"./mod/sprite-transform":7,"./mod/sprite-util":8}],2:[function(require,module,exports){
/*
 * SpriteAnimation
 *
 * @date 2014-08-04
 * @author niko
 *
 */

var U = require('./sprite-util');

function SpriteAnimation(name, args) {

    this.args = args[name];

    /**
     * 动画名称
     *
     * @property name
     * @type {String}
     * @default ''
     */
    this.name = name || '';

    /**
     * 第一帧的帧数
     *
     * @property firstFrame
     * @type {Number}
     * @default 0
     */
    this.firstFrame = this.args[0] || 0;

    /**
     * 最后一帧的帧数
     *
     * @property lastFrame
     * @type {Number}
     * @default 0
     */
    this.lastFrame = this.args[1] || 0;

    /**
     * 下一动画名称
     *
     * @property nextAnimationName
     * @type {String}
     * @default ''
     */
    this.nextAnimationName = this.args[2];

    /**
     * 动画总帧数
     *
     * @property totalFrame
     * @type {Number}
     * @default 0
     */
    this.totalFrame = this.lastFrame - this.firstFrame + 1;

    /**
     * 动画当前定格的帧数，相对于动画本身
     *
     * @property ocFrame
     * @type {Number}
     * @default 0
     */
    this.ocFrame = 0;

    /**
     * 每帧动画的间隔数
     *
     * @property rate
     * @type {Number}
     * @default 100
     */
    this.rate = this.args[3] || 100;

}

U.method(SpriteAnimation, {
    /**
     * 设置下一动画
     *
     * @method setNextAnim
     * @return {this}
     */
    setNextAnim: function (anim) {
        this.nextAnimation = anim;
        return this;
    },
    getName: function () {
        return this.name.replace(/_gcount_[\d+]+/ig, '');
    }
});

module.exports = SpriteAnimation;


},{"./sprite-util":8}],3:[function(require,module,exports){
/**
 *
 * gama-easing.js
 * 缓动公式库
 *
 * @author yujiang
 * @date 2014-08-06
 *
 */

//++++++++++++++++++++++
// Tween效果
// copy KISSY Anim
// https://github.com/kissyteam/kissy/blob/master/src/anim/sub-modules/timer/src/timer/easing.js
//++++++++++++++++++++++
var PI = Math.PI,
    pow = Math.pow,
    sin = Math.sin,
    abs = Math.abs,
    parseNumber = parseFloat,
    CUBIC_BEZIER_REG = /^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/i,
    BACK_CONST = 1.70158,
    ZERO_LIMIT = 1e-6;

function easeNone(t) {
    return t;
}

function cubicBezierFunction(p1x, p1y, p2x, p2y) {
    // Calculate the polynomial coefficients,
    // implicit first and last control points are (0,0) and (1,1).
    var ax = 3 * p1x - 3 * p2x + 1,
        bx = 3 * p2x - 6 * p1x,
        cx = 3 * p1x;

    var ay = 3 * p1y - 3 * p2y + 1,
        by = 3 * p2y - 6 * p1y,
        cy = 3 * p1y;

    function sampleCurveDerivativeX(t) {
        // `ax t^3 + bx t^2 + cx t' expanded using Horner 's rule.
        return (3 * ax * t + 2 * bx) * t + cx;
    }

    function sampleCurveX(t) {
        return ((ax * t + bx) * t + cx) * t;
    }

    function sampleCurveY(t) {
        return ((ay * t + by) * t + cy) * t;
    }

    // Given an x value, find a parametric value it came from.
    function solveCurveX(x) {
        var t2 = x,
            derivative,
            x2;

        // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/animation
        // First try a few iterations of Newton's method -- normally very fast.
        // http://en.wikipedia.org/wiki/Newton's_method
        for (var i = 0; i < 8; i++) {
            // f(t)-x=0
            x2 = sampleCurveX(t2) - x;
            if (abs(x2) < ZERO_LIMIT) {
                return t2;
            }
            derivative = sampleCurveDerivativeX(t2);
            // == 0, failure
            if (abs(derivative) < ZERO_LIMIT) {
                break;
            }
            t2 -= x2 / derivative;
        }

        // Fall back to the bisection method for reliability.
        // bisection
        // http://en.wikipedia.org/wiki/Bisection_method
        var t1 = 1,
            t0 = 0;
        t2 = x;
        while (t1 > t0) {
            x2 = sampleCurveX(t2) - x;
            if (abs(x2) < ZERO_LIMIT) {
                return t2;
            }
            if (x2 > 0) {
                t1 = t2;
            } else {
                t0 = t2;
            }
            t2 = (t1 + t0) / 2;
        }

        // Failure
        return t2;
    }

    function solve(x) {
        return sampleCurveY(solveCurveX(x));
    }

    return solve;
}

var Easing = {

    cubicBezier: cubicBezierFunction,

    /**
     * swing effect.
     */
    swing: function (t) {
        return 0.5 - (Math.cos(t * PI) / 2);
    },

    /**
     * Uniform speed between points.
     */
    easeNone: easeNone,

    linear: easeNone,

    /**
     * Begins slowly and accelerates towards end. (quadratic)
     */
    easeIn: function (t) {
        return t * t;
    },

    ease: cubicBezierFunction(0.25, 0.1, 0.25, 1.0),

    'ease-in': cubicBezierFunction(0.42, 0, 1.0, 1.0),

    'ease-out': cubicBezierFunction(0, 0, 0.58, 1.0),

    'ease-in-out': cubicBezierFunction(0.42, 0, 0.58, 1.0),

    'ease-out-in': cubicBezierFunction(0, 0.42, 1.0, 0.58),

    toFn: function (easingStr) {
        var m;
        if ((m = easingStr.match(CUBIC_BEZIER_REG))) {
            return cubicBezierFunction(
                parseNumber(m[1]),
                parseNumber(m[2]),
                parseNumber(m[3]),
                parseNumber(m[4])
            );
        }
        return Easing[easingStr] || easeNone;
    },

    /**
     * Begins quickly and decelerates towards end.  (quadratic)
     */
    easeOut: function (t) {
        return (2 - t) * t;
    },

    /**
     * Begins slowly and decelerates towards end. (quadratic)
     */
    easeBoth: function (t) {
        return (t *= 2) < 1 ?
        0.5 * t * t :
        0.5 * (1 - (--t) * (t - 2));
    },

    /**
     * Begins slowly and accelerates towards end. (quartic)
     */
    easeInStrong: function (t) {
        return t * t * t * t;
    },

    /**
     * Begins quickly and decelerates towards end.  (quartic)
     */
    easeOutStrong: function (t) {
        return 1 - (--t) * t * t * t;
    },

    /**
     * Begins slowly and decelerates towards end. (quartic)
     */
    easeBothStrong: function (t) {
        return (t *= 2) < 1 ?
        0.5 * t * t * t * t :
        0.5 * (2 - (t -= 2) * t * t * t);
    },

    /**
     * Snap in elastic effect.
     */

    elasticIn: function (t) {
        var p = 0.3,
            s = p / 4;
        if (t === 0 || t === 1) {
            return t;
        }
        return 0 - (pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
    },

    /**
     * Snap out elastic effect.
     */
    elasticOut: function (t) {
        var p = 0.3,
            s = p / 4;
        if (t === 0 || t === 1) {
            return t;
        }
        return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
    },

    /**
     * Snap both elastic effect.
     */
    elasticBoth: function (t) {
        var p = 0.45,
            s = p / 4;
        if (t === 0 || (t *= 2) === 2) {
            return t;
        }

        if (t < 1) {
            return -0.5 * (pow(2, 10 * (t -= 1)) *
                sin((t - s) * (2 * PI) / p));
        }
        return pow(2, -10 * (t -= 1)) *
            sin((t - s) * (2 * PI) / p) * 0.5 + 1;
    },

    /**
     * Backtracks slightly, then reverses direction and moves to end.
     */
    backIn: function (t) {
        if (t === 1) {
            t -= 0.001;
        }
        return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
    },

    /**
     * Overshoots end, then reverses and comes back to end.
     */
    backOut: function (t) {
        return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
    },

    /**
     * Backtracks slightly, then reverses direction, overshoots end,
     * then reverses and comes back to end.
     */
    backBoth: function (t) {
        var s = BACK_CONST;
        var m = (s *= 1.525) + 1;

        if ((t *= 2) < 1) {
            return 0.5 * (t * t * (m * t - s));
        }
        return 0.5 * ((t -= 2) * t * (m * t + s) + 2);

    },

    /**
     * Bounce off of start.
     */
    bounceIn: function (t) {
        return 1 - Easing.bounceOut(1 - t);
    },

    /**
     * Bounces off end.
     */
    bounceOut: function (t) {
        var s = 7.5625,
            r;

        if (t < (1 / 2.75)) {
            r = s * t * t;
        } else if (t < (2 / 2.75)) {
            r = s * (t -= (1.5 / 2.75)) * t + 0.75;
        } else if (t < (2.5 / 2.75)) {
            r = s * (t -= (2.25 / 2.75)) * t + 0.9375;
        } else {
            r = s * (t -= (2.625 / 2.75)) * t + 0.984375;
        }

        return r;
    },

    /**
     * Bounces off start and end.
     */
    bounceBoth: function (t) {
        if (t < 0.5) {
            return Easing.bounceIn(t * 2) * 0.5;
        }
        return Easing.bounceOut(t * 2 - 1) * 0.5 + 0.5;
    }
};

module.exports = Easing;

},{}],4:[function(require,module,exports){
/**
 *
 * Sprite Matrix
 *
 * @author niko
 * @date 2014-07-27
 *
 */

function rad(deg) {
    return deg % 360 * PI / 180;
}

function deg(rad) {
    return rad * 180 / PI % 360;
}

var objectToString = Object.prototype.toString,
    Str = String,
    math = Math,
    PI = math.PI,
    E = "";

// Snap Matrix
// https://github.com/adobe-webplatform/Snap.svg/blob/master/src/matrix.js
function Matrix(a, b, c, d, e, f) {
    if (b == null && objectToString.call(a) == "[object SVGMatrix]") {
        this.a = a.a;
        this.b = a.b;
        this.c = a.c;
        this.d = a.d;
        this.e = a.e;
        this.f = a.f;
        return;
    }
    if (a != null) {
        this.a = +a;
        this.b = +b;
        this.c = +c;
        this.d = +d;
        this.e = +e;
        this.f = +f;
    } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
    }
}
(function (matrixproto) {
    /*\
     * Matrix.add
     [ method ]
     **
     * Adds the given matrix to existing one
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     * or
     - matrix (object) @Matrix
     \*/
    matrixproto.add = function (a, b, c, d, e, f) {
        var out = [
                [],
                [],
                []
            ],
            m = [
                [this.a, this.c, this.e],
                [this.b, this.d, this.f],
                [0, 0, 1]
            ],
            matrix = [
                [a, c, e],
                [b, d, f],
                [0, 0, 1]
            ],
            x, y, z, res;

        if (a && a instanceof Matrix) {
            matrix = [
                [a.a, a.c, a.e],
                [a.b, a.d, a.f],
                [0, 0, 1]
            ];
        }

        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                res = 0;
                for (z = 0; z < 3; z++) {
                    res += m[x][z] * matrix[z][y];
                }
                out[x][y] = res;
            }
        }
        this.a = out[0][0];
        this.b = out[1][0];
        this.c = out[0][1];
        this.d = out[1][1];
        this.e = out[0][2];
        this.f = out[1][2];
        return this;
    };
    /*\
     * Matrix.invert
     [ method ]
     **
     * Returns an inverted version of the matrix
     = (object) @Matrix
     \*/
    matrixproto.invert = function () {
        var me = this,
            x = me.a * me.d - me.b * me.c;
        return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
    };
    /*\
     * Matrix.clone
     [ method ]
     **
     * Returns a copy of the matrix
     = (object) @Matrix
     \*/
    matrixproto.clone = function () {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    /*\
     * Matrix.translate
     [ method ]
     **
     * Translate the matrix
     - x (number) horizontal offset distance
     - y (number) vertical offset distance
     \*/
    matrixproto.translate = function (x, y) {
        return this.add(1, 0, 0, 1, x, y);
    };
    /*\
     * Matrix.scale
     [ method ]
     **
     * Scales the matrix
     - x (number) amount to be scaled, with `1` resulting in no change
     - y (number) #optional amount to scale along the vertical axis. (Otherwise `x` applies to both axes.)
     - cx (number) #optional horizontal origin point from which to scale
     - cy (number) #optional vertical origin point from which to scale
     * Default cx, cy is the middle point of the element.
     \*/
    matrixproto.scale = function (x, y, cx, cy) {
        y == null && (y = x);
        (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
        this.add(x, 0, 0, y, 0, 0);
        (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        return this;
    };
    /*\
     * Matrix.rotate
     [ method ]
     **
     * Rotates the matrix
     - a (number) angle of rotation, in degrees
     - x (number) horizontal origin point from which to rotate
     - y (number) vertical origin point from which to rotate
     \*/
    matrixproto.rotate = function (a, x, y) {
        a = rad(a);
        x = x || 0;
        y = y || 0;
        var cos = +math.cos(a).toFixed(9),
            sin = +math.sin(a).toFixed(9);
        this.add(cos, sin, -sin, cos, x, y);
        return this.add(1, 0, 0, 1, -x, -y);
    };
    /*\
     * Matrix.x
     [ method ]
     **
     * Returns x coordinate for given point after transformation described by the matrix. See also @Matrix.y
     - x (number)
     - y (number)
     = (number) x
     \*/
    matrixproto.x = function (x, y) {
        return x * this.a + y * this.c + this.e;
    };
    /*\
     * Matrix.y
     [ method ]
     **
     * Returns y coordinate for given point after transformation described by the matrix. See also @Matrix.x
     - x (number)
     - y (number)
     = (number) y
     \*/
    matrixproto.y = function (x, y) {
        return x * this.b + y * this.d + this.f;
    };
    matrixproto.get = function (i) {
        return +this[Str.fromCharCode(97 + i)].toFixed(4);
    };
    matrixproto.toString = function () {
        return "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")";
    };
    matrixproto.offset = function () {
        return [this.e.toFixed(4), this.f.toFixed(4)];
    };

    function norm(a) {
        return a[0] * a[0] + a[1] * a[1];
    }

    function normalize(a) {
        var mag = math.sqrt(norm(a));
        a[0] && (a[0] /= mag);
        a[1] && (a[1] /= mag);
    }

    /*\
     * Matrix.determinant
     [ method ]
     **
     * Finds determinant of the given matrix.
     = (number) determinant
     \*/
    matrixproto.determinant = function () {
        return this.a * this.d - this.b * this.c;
    };
    /*\
     * Matrix.split
     [ method ]
     **
     * Splits matrix into primitive transformations
     = (object) in format:
     o dx (number) translation by x
     o dy (number) translation by y
     o scalex (number) scale by x
     o scaley (number) scale by y
     o shear (number) shear
     o rotate (number) rotation in deg
     o isSimple (boolean) could it be represented via simple transformations
     \*/
    matrixproto.split = function () {
        var out = {};
        // translation
        out.dx = this.e;
        out.dy = this.f;

        // scale and shear
        var row = [
            [this.a, this.c],
            [this.b, this.d]
        ];
        out.scalex = math.sqrt(norm(row[0]));
        normalize(row[0]);

        out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
        row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

        out.scaley = math.sqrt(norm(row[1]));
        normalize(row[1]);
        out.shear /= out.scaley;

        if (this.determinant() < 0) {
            out.scalex = -out.scalex;
        }

        // rotation
        var sin = -row[0][1],
            cos = row[1][1];
        if (cos < 0) {
            out.rotate = deg(math.acos(cos));
            if (sin < 0) {
                out.rotate = 360 - out.rotate;
            }
        } else {
            out.rotate = deg(math.asin(sin));
        }

        out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
        out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
        out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
        return out;
    };
    /*\
     * Matrix.toTransformString
     [ method ]
     **
     * Returns transform string that represents given matrix
     = (string) transform string
     \*/
    matrixproto.toTransformString = function (shorter) {
        var s = shorter || this.split();
        if (!+s.shear.toFixed(9)) {
            s.scalex = +s.scalex.toFixed(4);
            s.scaley = +s.scaley.toFixed(4);
            s.rotate = +s.rotate.toFixed(4);
            return (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) +
                (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                (s.rotate ? "r" + [+s.rotate.toFixed(4), 0, 0] : E);
        } else {
            return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
        }
    };
})(Matrix.prototype);

module.exports = Matrix;


},{}],5:[function(require,module,exports){
/*
 * Sprite Render
 *
 * @date 2014-08-04
 * @author niko
 *
 */

var U = require('./sprite-util'),
    Transform = require('./sprite-transform');

/**
 * 判断是否支持一些css属性
 *
 * @method isSupport
 * @parma [String] key 支持的属性名
 * @parma [Function] callback 知道支持以后需要做的操作
 */
function isSupport(key, callback) {

    var t = {},
        k = key.replace(/(\w){1}/i, function ($1) {
            return $1.toUpperCase();
        });

    t['webkit' + k] = '';
    t['moz' + k] = '';
    t['ms' + k] = '';
    t[key] = '';

    var a = document.createElement('div');

    for (var prop in t) {
        if (prop in a.style) {
            if (callback) {
                callback(prop, a, t);
            }
            return true;
        }
    }
    return false;
}
function isAndroidLowVersion() {
    var b = navigator.userAgent,
        r = false,
        v;
    try {
        if (b.indexOf('Android') > -1) {
            v = b.split(';')[1].match(/[0-9\.]+/)[0].split('.');
            if (v[0] == 4 && v[1] <= 2) {
                return true;
            }
        }
    } catch (e) {
    }
    return r;
}

var toString = Object.prototype.toString;

/**
 * 是否支持css3 transform 以及 3d
 */
var KEY = '';
var isSupportTransform = isSupport('transform', function (prop) {
    KEY = prop;
});
var isSupportTransform3D = isSupport('transformOriginZ');
if (isAndroidLowVersion()) {
    isSupportTransform = false;
    isSupportTransform3D = false;
}

/**
 * 根据Sprite的渲染上下文环境获取渲染类型
 *
 * @method getRenderType
 * @return {String} 渲染类型
 */
function getRenderType() {

    var o = this.ctx, result = '';

    if (/element/ig.test(toString.call(o))) {
        if (isSupportTransform) {
            result = 'dom-t';
        } else {
            result = 'dom';
        }
    } else {
        result = '';
    }

    if (this._isTexturePicker && result) {
        result += '-tp';
    }

    return result;

}

//渲染选择器
//每个渲染器复写 render 和 update 方法
//会在Sprite的调用这两个方法
var RenderMachine = {
    //dom方式的渲染器
    dom: function () {

        var s,
            offsetX,
            offsetY;

        function setPos() {
            offsetX = -((this.cFrame % this.rowNum) * this.width);
            offsetY = -(Math.floor(this.cFrame / this.rowNum) * this.height);
            this.view.style.backgroundPosition = offsetX + 'px ' + offsetY + 'px';
        }

        this._render = function () {
            this.view = document.createElement('div');

            s = this.view.style;
            s.width = this.width + 'px';
            s.height = this.height + 'px';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            s.backgroundImage = 'url("' + this.res + '")';
            s.backgroundRepeat = 'no-repeat';

            setPos.call(this);

            this.ctx.appendChild(this.view);

        };

        this._update = function () {
            setPos.call(this);
        };

    },
    //利用transform+overflow做切换的dom渲染模式
    'dom-t': function () {
        var s,
            img,
            offsetX,
            offsetY;

        var _set;
        if (isSupportTransform3D) {
            _set = function () {
                img.style[KEY] = 'translate3d(' + offsetX + 'px,' + offsetY + 'px,0px)';
            }
        } else {
            _set = function () {
                img.style[KEY] = 'translate(' + offsetX + 'px,' + offsetY + 'px)';
            }
        }
        function setPos() {
            offsetX = -((this.cFrame % this.rowNum) * this.width);
            offsetY = -(Math.floor(this.cFrame / this.rowNum) * this.height);

            _set();
        }

        this._render = function () {
            img = new Image();
            img.src = this.res;

            this.view = document.createElement('div');

            s = this.view.style;
            s.width = this.width + 'px';
            s.height = this.height + 'px';
            s.overflow = 'hidden';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            setPos.call(this);

            this.view.appendChild(img);
            this.ctx.appendChild(this.view);

        };

        this._update = function () {
            setPos.call(this);
        };
    },
    //dom texturepicker渲染器
    'dom-tp': function () {
        var s,
            pos;

        function setPos() {
            s = this.view.style;

            pos = this.pickData[this.cAnim.getName()][this.cAnim.ocFrame];
            this.width = pos.w;
            this.height = pos.h;
            s.width = pos.w + 'px';
            s.height = pos.h + 'px';
            s.backgroundPosition = (-pos.x) + 'px ' + (-pos.y) + 'px';
        }

        this._render = function () {
            if (!this.cAnim) {
                return;
            }
            animData = this.pickData[this.cAnim.getName()];

            this.view = document.createElement('div');

            s = this.view.style;

            s.backgroundImage = 'url("' + this.res.image + '")';
            s.backgroundRepeat = 'no-repeat';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            setPos.call(this);

            this.ctx.appendChild(this.view);

        };
        this._update = function () {
            setPos.call(this);
        };
    },
    'dom-t-tp': function () {

        var s,
            img,
            pos;

        var _set;

        if (isSupportTransform3D) {
            _set = function (pos) {
                img.style[KEY] = 'translate3d(' + (-pos.x) + 'px,' + (-pos.y) + 'px,0px)';
            }
        } else {
            _set = function (pos) {
                img.style[KEY] = 'translate(' + (-pos.x) + 'px,' + (-pos.y) + 'px)';
            }
        }

        function setPos() {
            s = this.view.style;

            pos = this.pickData[this.cAnim.getName()][this.cAnim.ocFrame];
            this.width = pos.w;
            this.height = pos.h;
            s.width = pos.w + 'px';
            s.height = pos.h + 'px';

            _set(pos);
        }

        this._render = function () {
            if (!this.cAnim) {
                return;
            }

            animData = this.pickData[this.cAnim.getName()];

            img = new Image();
            img.src = this.res.image;

            this.view = document.createElement('div');
            s = this.view.style;
            s.overflow = 'hidden';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            setPos.call(this);

            this.view.appendChild(img);
            this.ctx.appendChild(this.view);

        };
        this._update = function () {
            setPos.call(this);
        };
    }
};

//返回的publish对象
var Render = {
    /**
     * 设置Sprite渲染方式
     *
     * @method setRedner
     * @return undefined
     */
    setRender: function () {
        //获取渲染类型
        var type = getRenderType.call(this);
        RenderMachine[type].call(this);
    },
    /**
     * 设置Sprite销毁方式
     *
     * @method setDestroy
     * @return undefined
     */
    setDestroy: function () {
        this.ctx.removeChild(this.view);
    }
};

module.exports = Render;

},{"./sprite-transform":7,"./sprite-util":8}],6:[function(require,module,exports){
/* Ticker 是时间轴
 *   时间轴维持一个递归的 requestAnimaionFrame 或 setTimeout，每约 17ms 运行一次（一帧）
 *   调用 addTask 向 Ticker 中添加一项任务（任务，就是一个每一帧都会调用的函数）
 */


/*
 * requestAnimationFrame pollyfill
 * http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
var requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            return window.setTimeout(callback, 1000 / 60)
        }
})()

/**
 * 新建时间轴
 * @constructor
 * @example
 * ```js
 * var ticker = new Ticker()
 * ```
 */
function Ticker() {
    this.tickers = []
    this.newTickers = []
    this.last = undefined
    this.requestId = undefined
    this.getIdLastTime = undefined
    this.getIdLastId = 0
}

Ticker.prototype.getTickId = function() {
    // 还没开始
    if (this.last === undefined) {
        if (this.getIdLastTime === undefined) {
            this.getIdLastTime = new Date().getTime()
        }
    } else {
        // 还在这一帧
        if (this.getIdLastTime !== this.last) {
            this.getIdLastTime = this.last
            this.getIdLastId = 0
        }
    }
    this.getIdLastId++
    return 'ticker-' + this.getIdLastTime + '-' + this.getIdLastId
}

Ticker.prototype.tick = function() {
    var now = new Date().getTime()

    // 处理暂停后的情况
    if (this.last && now - this.last > 200) {
        var inter = now - this.last
        this.last += inter - 20
        this.tickers.forEach(function(ticker) {
            ticker.beginTime += inter - 20
            ticker.endTime += inter - 20
        })
    }

    this.attachNewTickers(now)

    for (var i = 0; i < this.tickers.length; i++) {
        var ticker = this.tickers[i]
        var begin = ticker.beginTime
        var end = ticker.endTime

        // 还没开始
        if (now < begin) {
            continue
        }

        // 单次方法
        if (ticker.once) {
            this.tickTicker(ticker, now, this.last)
            ticker.hasBegun = true
            ticker.hasEnded = true
            continue
        }

        // 开始后第一次
        if (ticker.hasBegun === false) {
            this.tickTicker(ticker, begin, begin)
            ticker.hasBegun = true
            continue
        }

        // 已经结束
        if (end && now > end) {
            // 结束后补一次
            if (ticker.hasEnded === false) {
                this.tickTicker(ticker, end, this.last)
                ticker.hasEnded = true
            }
            continue
        }

        // 正常
        this.tickTicker(ticker, now, this.last)

    }

    this.removeEndedTickers()
    this.last = now

    if (!this.toStop) {
        this.requestId = requestAnimationFrame(function() {
            this.tick()
        }.bind(this))
    }
}

Ticker.prototype.tickTicker = function(ticker, now, last) {

    var p
    if (ticker.duration) {
        p = (now - ticker.beginTime) / ticker.duration
    }

    ticker.tick(now-ticker.beginTime, p)
}

/**
 * 开始时间轴
 * @example
 * ```js
 * ticker.start()
 * ```
 */
Ticker.prototype.start = function() {
    if (this.last === undefined) {
        this.last = new Date().getTime()
    }
    this.toStop = false
    this.tick()
}

/**
 * 停止/暂停时间轴
 * @example
 * ```js
 * ticker.stop()
 * // 在恰当的时候继续时间轴
 * ticker.start()
 * ```
 */
Ticker.prototype.stop = function() {
    this.toStop = true
}

/**
 * 向时间轴中添加一项任务
 * @param {Function} tick 任务的循环函数，每一帧都会被调用，调用时传入两个参数，当前时刻和上一帧时刻
 * @param {Object} config 任务的配置项，均可选
 * @param {Number} config.delay 任务延迟执行的时间，以毫秒为单位。如果不传，任务会立刻（在下一帧）开始执行
 * @param {Number} config.duration 任务的持续时间，以毫秒为单位，超过时间后任务自动删除。如果不传，任务将一直执行下去
 * @param {Boolen} config.once 任务是否只执行一次，如果是，任务函数执行一次后就自动删除。
 * @param {Function} config.callback 任务结束结束时的回调函数
 * @return {String} 任务的ID
 * @example
 * ```js
 * ticker.addTask(function(now, last){
 *   console.log(now)
 * })
 * ticker.addTask(function(now, last, p){
 *   console.log(p)
 * }， {
 *   duration: 5000,
 *   delay: 2000,
 *   callback: yourCallBackFunction
 * })
 * ```
 */
Ticker.prototype.addTask = function(tick, config) {
    // 兼容老式 API
    if (typeof tick === 'object' && config === undefined) {
        config = tick
        tick = config.tick
    }

    var id = this.getTickId()
    this.newTickers.push({
        id: id,
        tick: tick,
        config: config || {}
    })

    return id
}

Ticker.prototype.add = Ticker.prototype.addTask

/**
 * 将仍在执行的任务从时间轴中删除
 * @param  {String} id 任务的ID
 * @example
 * ```js
 * var id = ticker.addTask(function(){})
 * // 在恰当的时候
 * ticker.removeTask(id)
 * ```
 */
Ticker.prototype.removeTask = function(id) {
    for (var i = 0; i < this.tickers.length; i++) {
        if (id && id === this.tickers[i].id) {
            this.tickers.splice(i, 1)
        }
    }
    return this
}

Ticker.prototype.remove = Ticker.prototype.removeTask

Ticker.prototype.removeEndedTickers = function() {
    var i = 0
    for (var i = 0; i < this.tickers.length;) {
        var ticker = this.tickers[i]
        if (ticker.hasEnded) {
            ticker.callback && ticker.callback()
            this.tickers.splice(i, 1)
        } else {
            i++
        }
    }
}

Ticker.prototype.attachNewTickers = function(now) {

    for (var i = 0; i < this.newTickers.length; i++) {

        var ticker = this.newTickers[i]

        var id = ticker.config.id === undefined ? ticker.id : ticker.config.id
        var tick = this.newTickers[i].tick
        var config = this.newTickers[i].config

        var beginTime = config.delay ? now + config.delay : now
        var endTime = config.duration ? beginTime + config.duration : undefined

        this.tickers.push({
            id: id,
            tick: tick,
            beginTime: beginTime,
            endTime: endTime,
            duration: config.duration,
            hasBegun: false,
            hasEnded: false,
            once: config.once ? true : false,
            callback: config.callback
        })
    }

    this.newTickers = []
}

/**
 * 语法糖，效果与 setTimeout 相同，但由时间轴来负责触发
 * @param {Function} func  需要延迟执行的函数
 * @param {Number} delay 延迟的时间，以毫秒为单位
 * @example
 * ```js
 * ticker.setTimeout(yourDelayFunction, 5000)
 * // 相当于
 * ticker.addTask(yourDelayFunction, {
 *   delay:5000,
 *   once:true
 * })
 * ```
 */
Ticker.prototype.setTimeout = function(func, delay) {
    this.addTask(func, {
        delay: delay,
        once: true
    })
}

module.exports = Ticker;


},{}],7:[function(require,module,exports){
/**
 *
 * Sprite Transform
 *
 * @author niko
 * @date 2014-07-29
 *
 */

var toString = Object.prototype.toString;

var Matrix = require('./sprite-matrix');

/**
 * 判断是否支持一些css属性
 *
 * @method isSupport
 * @parma [String] key 支持的属性名
 * @parma [Function] callback 知道支持以后需要做的操作
 */
function isSupport(key, callback) {

    var t = {},
        k = key.replace(/(\w){1}/i, function ($1) {
            return $1.toUpperCase();
        });

    t['webkit' + k] = '';
    t['Moz' + k] = '';
    t['ms' + k] = '';
    t[key] = '';

    var a = document.createElement('div');

    for (var prop in t) {
        if (prop in a.style) {
            if (callback) {
                callback(prop, a, t);
            }
            return true;
        }
    }
    return false;
}

var isSupportTransform3D = isSupport('transformOriginZ');

//格式化矩阵为css3方式
var formatMatrix;
if (isSupportTransform3D) {
    formatMatrix = function (matrix) {
        var m = 'matrix3d(';
        m += matrix.a + ',';
        m += matrix.b + ',';
        m += '0,';
        m += '0,';

        m += matrix.c + ',';
        m += matrix.d + ',';
        m += '0,';
        m += '0,';

        m += '0,';
        m += '0,';
        m += '1,';
        m += '0,';

        m += matrix.e + ',';
        m += matrix.f + ',';
        m += '0,';
        m += '1';
        m += ')';

        return m;
    }
} else {
    formatMatrix = function (matrix) {
        var m = 'matrix(';
        m += matrix.a + ',';
        m += matrix.b + ',';
        m += matrix.c + ',';
        m += matrix.d + ',';
        m += matrix.e + ',';
        m += matrix.f;
        m += ')';
        return m;
    }
}

//css3的矩阵变化
function css3Transform(o, matrix) {
    //console.log(formatMatrix(matrix));
    o.style.webkitTransform = formatMatrix(matrix);
    o.style.msTransform = formatMatrix(matrix);
    o.style.transform = formatMatrix(matrix);
}

//设置初始化默认值
function setGAttr(o) {
    if (!o._gattr_) {
        o._gattr_ = {
            x: 0,
            y: 0,
            regX: 0,
            regY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            transform: undefined,
            matrix: new Matrix(1, 0, 0, 1, 0, 0)
        };
    }
}

//设置属性
function setAttr(o, k, v) {
    if (k === 'scale') {
        o._gattr_['scaleX'] = v;
        o._gattr_['scaleY'] = v;
    } else {
        o._gattr_[k] = v;
    }
}

//初始化矩阵
function clearMatrix(matrix) {
    matrix.a = 1;
    matrix.b = 0;
    matrix.c = 0;
    matrix.d = 1;
    matrix.e = 0;
    matrix.f = 0;
}


//设置变化矩阵，根据对象的属性值
function setMatrix(o) {

    clearMatrix(o._gattr_.matrix);

    if (o._gattr_.transform) {
        o._gattr_.matrix = o._gattr_.transform.transform.clone();
    }
    o._gattr_.matrix.translate(o._gattr_.x, o._gattr_.y).
        rotate(o._gattr_.rotation, o._gattr_.regX, o._gattr_.regY).
        scale(o._gattr_.scaleX, o._gattr_.scaleY, o._gattr_.regX, o._gattr_.regY);
}

//设置变化
function setTransform(o, callback) {
    if (!o._gattr_._setTransform && o.view) {

        if (isSupport('transform')) {

            o._gattr_._setTransform = function (o) {
                setMatrix(o);
                o.view.style.opacity = o._gattr_.opacity;
                css3Transform(o.view, o._gattr_.matrix);
            }

        } else {

            o.view.style.position = 'absolute';
            o._gattr_._setTransform = function (o) {
                o.view.style.top = o._gattr_.y + 'px';
                o.view.style.left = o._gattr_.x + 'px';
                o.view.style.opacity = o._gattr_.opacity;
            }
        }

    }
    if ( o._gattr_._setTransform ) {
        o._gattr_._setTransform(o, callback);
    }

}

//返回对象
var Transform = {
    set: function (o, arg1, arg2, arg3) {
        setGAttr(o);
        if (toString.call(arg1) == '[object Object]') {
            for (var prop in arg1) {
                if (arg1.hasOwnProperty(prop)) {
                    setAttr(o, prop, arg1[prop]);
                }
            }
        } else {
            setAttr(o, arg1, arg2);
        }

        if (toString.call(arg2) == '[object Function]') {
            setTransform(o, arg2);
        } else {
            setTransform(o, arg3);
        }
    },
    get: function (o, arg) {
        setGAttr(o);
        if (arg == 'scale') {
            return o._gattr_['scaleX'];
        }
        return o._gattr_[arg];
    },
    reset: function (o) {
        o._gattr_ = undefined;
        setGAttr(o);
    },
    setTransform: setTransform,
    Matrix: Matrix
};

module.exports = Transform;

},{"./sprite-matrix":4}],8:[function(require,module,exports){
/*
 * SpriteUtil
 *
 * @date 2014-08-04
 * @author niko
 *
 */

var toString = Object.prototype.toString;

var Util = {
    method: function (o, fns) {
        var p = o.prototype;
        for (var fn in fns) {
            if (fns.hasOwnProperty(fn)) {
                o.prototype[fn] = fns[fn];
            }
        }
    },
    proxy: function (fn, context) {
        return function () {
            fn.apply(context, arguments);
        }
    },
    isObject: function (n) {
        return toString.call(n) === '[object Object]';
    },
    isArray: function (n) {
        return toString.call(n) === '[object Array]';
    },
    isNumber: function (n) {
        return toString.call(n) === '[object Number]';
    },
    isString: function (n) {
        return toString.call(n) === '[object String]';
    },
    isFunction: function (n) {
        return toString.call(n) === '[object Function]';
    },
    clone: function (o) {
        var _o = {};

        if (Util.isArray(o)) {
            _o = o.concat();
        } else if (Util.isObject(o)) {
            for (var p in o) {
                if (o.hasOwnProperty(p)) {
                    if (Util.isObject(o[p])) {
                        _o[p] = Util.clone(o[p]);
                    } else if (Util.isArray(o[p])) {
                        _o[p] = o[p].concat();
                    } else {
                        _o[p] = o[p];
                    }
                }
            }
        } else {
            _o = o;
        }

        return _o;
    }
};

module.exports = Util;

},{}]},{},[1]);
