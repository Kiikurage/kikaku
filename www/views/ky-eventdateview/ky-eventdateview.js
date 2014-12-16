(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {};

        this.model_ = null;
        this.update = this.update.bind(this);
    };

    prototype.__defineSetter__('model', function (newVal) {
        if (this.model) {
            this.model.removeEventListener('update', this.update);
        }

        this.model_ = newVal;

        if (newVal) {
            this.update();
            newVal.addEventListener('update', this.update);
        }
    });

    prototype.__defineGetter__('model', function () {
        return this.model_;
    });

    prototype.update = function () {
        var model = this.model;
        if (!model) return;

    };

    document.registerElement('ky-eventdateview', {
        prototype: prototype
    });
}());
