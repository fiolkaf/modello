var Models = require('./models');

describe('model', function() {
    it('can register model', function() {
        Models.register('tour', {});
    });
});
