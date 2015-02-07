var Model = require('./model');
var TypeDefinition = require('./typeDefinition');
var DataAdapters = require('../data/dataAdapters');

function getModelName(type) {
    return type.substr(0, 1).toUpperCase() + type.substr(1);
}

function createConstructor(type, extend) {
    return function(data) {
        return new Model(data, extend);
    };
}

var Models = {
    getByType: function(type) {
        var constructorName = getModelName(type);
        return Models[constructorName];
    },
    define: function(type, definition) {
        var name = getModelName(type);
        if (Models[name]) {
            throw 'Model type ' + type + ' already exists';
        }
        definition = definition || {};
        Models[name] = createConstructor(type, definition);
        Models[name].Type = new TypeDefinition(type, definition);

        return Models[name];
    }
};

module.exports = Models;
