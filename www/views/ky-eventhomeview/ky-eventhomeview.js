(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            title: shadow.getElementById('title'),
            description: shadow.getElementById('description'),
            cancelBtn: shadow.getElementById('cancelBtn'),
            cancelDialog: shadow.getElementById('cancelDialog'),
            cancelDialogOKBtn: shadow.getElementById('cancelDialogOKBtn'),
            cancelDialogCancelBtn: shadow.getElementById('cancelDialogCancelBtn'),
            cancelingDialog: shadow.getElementById('cancelingDialog'),
            cancelSuccessDialog: shadow.getElementById('cancelSuccessDialog'),
            cancelSuccessDialogOKBtn: shadow.getElementById('cancelSuccessDialogOKBtn'),
            cancelFailedDialog: shadow.getElementById('cancelFailedDialog'),
            cancelFailedDialogMessage: shadow.getElementById('cancelFailedDialogMessage'),
            cancelFailedDialogOKBtn: shadow.getElementById('cancelFailedDialogOKBtn')
        };

        this.model_ = null;
        this.update = this.update.bind(this);

        this.$.cancelBtn.addEventListener('click', this.onCancelBtnClick.bind(this));
        this.$.cancelDialogOKBtn.addEventListener('click', this.onCancelDialogOKBtnClick.bind(this));
        this.$.cancelDialogCancelBtn.addEventListener('click', this.onCancelDialogCancelBtnClick.bind(this));
        this.$.cancelSuccessDialogOKBtn.addEventListener('click', this.onCancelSuccessDialogOKBtnClick.bind(this));
        this.$.cancelFailedDialogOKBtn.addEventListener('click', this.onCancelFailedDialogOKBtnClick.bind(this));

        application.on('deleteEventSuccessed', this.onDeleteEventSuccessed.bind(this));
        application.on('deleteEventFailed', this.onDeleteEventFailed.bind(this));
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

        this.$.title.innerText = model.name;
        this.$.description.innerText = model.description;
    };

    prototype.onDeleteEventSuccessed = function (ev) {
        this.$.cancelingDialog.close();
        this.$.cancelSuccessDialog.open();
    };

    prototype.onDeleteEventFailed = function (res) {
        this.$.cancelingDialog.close();
        this.$.cancelFailedDialogMessage.innerHTML = res.result ?
            res.result.message.jp :
            '通信できませんでした<br>通信状態を確認して下さい';
        this.$.cancelFailedDialog.open();
    };

    prototype.onCancelBtnClick = function (ev) {
        this.$.cancelDialog.open();
    };

    prototype.onCancelDialogOKBtnClick = function (ev) {
        var self = this;

        self.$.cancelDialog.close();
        self.$.cancelingDialog.open();
        application.deleteEvent(this.model);
    };

    prototype.onCancelDialogCancelBtnClick = function (ev) {
        this.$.cancelDialog.close();
    };

    prototype.onCancelSuccessDialogOKBtnClick = function (ev) {
        this.$.cancelSuccessDialog.close();
        application.gobackToTopView();
    };

    prototype.onCancelFailedDialogOKBtnClick = function (ev) {
        this.$.cancelFailedDialog.close();
    };

    document.registerElement('ky-eventhomeview', {
        prototype: prototype
    });
}());
