(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            basePanel: shadow.getElementById('basePanel'),
            createBtn: shadow.getElementById('createEventBtn'),
            eventList: shadow.getElementById('eventList')
        };

        this.$.eventList.model = application.models.attended;
        this.addEventListener('active', this.onActive);
        this.$.eventList.addEventListener('select', this.onEventListSelect.bind(this));
        this.$.createBtn.addEventListener('click', this.onCreateBtnClick.bind(this));
    };

    prototype.onCreateBtnClick = function (ev) {
        application.navigateToEventCreateTitleView();
    };

    prototype.onEventListSelect = function (ev) {
        application.navigateToEventView(ev.detail.model);
    };

    document.registerElement('ky-topview', {
        prototype: prototype
    });
}());
