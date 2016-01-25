'use strict';

var helper = require('../helper');

describe('Home Button', function() {
    beforeAll(function() {
        browser.get('/home-button.html');
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });

    it('should have a home button with a bound "view" attribute', function() {
        var esriHomeButton = element(by.tagName('esri-home-button'));
        helper.getAsyncAttributeValue(esriHomeButton, 'view').then(function(value) {
            expect(value).toBe('exampleCtrl.sceneView');
        });
    });
});
