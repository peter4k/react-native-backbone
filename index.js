
var _ = require('underscore');

var RestKit = {}
//Static method
RestKit.send = function(url, req, callback){
    var error = [];
    if(!req.method) error.push("Method not defined");
    if(error.length > 0) return callback(error, null);

    fetch(url, req)
    .then((response) => {
        if(response.status != 200){
            var error = {};
            error.status = response.status;
            error.statusText = response.statusText;
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
// var Model = function(options, obj){
//     this.attributes = {};
//     this.set(obj);
// }

// Model.prototype.set = function(field, value){
//     if(field == null) return this;
//
//     var obj;
//     if (typeof field === 'object'){
//         obj = field;
//     }else{
//         obj = {};
//         obj[field] = value;
//     }
//     for(var field in obj) {
//         if (obj[field] !== undefined) {
//             this.attributes[field] = obj[field];
//         }
//     }
// }

var Model = RestKit.Model = function(attributes) {
    var attrs = attributes || {};
    this.attributes = {};
    this.set(attrs);
    this.initialize.apply(this, arguments);
};

// Attach all inheritable methods to the Model prototype.
_.extend(Model.prototype, {
    initialize: function(){},
    toJSON: function(options) {
        return _.clone(this.attributes);
    },
    // sync: function() {
    //   return Backbone.sync.apply(this, arguments);
    // },
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

    fetch: function(options) {
        var request = {

        }
    },

    save: function(key, val, options) {
        console.log(this.url());
        return;
        // Handle both `"key", value` and `{key: value}` -style arguments.
        var attrs;
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options = _.extend({validate: true, parse: true}, options);
        var wait = options.wait;

        // If we're not waiting and attributes exist, save acts as
        // `set(attr).save(null, opts)` with validation. Otherwise, check if
        // the model will be valid when the attributes, if any, are set.
        if (attrs && !wait) {
            if (!this.set(attrs, options)) return false;
        } else {
            if (!this._validate(attrs, options)) return false;
        }

        // After a successful server-side save, the client is (optionally)
        // updated with the server-side state.
        var model = this;
        var success = options.success;
        var attributes = this.attributes;
        options.success = function(resp) {
            // Ensure attributes are restored during synchronous saves.
            model.attributes = attributes;
            var serverAttrs = options.parse ? model.parse(resp, options) : resp;
            if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
            if (serverAttrs && !model.set(serverAttrs, options)) return false;
            if (success) success.call(options.context, model, resp, options);
            model.trigger('sync', model, resp, options);
        };
        wrapError(this, options);

        // Set temporary attributes if `{wait: true}` to properly find new ids.
        if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

        var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
        if (method === 'patch' && !options.attrs) options.attrs = attrs;
        var xhr = this.sync(method, this, options);

        // Restore attributes.
        this.attributes = attributes;

        return xhr;
    },

    url: function() {
        var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
        // if (this.isNew()) return base;
        var id = this.get(this.idAttribute);
        return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
    },

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

module.exports = RestKit;
