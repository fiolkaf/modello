function flattenNestedObjects(properties, data) {
    var result = Object.assign({}, data);
    Object.keys(properties).forEach(function(key) {
        if (!result[key]) {
            return;
        }
        if (!properties[key].array) {
            result[key] = result[key].uri;
            return;
        }

        result[key] = result[key].map(function(obj) {
            return obj.uri ? obj.uri : obj;
        });
    });

    return result;
}

function resolveNestedObjects(properties, data, getLookup) {
    var result = Object.assign({}, data);
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
