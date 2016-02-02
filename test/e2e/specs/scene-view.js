'use strict';

var helper = require('../helper');

describe('Scene View', function() {
    beforeAll(function() {
        browser.get('/scene-view.html');
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });
});
