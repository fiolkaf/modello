var expect = require('unexpected/unexpected');
var Models = require('../../src/model/models');
var LocalStorageAdapter = require('../../src/data/localStorageAdapter');

describe('localStorageAdapter', function() {
    it('can save and retrieve simple data', function() {
        Models.define('test');
        var data = {
            uri: '/test/1',
            property: true,
            array: [{property: false}]
        };
        LocalStorageAdapter.save('test', data);
        var result = LocalStorageAdapter.get('test', '/test/1');

        expect(result, 'to equal', data);
    });
});
