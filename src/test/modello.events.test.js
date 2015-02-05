var expect = require('unexpected/unexpected');

var Models = require('../model/models');
var LocalStorageAdapter = require('../data/localStorageAdapter');

describe('model.events', function() {
    before(function() {
        Models.define('tour', {
            tasks: {
                type: 'task',
                array: true
            }
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
    });
    after(function() {
        Models.Tour.remove('/tours/welcome');
        Models.Tour = null;

        Models.Task.remove('/tasks/read-manual');
        Models.Task.remove('/tasks/accept');
        Models.Task = null;
    });
    it('gets events on model modification', function() {
        var tour = Models.Tour.get('/tours/welcome');
        tour.on('change', function(change) {
            console.log('change', arguments);
        });
        debugger;
        tour.done = false;
        tour.tasks[0].active = true;
    });

});
