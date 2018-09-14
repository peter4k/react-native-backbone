import _ from 'underscore';

var fetchStorage = {};

fetchStorage.globalOptions = {};

var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
};

fetchStorage.sync = function (method, model, options) {

    var type = methodMap[method];

    if (typeof options === 'function') {
        callback = options;
        options = null;
    }
    options = options || {};

    var request = {
        method: type,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (type != 'GET' && type != 'HEAD') {
        request['body'] = JSON.stringify(options.attrs || model.toJSON(options));
    }

    if (fetchStorage.globalOptions.headers) {
        for (header in fetchStorage.globalOptions.headers) {
            request.headers[header] = fetchStorage.globalOptions.headers[header];
        }
    }

    if (options.headers) {
        for (header in options.headers) {
            request.headers[header] = options.headers[header];
        }
    }

    var url;

    if (!options.url) {
        url = _.result(model, 'url') || urlError();
    }

    if (fetchStorage.globalOptions.baseUrl) {
        var base = fetchStorage.globalOptions.baseUrl;
        if (base[base.length - 1] === "/") {
            base = base.slice(0, -1);
        }
        url = base + url;
    }

    if (options.data) {
        var params = [];
        for (key in options.data) {
            params.push(key + '=' + encodeURIComponent(options.data[key]));
        }
        if (params.length) {
            url = url + '?' + params.join('&');
        }
    }

    fetchStorage.send(url, request, function (error, json) {
        if (error) {
            options.error(error);
        } else {
            options.success(json);
        }
    })
};

fetchStorage.send = async function (url, req, callback) {
    if (callback) {
        _send(url, req, callback);
    } else {
        try {
            await _sendAsync(url, req);
        } catch (e) {
            throw e;
        }
    }
};

const _send = async function (url, req, callback) {
    var error, json;
    try {
        json = await _sendAsync(url, req);
    } catch (_error) {
        error = _error;
    }
    callback(error, json);
};

const _sendAsync = async function (url, req) {
    try {
        var response = await fetch(url, req);
        if((response.status >= 200 && response.status <= 208) || (response.status === 226)) {
            var responseText = await response.text();
            try {
                return JSON.parse(responseText);
            } catch (e) {
                return responseText;
            }
        } else {
            var error;
            try {
                var errorText = await response.text();
                var errorJSON = JSON.parse(errorText);
                error = errorJSON["error-message"] || errorText;
            } catch (e) {
                error = errorText || "";
            }
            throw {
                error: new Error(error),
                status: response.status,
                code: 104
            }
        }
    } catch (e) {
        throw e;
    }
};

var urlError = function () {
    throw new Error('A "url" property or function must be specified');
};

export default fetchStorage;
