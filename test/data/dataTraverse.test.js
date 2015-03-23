var expect = require('unexpected/unexpected');
var DataTraverse = require('../../src/data/dataTraverse');

describe('dataTraverse', function() {
    describe('flattenNestedObject', function() {
        it('can resolve nested objects', function() {
            var result = DataTraverse.flattenNestedObjects({ tasks: {name: 'tasks', array: true}}, {
                tasks: [ {_uri: '/uri/1'}, {_uri: '/uri/2'}]
            });
            expect(result, 'to equal', {tasks: ['/uri/1','/uri/2']});
        });
    });

    describe('resolveNestedObjects', function() {
        it('can flatten nested objects', function() {
            var result = DataTraverse.resolveNestedObjects({ tasks: {name: 'tasks', array: true}}, {
                tasks: ['/uri/1', '/uri/2']
            }, function(type, uri) {
                return {_uri: uri};
            });

            expect(result, 'to equal',  {
                tasks: [{_uri: '/uri/1'}, {_uri: '/uri/2'}]
            });
        });
    });
});
