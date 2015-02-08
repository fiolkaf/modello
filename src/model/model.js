var ObservableObject = require('osync').ObservableObject;
var Models = require('./models');

function extendFunctions(model, extend) {
    Object.keys(extend).filter(function (key) {
        return typeof extend[key] === 'function';
    }).forEach(function(key) {
        if (model[key]) {
            throw 'Function ' + key + ' already defined';
        }
        model[key] = extend[key].bind(model);
    });
}

function extendProperties(data, definition) {
    Object.keys(definition).filter(function (key) {
        return typeof definition[key] !== 'function';
    }).filter(function(key) {
        return typeof data[key] === 'undefined';
    }).forEach(function(key) {
        if (!definition[key]) {
            data[key] = null;
        }
        data[key] = definition[key].default || definition[key].array ? [] : null;
    });
}

function Model(data, extend) {
    if (!data) {
        throw 'Data must be specified for model ' + data ;
    }

    if (!data.uri) {
        throw 'Please define uri property for model ' + data;
    }
    extend = extend || {};

    extendProperties(data, extend);
    var observable = new ObservableObject(data);

    observable.listenTo = function(target, topic, callback) {
        if (typeof target === 'string') {
            callback = topic;
            topic = target;
            target = this;
        }
        var subscribe = target.on(topic, callback);
        observable.addDisposer(subscribe);
    };

    extendFunctions(observable, extend);
    if (observable.init) {
        observable.init();
    }
    return observable;
}

module.exports = Model;