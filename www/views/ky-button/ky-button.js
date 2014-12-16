(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.isDummyClickEvent = false;

        this.addEventListener('touchstart', this.onTouchStart);
        this.addEventListener('touchend', this.onTochEnd);
        this.addEventListener('click', this.onClick);
    };

    prototype.ClassName = {
        HOVER: '-hover'
    };

    prototype.__defineGetter__('disabled', function () {
        return this.hasAttribute('disabled')
    });

    prototype.__defineSetter__('disabled', function (newVal) {
        if (newVal) {
            this.setAttribute('disabled', 'disabled');
        } else {
            this.removeAttribute('disabled');
        }
    });

    prototype.onTouchStart = function (ev) {
        if (!this.disabled) {
            this.classList.add(this.ClassName.HOVER);
        }
    };

    prototype.onTochEnd = function (ev) {
        if (!this.disabled) {
            this.classList.remove(this.ClassName.HOVER);
            //    this.isDummyClickEvent = true;
            //    this.dispatchEvent(new CustomEvent('click', {bubbles: true}));
        }
    };

    prototype.onClick = function (ev) {
        //if (this.isDummyClickEvent) {
        //    this.isDummyClickEvent = false;
        //} else {
        //    ev.preventDefault();
        //    ev.stopImmediatePropagation();
        //}
        if (this.disabled) {
            ev.preventlDefault();
            ev.stopImmediatePropagation();
        }
    };

    document.registerElement('ky-button', {
        prototype: prototype
    });
}());
