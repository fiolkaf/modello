var Disposable = require('osync').Mixin.Disposable;

var DataProvider = function(Model, dataAdapter) {
    Disposable.mixin(this);

    function createModel(data) {
        var model = new Model(data);
        model.on('change', function(evt) {
            //TODO evt.target
        });
        return model;
    }

    function get(uri) {
        var data = dataAdapter.get(uri);
        if (!data) {
            return data;
        }
        return createModel(data);
    }

    function getAll(filter) {
        var array = dataAdapter.getAll(filter);
        return array.map(function(data) {
            return createModel(data);
        });
    }

    function save(data) {
        dataAdapter.save(data);
    }

    function remove(uri) {
        dataAdapter.remove(uri);
    }

    return {
        get: get,
        getAll: getAll,
        remove: remove,
        save: save
    };
};

module.exports = DataProvider;
