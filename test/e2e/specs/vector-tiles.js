'use strict';

var helper = require('../helper');

describe('Feature Layer', function() {
    beforeAll(function() {
        browser.get('/vector-tiles.html');
    });

    it('should have a standard map view that is not rotated', function() {
        helper.getMapViewElement().then(function(mapView) {
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(0deg\))/);
        });
    });

    it('should have 1 vector tiles layer, identified by a "canvas" element', function() {
        helper.getMapViewElement().then(function(mapView) {
            var canvasElements = mapView.all(by.tagName('canvas'));

            browser.wait(function() {
                return canvasElements.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                expect(canvasElements.count()).toEqual(1);
            });
        });
    });
});
