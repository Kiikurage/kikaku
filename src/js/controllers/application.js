//@include ../service/util.js
//@include ../service/eventdispatcher.js
//@include ../models/eventmodel.js
//@include ../models/listmodel.js
//@include ../connection/connection.js

var application = (function () {
    function Application() {
        this.models = {
            attended: new ListModel(),
            creatingEvent: new EventModel(),
            selectedEvent: null,
            isLogin: false
        };
        var self = this;

        this.initializedPromise = new Promise(function (resolve, reject) {
            self.resolveInitializedPromise = resolve;
        });
    }

    extendClass(Application, EventDispatcher);

    Application.prototype.setup = function () {
        application.$ = {
            baseView: document.querySelector('ky-baseview')
        };

        Connection
            .status()
            .then(function (isAuthorized) {
                if (isAuthorized) {
                    application.models.isLogin = true;
                    application.updateAttendedModel();
                } else {
                    application.models.isLogin = false;
                }
                application.resolveInitializedPromise();
            })
            .catch(function (e) {
                console.error(e.stack);
            });
    };

    Application.prototype.login = function (email, password) {
        Connection
            .login(email, password)
            .then(function (res) {
                if (res.isSuccess) {
                    application.fire('loginSuccessed');
                    application.updateAttendedModel();
                } else {
                    application.fire('loginFailed', res.result.message.jp);
                }
            })
            .catch(function () {
                application.fire('loginFailed', '通信できませんでした。通信状態を確認して下さい。');
            });
    };

    Application.prototype.signup = function (name, email, password) {
        Connection
            .createUser(name, email, password)
            .then(function (res) {
                if (res.isSuccess) {
                    application.fire('signupSuccessed');
                    application.updateAttendedModel();
                } else {
                    application.fire('signupFailed', res.result.message.jp);
                }
            })
            .catch(function () {
                application.fire('signupFailed', '通信できませんでした。通信状態を確認して下さい。');
            });
    };

    Application.prototype.createEvent = function () {
        application.fire('creatingEvent');

        Connection
            .createEvent(application.models.creatingEvent)
            .then(function (res) {
                if (!res.isSuccess) return Promise.reject();

                application.fire('createEventSuccessed');
                return application.updateAttendedModel();
            })
            .catch(function () {
                application.fire('createEventFailed');
            });
    };

    Application.prototype.deleteEvent = function (model) {
        Connection
            .deleteEvent(model.id)
            .then(function (res) {
                if (!res.isSuccess) return Promise.reject(res);

                application.fire('deleteEventSuccessed', res);
                return application.updateAttendedModel();
            })
            .catch(function (e) {
                application.fire('deleteEventFailed', e);
            });
    };

    Application.prototype.updateAttendedModel = function () {
        Connection
            .getAllEvents()
            .then(function (res) {
                application.models.attended.setArray(res.result);
            });
    };

    Application.prototype.clearEventCreateForm = function () {
        application.models.creatingEvent = new EventModel();
        application.fire('clearEventCreateForm');
    };

    Application.prototype.navigateToSignupView = function () {
        application.fire('navigateToSignupView');
    };

    Application.prototype.navigateToSignupViewFromLoginView = function () {
        application.fire('navigateToSignupViewFromLoginView');
    };

    Application.prototype.navigateToLoginViewFromSignupView = function () {
        application.fire('navigateToLoginViewFromSignupView');
    };

    Application.prototype.navigateToTopView = function () {
        application.fire('navigateToTopView');
    };

    Application.prototype.navigateToEventViewFromEventCreateView = function () {
        application.models.selectedEvent = application.models.creatingEvent;
        application.fire('navigateToEventViewFromEventCreateView');
    };

    Application.prototype.navigateToEventView = function (event) {
        application.models.selectedEvent = event;
        application.fire('navigateToEventView');
    };

    Application.prototype.navigateToEventCreateTitleView = function () {
        application.clearEventCreateForm();
        application.fire('navigateToEventCreateTitleView');
    };

    Application.prototype.navigateToEventCreateTitleViewFromEventCreateDateView = function () {
        application.fire('navigateToEventCreateTitleViewFromEventCreateDateView');
    };

    Application.prototype.navigateToEventCreateDateView = function () {
        application.fire('navigateToEventCreateDateView');
    };

    Application.prototype.cancelCreateEvent = function () {
        application.models.creatingEvent = null;
        application.clearEventCreateForm();
        application.fire('cancelCreateEvent');
    };

    Application.prototype.successCreateEvent = function () {
        application.models.creatingEvent = null;
        application.clearEventCreateForm();
        application.fire('successCreateEvent');
    };

    Application.prototype.showCreatedEvent = function () {
        application.models.selectedEvent = application.models.creatingEvent;
        application.fire('showCreatedEvent');
    };

    Application.prototype.gobackToTopView = function () {
        application.fire('gobackToTopView');
    };

    return new Application();
}());
application.setup();
