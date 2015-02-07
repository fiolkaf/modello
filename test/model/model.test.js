var Model = require('../../src/model/model');
var expect = require('unexpected/unexpected');

describe('model', function() {
    it('can create a new model', function() {
        var model = new Model({ uri: 'uri'});
        expect(model, 'to be defined');
    });
    it('can create new model with properties', function() {
        var model = new Model({
            uri: 'uri',
            property: true
        });
        expect(model.property, 'to be true');
    });
    it('can extend model with methods', function() {
        var model = new Model({
            uri: 'uri',
            property: true
        });
        expect(model.property, 'to be true');
    });
});
