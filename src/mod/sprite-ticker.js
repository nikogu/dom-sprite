/*
* @copyright form http://gama.taobao.net/2/
*/

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

