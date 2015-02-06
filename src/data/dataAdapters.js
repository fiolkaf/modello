var Models = require('../model/models');
var DataProvider = require('./dataProvider');

function storeDefaults(name, array) {
    if (!array) {
        return;
    }

    array.forEach(function(item) {
        if (!item.uri) {
            throw 'You have to provide item uri' + item;
        }

        var result = Models[name].get(item.uri);

        if (!result) {
            Models[name].save(item);
        }
    });
}


var DataAdapters = {
    register: function(type, dataAdapter, defaultArray) {
        var constructorName = type.substr(0, 1).toUpperCase() + type.substr(1);
        var modelConstructor = Models[constructorName];

        if (!modelConstructor) {
            throw 'Model ' + constructorName + 'does not exists. Define it using Models.define(...).';
        }

        if (modelConstructor.get) {
            throw constructorName + 'has already data adapter defined.';
        }

        var dataProvider = new DataProvider(dataAdapter);

        modelConstructor.get = function(uri) {
            return dataProvider.get(type, uri);
        };
        modelConstructor.getAll = function(filter) {
            return dataProvider.getAll(type, filter);
        };
        modelConstructor.save = function(data) {
            return dataProvider.save(type, data);
        };
        modelConstructor.remove = dataProvider.remove;

        storeDefaults(constructorName, defaultArray);
    }
};

module.exports = DataAdapters;
