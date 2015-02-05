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
    register: function(type, Constructor, defaultArray) {
        var constructorName = type.substr(0, 1).toUpperCase() + type.substr(1);
        var modelConstructor = Models[constructorName];

        if (!modelConstructor) {
            throw 'Model ' + constructorName + 'does not exists. Define it using Models.define(...).';
        }

        if (modelConstructor.get) {
            throw constructorName + 'has already data adapter defined.';
        }

        var dataAdapter = new Constructor(type);
        var dataProvider = new DataProvider(modelConstructor, dataAdapter);

        modelConstructor.get = dataProvider.get;
        modelConstructor.getAll = dataProvider.getAll;
        modelConstructor.save = dataProvider.save;
        modelConstructor.remove = dataProvider.remove;

        storeDefaults(constructorName, defaultArray);
    }
};

module.exports = DataAdapters;
