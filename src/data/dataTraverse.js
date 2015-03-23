var assign = Object.assign || require('object.assign');

function flattenNestedObjects(properties, data) {
    var result = assign({}, data);
    Object.keys(properties).forEach(function(key) {
        if (!result[key]) {
            return;
        }
        if (!properties[key].array) {
            result[key] = result[key]._uri;
            return;
        }

        result[key] = result[key].map(function(obj) {
            return obj._uri ? obj._uri : obj;
        });
    });

    return result;
}

function resolveNestedObjects(properties, data, getLookup) {
    var result = assign({}, data);
    Object.keys(properties).forEach(function(key) {
        if (!result[key]) {
            return;
        }
        if (!properties[key].array) {
            result[key] = getLookup(properties[key].type, result[key]);
            return;
        }

        result[key] = result[key].map(function(uri) {
            return typeof uri === 'string' ? getLookup(properties[key].type, uri) : uri;
        });
    });
    return result;
}

module.exports = {
    resolveNestedObjects: resolveNestedObjects,
    flattenNestedObjects: flattenNestedObjects
};
