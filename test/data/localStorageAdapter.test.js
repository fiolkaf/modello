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
        LocalStorageAdapter.remove('/test/1');

        expect(result, 'to equal', data);
    });
    it('can save and retrieve nested models as properties', function() {
        Models.define('level2');
        Models.define('level1', {
            object: { type: 'level2'},
        });
        Models.define('level0', {
            object: { type: 'level1'},
        });

        var modelLevel2 = {
            uri: '/test/level2',
            object: true
        };
        var modelLevel1 = {
            uri: '/test/level1',
            object: modelLevel2
        };
        var model = {
            uri: '/test/level0',
            object: modelLevel1
        };

        LocalStorageAdapter.save('level2', modelLevel2);
        LocalStorageAdapter.save('level1', modelLevel1);
        LocalStorageAdapter.save('level0', model);

        var result;
        result = LocalStorageAdapter.get('level0', '/test/level0');
        expect(result, 'to equal', model);

        result = LocalStorageAdapter.get('level1', '/test/level1');
        expect(result, 'to equal', modelLevel1);

        result = LocalStorageAdapter.get('level2', '/test/level2');
        expect(result, 'to equal', modelLevel2);

        LocalStorageAdapter.remove('/test/level0');
        LocalStorageAdapter.remove('/test/level1');
        LocalStorageAdapter.remove('/test/level2');
        Models.Level0 = null;
        Models.Level1 = null;
        Models.Level2 = null;

    });
    it('can save and retrieve nested models as arrays', function() {
        Models.define('level2');
        Models.define('level1', {
            array: { type: 'level2', array: true },
        });
        Models.define('level0', {
            array: { type: 'level1', array: true},
        });

        var modelLevel20 = {
            uri: 'modelLevel20',
            property: true
        };

        var modelLevel21 = {
            uri: 'modelLevel21',
            property: true
        };

        var modelLevel22= {
            uri: 'modelLevel22',
            property: true
        };

        var modelLevel23 = {
            uri: 'modelLevel23',
            property: true
        };

        var modelLevel10 = {
            uri: 'modelLevel10',
            array: [ modelLevel20, modelLevel21 ]
        };

        var modelLevel11 = {
            uri: 'modelLevel11',
            array: [ modelLevel22, modelLevel23 ]
        };

        var model = {
            uri: 'model',
            array: [ modelLevel10, modelLevel11 ]
        };

        LocalStorageAdapter.save('level1', modelLevel10);
        LocalStorageAdapter.save('level1', modelLevel11);
        LocalStorageAdapter.save('level1', modelLevel20);
        LocalStorageAdapter.save('level1', modelLevel21);
        LocalStorageAdapter.save('level1', modelLevel22);
        LocalStorageAdapter.save('level1', modelLevel23);
        LocalStorageAdapter.save('level0', model);

        var result = LocalStorageAdapter.get('level0', 'model');
        expect(result, 'to equal', model);
        LocalStorageAdapter.remove('model');
        LocalStorageAdapter.remove('modelLevel10');
        LocalStorageAdapter.remove('modelLevel11');
        LocalStorageAdapter.remove('modelLevel20');
        LocalStorageAdapter.remove('modelLevel21');
        LocalStorageAdapter.remove('modelLevel22');
        LocalStorageAdapter.remove('modelLevel23');
        Models.Level0 = null;
        Models.Level1 = null;
        Models.Level2 = null;
    });
});
