function flattenNestedObjects(properties, data) {
    var result = Object.assign({}, data);
    properties.forEach(function(property) {
        propertyName = property.name;
        if (!result[propertyName]) {
            return;
        }
        if (!property.array) {
            result[propertyName] = result[propertyName].uri;
            return;
        }

        result[propertyName] = result[propertyName].map(function(obj) {
            return obj.uri ? obj.uri : obj;
        });
    });

    return result;
}

function resolveNestedObjects(properties, data, getLookup) {
    var result = Object.assign({}, data);
    properties.forEach(function(property) {
        var propertyName = property.name;
        if (!result[propertyName]) {
            return;
        }
        if (!property.array) {
            result[propertyName] = getLookup(property.type, result[propertyName]);
            return;
        }

        result[propertyName] = result[propertyName].map(function(uri) {
            return typeof uri === 'string' ? getLookup(property.type, uri) : uri;
        });
    });
    return result;
}

module.exports = {
    resolveNestedObjects: resolveNestedObjects,
    flattenNestedObjects: flattenNestedObjects
};
