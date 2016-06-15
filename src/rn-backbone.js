import Backbone from 'backbone';

var RNBackbone = {};

RNBackbone.Model = Backbone.Model.extend({
    sync: function () {
        return RNBackbone.sync.apply(this, arguments);
    }
});

RNBackbone.Collection = Backbone.Collection.extend({
    sync: function () {
        return RNBackbone.sync.apply(this, arguments);
    }
});

RNBackbone.sync = function () {
    if (!RNBackbone.storage) {
        throw 'A storage must be specified before using RNBackbone models or collections';
    }
    return RNBackbone.storage.sync.apply(this, arguments);
};

export default RNBackbone;