var ModelFactory = require('../../src/model/modelFactory');
var Models = require('../../src/model/models');
var expect = require('unexpected/unexpected');

describe('modelFactory', function() {
    it('can create a new model', function() {
        var Model = new ModelFactory(Models, 'test', { _uri: null});
        var model = new Model();

        expect(model, 'to be defined');
    });
    it('can create new model with properties', function() {
        var Model = new ModelFactory(Models, 'test', { _uri: null});
        var model = new Model({
            _uri: 'uri',
            property: true
        });
        expect(model.property, 'to be true');
    });
    it('does fire change event once when initializing with data', function() {
        var Model = new ModelFactory(Models, 'test', { _uri: null});
        var spy = sinon.spy();
        var model = new Model();
        model.listenTo('changed', spy);
        model.data({ _uri: 'uri', property: true });
        expect(spy.calledOnce, 'to be true');
    });
});
