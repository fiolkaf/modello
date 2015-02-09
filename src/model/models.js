var Model = require('./model');
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
    return function(data, save) {
        data = data || {};
        if (!data.uri) {
            data.uri = '/' + type + '/' + guid();
        }

        var model = new Model(data, extend);
        if (save !== false && Models.getByType(type).save) {
            Models.getByType(type).save(model);
        }
        return model;
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
