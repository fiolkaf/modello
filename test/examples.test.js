var expect = require('unexpected/unexpected');
var Models = require('../src/model/models');
var LocalStorageAdapter = require('../src/data/localStorageAdapter');

describe('model-examples', function() {
    describe('define a model', function() {
        it('can create an empty model', function() {
            // Define a new 'garden' model
            Models.define('garden');

            // Create an instance of a garden
            var garden = new Models.Garden();
            expect(garden, 'to be defined');
            Models.Garden = null;
        });
        it('can create model with properties', function() {
            // Define a new 'garden' model
            Models.define('garden', {
                // Define garden property - all garden instances will have 'pumpkins property defined'
                pumpkins: {},
                // Specify default value
                opened: { default: true },
                // Owner array definition
                owners: { array: true }
            });

            // Create an instance of a garden
            var garden = new Models.Garden({ pumpkins: 3 });
            expect(garden.pumpkins, 'to equal', 3);
            expect(garden.opened, 'to be true');
            expect(garden.owners, 'to equal', []);

            garden = new Models.Garden();
            expect(garden.hasOwnProperty('pumpkins'), 'to be true');

            Models.Garden = null;
        });
        it('can create model with default properties', function() {
            // Define a new 'garden' model
            Models.define('garden', {
                pumpkins: { default: 0 },
            });
            var garden = new Models.Garden();
            expect(garden.pumpkins, 'to equal', 0);

            garden = new Models.Garden({ carrots: 7 });

            expect(garden.carrots, 'to equal', 7);

            Models.Garden = null;
        });
        it('can create model with array property', function() {
            // Define a new 'garden' model
            Models.define('garden', {
                owners: { array: true },
            });
            var garden = new Models.Garden();
            expect(garden.owners, 'to equal', []);

            Models.Garden = null;
        });
        it('can create model with embedded property', function() {
            // Define pumpkin model with size property
            Models.define('pumpkin', { size: {} });

            // Define strawberry model
            Models.define('strawberry', { color: { default: 'red' }});

            // Define a new 'garden' model
            Models.define('garden', {
                pumpkin: { type: 'pumpkin' }, // embedded model
                strawberries: { type: 'strawberry', array: true } // embedded array of models
            });

            var garden = new Models.Garden({
                pumpkin: new Models.Pumpkin({ size: 1 }),
                strawberries: [ new Models.Strawberry() ]
            });

            expect(garden.pumpkin.size, 'to equal', 1);
            expect(garden.strawberries[0].color, 'to equal', 'red');
            Models.Pumpkin = null;
            Models.Strawberry = null;
            Models.Garden = null;
        });
        it('can extend a model with functions', function() {
            // Define a new 'garden' model
            Models.define('garden', {
                pumpkins: { default: 1 },
                carrots: { default: 3 },
                getVeggiesCount: function() {
                    return this.pumpkins + this.carrots;
                }
            });
            var garden = new Models.Garden();
            expect(garden.getVeggiesCount(), 'to equal', 4);

            Models.Garden = null;
        });
        it('will call init method on model', function() {

            Models.define('garden', {
                pumpkins: {},
                init: function() {
                    this.pumpkins = 1;
                }
            });
            var garden = new Models.Garden();
            expect(garden.pumpkins, 'to equal', 1);

            Models.Garden = null;
        });
    });
    describe('model events', function() {
        it('can listen to model changes', function() {
            Models.define('garden', {
                pumpkins: { default: 0 }
            });
            var garden = new Models.Garden();
            var callback = sinon.spy();
            garden.listenTo('pumpkinsChange', callback);
            garden.pumpkins++;
            expect(callback.called, 'to be true');
            garden.dispose();

            Models.Garden = null;
        });
    });
    describe('define data adapter', function() {
        it('can register data adapter', function() {
            Models.define('garden', {
                pumpkins: { default: 0 }
            });
            // Specify that we store garden models in localstorage
            LocalStorageAdapter.register('garden');
            // New instance is created and saved, it gets assigned uri property
            var garden = new Models.Garden();

            // You can specify uri property by yourself
            var myGarden = new Models.Garden({
                uri: '/garden/myGarden'
            });
            // Get you model using get method on the model
            var result = Models.Garden.get('/garden/myGarden');
            expect(myGarden, 'to equal', result);

            // Query models using getAll method
            result = Models.Garden.getAll( { filter : { pumpkins: 0 } });
            expect(result.length, 'to equal', 2);

            // Model changes will be saved on each modification
            garden.pumpkins++;

            // remove your models with remove method
            result = Models.Garden.remove(myGarden.uri);
            result = Models.Garden.remove(garden.uri);

            result = Models.Garden.get('/garden/myGarden');
            expect(result, 'to be null');

            Models.Garden.getAll();
        });
    });
});
