'use strict';

var helper = require('../helper');

describe('Feature Layer', function() {
    beforeAll(function() {
        browser.get('/feature-layer.html');
    });

    it('should have a map view that is rotated by 90 degrees', function() {
        helper.getMapViewElement().then(function(mapView) {
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(90deg\))/);
        });
    });

    it('should have a feature layer with many circle symbols, identified by svg "circle" elements', function() {
        helper.getMapViewElement().then(function(mapView) {
            var allCircles = mapView.all(by.tagName('circle'));

            browser.wait(function() {
                return allCircles.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                expect(allCircles.count()).toBeGreaterThan(1);
            });
        });
    });
});
