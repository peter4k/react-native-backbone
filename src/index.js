import Backbone from 'backbone';
import fetchStorage from './storages/fetch';

//Set the default storage to be Fetch
var RNBackbone = {
    storage: fetchStorage
};

//Override sync methods for Model and Collections
RNBackbone.Model = Backbone.Model.extend({
    addDelegate(delegate){
        this.on('change', function () {
            delegate.forceUpdate();
        })
    },
    sync: function () {
        return RNBackbone.sync.apply(this, arguments);
    }
});

RNBackbone.Collection = Backbone.Collection.extend({
    addDelegate(delegate){
        this.on('change', function () {
            delegate.forceUpdate();
        })
    },
    sync: function () {
        return RNBackbone.sync.apply(this, arguments);
    }
});

RNBackbone.sync = function () {
    if (!RNBackbone.storage) {
        throw 'A storage must be specified before using RNBackbone models or collections';
    }
    //Using the sync method provided by RNBackbone
    return RNBackbone.storage.sync.apply(this, arguments);
};

export default RNBackbone;