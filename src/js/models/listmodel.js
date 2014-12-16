//@include ../service/util.js
//@include model.js

var ListModel = (function() {
    function ListModel() {
        if (!(this instanceof ListModel)) {
            return new ListModel();
        }

        Model.call(this);
    }

    extendClass(ListModel, Model);

    var ArrayProto = Array.prototype,
        push = ArrayProto.push,
        pop = ArrayProto.pop,
        unshift = ArrayProto.unshift,
        shift = ArrayProto.shift,
        splice = ArrayProto.splice;

    ListModel.prototype.length = 0;

    ListModel.prototype.push = function() {
        var res = push.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.pop = function() {
        var res = pop.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.unshift = function() {
        var res = unshift.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.shift = function() {
        var res = shift.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.splice = function() {
        var res = splice.apply(this, arguments);
        this.update();
        return res
    };

    ListModel.prototype.setArray = function(arr) {
        var max1 = this.length,
            max2 = arr.length,
            i;

        this.length = max2;

        for (i = 0; i < max2; i++) {
            this[i] = arr[i];
        }

        if (max1 > max2) {
            for (i = max2; i < max1; i++) {
                delete this[i];
            }
        }

        this.update();
    };

    return ListModel;
}());
