(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            loginBtn: shadow.getElementById('loginBtn'),
            sendBtn: shadow.getElementById('sendBtn'),
            nameInput: shadow.getElementById('nameInput'),
            emailInput: shadow.getElementById('emailInput'),
            passwordInput: shadow.getElementById('passwordInput'),
            errorMsg: shadow.getElementById('errorMsg')
        };

        this.errorMsgTimer = null;
        this.addEventListener('active', this.onActive);
        this.$.sendBtn.addEventListener('click', this.onSendBtnClick.bind(this));
        this.$.loginBtn.addEventListener('click', this.onLoginBtnClick.bind(this));

        application.on('signupFailed', this.onSignupFailed.bind(this));
    };

    prototype.onActive = function (ev) {
        if (ev.detail.to !== this) return;

        this.$.nameInput.disabled = false;
        this.$.emailInput.disabled = false;
        this.$.passwordInput.disabled = false;
        this.$.sendBtn.disabled = false;
        this.$.loginBtn.disabled = false;
    };

    prototype.onSendBtnClick = function (ev) {
        var name = this.$.nameInput.value,
            email = this.$.emailInput.value,
            password = this.$.passwordInput.value,
            self = this;

        this.showMessage('通信中', -1);
        this.$.nameInput.disabled = true;
        this.$.emailInput.disabled = true;
        this.$.passwordInput.disabled = true;
        this.$.sendBtn.disabled = true;
        this.$.loginBtn.disabled = true;

        application.signup(name, email, password);
    };

    prototype.onLoginBtnClick = function (ev) {
        application.navigateToLoginViewFromSignupView();
    };

    prototype.onSignupFailed = function (errmsg) {
        this.showMessage(errmsg);
        this.$.nameInput.disabled = false;
        this.$.emailInput.disabled = false;
        this.$.passwordInput.disabled = false;
        this.$.sendBtn.disabled = false;
        this.$.loginBtn.disabled = false;
    };

    prototype.showMessage = function (msg, duration) {
        var errorMsg = this.$.errorMsg;
        duration = duration || 3000;

        errorMsg.innerText = msg;
        errorMsg.classList.remove('-hide');

        if (this.errorMsgTimer) {
            clearTimeout(this.errorMsgTimer);
        }

        if (duration < 0) return;

        this.errorMsgTimer = setTimeout(function () {
            errorMsg.classList.add('-hide');
        }, duration);
    };

    document.registerElement('ky-signupview', {
        prototype: prototype
    });
}());
