

function extendClass(subClass, superClass) {
    var __ = function () {
    };
    __.prototype = new superClass();
    subClass.prototype = new __();
    subClass.prototype.constructor = subClass;
    subClass.prototype.super = superClass;
}

function extend(target, opt_src) {
    var srces = Array.prototype.slice.call(arguments, 1);
    srces.forEach(function (src) {
        if (!isObject(src)) return;
        Object.keys(src).forEach(function (key) {
            target[key] = src[key];
        });
    });

    return target
}

function isObject(exp) {
    return (typeof exp === 'object' && !!exp)
}


var EventDispatcher = (function () {

    function EventDispatcher() {
        if (!(this instanceof EventDispatcher)) {
            return new EventDispatcher();
        }

        this.callbacks_ = {};
    }

    EventDispatcher.prototype.addEventListener = function (type, fn) {
        var listeners = this.callbacks_[type];

        if (!listeners) {
            listeners = this.callbacks_[type] = [];
        }

        listeners.push(fn);
    };

    EventDispatcher.prototype.removeEventListener = function (type, fn) {
        var listeners = this.callbacks_[type],
            i, max;

        if (!listeners) return;

        for (i = 0, max = listeners.length; i < max; i++) {
            if (listeners[i] === fn) {
                listeners.splice(i, 1);
                max--;
                i--;
            }
        }
    };

    EventDispatcher.prototype.dispatchEvent = function (type, ev) {
        var listeners = this.callbacks_[type],
            i, max;

        if (!listeners) return;

        for (i = 0, max = listeners.length; i < max; i++) {
            listeners[i].call(this, ev);
        }
    };

    EventDispatcher.prototype.on = EventDispatcher.prototype.addEventListener;
    EventDispatcher.prototype.off = EventDispatcher.prototype.addEventListener;
    EventDispatcher.prototype.one = function (type, fn) {
        var self = this,
            proxy = function (ev) {
                self.off(type, proxy);
                fn.call(this, ev);
            };
        this.on(type, proxy);
    };
    EventDispatcher.prototype.fire = EventDispatcher.prototype.dispatchEvent;

    return EventDispatcher;
}());



undefined


undefined

undefined
var Model = (function() {
    function Model(data) {
        if (!(this instanceof Model)) {
            return new Model(data);
        }

        EventDispatcher.call(this);
    }

    extendClass(Model, EventDispatcher);

    Model.prototype.update = function() {
        this.dispatchEvent('update');
    };

    return Model
}());

var EventModel = (function() {
    function EventModel(data) {
        if (!(this instanceof EventModel)) {
            return new EventModel(data);
        }

        Model.call(this);

        if (isObject(data)) {
            this.updateWithObject(data);
        }
    }

    extendClass(EventModel, Model);

    /**
     * ID
     * @type {string}
     */
    EventModel.prototype.id = '';

    /**
     * 名前
     * @type {string}
     */
    EventModel.prototype.name = '';

    /**
     * 説明文
     * @type {string}
     */
    EventModel.prototype.description = '';

    /**
     * 候補日
     * @type {string}
     */
    EventModel.prototype.datelist = '';

    EventModel.prototype.updateWithObject = function(data) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.datelist = data.datelist || '';
        this.update();
    };

    return EventModel
}());



undefined

undefined
var ListModel = (function() {
    function ListModel() {
        if (!(this instanceof ListModel)) {
            return new ListModel();
        }

        Model.call(this);
    }

    extendClass(ListModel, Model);

    var ArrayProto = Array.prototype,
        push = ArrayProto.push,
        pop = ArrayProto.pop,
        unshift = ArrayProto.unshift,
        shift = ArrayProto.shift,
        splice = ArrayProto.splice;

    ListModel.prototype.length = 0;

    ListModel.prototype.push = function() {
        var res = push.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.pop = function() {
        var res = pop.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.unshift = function() {
        var res = unshift.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.shift = function() {
        var res = shift.apply(this, arguments);
        this.update();
        return res;
    };

    ListModel.prototype.splice = function() {
        var res = splice.apply(this, arguments);
        this.update();
        return res
    };

    ListModel.prototype.setArray = function(arr) {
        var max1 = this.length,
            max2 = arr.length,
            i;

        this.length = max2;

        for (i = 0; i < max2; i++) {
            this[i] = arr[i];
        }

        if (max1 > max2) {
            for (i = max2; i < max1; i++) {
                delete this[i];
            }
        }

        this.update();
    };

    return ListModel;
}());


/**
 * @namespace Connection
 */
var Connection = (function () {
    var Connection = Connection || {},
        KEY = 'token';


    //@TODO: For debugging.
    //Connection.HOST = 'http://localhost:8080/api';
    //
    //@TODO: For release.
    Connection.HOST = 'http://kikakuserver-silverlance.rhcloud.com/api';

    Connection.getToken = function () {
        return new Promise(function (resolve, reject) {
            if (window.chrome && window.chrome.storage) {
                //Chrome Apps
                chrome.storage.local.get(KEY, function (items) {
                    resolve(items[KEY]);
                });
            } else {
                resolve(localStorage.getItem(KEY));
            }
        });
    };

    Connection.setToken = function (token) {
        return new Promise(function (resolve, reject) {
            var items;

            if (window.chrome && window.chrome.storage) {
                //Chrome Apps
                items = {};
                items[KEY] = token;
                chrome.storage.local.set(items, resolve);
            } else {
                resolve(localStorage.setItem(KEY, token));
            }
        });
    };

    /**
     * HTTP:POST
     * @param {string} url
     * @param {Object} params
     * @returns {Promise}
     */
    Connection.post = function (url, params) {
        return Connection.getToken()
            .then(function (token) {
                url += '?' + Connection.encodeURLParams({
                    token: token
                });

                return Connection.ajax('POST', url, params);
            });
    };

    /**
     * HTTP:DELETE
     * @param {string} url
     * @returns {Promise}
     */
    Connection.delete = function (url) {
        return Connection.getToken()
            .then(function (token) {
                url += '?' + Connection.encodeURLParams({
                    token: token
                });

                return Connection.ajax('DELETE', url, '');
            });
    };

    /**
     * HTTP:GET
     * @param {string} url
     * @param {Object} params
     * @returns {Promise}
     */
    Connection.get = function (url, params) {
        params = params || {};

        return Connection.getToken()
            .then(function (token) {
                params.token = token
                url += '?' + Connection.encodeURLParams(params);

                return Connection.ajax('GET', url, '');
            });
    };

    /**
     * Send HTTP request.
     * @param {string} method
     * @param {string} url
     * @param {Object} body
     * @returns {Promise}
     */
    Connection.ajax = function (method, url, body) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, Connection.HOST + url);

            xhr.onload = function () {
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.onerror = function () {
                reject(xhr);
            };

            if (body) {
                xhr.setRequestHeader('Content-type', 'application/json');
                body = JSON.stringify(body);
            }
            xhr.send(body);
        });
    };

    /**
     * Encode object as URL encode.
     * @param params
     * @returns {string}
     */
    Connection.encodeURLParams = function (params) {
        var parts = [];
        Object.keys(params).forEach(function (key) {
            parts.push(key + '=' + encodeURIComponent(params[key]));
        });
        return parts.join('&');
    };
Connection.status = function() {
    return Connection.getToken()
        .then(function(token) {
            if (!token) {
                return Promise.resolve(false);
            }

            return Connection
                .get('/auth/status', {
                    token: token
                })
                .then(function(response) {
                    if (!response.result) {
                        return Connection.setToken('')
                            .then(function() {
                                return response;
                            });
                    } else {
                        return response;
                    }
                })
                .catch(function(e) {
                    console.error(e);
                });
        });
};

Connection.login = function(email, password) {
    return Connection
        .post('/auth/login', {
            email: email,
            password: password
        })
        .then(function(response) {
            if (response.isSuccess) {
                return Connection.setToken(response.result)
                    .then(function() {
                        return response;
                    })
            } else {
                return response;
            }
        })
        .catch(function(e) {
            console.error(e);
        });
};


/**
 * Create User
 * POST /user/create
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
Connection.createUser = function(name, email, password) {
    return Connection
        .post('/user', {
            name: name,
            email: email,
            password: password
        })
        .then(function(response) {
            if (response.isSuccess) {
                return Connection.setToken(response.result).
                then(function() {
                    return response;
                })
            } else {
                return response;
            }
        })
        .catch(function(e) {
            console.error(e);
        });
};


/**
 * Create Event
 * POST /event/create
 * @param params
 * @returns {Promise}
 */
Connection.createEvent = function(params) {
    return Connection
        .post('/event', params)
        .then(function(res) {
            res.result = EventModel(res.result);
            return res;
        })
        .catch(function(e) {
            console.error(e);
        });
};

/**
 * Delete Event
 * DELETE /event/:id
 * @param {string} id
 * @returns {Promise}
 */
Connection.deleteEvent = function(id) {
    return Connection
        .delete('/event/' + id)
        .then(function(res) {
            res.result = EventModel(res.result);
            return res;
        })
        .catch(function(e) {
            console.error(e);
        });
};

/**
 * Get All Event
 * GET /event/all
 * @returns {Promise}
 */
Connection.getAllEvents = function() {
    return Connection
        .get('/event/all')
        .then(function(res) {
            res.result = res.result.map(EventModel);
            return res;
        })
        .catch(function(e) {
            console.error(e);
        });
};

return Connection;
}());

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

