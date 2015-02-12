var ModelFactory = require('../../src/model/modelFactory');
var Models = require('../../src/model/models');
var expect = require('unexpected/unexpected');

describe('model', function() {
    it('can create a new model', function() {
        var Model = new ModelFactory(Models, 'test', { uri: null});
        var model = new Model();

        expect(model, 'to be defined');
    });
    it('can create new model with properties', function() {
        var Model = new ModelFactory(Models, 'test', { uri: null});
        var model = new Model({
            uri: 'uri',
            property: true
        });
        expect(model.property, 'to be true');
    });
    it('does not fire change events when initializing with data', function() {
        var Model = new ModelFactory(Models, 'test', { uri: null});
        var spy = sinon.spy();
        var model = new Model();
        model.listenTo('changed', spy);
        model.data({ uri: 'uri', property: true });
        expect(spy.called, 'to be false');
    });
});
