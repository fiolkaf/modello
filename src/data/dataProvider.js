var Models = require('../model/models');
var Disposable = require('osync').Mixin.Disposable;

var DataProvider = function(dataAdapter) {
    Disposable.mixin(this);
    var _cache = {};
    var _self = this;

    function registerModel(type, model) {
        var unsubscribe = model.on('modified', function(evt) {
            _self.save(type, model);
        });
        _self.addDisposer(unsubscribe);
        _cache[model.uri] = model;
    }

    function getDataForModel(type, model) {
        var Constructor = Models.getByType(type);
        var properties = Constructor.Type.getNonPersistentProperties();
        var result = Object.assign({}, model);
        properties.forEach(function(property) {
            delete result[property.name];
        });
        return result;
    }

    function addNonPresistentProperties(type, data) {
        var Constructor = Models.getByType(type);
        var properties = Constructor.Type.getNonPersistentProperties();
        properties.forEach(function(property) {
            data[property.name] = property['default'] || null;
        });
    }

    function registerSubTypes(type, data) {
        var Constructor = Models.getByType(type);
        var properties = Constructor.Type.getTypedProperties();
        properties.forEach(function(property) {
            if (data[property.name] === null) {
                throw 'Please define ' + property.name + ' property for ' + type;
            }
            if (property.array) {
                data[property.name] = data[property.name].map(function(item) {
                    var model = createModel(property.type, item);
                    registerModel(property.type, model);
                    return model;
                });
            } else {
                data[property.name] = createModel(property.type, data[property.name]);
                registerModel(property.type, data[property.name]);
            }
        });
    }

    function createModel(type, data) {
        var Constructor = Models.getByType(type);
        addNonPresistentProperties(type, data);
        registerSubTypes(type, data);

        var model = new Constructor(data, false);
        registerModel(type, model);

        return model;
    }

    this.get = function(type, uri) {
        if (_cache[uri]) {
            return _cache[uri];
        }

        var data = dataAdapter.get(type, uri);
        if (!data) {
            return data;
        }
        return createModel(type, data);
    };

    this.getAll = function(type, filter) {
        var array = dataAdapter.getAll(type, filter);
        return array.map(function(data) {
            return _cache[data.uri] || createModel(type, data);
        });
    };

    this.save = function(type, model) {
        if (!_cache[model.uri]) {
            registerModel(type, model);
        }
        var data = getDataForModel(type, model);
        dataAdapter.save(type, data);
    };

    this.remove = function(type, uri) {
        _cache[uri] = null;
        dataAdapter.remove(type, uri);
    };

    this.resetCache = function() {
        _cache = {};
    };
};

module.exports = DataProvider;
