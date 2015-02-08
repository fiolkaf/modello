var Models = require('../model/models');
var DataProvider = require('./dataProvider');

var DataAdapters = {
    register: function(type, dataAdapter) {
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
        modelConstructor.create = function(data) {
            return dataProvider.save(type, data);
        };
        modelConstructor.resetCache = function() {
            return dataProvider.resetCache();
        };
        modelConstructor.remove = function(uri) {
            return dataProvider.remove(type, uri);
        };
    }
};

module.exports = DataAdapters;
