'use strict';

var helper = require('../helper');

describe('Property Binding', function() {
    beforeAll(function() {
        browser.get('/property-binding.html');
    });

    it('should have a bound rotation property model to an input element', function() {
        helper.getMapViewElement().then(function() {
            var rotationInput = element(by.model('exampleCtrl.mapView.rotation'));
            expect(rotationInput.getAttribute('value')).toBe('0');
        });
    });
});

