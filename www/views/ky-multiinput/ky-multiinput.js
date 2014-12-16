(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            label: shadow.querySelector('label'),
            input: shadow.querySelector('textarea')
        };

        this.$.input.value = this.value;
        this.$.label.innerText = this.title;

        this.addEventListener('click', this.onclick_);
        this.$.input.addEventListener('input', this.oninputinput_.bind(this));
    };

    prototype.onclick_ = function (ev) {
        this.$.input.focus();
        ev.preventDefault();
    };

    prototype.oninputinput_ = function (ev) {
        if (this.$.input.value === '') {
            this.showLabel();
        } else {
            this.hideLabel();
        }
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
        if (this.$.input.value === '') {
            this.showLabel();
        } else {
            this.hideLabel();
        }
        this.setAttribute('value', newVal);
    });

    prototype.showLabel = function () {
        this.$.label.classList.remove('-hide');
    };

    prototype.hideLabel = function () {
        this.$.label.classList.add('-hide');
    };

    document.registerElement('ky-multiinput', {
        prototype: prototype
    });
}());
