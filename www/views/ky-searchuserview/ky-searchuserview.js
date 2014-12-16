(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            backBtn: shadow.getElementById('backBtn')
        };

        this.onHardBackBtnPush = this.onHardBackBtnPush.bind(this);

        this.addEventListener('active', this.onActive);
        this.addEventListener('deactive', this.onDeactive);
        this.$.backBtn.addEventListener('click', this.onBackBtnClick.bind(this));

        this.clear();
    };

    prototype.clear = function () {
        this.update();
    };

    prototype.update = function () {
    };

    prototype.onActive = function (ev) {
        if (ev.detail.to !== this) return;

        this.clear();
        document.addEventListener('backbutton', this.onHardBackBtnPush, false);
    };

    prototype.onDeactive = function (ev) {
        if (ev.detail.from !== this) return;

        document.removeEventListener('backbutton', this.onHardBackBtnPush, false);
    };

    prototype.onHardBackBtnPush = function (ev) {
        this.requestNavigateViewBackward();
    };

    prototype.onBackBtnClick = function (ev) {
        this.requestNavigateViewBackward();
    };

    prototype.requestNavigateViewBackward = function () {
        this.dispatchEvent(new CustomEvent('navigateViewBackward'));
    }

    document.registerElement('ky-searchuserview', {
        prototype: prototype
    });
}());
