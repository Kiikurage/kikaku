(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            backBtn: shadow.getElementById('backBtn'),
            sendBtn: shadow.getElementById('sendBtn'),
            goTopBtn: shadow.getElementById('goTopBtn'),
            goEventBtn: shadow.getElementById('goEventBtn'),
            calendar: shadow.getElementById('calendar'),
            creatingDialog: shadow.getElementById('creatingDialog'),
            createSuccessDialog: shadow.getElementById('createSuccessDialog'),
            createFailedDialog: shadow.getElementById('createFailedDialog'),
            createFailedDialogOKBtn: shadow.getElementById('createFailedDialogOKBtn'),
            createFailedDialogMessage: shadow.getElementById('createFailedDialogMessage')
        };
        this.createdEvent = null;

        this.onHardBackButtonClick = this.onHardBackButtonClick.bind(this);

        this.addEventListener('active', this.onActive);
        this.addEventListener('deactive', this.onDeactive);
        this.$.goTopBtn.addEventListener('click', this.onGoTopBtnClick.bind(this));
        this.$.goEventBtn.addEventListener('click', this.onGoEventBtnClick.bind(this));
        this.$.backBtn.addEventListener('click', this.onBackBtnClick.bind(this));
        this.$.sendBtn.addEventListener('click', this.onSendBtnClick.bind(this));
        this.$.calendar.addEventListener('change', this.onCalendarChange.bind(this));
        this.$.createFailedDialogOKBtn.addEventListener('click', this.onCreateFailedDialogOKBtnClick.bind(this));

        application.on('clearEventCreateForm', this.onClearEventCreateForm.bind(this));
        application.on('creatingEvent', this.onCreatingEvent.bind(this));
        application.on('createEventSuccessed', this.onCreateEventSuccessed.bind(this));
        application.on('createEventFailed', this.onCreateEventFailed.bind(this));
    };

    prototype.clear = function (ev) {
        this.$.calendar.clear();
        this.$.calendar.year = new Date().getFullYear();
        this.$.calendar.month = new Date().getMonth() + 1;
        this.$.sendBtn.disabled = true;
    };

    prototype.onActive = function (ev) {
        if (ev.detail.to !== this) return;

        document.addEventListener('backbutton', this.onHardBackButtonClick);
    };

    prototype.onDeactive = function (ev) {
        if (ev.detail.from !== this) return;

        document.removeEventListener('backbutton', this.onHardBackButtonClick);
    };

    prototype.onBackBtnClick = function (ev) {
        application.navigateToEventCreateTitleViewFromEventCreateDateView();
    };

    prototype.onGoEventBtnClick = function (ev) {
        this.$.createSuccessDialog.close();
        application.showCreatedEvent();
    };

    prototype.onGoTopBtnClick = function (ev) {
        this.$.createSuccessDialog.close();
        application.successCreateEvent();
    };

    prototype.onSendBtnClick = function (ev) {
        application.models.creatingEvent.datelist = this.$.calendar.selected;

        this.$.creatingDialog.open();
        application.createEvent();
    };

    prototype.onHardBackButtonClick = function () {
        this.navigateToEventCreateTitleView();
    };

    prototype.onCalendarChange = function (ev) {
        this.$.sendBtn.disabled = (this.$.calendar.selected.length === 0);
    };

    prototype.onClearEventCreateForm = function () {
        this.clear();
    };

    prototype.onCreatingEvent = function () {
        this.$.creatingDialog.open();
    };

    prototype.onCreateEventSuccessed = function () {
        this.$.creatingDialog.close();
        this.$.createSuccessDialog.open();
    };

    prototype.onCreateEventFailed = function () {
        this.$.creatingDialog.close();
        this.$.createFailedDialog.open();
    };

    prototype.onCreateFailedDialogOKBtnClick = function (ev) {
        this.$.createFailedDialog.close();
    };

    prototype.navigateToEventCreateTitleView = function () {
        application.navigateToEventCreateTitleView();
    };

    document.registerElement('ky-eventcreatedateview', {
        prototype: prototype
    });
}());
