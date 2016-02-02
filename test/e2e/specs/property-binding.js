'use strict';

var helper = require('../helper');

describe('Property Binding', function() {
    beforeAll(function() {
        browser.get('/property-binding.html');
    });

    it('should have a standard map view that is not rotated', function() {
        helper.getMapViewElement().then(function(mapView) {
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(0deg\))/);
        });
    });

    it('should have a bound rotation property model to an input element', function() {
        helper.getMapViewElement().then(function() {
            var rotationInput = element(by.model('exampleCtrl.mapView.rotation'));
            expect(rotationInput.getAttribute('value')).toBe('0');
        });
    });

    it('should rotate the map by changing the bound rotation property model of an input element', function() {
        helper.getMapViewElement().then(function(mapView) {
            var rotationInput = element(by.model('exampleCtrl.mapView.rotation'));
            rotationInput.sendKeys('180');
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(180deg\))/);
        });
    });
});

