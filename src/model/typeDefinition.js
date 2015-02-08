var TypeDefinition = function(type, definition) {
    return {
        getTypedProperties: function() {
            return Object.keys(definition)
                .map(function(name) {
                    return Object.assign(definition[name] || {}, { 'name': name });
                })
                .filter(function(propertyInfo) {
                    return propertyInfo.hasOwnProperty('type');
                });
        },
        getNonPersistentProperties: function() {
            return Object.keys(definition)
                .filter(function(key) {
                    var propertyInfo = definition[key] || {};
                    return propertyInfo.hasOwnProperty('store') && propertyInfo.store === false;
                }).map(function(name) {
                    return Object.assign(definition[name] || {}, { 'name': name });
                });
        }
    };
};

module.exports = TypeDefinition;
