(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            name: shadow.getElementById('name'),
            description: shadow.getElementById('description')
        };

        this.addEventListener('touchstart', this.onTouchStart);
        this.addEventListener('touchend', this.onTouchEnd);
    };

    prototype.__defineGetter__('model', function () {
        return this.model_;
    });

    prototype.__defineSetter__('model', function (newVal) {
        this.model_ = newVal;
        this.update();
    });

    prototype.update = function () {
        var model = this.model || {};

        this.$.name.innerText = model.name;
        this.$.description.innerText = model.description;
    };

    prototype.onTouchStart = function (ev) {
        this.classList.add('-hover');
    };

    prototype.onTouchEnd = function (ev) {
        this.classList.remove('-hover');
    };

    document.registerElement('ky-eventcard', {
        prototype: prototype
    });
}());
