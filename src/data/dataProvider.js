var Models = require('../model/models');
var Observer = require('../model/observer');
var ObservableArray = require('osync').ObservableArray;
var ObservableObject = require('osync').ObservableObject;
var Disposable = require('osync').Mixin.Disposable;
var assign = Object.assign || require('object.assign');

var DataProvider = function(type, dataAdapter) {
    Disposable.mixin(this);
    var _cache = {};
    var _self = this;

    function getDataForModel(model) {
        var Constructor = Models.getByType(type);
        var properties = Constructor.Type.getNonPersistentProperties();
        var result = assign({}, JSON.parse(JSON.stringify(model)));
        Object.keys(properties).forEach(function(key) {
            delete result[key];
        });
        if (result.dataReady) {
            delete result.dataReady;
        }
        return result;
    }

    function createModel(data) {
        var Constructor = Models.getByType(type);
        if (!Constructor) {
            throw 'Model ' + type + ' is not defined';
        }
        var model = new Constructor(data, { save: false });

        return model;
    }

    this.get = function(uri, properties) {
        if (_cache[uri]) {
            return _cache[uri];
        }

        var response = dataAdapter.get(type, uri, properties);
        if (!response) {
            return response;
        }

        var model = createModel( { _uri: uri });
        _cache[uri] = model;

        if (response instanceof Promise) {
            response.then(function(data) {
                if (data._uri) {
                    delete data._uri; //Do not overwrite uri
                }
                model.data(data);
            }, function(err) {
                console.log('Error', err);
                throw err;
            });
        } else {
            model.data(response);
        }

        return model;
    };

    this.getAll = function(options) {
        options = options || {};

        var result = new ObservableArray([]);

        Observer.mixin(result);
        var response = dataAdapter.getAll(type, options);

        function getArray(data) {
            data.map(function(item) {
                var model = _cache[item._uri] || createModel(null).data(item);
                _cache[model._uri] = model;
                return model;
            }).forEach(function(item) {
                result.push(item);
            });
        }

        if (response instanceof Promise) {
            assign(result, {dataReady : response });
        } else {
            getArray(response);
            assign(result, {dataReady : Promise.resolve(response)});
        }

        result.dataReady.then(getArray, function(err) {
            throw err;
        });

        return result;
    };

    this.save = function(model) {
        _cache[model._uri] = model;
        var data = getDataForModel(model);
        return dataAdapter.save(type, data);
    };

    this.update = function(uri, model, updates) {
        var data = getDataForModel(model);
        return dataAdapter.update(type, uri, data, updates);
    };

    this.remove = function(uri) {
        _cache[uri] = null;
        return dataAdapter.remove(type, uri);
    };

    this.addCache = function(uri, model) {
        _cache[model._uri] = model;
    };

    this.resetCache = function() {
        _cache = {};
    };
};

module.exports = DataProvider;
