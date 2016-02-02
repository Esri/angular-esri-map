'use strict';

var helper = require('../helper');

describe('Search Widget', function() {
    beforeAll(function() {
        browser.get('/search.html');
    });

    it('should have a standard map view that is not rotated', function() {
        helper.getMapViewElement().then(function(mapView) {
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(0deg\))/);
        });
    });

    it('should have a search widget', function() {
        helper.getMapViewElement().then(function() {
            var search = element(by.css('.esri-search'));
            expect(search).toBeDefined();
        });
    });
});
