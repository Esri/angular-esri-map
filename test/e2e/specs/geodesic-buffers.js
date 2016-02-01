'use strict';

var helper = require('../helper');

describe('Feature Layer', function() {
    beforeAll(function() {
        browser.get('/geodesic-buffers.html');
    });

    it('should have a standard map view that is not rotated', function() {
        helper.getMapViewElement().then(function(mapView) {
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(0deg\))/);
        });
    });

    it('should have a point layer containing 17 graphics, identified by "circle" elements', function() {
        helper.getMapViewElement().then(function(mapView) {
            var circleElements = mapView.all(by.tagName('circle'));

            browser.wait(function() {
                return circleElements.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                expect(circleElements.count()).toEqual(17);
            });
        });
    });

    it('should have a buffer polygon layer containing 17 graphics, identified by "path" elements', function() {
        helper.getMapViewElement().then(function(mapView) {
            var pathElements = mapView.all(by.tagName('path'));

            browser.wait(function() {
                return pathElements.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                expect(pathElements.count()).toEqual(17);
            });
        });
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });
});
