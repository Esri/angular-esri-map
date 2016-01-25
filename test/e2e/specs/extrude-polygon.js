'use strict';

var helper = require('../helper');

describe('Extrude Polygon', function() {
    beforeAll(function() {
        browser.get('/extrude-polygon.html');
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });
});
