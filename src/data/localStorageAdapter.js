var Models = require('../model/models');
var DataTraverse = require('./dataTraverse');
var DataAdapters = require('./dataAdapters');

var Prefix = '/g2a';

function getTypeProperties(type) {
    var model = Models.getByType(type);
    if (!model) {
        throw 'Model ' + type + ' is unknown. Please define it before use';
    }

    return model.Type.getTypedProperties();
}

var LocalStorageAdapter = {

    get: function(type, uri) {
        var json = localStorage.getItem(Prefix + uri);
        var data = JSON.parse(json);

        if (data === null) {
            return null;
        }
        var properties = getTypeProperties(type);
        return DataTraverse.resolveNestedObjects(properties, data, LocalStorageAdapter.get);
    },

    remove: function(uri) {
        localStorage.removeItem(Prefix + uri);
    },

    getAll: function(type, filter) {
        localStorage.map(function(storageItem) {
            throw 'Not implemented';
        });
    },

    save: function(type, data) {
        var properties = getTypeProperties(type);
        data = DataTraverse.flattenNestedObjects(properties, data);
        localStorage.setItem(Prefix + data.uri, JSON.stringify(data));
    }
};

LocalStorageAdapter.register = function(type, defaultData) {
    return DataAdapters.register(type, LocalStorageAdapter, defaultData);
};

module.exports = LocalStorageAdapter;
