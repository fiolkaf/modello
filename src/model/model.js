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

function extendProperties(data, extend) {
    Object.keys(extend).filter(function (key) {
        return typeof extend[key] !== 'function';
    }).filter(function(key) {
        return typeof data[key] === 'undefined';
    }).forEach(function(key) {
        data[key] = extend[key] ? extend[key].default : null;
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
    var unsubscribe = observable.on('change', function(evt) {
        var target = evt.target || observable;
        var ev = Object.assign({}, evt, {key: evt.key.split('.').pop() });
        target._trigger(ev.key + 'Change', ev);
    });
    observable.addDisposer(unsubscribe);
    extendFunctions(observable, extend);
    if (observable.init) {
        observable.init();
    }
    return observable;
}

module.exports = Model;
