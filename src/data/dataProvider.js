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
        var result = assign({}, model);
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

        var model = createModel();
        _cache[uri] = model;

        if (response instanceof Promise) {
            response.then(function(data) {
                model.data(data);
            }, function(err) {
                console.log(err);
                throw err;
            });
        } else {
            model.data(response);
        }

        return model;
    };

    this.getAll = function(options) {
        var key = type + JSON.stringify(options);
        if (_cache[key]) {
            return _cache[key];
        }

        var result = new ObservableArray([]);
        _cache[key] = result;

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
            assign(result, {dataReady : response });
        } else {
            getArray(response);
            assign(result, {dataReady : Promise.resolve(response)});
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
