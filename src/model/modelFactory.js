var utils= require('../data/utils');
var uuid = require('../data/uuid');
var Observer = require('./observer');
var RemoteObject = require('osync').RemoteObject;
var TypeDefinition = require('./typeDefinition');

function ModelFactory(models, type, definition) {
    var _factory = this;
    var _typeDefinition = new TypeDefinition(definition);

    function getValue(property, value) {
        if (!property) {
            return value;
        }

        if (typeof value !== 'undefined') {
            return value;
        }

        if (property.array) {
            return property.default ? utils.deepClone(property.default) : [];
        }

        return property.default ? utils.deepClone(property.default) : property.default;
    }

    function getModelTemplate() {
        var result = {};
        var properties = _typeDefinition.getProperties();
        Object.keys(properties).forEach(function(key) {
            result[key] = getValue(properties[key]);
        });
        return result;
    }

    function addData(model, data) {
        var properties = _typeDefinition.getProperties();
        var typedProperties = _typeDefinition.getTypedProperties();

        Object.keys(data)
            .filter(function(key){
                return !typedProperties[key];
            })
            .forEach(function(key) {
                if (!model.hasOwnProperty(key)) {
                    model.defineProperty(key);
                }

                if (properties[key] && properties[key].array) {
                    model[key].splice(0, model[key].length);
                    data[key].forEach(function(item) {
                        model[key].push(item);
                    });
                    return;
                }

                model[key] = data[key];
            });
    }

    function addNestedModels(model, data) {
        var typedProperties = _typeDefinition.getTypedProperties();
        Object.keys(typedProperties).forEach(function(key) {
            var property = typedProperties[key];
            var Model = models.getByType(property.type);

            var modelData = getValue(property, data[key]);
            if (!property.array) {
                if (modelData) {
                    model[key] = modelData.hasOwnProperty('on') ? modelData : new Model(modelData);
                }
                return;
            }

            modelData.forEach(function(item) {
                var element = item.hasOwnProperty('on') ? item : new Model(item);
                model[key].push(element);
            });
        });
    }

    function addFunctions(model) {
        var functionProperties = _typeDefinition.getFunctions();
        Object.keys(functionProperties).forEach(function(key) {
            if (model[key]) {
                throw 'Function ' + key + ' already defined';
            }
            model[key] = definition[key].bind(model);
        });
    }

    function save(model) {
        var Constructor = models.getByType(type);
        if (Constructor.save) {
            Constructor.save(model);
        }
    }

    function Model(data) {
        if (typeof data === 'undefined') {
            data = {};
        }
        this.Type = _typeDefinition;
        if (data && !data.uri) {
            data.uri = '/' + type + '/' + uuid();
        }

        var modelData = getModelTemplate();
        var _this = new RemoteObject(modelData);

        var dataReady;
        _this.dataReady = new Promise(function(resolve) {
            dataReady = function(data) {
                resolve(data);
            };
        });

        Observer.mixin(_this);

        _this.data = function(data) {
            if (!data) {
                return utils.deepClone(_this);
            }
            _this.startChanges();
            addData(_this, data);
            addNestedModels(_this, data);
            _this.supressChanges();

            var unsubscribe = _this.on('changed', function() {
                save(_this);
            });
            _this.addDisposer(unsubscribe);
            dataReady(Object.keys(data).length ? data: null);

            return _this;
        };

        addFunctions(_this);

        if (data) {
            _this.data(data);
        }

        if (_this.init) {
            _this.init();
        }

        if (data) {
            save(_this);
        }

        return _this;
    }

    Model.Type = _typeDefinition;
    return Model;
}

module.exports = ModelFactory;
