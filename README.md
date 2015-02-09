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
You can define your model with properties:

```javascript
// Define a new 'garden' model
Models.define('garden', {
  pumpkins: {},
});

// Create an instance of a garden
var garden = new Models.Garden({
  pumpkins: 3
});
expect(garden.pumpkins, 'to equal', 3);
```

Your model will get all defined properties:
```javascript
var garden = new Models.Garden();

expect(garden.hasOwnProperty('pumpkins'), 'to be true');
```
##### Default values for properties
You can specify default values for properties:
```javascript
Models.define('garden', {
    pumpkins: { default: 0 },
});
garden = new Models.Garden();
expect(garden.pumpkins, 'to equal', 0);
```
##### Array properties
Or define arays:
```javascript
Models.define('garden', {
    owners: { array: true },
});
var garden = new Models.Garden();
expect(garden.owners, 'to equal', []);
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
    pumpkin: { type: 'pumpkin' }, // embedded mo
    strawberries: { type: 'strawberry', array: true }
});

var garden = new Models.Garden({
    pumpkin: new Models.Pumpkin({ size: 1 }),
    strawberries: [ new Models.Strawberry() ]
});
expect(garden.pumpkin.size, 'to equal', 1);
expect(garden.strawberries[0].color, 'to equal', 'red');

```
