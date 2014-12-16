(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            label: shadow.querySelector('label'),
            input: shadow.querySelector('input')
        };

        this.$.input.value = this.value;
        this.$.label.innerText = this.title;

        this.addEventListener('click', this.onclick_);
        this.$.input.addEventListener('input', this.oninputinput_.bind(this));
        this.$.input.addEventListener('change', this.oninputchange_.bind(this));

        if (this.hasAttribute('password')) {
            this.$.input.setAttribute('type', 'password');
        }
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

    prototype.showLabel = function () {
        this.$.label.classList.remove('-hide');
    };

    prototype.hideLabel = function () {
        this.$.label.classList.add('-hide');
    };

    prototype.onclick_ = function (ev) {
        if (this.disabled) return;

        this.$.input.focus();
        ev.preventDefault();
    };

    prototype.oninputinput_ = function (ev) {
        if (this.$.input.value === '') {
            this.showLabel();
        } else {
            this.hideLabel();
        }
        this.dispatchEvent(new CustomEvent('input'));
    };

    prototype.oninputchange_ = function (ev) {
        this.dispatchEvent(new CustomEvent('change'));
    };

    prototype.__defineGetter__('title', function () {
        return this.getAttribute('title');
    });

    prototype.__defineSetter__('title', function (newVal) {
        this.$.label.innerText = newVal;
        this.setAttribute('title', newVal);
    });

    prototype.__defineGetter__('value', function () {
        return this.$.input.value
    });

    prototype.__defineSetter__('value', function (newVal) {
        this.$.input.value = newVal;
        if (newVal === '') {
            this.showLabel();
        } else {
            this.hideLabel();
        }
        this.setAttribute('value', newVal);
    });

    document.registerElement('ky-input', {
        prototype: prototype
    });
}());
