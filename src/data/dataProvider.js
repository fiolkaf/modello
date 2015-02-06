var Models = require('../model/models');
var Disposable = require('osync').Mixin.Disposable;

var DataProvider = function(dataAdapter) {
    Disposable.mixin(this);
    var _cache = {};
    var _self = this;

    function createModel(type, data) {
        var model = new Models.getByType(type)(data);
        var unsubscribe = model.on('change', function(evt) {
            var data = evt.target || model;
            _self.save(type, data);
        });
        _self.addDisposer(unsubscribe);
        _cache[data.uri] = model;
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

    this.save = function(type, data) {
        dataAdapter.save(type, data);
    };

    this.remove = function(uri) {
        delete _cache.uri;
        dataAdapter.remove(uri);
    };
};

module.exports = DataProvider;
