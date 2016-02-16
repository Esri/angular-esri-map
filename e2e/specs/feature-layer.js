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

    it('should have 1 feature layer, identified by an svg "g" element', function() {
        helper.getMapViewElement().then(function(mapView) {
            var allGs = mapView.all(by.tagName('g'));

            browser.wait(function() {
                return allGs.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                expect(allGs.count()).toEqual(1);
            });
        });
    });
});
