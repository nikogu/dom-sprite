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
