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

            var _schema = JSON.parse(JSON.stringify(schema));
            _.each(_schema.properties, (value, key) => {
                if (value == 'object') _schema.properties[key] = 'string';
                else if (value.type == 'object') value.type = 'string';
            });
            schemas.push(_schema);
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
                if (!model.get(primaryKeyAttr)) {
                    model.set(primaryKeyAttr, ShortId.generate());
                }

                var json = model.toJSON();
                //Save the models
                realm._realm.write(() => {
                    realm._realm.create(name, realm.parseBackboneModel(json, model));
                });

                options.success(json);
            },
            'read': function () {

                //For realm models, generate a shortid as primary key;
                if (!model.get(schema.primaryKey)) {
                    throw 'Cannot fetch a model with out primaryKey';
                }

                var realmObj = realm.findModelObjects(model);
                if (!realmObj) {
                    return options.error({realmError: 'not_found', realmErrorMessage: 'Object not found'});
                }

                model.realmObject = realmObj;
                options.success(realmObj);
            },
            'update': function () {

                var json = model.toJSON();
                //Save the models
                realm._realm.write(() => {
                    realm._realm.create(name, realm.parseBackboneModel(json, model), true);
                });

                options.success(json);
            },
            'delete': function () {
                //first find the Realm object
                var realmObj = realm.findModelObjects(model, {noParse: true});
                if (!realmObj) {
                    return options.error({realmError: 'Cannot find object'});
                }
                realm._realm.write(() => {
                    realm._realm.delete(realmObj);
                });
                options.success();
            }
        };

        if (!_.contains(_.keys(methodMap), method)) {
            throw 'Method ' + method + ' is not supported for models while using Realm';
        }
        methodMap[method](model, options);
    },
    syncCollection: function (method, collection, options) {
        options = options || {}
        var Model = collection.model,
            name = Model.prototype.realmSchema.name;

        if (!name) {
            throw 'Model of collection does not have realmSchema.name';
        }

        var methodMap = {
            'read': function () {
                var realmObjects = realm.findObjects(name, options, Model.prototype.realmSchema);
                options.success(_.toArray(realmObjects));
            }
        };

        if (!_.contains(_.keys(methodMap), method)) {
            throw 'Method ' + method + ' is not supported for collections while using Realm';
        }

        methodMap[method](collection, options);
    },
    findModelObjects: function (models, options) {
        options = options || {};
        if (models instanceof Backbone.Collection) {
            //TODO: find for collections, this will be required if we want to implement Sync of local and API
        } else {
            var schema = models.realmSchema,
                primaryKeyAttr = schema.primaryKey,
                name = schema.name;

            options.filters = [primaryKeyAttr + ' = "' + models.get(primaryKeyAttr) + '"'];
            options.limit = 1;
            return realm.findObjects(name, options, schema)[0];
        }
    },
    findObjects: function (name, options, schema) {

        var filters = options.filters, timeFilter = options.timeFilter, sort = options.sort;
        var allRealmObj = realm._realm.objects(name);

        //If no filter, return all
        if (filters && filters.length > 0) {

            //generate filter query
            let query = filters.join(' AND ');

            allRealmObj = allRealmObj.filtered(query);
        }

        if (timeFilter) {
            _.each(timeFilter, function (tfilter) {
                allRealmObj = allRealmObj.filtered(tfilter.query, tfilter.date);
            })
        }

        if (sort) {
            allRealmObj = allRealmObj.sorted(sort, options.sortDescending == true);
        }

        if(options.noParse) return allRealmObj;
        return this.parseRealmObject(allRealmObj, schema, options);
    },

    /**
     * Parse all "object" type to a stringify JSON in order to store it in Realm
     * @param model the backbone model to be parsed
     * @returns {object} the object to be saved
     */
    parseBackboneModel: function (_json, model) {
        var json = _.clone(_json);
        var schema = model.realmSchema.properties;
        _.each(json, function (value, key) {
            console.log(key, value);
            if(!schema[key]){
                throw "Missing property definition for " + key + " in the Realm schema of object " + model.realmSchema.name
            }
            if (schema[key] == 'object' || schema[key].type == 'object') {
                json[key] = JSON.stringify(value);
            }
        });
        return json;
    },

    /**
     * Realm object cannot be modified outside of "write" block, we create a copy of realm object for backbone to use
     * Parse all "object" from stringify JSON to object
     * @param realmObj
     * @param schema
     * @returns {Array}
     */
    parseRealmObject: function (realmObj, schema, options) {
        options = options || {};
        var resultArray = [];
        var start = options.skip || 0;
        var max = realmObj.length;
        if (options.limit) {
            max = start + options.limit;
            if (max > realmObj.length) max = realmObj.length;
        }
        for (let i = start; i < max; i++) {
            var resultObj = _.clone(realmObj[i]);
            _.each(resultObj, function (value, key) {
                if (schema.properties[key] == 'object' || schema.properties[key].type == 'object') {
                    resultObj[key] = value ? JSON.parse(value) : undefined;
                }
            });
            resultArray.push(resultObj);
        }
        return resultArray;
    }
};

export default realm;