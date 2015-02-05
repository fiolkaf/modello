var Models = require('./models');

describe('model', function() {
    it('can register new model', function() {
        Models.define('tour', {});
        Models.Tour = null;
    });

    it('can register model with properties', function() {
        Models.define('person', {
            firstName: {},
            name: {},
            active: { store: false }
        });
        Models.Person = null;
    });
    it('can create a new model', function() {
        Models.define('person', {});

        var person = new Models.Person({
            firstName: 'Filip',
            surName: 'Fiolka'
        });
        Models.Person = null;
    });
});
