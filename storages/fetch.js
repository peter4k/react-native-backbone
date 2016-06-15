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

fetchStorage.sync = function(method, model, options) {

    var type = methodMap[method];

    if(typeof options === 'function'){
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

    if(type != 'GET' && type != 'HEAD'){
        request['body'] = JSON.stringify(model.toJSON());
    }

    if(fetchStorage.globalOptions.headers){
        for(header in fetchStorage.globalOptions.headers){
            request.headers[header] = fetchStorage.globalOptions.headers[header];
        }
    }

    if(options.headers){
        for(header in options.headers){
            request.headers[header] = options.headers[header];
        }
    }

    var url;

    if (!options.url) {
        url = _.result(model, 'url') || urlError();
    }

    fetchStorage.send(url, request, function(error, json){
        if(error){
            options.error(error);
        }else{
            options.success(json);
        }
    })
};

fetchStorage.send = function(url, req, callback){
    var error = [];
    if(!req.method) error.push("Method not defined");
    if(error.length > 0) return callback(error, null);
    fetch(url, req)
        .then((response) => {
            if(!((response.status >= 200 && response.status <= 208) || (response.status === 226))) {
                var error = {};
                error.status = response.status;
                error.statusText = response.statusText;
                error.body = response._bodyText;
                callback(error, null);
            }else{
                return response.json()
            }
        })
        .then((json) => {
            callback(null, json);
        })
        .catch(function(error) {
            callback(error, null);
        });
};

export default fetchStorage;