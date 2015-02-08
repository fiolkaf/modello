var Models = require('../../src/model/models');
var LocalStorageAdapter = require('../../src/data/localStorageAdapter');

var expect = require('unexpected/unexpected');

describe('model-integration', function() {
    describe('define', function() {
        it('can define model', function() {
            Models.define('tour', {
                active: {
                    save: false
                }
            });
            LocalStorageAdapter.register('tour');
            new Models.Tour({
                uri: '/tours/welcome',
                default: true
            });
            var tour = Models.Tour.get('/tours/welcome');

            expect(tour.uri, 'to equal', '/tours/welcome');
            expect(tour.default, 'to equal', true);

            Models.Tour.remove('/tours/welcome');
            Models.Tour = null;
        });
        it('can define nested models', function() {
            Models.define('task');
            Models.define('tour', {
                tasks: {
                    type: 'task',
                    array: true
                }
            });
            LocalStorageAdapter.register('tour');

            var tour = new Models.Tour({
                uri: '/tours/welcome',
                done: false,
                activeTask: 0
            });

            LocalStorageAdapter.register('task');

            var task1 = new Models.Task({
                uri: '/tasks/read-manual',
                active: false
            });
            tour.tasks.push(task1);

            var task2 = new Models.Task({
                uri: '/tasks/accept',
                active: false
            });
            tour.tasks.push(task2);

            var tourResult = Models.Tour.get('/tours/welcome');

            expect(tourResult.tasks[0].uri, 'to equal', '/tasks/read-manual');
            expect(tourResult.tasks[1].uri, 'to equal', '/tasks/accept');

            Models.Tour.remove('/tours/welcome');
            Models.Tour = null;

            Models.Task.remove('/tasks/read-manual');
            Models.Task.remove('/tasks/accept');
            Models.Task = null;
        });
        it('can create new models', function() {
            Models.define('task');
            LocalStorageAdapter.register('task');
            var task = new Models.Task({
                name: 'my task v1'
            });

            var result = LocalStorageAdapter.get('task', task.uri);
            expect(task.name, 'to equal', result.name);
            LocalStorageAdapter.remove(task.uri);
            Models.Task = null;
        });
        it('can create new nested models', function() {
            Models.define('task');
            Models.define('tour', {
                tasks: {
                    type: 'task',
                    array: true
                },
                user: { type: 'user' }
            });
            LocalStorageAdapter.register('tour');
            LocalStorageAdapter.register('task');

            var tour = new Models.Tour({
                name: 'Welcome',
            });

            var task1 = new Models.Task({
                name: 'First welcome task',
            });
            var task1Result = LocalStorageAdapter.get('task', task1.uri);
            tour.tasks.push(task1);

            task2 = new Models.Task({
                name: 'Second welcome task'
            });
            task2Result = LocalStorageAdapter.get('task', task2.uri);
            tour.tasks.push(task2);

            var result = LocalStorageAdapter.get('tour', tour.uri);

            Models.Tour.remove(tour.uri);
            Models.Tour = null;
            Models.Task.remove(task1.uri);
            Models.Task.remove(task2.uri);
            Models.Task = null;

            expect(task1.name, 'to equal', task1Result.name);
            expect(task2.name, 'to equal', task2Result.name);
            expect(result.name, 'to equal', 'Welcome');
            expect(result.tasks[0].name, 'to equal', task1.name);
            expect(result.tasks[1].name, 'to equal', task2.name);
        });
    });
    describe('retrieve', function() {
        var _tour;
        before(function() {
            Models.define('task', {
                user: { type: 'user' }
            });
            Models.define('user');
            Models.define('tour', {
                tasks: {
                    type: 'task',
                    array: true
                },
                user: {
                    type: 'user'
                }
            });
            LocalStorageAdapter.register('tour');
            LocalStorageAdapter.register('user');
            LocalStorageAdapter.register('task');

            _tour = new Models.Tour({
                name: 'Welcome',
                tasks: [
                    new Models.Task({
                        name: 'First welcome task',
                        user: new Models.User({ name: 'Filip'})
                    }),
                    new Models.Task({
                        name: 'Second welcome task',
                        user: new Models.User({ name: 'Filip'})
                    })
                ],
                user: new Models.User({name: 'Filip'})
            });
        });
        after(function() {
            Models.Tour.remove(_tour.uri);
            Models.Task.remove(_tour.tasks[0].uri);
            Models.Task.remove(_tour.tasks[1].uri);
            Models.Task.remove(_tour.user.uri);
            Models.Task.remove(_tour.tasks[0].user.uri);
            Models.Task.remove(_tour.tasks[1].user.uri);

            Models.Tour = null;
            Models.Task = null;

        });
        it('can retrieve nested model', function() {
            var result = LocalStorageAdapter.get('tour', _tour.uri);
            expect(result.tasks[0].name, 'to equal', 'First welcome task');
            expect(result.tasks[1].name, 'to equal', 'Second welcome task');
        });
        it('can modify and retrieve nested model', function() {
            _tour.tasks[0].name = 'New name';
            var result = LocalStorageAdapter.get('tour', _tour.uri);
            expect(result.tasks[0].name, 'to equal', 'New name');
        });
        it('gets notification about child changes', function() {
            var spy = sinon.spy();
            _tour.listenTo('change', spy);

            _tour.tasks[0].name = 'New name';
            expect(spy.called, 'to be true');
            var result = LocalStorageAdapter.get('tour', _tour.uri);
            expect(result.tasks[0].name, 'to equal', 'New name');
        });
        it('gets notification about child array changes (model from LocalStorage)', function() {
            Models.Tour.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            expect(tour.tasks.length, 'to equal', 2);
            tour.listenTo('change', spy);
            tour.tasks[0].name = 'new name';
            expect(spy.called, 'to be true');

            Models.Tour.resetCache();
            tour = Models.Tour.get(_tour.uri);
            expect(tour.tasks[0].name, 'to equal', 'new name');
        });
        it('gets notification about child changes (model from LocalStorage)', function() {
            Models.Tour.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            tour.listenTo('change', spy);
            tour.user.name = 'new name';
            expect(spy.called, 'to be true');

            Models.Tour.resetCache();
            tour = Models.Tour.get(_tour.uri);
            expect(tour.user.name, 'to equal', 'new name');
        });
        it('gets notifications from child objects', function() {
            Models.Tour.resetCache();
            Models.User.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            tour.listenTo('change', spy);

            var user = Models.Tour.get(_tour.user.uri);
            user.name = 'new name';
            expect(spy.called, 'to be true');
        });
        it('gets notifications from parent objects', function() {
            Models.Tour.resetCache();
            Models.User.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);

            var user = Models.Tour.get(_tour.user.uri);
            user.listenTo('change', spy);

            tour.user.name = 'new name';
            expect(spy.called, 'to be true');
        });
        it('gets notifications from hierarchy objects', function() {
            Models.Tour.resetCache();
            Models.User.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            tour.listenTo('change', spy);

            tour.tasks[0].user.name = 'new name';
            expect(spy.called, 'to be true');
            Models.User.resetCache();
            expect(tour.tasks[0].user.name, 'to equal', 'new name');
        });
    });
});
