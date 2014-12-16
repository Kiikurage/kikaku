(function () {

    var prototype = Object.create(HTMLElement.prototype),
        ownerDocument = (document._currentScript || document.currentScript).ownerDocument,
        template = ownerDocument.querySelector('template');

    prototype.createdCallback = function () {
        var shadow = this.createShadowRoot();
        shadow.appendChild(ownerDocument.importNode(template.content, true));

        this.$ = {
            pager: shadow.querySelector('ky-view-pager'),
            loginView: shadow.querySelector('ky-loginview'),
            signupView: shadow.querySelector('ky-signupview'),
            topView: shadow.querySelector('ky-topview'),
            eventCreateTitleView: shadow.querySelector('ky-eventcreatetitleview'),
            eventCreateDateView: shadow.querySelector('ky-eventcreatedateview'),
            eventView: shadow.querySelector('ky-eventview'),
            searchUserView: shadow.querySelector('ky-searchuserview'),
        };

        application.initializedPromise
            .then(function () {
                if (application.models.isLogin) {
                    this.onNavigateToTopView();
                } else {
                    this.onNavigateToSignupView();
                }
            }.bind(this));

        application.on('loginSuccessed', this.onLoginSuccessed.bind(this));
        application.on('signupSuccessed', this.onSignupSuccessed.bind(this));
        application.on('navigateToEventView', this.onNavigateToEventView.bind(this));
        application.on('navigateToEventCreateTitleView', this.onNavigateToEventCreateTitleView.bind(this));
        application.on('navigateToEventCreateTitleViewFromEventCreateDateView', this.onNavigateToEventCreateTitleViewFromEventCreateDateView.bind(this));
        application.on('navigateToEventCreateDateView', this.onNavigateToEventCreateDateView.bind(this));
        application.on('navigateToSignupView', this.onNavigateToSignupView.bind(this));
        application.on('navigateToSignupViewFromLoginView', this.onNavigateToSignupViewFromLoginView.bind(this));
        application.on('navigateToLoginViewFromSignupView', this.onNavigateToLoginViewFromSignupView.bind(this));
        application.on('navigateToTopView', this.onNavigateToTopView.bind(this));
        application.on('gobackToTopView', this.onGobackToTopView.bind(this));
        application.on('cancelCreateEvent', this.onCancelCreateEvent.bind(this));
        application.on('successCreateEvent', this.onSuccessCreateEvent.bind(this));
        application.on('showCreatedEvent', this.showCreatedEvent.bind(this));
    };

    prototype.onLoginSuccessed = function () {
        return this.$.pager.slideLeft(this.$.topView);
    };

    prototype.onSignupSuccessed = function () {
        return this.$.pager.slideLeft(this.$.topView);
    };

    prototype.onNavigateToSignupViewFromLoginView = function () {
        return this.$.pager.slideRight(this.$.signupView);
    };

    prototype.onNavigateToLoginViewFromSignupView = function () {
        return this.$.pager.slideLeft(this.$.loginView);
    };

    prototype.onNavigateToEventView = function (ev) {
        this.$.eventView.model = application.models.selectedEvent;
        return this.$.pager.cover(this.$.eventView);
    };

    prototype.onNavigateToEventCreateTitleView = function () {
        return this.$.pager.coverUp(this.$.eventCreateTitleView);
    };

    prototype.onNavigateToEventCreateTitleViewFromEventCreateDateView = function () {
        return this.$.pager.slideRight(this.$.eventCreateTitleView);
    };

    prototype.onNavigateToEventCreateDateView = function () {
        return this.$.pager.slideLeft(this.$.eventCreateDateView);
    };

    prototype.onNavigateToSignupView = function () {
        this.$.pager.jump(this.$.signupView);
        this.removeAttribute('unresolved');
    };

    prototype.onNavigateToTopView = function () {
        this.$.pager.jump(this.$.topView);
        this.removeAttribute('unresolved');
    };

    prototype.onCancelCreateEvent = function () {
        return this.$.pager.uncoverDown(this.$.topView);
    };

    prototype.onSuccessCreateEvent = function () {
        return this.$.pager.uncoverDown(this.$.topView);
    };

    prototype.onGobackToTopView = function () {
        return this.$.pager.uncover(this.$.topView);
    };

    prototype.showCreatedEvent = function () {
        var self = this;

        return this.$.pager.uncover(this.$.topView)
            .then(function () {
                self.$.pager.cover(self.$.eventView);
            });
    };

    document.registerElement('ky-baseview', {
        prototype: prototype
    });
}());
