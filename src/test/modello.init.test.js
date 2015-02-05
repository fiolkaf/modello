var expect = require('unexpected/unexpected');

var Models = require('../model/models');
var LocalStorageAdapter = require('../data/localStorageAdapter');

describe('model', function() {
    it('can register model', function() {
        Models.define('tour', {
            active: {
                save: false
            },
            tasks: { type: 'task', array: true }
        });
        LocalStorageAdapter.register('tour', [{
            uri: '/tours/welcome',
            default: true
        }]);

        var tour = Models.Tour.get('/tours/welcome');

        expect(tour.uri, 'to equal', '/tours/welcome');
        expect(tour.default, 'to equal', true);

        Models.Tour.remove('/tours/welcome');
        Models.Tour = null;
    });

    it('can register nested models', function() {
        Models.define('tour', {
            tasks: { type: 'task', array: true }
        });
        LocalStorageAdapter.register('tour', [{
            uri: '/tours/welcome',
            tasks: [
                '/tasks/read-manual',
                '/tasks/accept'
            ],
            done: false,
            activeTask: 0
        }]);

        Models.define('task', {});
        LocalStorageAdapter.register('task', [{
            uri: '/tasks/read-manual',
            active: false
        }, {
            uri: '/tasks/accept',
            active: false
        }]);
        var tour = Models.Tour.get('/tours/welcome');

        expect(tour.tasks[0].uri, 'to equal', '/tasks/read-manual');
        expect(tour.tasks[1].uri, 'to equal', '/tasks/accept');

        Models.Tour.remove('/tours/welcome');
        Models.Tour = null;

        Models.Task.remove('/tasks/read-manual');
        Models.Task.remove('/tasks/accept');
        Models.Task = null;
    });

});
