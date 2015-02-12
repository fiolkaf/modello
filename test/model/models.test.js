var Models = require('../../src/model/models');
var expect = require('unexpected/unexpected');

describe('models', function() {
    describe('define', function() {
        it('can define new model', function() {
            Models.define('tour', {});
            Models.Tour = null;
        });
        it('can define model without properties', function() {
            Models.define('tour');
            Models.Tour = null;
        });
        it('can define model with properties', function() {
            Models.define('person', {
                firstName: {},
                name: {},
                active: {}
            });
            Models.Person = null;
        });
        it('can define model with non persistent properties', function() {
            Models.define('person', {
                firstName: {},
                name: {},
                active: {
                    store: false
                }
            });
            var properties = Models.Person.Type.getNonPersistentProperties();
            expect(Object.keys(properties).length, 'to equal', 1);

            Models.Person = null;
        });
        it('can create a new defined model', function() {
            Models.define('person', {});
            var person = new Models.Person({
                uri: '/persons/1',
                firstname: 'Filip',
                surname: 'Fiolka'
            });
            person.dispose();
            Models.Person = null;
        });
        it('can define a model with default properties', function() {
            Models.define('person', {
                test: { default: true }
            });
            var person = new Models.Person();
            expect(person.test, 'to be true');
            person.dispose();
            Models.Person = null;
        });
        it('can define a model with default array properties', function() {
            Models.define('person', {
                test: { array: true,  default: [1, 2, 3] }
            });
            var person = new Models.Person();
            expect(person.test, 'to equal', [1, 2, 3]);
            person.dispose();
            Models.Person = null;
        });
    });
    describe('extend', function() {
        it('can extend model with methods', function() {
            Models.define('person', {
                property: null,
                getProperty: function() {
                    return property;
                }
            });
            Models.Person = null;
        });
        it('can extended model methods', function() {
            Models.define('person', {
                name: null,
                getName: function() {
                    return this.name;
                }
            });
            var person = Models.Person({
                uri: '/persons/1',
                name: 'Filip'
            });
            expect(person.name, 'to equal', 'Filip');
            expect(person.getName, 'to be defined');
            expect(person.getName(), 'to equal', 'Filip');
            Models.Person = null;
        });
        it('runs init method and listens to child changes', function() {
            var spy = sinon.spy();
            Models.define('tour', {
                taskChanged: null,
                task: {
                    type: 'task'
                },
                init: function() {
                    this.listenTo(this.task, 'change', spy);
                    this.taskChanged = true;
                }
            });
            Models.define('task', {
                name: null
            });
            var tour = Models.Tour({
                uri: '/tours/1',
                taskChanged: false,
                task: {
                    uri: '/tasks/1',
                    name: 'my task'
                }
            });
            expect(tour.task.name, 'to equal', 'my task');
            tour.task.name = 'new name';
            expect(spy.called, 'to be true');
            expect(tour.taskChanged, 'to be true');
            Models.Tour = null;
            Models.Task = null;
        });
    });
});
