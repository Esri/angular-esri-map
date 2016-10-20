'use strict';

var helper = require('../helper');

describe('Registry Pattern', function() {
    beforeAll(function() {
        browser.get('/registry-pattern.html');
    });

    it('should click on the map and scene views and begin showing click information in a text element', function() {
        var mapViewClickInfo = element(by.id('mapViewClickInfo'));

        helper.getMapViewElement().then(function() {
            var clickableMapElements = element.all(by.css('.esri-view-surface'));
            clickableMapElements.click();

            // briefly slow down the test runner
            var zoomInDiv = element(by.css('.esri-button.esri-widget-button.esri-interactive'));
            helper.waitUntilElementIsReady(zoomInDiv);
            zoomInDiv.click();

            expect(mapViewClickInfo.getCssValue('display')).toEqual('block');

            var sceneViewClickInfo = element(by.id('sceneViewClickInfo'));

            // nesting this to give the scene view some more time to load and settle
            helper.getSceneViewElement().then(function() {
                var clickableMapElements = element.all(by.css('.esri-view-surface'));
                clickableMapElements.last().click();

                // briefly slow down the test runner
                var zoomInDiv = element(by.css('.esri-button.esri-widget-button.esri-interactive'));
                helper.waitUntilElementIsReady(zoomInDiv);
                zoomInDiv.click();

                expect(sceneViewClickInfo.getCssValue('display')).toEqual('block');
            });
        });
    });
});
