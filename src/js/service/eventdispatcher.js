var EventDispatcher = (function () {

    function EventDispatcher() {
        if (!(this instanceof EventDispatcher)) {
            return new EventDispatcher();
        }

        this.callbacks_ = {};
    }

    EventDispatcher.prototype.addEventListener = function (type, fn) {
        var listeners = this.callbacks_[type];

        if (!listeners) {
            listeners = this.callbacks_[type] = [];
        }

        listeners.push(fn);
    };

    EventDispatcher.prototype.removeEventListener = function (type, fn) {
        var listeners = this.callbacks_[type],
            i, max;

        if (!listeners) return;

        for (i = 0, max = listeners.length; i < max; i++) {
            if (listeners[i] === fn) {
                listeners.splice(i, 1);
                max--;
                i--;
            }
        }
    };

    EventDispatcher.prototype.dispatchEvent = function (type, ev) {
        var listeners = this.callbacks_[type],
            i, max;

        if (!listeners) return;

        for (i = 0, max = listeners.length; i < max; i++) {
            listeners[i].call(this, ev);
        }
    };

    EventDispatcher.prototype.on = EventDispatcher.prototype.addEventListener;
    EventDispatcher.prototype.off = EventDispatcher.prototype.addEventListener;
    EventDispatcher.prototype.one = function (type, fn) {
        var self = this,
            proxy = function (ev) {
                self.off(type, proxy);
                fn.call(this, ev);
            };
        this.on(type, proxy);
    };
    EventDispatcher.prototype.fire = EventDispatcher.prototype.dispatchEvent;

    return EventDispatcher;
}());
