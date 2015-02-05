var Models = require('../model/models');
var DataAdapters = require('./dataAdapters');

var LocalStorageAdapter = function(type) {
    var Prefix = '/g2a';

    function get(uri) {
        var json = localStorage.getItem(Prefix + uri);
        var data = JSON.parse(json);

        // Resolve nested properties
        Models.getByType(type).Type.getTypedProperties()
            .filter(function(property) {
                return data && typeof data[property.key] !== 'undefined';
            })
            .forEach(function(property) {
                data[property.key] = property.array ?
                    data[property.key].map(get) : get(data[property.key]);
            });

        return data;
    }

    function remove(uri) {
        localStorage.removeItem(Prefix + uri);
    }

    function getAll(filter) {
        localStorage.map(function(storageItem) {
            throw 'Not implemented';
        });
    }

    function save(data) {
        localStorage.setItem(Prefix + data.uri, JSON.stringify(data));
    }

    return {
        get: get,
        gatAll: getAll,
        remove: remove,
        save: save
    };
};

LocalStorageAdapter.register = function(name, defaultData) {
    return DataAdapters.register(name, LocalStorageAdapter, defaultData);
};

module.exports = LocalStorageAdapter;
