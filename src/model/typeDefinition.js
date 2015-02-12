var TypeDefinition = function(definition) {
    return {
        getTypedProperties: function() {
            var result = {};
            Object.keys(definition)
                .filter(function(key) {
                    return definition[key] && definition[key].hasOwnProperty('type');
                }).forEach(function(key){
                    result[key] = definition[key];
                });
            return result;
        },
        getProperties: function() {
            var result = {};
            Object.keys(definition)
                .filter(function(key) {
                    return typeof definition[key] !== 'function';
                }).forEach(function(key){
                    result[key] = definition[key];
                });
            return result;
        },
        getNonPersistentProperties: function() {
            var result = {};
            Object.keys(definition)
                .filter(function(key) {
                    var propertyInfo = definition[key] || {};
                    return propertyInfo.hasOwnProperty('store') && propertyInfo.store === false;
                }).forEach(function(key){
                    result[key] = definition[key];
                });
            return result;
        },
        getFunctions: function() {
            var result = {};
            Object.keys(definition)
                .filter(function(key) {
                    return typeof definition[key] === 'function';
                }).forEach(function(key){
                    result[key] = definition[key];
                });
            return result;
        }
    };
};

module.exports = TypeDefinition;
