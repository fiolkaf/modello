var RemoteObject = require('osync').RemoteObject;

var DataAdapters = require('../data/dataAdapters');
var TypeDefinition = require('./typeDefinition');

function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function getModelName(type) {
    return type.substr(0, 1).toUpperCase() + type.substr(1);
}

function createConstructor(type, extend) {
    return function(data) {
        if (!data) {
            throw 'Data must be specified for ' + type;
        }
        data.uri = data.uri ? data.uri : '/' + type + 's/' + guid();

        var remoteObject = new RemoteObject(data);
        remoteObject.type = type;

        return remoteObject;
    };
}

var Models = {
    getByType: function(type) {
        var constructorName = getModelName(type);
        return Models[constructorName];
    },
    define: function(type, definition, extend) {
        var name = getModelName(type);
        if (Models[name]) {
            throw 'Model type ' + type + ' already exists';
        }

        Models[name] = createConstructor(type, extend);
        Models[name].Type = new TypeDefinition(type, definition);

        return Models[name];
    }
};

module.exports = Models;
