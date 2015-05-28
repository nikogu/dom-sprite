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
function Ticker() {
    this.tickers = []
    this.newTickers = []
    this.last = undefined
    this.requestId = undefined
    this.getIdLastTime = undefined
    this.getIdLastId = 0
}
Ticker.prototype.getTickId = function() {
    if (this.last === undefined) {
        if (this.getIdLastTime === undefined) {
            this.getIdLastTime = new Date().getTime()
        }
    } else {
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
        if (now < begin) {
            continue
        }

        if (ticker.once) {
            this.tickTicker(ticker, now, this.last)
            ticker.hasBegun = true
            ticker.hasEnded = true
            continue
        }
        if (ticker.hasBegun === false) {
            this.tickTicker(ticker, begin, begin)
            ticker.hasBegun = true
            continue
        }
        if (end && now > end) {
            if (ticker.hasEnded === false) {
                this.tickTicker(ticker, end, this.last)
                ticker.hasEnded = true
            }
            continue
        }
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

Ticker.prototype.start = function() {
    if (this.last === undefined) {
        this.last = new Date().getTime()
    }
    this.toStop = false
    this.tick()
}

Ticker.prototype.stop = function() {
    this.toStop = true
}

Ticker.prototype.addTask = function(tick, config) {
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

Ticker.prototype.setTimeout = function(func, delay) {
    this.addTask(func, {
        delay: delay,
        once: true
    })
}

module.exports = Ticker;

