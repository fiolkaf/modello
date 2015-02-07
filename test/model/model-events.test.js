var expect = require('unexpected/unexpected');

var Models = require('../../src/model/models');
var LocalStorageAdapter = require('../../src/data/localStorageAdapter');

describe('model.events', function() {
    before(function() {
        Models.define('task');
        LocalStorageAdapter.register('task', [{
            uri: '/tasks/read-manual',
            active: false
        }, {
            uri: '/tasks/accept',
            active: false
        }]);

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
        var spy = sinon.spy();
        tour.on('doneChange', spy);
        tour.done = false;
        tour.tasks[0].on('activeChange', spy);
        tour.tasks[0].active = true;

        expect(spy.calledTwice, 'to be true');
    });
    it('gets events on both instances', function() {
        var tour1 = Models.Tour.get('/tours/welcome');
        var tour2 = Models.Tour.get('/tours/welcome');

        var spy = sinon.spy();
        tour2.on('doneChange', spy);
        tour1.done = false;

        expect(spy.called, 'to be true');
    });

});
