var RemoteObject = require('osync').RemoteObject;
var TypeDefinition = require('./typeDefinition');
var Observer = require('./observer');
var objectAssign = Object.assign || require('object.assign');
var uuid = require('../data/uuid');

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
            return property.default ? property.default.slice(0) : [];
        }

        return property.default;
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
                if (key === '_uri' && data[key] === model[key]) {
                    return;
                }

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

                if (typeof data[key] === 'object' && data[key] !== null) {
                    model[key] = data[key].hasOwnProperty('on') ? data[key] : new RemoteObject(data[key]);
                } else {
                    model[key] = data[key];
                }
            });
    }

    function addNestedModels(model, data) {
        var typedProperties = _typeDefinition.getTypedProperties();
        Object.keys(typedProperties).forEach(function(key) {
            var property = typedProperties[key];
            var Model = models.getByType(property.type);

            var modelData = getValue(property, data[key]);
            if (typeof modelData === 'undefined') {
                model[key] = property.array ? [] : null;
                return;
            }

            if (!property.array) {
                var element = data[key];
                if (!element.hasOwnProperty('on')) {
                    element = new models.getByType(property.type)(data[key], { save: false });
                }
                model[key] = element;
                return;
            }

            modelData.forEach(function(item) {
                var element = item;
                if (!item.hasOwnProperty('on')) {
                    element = new models.getByType(property.type)(item, { save: false });
                }
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
            return Constructor.save(model);
        }
    }

    function update(model, changes) {
        var Constructor = models.getByType(type);
        if (!Constructor.update) {
            return;
        }
        var result = Constructor.update(model._uri, model, changes) || {};
        if (result.then) {
            model.dataReady = result;
            return model.dataReady;
        }

        return result;
    }

    function shouldSendUpdate(changes) {
        return changes
            .map(function(change) {
                return change.property;
            })
            .filter(function(name) {
                return ['id', '_uri'].indexOf(name) < 0;
            }).length;
    }

    function Model(data, options) {
        if (typeof data === 'undefined') {
            data = {};
        }
        options = options || {};
        options.save = options.hasOwnProperty('save') ? options.save : true;

        this.Type = _typeDefinition;

        var modelData = getModelTemplate();
        modelData._uri = data && data._uri ? data._uri : '/' + type + '/' + uuid();
        var _this = new RemoteObject(modelData);

        var dataReady;
        _this.dataReady = new Promise(function(resolve) {
            dataReady = function(data) {
                resolve(data);
            };
        });

        Observer.mixin(_this);

        _this.data = function(data) {
            if (typeof data === 'undefined') {
                return JSON.parse(JSON.stringify(_this));
            }
            _this.startChanges();
            addData(_this, data || {});
            addNestedModels(_this, data || {});
            _this._trigger('changed', _this.supressChanges());

            var unsubscribe = _this.on('changed', function(changes) {
                if (shouldSendUpdate(changes)) {
                    update(_this, changes);
                }
            });

            _this.addDisposer(unsubscribe);
            dataReady(data);

            return _this;
        };

        addFunctions(_this);

        var hasProperties = data && Object.keys(data).filter(function(key) { return key !== '_uri'; }).length > 0;
        if (hasProperties || options.save) {
            _this.data(data);
        }

        if (data && options.save) {
            var result = save(_this) || {};
            if (result.then) {
                _this.dataReady = result;
                _this.dataReady.then(function(data) {
                    objectAssign(_this, data);
                });
            } else {
                objectAssign(_this, result);
            }
        }

        if (_this.init) {
            _this.init();
        }

        return _this;
    }

    Model.Type = _typeDefinition;
    return Model;
}

module.exports = ModelFactory;
