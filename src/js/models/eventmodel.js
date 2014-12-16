//@include ../service/util.js
//@include model.js

var EventModel = (function() {
    function EventModel(data) {
        if (!(this instanceof EventModel)) {
            return new EventModel(data);
        }

        Model.call(this);

        if (isObject(data)) {
            this.updateWithObject(data);
        }
    }

    extendClass(EventModel, Model);

    /**
     * ID
     * @type {string}
     */
    EventModel.prototype.id = '';

    /**
     * 名前
     * @type {string}
     */
    EventModel.prototype.name = '';

    /**
     * 説明文
     * @type {string}
     */
    EventModel.prototype.description = '';

    /**
     * 候補日
     * @type {string}
     */
    EventModel.prototype.datelist = '';

    EventModel.prototype.updateWithObject = function(data) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.datelist = data.datelist || '';
        this.update();
    };

    return EventModel
}());
