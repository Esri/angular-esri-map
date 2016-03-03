'use strict';

var helper = require('../helper');

describe('Registry Pattern', function() {
    beforeAll(function() {
        browser.get('/registry-pattern.html');
    });

    it('should click on the map view and begin showing click information in a text element', function() {
        var mapViewClickInfo = element(by.id('mapViewClickInfo'));
        
        helper.getMapViewElement().then(function() {
            var clickableMapElements = element.all(by.css('.esri-view-surface'));
            clickableMapElements.click();

            expect(mapViewClickInfo.getCssValue('display')).toEqual('block');
        });
    });

    it('should click on the scene view and begin showing click information in a text element', function() {
        var sceneViewClickInfo = element(by.id('sceneViewClickInfo'));

        helper.getSceneViewElement().then(function() {
            var clickableMapElements = element.all(by.css('.esri-view-surface'));
            clickableMapElements.click();

            expect(sceneViewClickInfo.getCssValue('display')).toEqual('block');
        });
    });
});
