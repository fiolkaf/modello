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

        var dataProvider = new DataProvider(type, dataAdapter);

        modelConstructor.get = function(uri) {
            return dataProvider.get(uri);
        };
        modelConstructor.getAll = function(options) {
            return dataProvider.getAll(options);
        };
        modelConstructor.save = function(data) {
            return dataProvider.save(data);
        };
        modelConstructor.create = function(data) {
            return dataProvider.save(data);
        };
        modelConstructor.resetCache = function() {
            return dataProvider.resetCache();
        };
        modelConstructor.remove = function(uri) {
            return dataProvider.remove(uri);
        };
    }
};

module.exports = DataAdapters;
