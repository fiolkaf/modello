var TypeDefinition = function(type, definition) {
    return {
        getTypedProperties: function() {
            return Object.keys(definition)
                .map(function(key) {
                    return Object.assign(definition[key], { 'key': key });
                })
                .filter(function(propertyInfo) {
                    return propertyInfo.hasOwnProperty('type');
                });
        },
        getNestedUris: function(data) {
            var result = [];
            getTypeProperties().forEach(function(property) {

            });
        }
    };
};

module.exports = TypeDefinition;
