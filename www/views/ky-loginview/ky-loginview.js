(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            loginBtn: shadow.getElementById('loginBtn'),
            signupBtn: shadow.getElementById('signupBtn'),
            emailInput: shadow.getElementById('emailInput'),
            passwordInput: shadow.getElementById('passwordInput'),
            errorMsg: shadow.getElementById('errorMsg')
        };

        this.errorMsgTimer = null;
        this.addEventListener('active', this.onActive);
        this.$.loginBtn.addEventListener('click', this.onLoginBtnClick.bind(this));
        this.$.signupBtn.addEventListener('click', this.onSignupBtnClick.bind(this));

        application.on('loginFailed', this.onLoginFailed.bind(this));
    };

    prototype.onActive = function (ev) {
        if (ev.detail.to !== this) return;

        this.$.emailInput.disabled = false;
        this.$.passwordInput.disabled = false;
        this.$.loginBtn.disabled = false;
        this.$.signupBtn.disabled = false;
    };

    prototype.onLoginBtnClick = function (ev) {
        var email = this.$.emailInput.value,
            password = this.$.passwordInput.value,
            self = this;

        this.showMessage('ログイン中', -1);
        this.$.emailInput.disabled = true;
        this.$.passwordInput.disabled = true;
        this.$.loginBtn.disabled = true;
        this.$.signupBtn.disabled = true;

        application.login(email, password);

    };

    prototype.onSignupBtnClick = function (ev) {
        application.navigateToSignupViewFromLoginView();
    };

    prototype.onLoginFailed = function (errmsg) {
        this.showMessage(errmsg);
        this.$.emailInput.disabled = false;
        this.$.passwordInput.disabled = false;
        this.$.loginBtn.disabled = false;
        this.$.signupBtn.disabled = false;
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

    document.registerElement('ky-loginview', {
        prototype: prototype
    });
}());
