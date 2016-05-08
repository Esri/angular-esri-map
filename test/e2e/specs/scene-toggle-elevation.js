'use strict';

var helper = require('../helper');

describe('Scene View', function() {
    beforeAll(function() {
        browser.get('/scene-toggle-elevation.html');
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });

    it('should change the data attribution text when toggling elevation layers', function() {
        helper.getSceneViewElement().then(function() {
            var elevationToggle = element(by.id('elevationDiv'));
            var attributionTextElement = element(by.css('.esri-attribution__sources'));
            browser.wait(function() {
                return attributionTextElement.getText().then(function(textValue) {
                    return textValue.indexOf('Source: USGS, NGA, NASA, CGIAR') > -1;
                });
            }, 5000).then(function() {
                attributionTextElement.getText().then(function(textValue) {
                    var elevationOnText = textValue;

                    elevationToggle.click();

                    attributionTextElement.getText().then(function(textValue) {
                        var elevationOffText = textValue;
                        
                        expect(elevationOffText).not.toEqual(elevationOnText);
                    });
                });
            });
        });
    });
});
