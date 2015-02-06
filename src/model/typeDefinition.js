var TypeDefinition = function(type, definition) {
    return {
        getTypedProperties: function() {
            return Object.keys(definition)
                .map(function(name) {
                    return Object.assign(definition[name], { 'name': name });
                })
                .filter(function(propertyInfo) {
                    return propertyInfo.hasOwnProperty('type');
                });
        }
    };
};

module.exports = TypeDefinition;
