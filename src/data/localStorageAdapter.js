var Models = require('../model/models');
var DataTraverse = require('./dataTraverse');
var DataAdapters = require('./dataAdapters');

function getTypeProperties(type) {
    var model = Models.getByType(type);
    if (!model) {
        throw 'Model ' + type + ' is unknown. Please define it before use';
    }

    return model.Type.getTypedProperties();
}

function keyFromUri(type, uri) {
    return '/' + type + 's/' + uri;
}

var LocalStorageAdapter = {

    get: function(type, uri) {
        var json = localStorage.getItem(keyFromUri(type, uri));
        var data = JSON.parse(json);

        if (data === null) {
            return null;
        }
        var properties = getTypeProperties(type);
        return DataTraverse.resolveNestedObjects(properties, data, LocalStorageAdapter.get);
    },

    remove: function(type, uri) {
        localStorage.removeItem(keyFromUri(type, uri));
    },

    getAll: function(type, filter) {
        filter = filter || {};

        return Object.keys(localStorage).filter(function(key) {
            return key.indexOf('/' + type + 's/') === 0;
        }).map(function(key) {
            return JSON.parse(localStorage.getItem(key));
        }).filter(function(store) {

            var keys = Object.keys(filter);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (store[key] !== filter[key]) {
                    return false;
                }
            }
            return true;
        });
    },

    save: function(type, data) {
        var properties = getTypeProperties(type);
        data = DataTraverse.flattenNestedObjects(properties, data);
        localStorage.setItem(keyFromUri(type, data.uri), JSON.stringify(data));
    }
};

LocalStorageAdapter.register = function(type) {
    return DataAdapters.register(type, LocalStorageAdapter);
};

module.exports = LocalStorageAdapter;
