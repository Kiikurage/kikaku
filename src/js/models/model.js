//@include ../service/util.js
//@include ../service/eventdispatcher.js

var Model = (function() {
    function Model(data) {
        if (!(this instanceof Model)) {
            return new Model(data);
        }

        EventDispatcher.call(this);
    }

    extendClass(Model, EventDispatcher);

    Model.prototype.update = function() {
        this.dispatchEvent('update');
    };

    return Model
}());
