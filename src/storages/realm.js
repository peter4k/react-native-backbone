import _Realm from 'realm';
import _ from 'underscore';
import Backbone from 'backbone';
import ShortId from 'shortid';

var realm = {
    type: 'realm',

    /**
     * Initialize a realm instance for the use of RNBackbone
     */
    init: function (options) {
        var schemas = [];
        _.each(options.models, (model, key) => {

            var schema = model.prototype.realmSchema;
            if (!schema) {
                throw '"realmSchema" must be specified for every model when using Realm as storage';
            }

            //realm does not auto-generate primaryKey, add the idAttribute as primaryKey to the realm schema
            var primaryKey = schema.primaryKey = schema.primaryKey || this.idAttribute || 'id';
            schema.properties[primaryKey] = 'string';
            schemas.push(model.prototype.realmSchema);
        });
        options.schema = schemas;
        realm._realm = new _Realm(options);
    },

    sync: function (method, model, options) {
        if (model instanceof Backbone.Collection) {
            realm.syncCollection(method, model, options);
        } else {
            realm.syncModel(method, model, options);
        }
    },

    syncModel: function (method, model, options) {

        var schema = model.realmSchema,
            primaryKeyAttr = schema.primaryKey,
            name = schema.name;

        var methodMap = {
            'create': function () {

                //For realm models, generate a shortid as primary key;
                if (!model.get(schema.primaryKey)) {
                    model.set(schema.primaryKey, ShortId.generate());
                }

                //Save the models
                realm._realm.write(() => {
                    realm._realm.create(name, model.toJSON());
                });

                options.success();
            },
            'read': function () {

                //For realm models, generate a shortid as primary key;
                if (!model.get(schema.primaryKey)) {
                    throw 'Cannot fetch a model with out primaryKey';
                }

                var realmObj = realm.findModelObjects(model);
                if (!realmObj) {
                    return options.error(model, {realmError: 'Cannot find object'});
                }

                model.realmObject = realmObj;
                options.success(realmObj);
            },
            'update': function () {

                //Save the models
                realm._realm.write(() => {
                    realm._realm.create(name, model.toJSON(), true);
                });

                options.success();
            },
            'delete': function () {
                //first find the Realm object
                var realmObj = realm.findModelObjects(model);
                if (!realmObj) {
                    return options.error(model, {realmError: 'Cannot find object'});
                }
                realm._realm.write(() => {
                    realm._realm.delete(realmObj);
                });
                options.success();
            }
        };

        if(!_.contains(_.keys(methodMap), method)){
            throw 'Method ' + method + ' is not supported for models while using Realm';
        }
        methodMap[method](model, options);
    },
    syncCollection: function (method, collection, options) {
        var Model = collection.model,
            name = Model.prototype.realmSchema.name;

        if (!name) {
            throw 'Model of collection does not have realmSchema.name';
        }

        var methodMap = {
            'read': function () {
                var realmObjects = realm.findObjects(name);
                collection.set(_.toArray(realmObjects));
                options.success();
            }
        };

        console.log(_.keys(methodMap), method);
        if(!_.contains(_.keys(methodMap), method)){
            throw 'Method ' + method + ' is not supported for collections while using Realm';
        }

        methodMap[method](collection, options);
    },
    findModelObjects: function (models) {
        if (models instanceof Backbone.Collection) {
            // _.each(models.model, () = >)
            //TODO: find for collections
        } else {
            var schema = models.realmSchema,
                primaryKeyAttr = schema.primaryKey,
                name = schema.name;

            var filters = {};
            filters[primaryKeyAttr] = models.get(primaryKeyAttr);
            return realm.findObjects(name, filters)[0];
        }
    },
    findObjects: function (name, filters) {

        var allRealmObj = realm._realm.objects(name);

        //If no filter, return all
        if (!filters || _.keys(filters).length == 0) {
            return allRealmObj;
        }

        //generate filter query
        var params = [];
        _.each(filters, function (value, field) {
            params.push(field + ' = "' + value + '"');
        });
        let query = params.join(' AND ');

        return allRealmObj.filtered(query);
    }
};

export default realm;