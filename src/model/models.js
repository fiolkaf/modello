var ModelFactory = require('./modelFactory');

function getModelName(type) {
    return type.substr(0, 1).toUpperCase() + type.substr(1);
}

var Models = {
    getByType: function(type) {
        var constructorName = getModelName(type);
        return Models[constructorName];
    },
    define: function(type, definition) {
        definition = definition || {};
        var name = getModelName(type);
        if (Models[name]) {
            throw 'Model type ' + type + ' already exists';
        }
        this[name] = new ModelFactory(this, type, definition);

        return this[name];
    }
};

module.exports = Models;
