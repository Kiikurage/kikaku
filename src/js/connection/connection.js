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

    //@include auth.js
    //@include user.js
    //@include event.js

    return Connection;
}());
