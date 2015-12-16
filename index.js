var _ = require('underscore');
var AsyncStorage = require('react-native').AsyncStorage;

var RestKit = {}
RestKit.globalOptions = {};

//Static method
RestKit.send = function(url, req, callback){
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
            return callback(error, null);
        }
        return response.json();
    })
    .then((json) => {
        callback(null, json);
    })
    .catch(function(error) {
        callback(error, null);
    });
}

//Model
var Model = RestKit.Model = function(attributes) {
    var attrs = attributes || {};
    this.attributes = {};
    this.set(attrs);
    this.initialize.apply(this, arguments);
};

// Attach all inheritable methods to the Model prototype.
_.extend(Model.prototype, {
    idAttribute: '_id',
    initialize: function(){},
    toJSON: function(options) {
        return _.clone(this.attributes);
    },
    get: function(attr) {
        return this.attributes[attr];
    },
    has: function(attr) {
        return this.get(attr) != null;
    },
    matches: function(attrs) {
        return !!_.iteratee(attrs, this)(this.attributes);
    },
    set: function(field, value) {
        if (field == null) return this;
        var obj;
        if (typeof field === 'object') {
            obj = field;
        } else {
            (obj = {})[field] = value;
        }

        for(var field in obj) {
            if (obj[field] !== undefined) {
                this.attributes[field] = obj[field];
            }
        }

        return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr) {
        delete this.attributes[attr];
    },

    isNew: function() {
        return !this.has(this.idAttribute);
    },

    fetch: function(options, callback) {
        if(this.isNew()) throw new Error('Cannot fetch model without Id');
        return RestKit.sync('GET', this, options, callback);
    },

    save: function(options, callback) {
        var method = (this.isNew()) ? 'POST' : 'PUT'
        return RestKit.sync('POST', this, options, callback);
    },

    destroy: function(option, callback) {
        return RestKit.sync('DELETE', this, options, callback);
    },

    url: function() {
        var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
        if (this.isNew()) return base;
        var id = this.get(this.idAttribute);
        return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

    saveToLocalStorage: function(storageKey, callback){
        if (typeof storageKey == 'function') {
            var storageKey = uniqueName();
        }
        if (storageKey.length <= 0){
            throw new Error("Storage Key must be specified");
        }
        AsyncStorage.setItem(storageKey, JSON.stringify(this.attributes))
        .then(callback)
        .catch(callback);
    },

    getFromLocalStorage: function(storageKey, callback){
        if (typeof storageKey == 'function') {
            var storageKey = uniqueName();
        }
        if (storageKey.length <= 0){
            throw new Error("Storage Key must be specified");
        }
        var self = this;
        AsyncStorage.getItem(storageKey, function(error, string){
            if (error) return callback(error);
            self.attributes = JSON.parse(string) || self.attributes;
            return callback(null);
        });
    }
});

var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

// Set up inheritance for the model, collection, router, view and history.
Model.extend = extend;

RestKit.Model = Model;

RestKit.sync = function(method, model, options, callback) {

    if(typeof options === 'function'){
        callback = options;
        options = null;
    }
    options = options || {};

    var request = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }

    if(method != 'GET' && method != 'HEAD'){
        request['body'] = JSON.stringify(model.toJSON());
    }

    if(RestKit.globalOptions.headers){
        for(header in RestKit.globalOptions.headers){
            request.headers[header] = RestKit.globalOptions.headers[header];
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

    RestKit.send(url, request, function(error, json){
        model.set(json);
        if(callback){
            callback(error, json);
        }
    })

    return;
};

var urlError = function() {
    throw new Error('A "url" property or function must be specified');
};

module.exports = RestKit;
