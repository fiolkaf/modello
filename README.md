[![Build Status](https://travis-ci.org/fiolkaf/osync.svg?branch=master)](https://travis-ci.org/fiolkaf/modello)
# modello
Javascript modeling framework

## Install

##### CommonJS module

```
npm install modello
```

## Define a model

```javascript
// Define a new 'garden' model
Models.define('garden');

// Create an instance of a garden
var garden = new Models.Garden();
```
##### Model properties
You can define your model properties:

```javascript
// Define a new 'garden' model
Models.define('garden', {
    // garden.pumpkins property will be defined for all instances
    pumpkins: {},
    // garden.opened property will get default value
    opened: { default: true },
    // Array definition, defaults to []
    owners: { array: true }
});
// Create an instance of a garden
var garden = new Models.Garden({ pumpkins: 3 });
expect(garden.pumpkins, 'to equal', 3);
expect(garden.opened, 'to be true');
expect(garden.owners, 'to equal', []);
```

Your model will get all defined properties:
```javascript
var garden = new Models.Garden();
expect(garden.hasOwnProperty('pumpkins'), 'to be true');
```

And can be extended with not defined properties:
```javascript
var garden = new Models.Garden({ carrots: 7 });
expect(garden.carrots, 'to equal', 7);
```

##### Model functions
Extend your model with helper functions:
```javascript
Models.define('garden', {
    pumpkins: { default: 1 },
    carrots: { default: 3 },
    getVeggiesCount: function() {
        return this.pumpkins + this.carrots;
    }
});
garden = new Models.Garden();
expect(garden.getVeggiesCount(), 'to equal', 4);
```

Init function will be executed when model is created:
```javascript
Models.define('garden', {
    pumpkins: {},
    init: function() {
        this.pumpkins = 1;
    }
});
garden = new Models.Garden();
expect(garden.pumpkins, 'to equal', 1);
```

##### Embedded models
Composing models is easy:
```javascript
// Define pumpkin model with size property
Models.define('pumpkin', { size: {} });

// Define strawberry model
Models.define('strawberry', { color: { default: 'red' }});

// Define garden model
Models.define('garden', {
    pumpkin: { type: 'pumpkin' }, // embedded model
    strawberries: { type: 'strawberry', array: true }
});

var garden = new Models.Garden({
    pumpkin: new Models.Pumpkin({ size: 1 }),
    strawberries: [ new Models.Strawberry() ]
});
expect(garden.pumpkin.size, 'to equal', 1);
expect(garden.strawberries[0].color, 'to equal', 'red');
```

#### Model events
```javascript
garden = new Models.Garden();
// Attach listener to 'pumpkins' property change 
garden.listenTo('pumpkinsChange', callback);
// Attach a generic listener to any change in the model 
garden.listenTo('change', callback);
garden.pumpkins++;
```

All subscriptions will be released when disposing a model:
```javascript
garden.dispose();
```

## Model data adapter

```javascript
Models.define('garden', { pumpkins: { default: 0 } });

// Specify that we store garden models in localstorage
LocalStorageAdapter.register('garden');

// New instance is created and saved, it gets assigned uri property
var garden = new Models.Garden();

// You can specify uri property by yourself
garden = new Models.Garden({
    uri: '/garden/myGarden'
});

// Get you model using get method on the model
Models.Garden.get('/garden/myGarden');

// Query models using getAll method
result = Models.Garden.getAll( { pumpkins: 0 });

// Model changes will be saved on each modification
garden.pumpkins++;
            
// remove your models with remove method
result = Models.Garden.remove(garden.uri);
```

##### Non persistent properties
Use store modifier to exlude property from beeing stored:

```javascript
Models.define('garden', { 
    pumpkins: { store: false } 
});
```
