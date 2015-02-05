
var Models = {};

function createModel(properties) {

}

function register(name, properties) {
    if (Models[name]) {
        throw 'Model ' + name + 'already exists';
    }

    Models[name] = properties;
}

module.exports = {
    register : register
};
