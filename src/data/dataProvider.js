var Models = require('../model/models');
var Observer = require('../model/observer');
var ObservableArray = require('osync').ObservableArray;
var ObservableObject = require('osync').ObservableObject;
var Disposable = require('osync').Mixin.Disposable;

var DataProvider = function(type, dataAdapter) {
    Disposable.mixin(this);
    var _cache = {};
    var _self = this;

    function getDataForModel(model) {
        var Constructor = Models.getByType(type);
        var properties = Constructor.Type.getNonPersistentProperties();
        var result = Object.assign({}, model);
        Object.keys(properties).forEach(function(key) {
            delete result[key];
        });
        return result;
    }

    function createModel() {
        var Constructor = Models.getByType(type);
        if (!Constructor) {
            throw 'Model ' + type + ' is not defined';
        }
        var model = new Constructor(null);

        return model;
    }

    this.get = function(uri) {
        if (_cache[uri]) {
            return _cache[uri];
        }

        var response = dataAdapter.get(type, uri);
        if (!response) {
            return response;
        }

        function getResult(data) {
            _cache[model.uri] = model;
            model.data(data);
        }

        var model = createModel();
        if (response instanceof Promise) {
            model.dataReady = response;
        } else {
            getResult(response);
            model.dataReady = Promise.resolve(response);
        }

        model.dataReady.then(getResult, function(err) {
            console.log(err);
            throw err;
        });

        return model;
    };

    this.getAll = function(options) {
        var result = new ObservableArray([]);
        Observer.mixin(result);
        var response = dataAdapter.getAll(type, options);

        function getArray(data) {
            data.map(function(item) {
                var model = _cache[item.uri] || createModel().data(item);
                _cache[model.uri] = model;
                return model;
            }).forEach(function(item) {
                result.push(item);
            });
        }

        if (response instanceof Promise) {
            result.dataReady = response;
        } else {
            getArray(response);
            result.dataReady = Promise.resolve(response);
        }

        result.dataReady.then(getArray, function(err) {
            console.log(err);
            throw err;
        });

        return result;
    };

    this.save = function(model) {
        _cache[model.uri] = model;
        var data = getDataForModel(model);
        return dataAdapter.save(type, data);
    };

    this.remove = function(uri) {
        _cache[uri] = null;
        dataAdapter.remove(type, uri);
    };

    this.addCache = function(uri, model) {
        _cache[model.uri] = model;
    };

    this.resetCache = function() {
        _cache = {};
    };
};

module.exports = DataProvider;
