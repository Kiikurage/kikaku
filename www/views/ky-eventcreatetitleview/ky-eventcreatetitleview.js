(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            backBtn: shadow.getElementById('backBtn'),
            nextBtn: shadow.getElementById('nextBtn'),
            nameInput: shadow.getElementById('nameInput'),
            descriptionInput: shadow.getElementById('descriptionInput'),
            clearDialog: shadow.getElementById('clearDialog'),
            clearDialogOKBtn: shadow.getElementById('clearDialogOKBtn'),
            clearDialogCancelBtn: shadow.getElementById('clearDialogCancelBtn'),
        };

        this.onHardBackButtonClick = this.onHardBackButtonClick.bind(this);

        this.addEventListener('active', this.onActive);
        this.addEventListener('deactive', this.onDeactive);
        this.$.backBtn.addEventListener('click', this.onBackBtnClick.bind(this));
        this.$.nextBtn.addEventListener('click', this.onNextBtnClick.bind(this));
        this.$.nameInput.addEventListener('input', this.onNameInputInput.bind(this));
        this.$.descriptionInput.addEventListener('input', this.onDescriptionInputInput.bind(this));
        this.$.clearDialogOKBtn.addEventListener('click', this.onClearDialogOKBtnClick.bind(this));
        this.$.clearDialogCancelBtn.addEventListener('click', this.onClearDialogCancelBtnClick.bind(this));

        application.on('clearEventCreateForm', this.onClearEventCreateForm.bind(this));
    };

    prototype.clear = function (ev) {
        this.$.nameInput.value = '';
        this.$.descriptionInput.value = '';
        this.$.nextBtn.disabled = true;
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
        this.$.clearDialog.open();
    };

    prototype.onNextBtnClick = function (ev) {
        application.navigateToEventCreateDateView();
    };

    prototype.onHardBackButtonClick = function () {
        this.$.clearDialog.open();
    };

    prototype.onClearEventCreateForm = function () {
        this.clear();
    };

    prototype.onNameInputInput = function (ev) {
        this.$.nextBtn.disabled = (this.$.nameInput.value === '');
        application.models.creatingEvent.name = this.$.nameInput.value;
    };

    prototype.onDescriptionInputInput = function (ev) {
        application.models.creatingEvent.description = this.$.descriptionInput.value;
    };

    prototype.onClearDialogOKBtnClick = function (ev) {
        this.$.clearDialog.close();
        application.cancelCreateEvent();
    };

    prototype.onClearDialogCancelBtnClick = function (ev) {
        this.$.clearDialog.close();
    };

    document.registerElement('ky-eventcreatetitleview', {
        prototype: prototype
    });
}());
