(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            base: shadow.getElementById('base'),
            wrapper: shadow.getElementById('wrapper')
        };

        this.$.wrapper.addEventListener('click', this.onWrapperClick.bind(this));
    };

    prototype.onWrapperClick = function (ev) {
        if (ev.target !== this.$.wrapper) return;
        this.cancel();
    };

    prototype.cancel = function () {
        this.close();
        this.dispatchEvent(new CustomEvent('cancel'));
    };

    prototype.close = function () {
        var self = this;
        requestAnimationFrame(function () {
            self.classList.remove('-open');
        });
    };

    prototype.open = function () {
        var self = this;
        requestAnimationFrame(function () {
            self.classList.add('-open');
        });
    };

    document.registerElement('ky-dialog', {
        prototype: prototype
    });
}());