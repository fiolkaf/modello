var expect = require('unexpected/unexpected');
var Provider = require('../../src/data/dataProvider');
var Models = require('../../src/model/models');

describe('dataProvider test', function() {
    function getProvider(name) {
        var resolvePromise;
        var promise = new Promise(function(resolve) {
            resolvePromise = function(data) {
                resolve(data);
                return promise;
            };
        });
        var dataAdapter = {
            get: function() {
                return promise;
            }
        };

        return {
            data: new Provider(name, dataAdapter),
            resolve: resolvePromise
        };
    }
    before(function() {
        Models.define('gate', {
            color: {}
        });

        Models.define('flower', {
            type: {}
        });

        Models.define('garden', {
            property: {},
            flowers: { array: true, type: 'flower'},
            gate: { type: 'gate'}
        });

    });
    after(function() {
        Models.Garden = null;
        Models.Flower = null;
        Models.Gate = null;
    });
    it('it supports lazy load for get method', function(done) {
        var provider = getProvider('garden');
        var model = provider.data.get();
        expect(model.hasOwnProperty('property'), 'to be true');
        var spy = sinon.spy();

        model.dataReady.then(spy);

        provider
            .resolve({ property: true })
            .then(function() {
                expect(spy.called, 'to be true');
                expect(model.property, 'to be true');
                model.dispose();
                done();
            });
    });
    it('it receives data nested models after lazy loading', function(done) {
        var provider = getProvider('garden');
        var model = provider.data.get();
        expect(model.hasOwnProperty('property'), 'to be true');
        var spy = sinon.spy();

        model.dataReady.then(spy);
        provider.resolve({
            property: true,
            flowers: [ { type: 'tulipan' }, { type : 'hiacynt' }],
            gate: { color: 'blue' }
        })
        .then(function() {
            expect(spy.calledOnce, 'to be true');
            expect(model.property, 'to be true');
            expect(model.flowers.length, 'to equal', 2);
            expect(model.flowers[0].type, 'to equal', 'tulipan');
            expect(model.flowers[1].type, 'to equal', 'hiacynt');
            expect(model.gate.color, 'to equal', 'blue');

            model.dispose();
            done();
        }).catch(function(err) {
            model.dispose();
            done(err);
        });
    });
    it('it receives events from property models after lazy loading', function(done) {
        var provider = getProvider('garden');
        var model = provider.data.get();
        var spy = sinon.spy();

        provider.resolve({
            property: true,
            flowers: [ { type: 'tulipan' }, { type : 'hiacynt' }],
            gate: { color: 'blue' }
        })
        .then(function() {
            model.on('change', spy);
            model.property = false;
            expect(spy.callCount, 'to equal', 1);
            model.gate.color = 'yellow';
            expect(spy.callCount, 'to equal', 2);
            model.dispose();
            done();
        }).catch(function(err) {
            model.dispose();
            done(err);
        });
    });
});
