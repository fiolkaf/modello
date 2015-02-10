var Models = require('../src/model/models');
var LocalStorageAdapter = require('../src/data/localStorageAdapter');

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
            var tour = new Models.Tour({
                uri: '/tours/welcome',
                default: true
            });
            var result = Models.Tour.get('/tours/welcome');

            expect(result.uri, 'to equal', '/tours/welcome');
            expect(result.default, 'to equal', true);

            tour.dispose();
            result.dispose();
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

            tour.dispose();
            tourResult.dispose();
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
            LocalStorageAdapter.remove('task', task.uri);
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
            tour.dispose();

            expect(task1.name, 'to equal', task1Result.name);
            expect(task2.name, 'to equal', task2Result.name);
            expect(result.name, 'to equal', 'Welcome');
            expect(result.tasks[0].name, 'to equal', task1.name);
            expect(result.tasks[1].name, 'to equal', task2.name);
        });
        it('does not save non persistent properties', function() {
            Models.define('user', {
                name: null,
                active: { store: false}
            });
            var user = new Models.User({});
            expect(user.hasOwnProperty('name'), 'to be true');
            expect(user.hasOwnProperty('active'), 'to be true');
            Models.User = null;
            user.dispose();
        });
    });
    describe('events', function() {
        var _tour;
        before(function() {
            Models.define('task');
            LocalStorageAdapter.register('task');
            var task1 = new Models.Task({
                uri: '/task/read-manual',
                active: false
            });
            var task2 = new Models.Task({
                uri: '/task/accept',
                active: false
            });

            Models.define('tour', {
                tasks: {
                    type: 'task',
                    array: true
                }
            });
            LocalStorageAdapter.register('tour');
            _tour = new Models.Tour({
                uri: '/tour/welcome',
                tasks: [ task1, task2 ],
                done: false,
                activeTask: 0
            });
        });
        after(function() {
            Models.Tour.remove('/tour/welcome');
            Models.Tour = null;

            Models.Task.remove('/task/read-manual');
            Models.Task.remove('/task/accept');
            Models.Task = null;
            _tour.dispose();
        });
        it('gets events on model modification', function() {
            var tour = Models.Tour.get('/tour/welcome');
            var spy = sinon.spy();
            tour.on('doneChange', spy);
            tour.done = false;
            tour.tasks[0].on('activeChange', spy);
            tour.tasks[0].active = true;

            expect(spy.callCount, 'to equal', 2);
            tour.dispose();
        });
        it('gets events on both instances', function() {
            var tour1 = Models.Tour.get('/tour/welcome');
            var tour2 = Models.Tour.get('/tour/welcome');

            var spy = sinon.spy();
            tour2.on('doneChange', spy);
            tour1.done = false;

            expect(spy.called, 'to be true');
            tour1.dispose();
            tour2.dispose();
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
                user: new Models.User({name: 'Filip 4'})
            });
        });
        after(function() {
            Models.Tour.remove(_tour.uri);
            Models.Task.remove(_tour.tasks[0].uri);
            Models.Task.remove(_tour.tasks[1].uri);
            Models.User.remove(_tour.user.uri);
            Models.User.remove(_tour.tasks[0].user.uri);
            Models.User.remove(_tour.tasks[1].user.uri);

            Models.Tour = null;
            Models.Task = null;
            Models.User = null;
            _tour.dispose();
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
            var unsubscribe = _tour.listenTo('change', spy);

            _tour.tasks[0].name = 'New name';
            expect(spy.called, 'to be true');
            var result = LocalStorageAdapter.get('tour', _tour.uri);
            unsubscribe();
            expect(result.tasks[0].name, 'to equal', 'New name');
        });
        it('gets notification about child array changes (model from LocalStorage)', function() {
            Models.Tour.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            expect(tour.tasks.length, 'to equal', 2);
            var unsubscribe = tour.listenTo('change', spy);
            tour.tasks[0].name = 'new name';
            expect(spy.called, 'to be true');

            Models.Tour.resetCache();
            tour = Models.Tour.get(_tour.uri);
            unsubscribe();
            expect(tour.tasks[0].name, 'to equal', 'new name');
        });
        it('gets notification about child changes (model from LocalStorage)', function() {
            Models.Tour.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            var unsubscribe = tour.listenTo('change', spy);
            tour.user.name = 'new name';
            expect(spy.called, 'to be true');

            Models.Tour.resetCache();

            tour = Models.Tour.get(_tour.uri);
            expect(tour.user.name, 'to equal', 'new name');
            unsubscribe();
        });
        it('gets notification from child objects', function() {
            Models.Tour.resetCache();
            Models.User.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            var unsubscribe = tour.listenTo('change', spy);

            var user = Models.Tour.get(_tour.user.uri);
            user.name = 'new name';
            unsubscribe();
            expect(spy.called, 'to be true');
        });
        it('gets notification from parent objects', function() {
            _tour.dispose();
            Models.Tour.resetCache();
            Models.User.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            var user = Models.Tour.get(_tour.user.uri);

            var unsubscribe = user.listenTo('change', spy);

            tour.user.name = 'new name';
            unsubscribe();
            expect(spy.called, 'to be true');
        });
        it('gets notification from hierarchy objects', function() {
            Models.Tour.resetCache();
            Models.User.resetCache();
            var spy = sinon.spy();
            var tour = Models.Tour.get(_tour.uri);
            var unsubscribe = tour.listenTo('change', spy);

            tour.tasks[0].user.name = 'new name';
            expect(spy.called, 'to be true');
            Models.User.resetCache();
            unsubscribe();
            expect(tour.tasks[0].user.name, 'to equal', 'new name');
        });

    });
    describe('getAll', function() {
        var _models;
        before(function() {
            Models.define('user');
            LocalStorageAdapter.register('user');
            _models = [
                new Models.User({ name: 'Filip', surname: 'Brown'}),
                new Models.User({ name: 'Adam', surname: 'Yellow'}),
                new Models.User({ name: 'Filip', surname: 'Blue'}),
                new Models.User({ name: 'Adam', surname: 'Pink'})
            ];
        });
        after(function() {
            _models.forEach(function(model) {
                Models.User.remove(model.uri);
            });
            Models.User = null;
        });
        it('can get list of objects', function() {
            var users = Models.User.getAll({ name: 'Filip' });
            expect(users.length, 'to equal', 2);

            users = Models.User.getAll({ name: 'Filip', surname: 'Brown' });
            expect(users.length, 'to equal', 1);
        });
        it('can get list of objects without cache', function() {
            Models.User.resetCache();
            var users = Models.User.getAll({ name: 'Filip' });
            expect(users.length, 'to equal', 2);

            users = Models.User.getAll({ name: 'Filip', surname: 'Brown' });
            expect(users.length, 'to equal', 1);
        });
        it('returns the same instances of objects', function() {
            Models.User.resetCache();
            var userInstance1 = Models.User.getAll({ uri: _models[0].uri })[0];
            var userInstance2 = Models.User.getAll({ uri: _models[0].uri })[0];
            expect(userInstance1, 'to be', userInstance2);
        });
        it('can subscribe to object events', function() {
            Models.User.resetCache();
            var user = Models.User.getAll({ uri: _models[0].uri })[0];
            var spy = sinon.spy();
            user.listenTo('nameChange', spy );
            user.name = 'new name';
            expect(spy.calledOnce, 'to be true');
        });
        it('shares events between objects', function() {
            Models.User.resetCache();
            var userInstance1 = Models.User.getAll({ uri: _models[0].uri })[0];
            var userInstance2 = Models.User.getAll({ uri: _models[0].uri })[0];
            var spy = sinon.spy();
            userInstance1.listenTo('nameChange', spy );
            userInstance2.name = 'new name';
            expect(spy.calledOnce, 'to be true');
        });
        it('shares events between objects (with get method)', function() {
            Models.User.resetCache();
            var userInstance1 = Models.User.get(_models[0].uri);
            var userInstance2 = Models.User.getAll({ uri: _models[0].uri })[0];
            var spy = sinon.spy();
            userInstance1.listenTo('nameChange', spy );
            userInstance2.name = 'new name';
            expect(spy.calledOnce, 'to be true');
        });
    });
    describe('save', function() {
        it('does not save non persistent properties', function() {
            Models.define('user', {
                name: null,
                active: { store: false}
            });
            LocalStorageAdapter.register('user');

            var user = new Models.User({
                name: 'My name',
                active: true
            });

            var data = LocalStorageAdapter.get('user', user.uri);
            expect(data.active, 'to be undefined');

            user = Models.User.get(user.uri);
            expect(user.active, 'to be true');

            Models.User.remove(user.uri);
            Models.User = null;
        });
        it('assigns non persistent properties', function() {
            Models.define('user', {
                name: null,
                active: { store: false}
            });
            LocalStorageAdapter.register('user');

            var user = new Models.User({
                name: 'My name',
                active: true
            });

            Models.User.resetCache();
            user = Models.User.get(user.uri);
            expect(user.hasOwnProperty('active'), 'to be true');

            Models.User.remove(user.uri);
            Models.User = null;
        });
        it('assigns default value to persistent properties', function() {
            Models.define('user', {
                name: null,
                active: { store: false, default: 'yes'}
            });
            LocalStorageAdapter.register('user');

            var user = new Models.User({
                name: 'My name',
                active: true
            });

            Models.User.resetCache();
            user = Models.User.get(user.uri);
            expect(user.active, 'to equal', 'yes');

            Models.User.remove(user.uri);
            Models.User = null;
        });
    });
});
