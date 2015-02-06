var expect = require('unexpected/unexpected');
var DataTraverse = require('../../src/data/dataTraverse');

describe('dataTraverse', function() {
    describe('flattenNestedObject', function() {
        it('can resolve nested objects', function() {
            var result = DataTraverse.flattenNestedObjects([{name: 'tasks', array: true}], {
                tasks: [ {uri: '/uri/1'}, {uri: '/uri/2'}]
            });
            expect(result, 'to equal', {tasks: ['/uri/1','/uri/2']});
        });
    });

    describe('resolveNestedObjects', function() {
        it('can flatten nested objects', function() {
            var result = DataTraverse.resolveNestedObjects([{name: 'tasks', array: true}], {
                tasks: ['/uri/1', '/uri/2']
            }, function(type, uri) {
                return {uri: uri};
            });

            expect(result, 'to equal',  {
                tasks: [{uri: '/uri/1'}, {uri: '/uri/2'}]
            });
        });
    });
});
