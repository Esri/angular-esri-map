'use strict';

var helper = require('../helper');

describe('Map Events', function() {
    // shared element locators
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/map-events.html');
    });

    it('should load the map and change the text of a "<p>" element', function() {
        // element locator(s) specific to this test
        var mapLoadedInfo = element(by.id('mapLoadedInfo'));
        helper.waitUntilElementIsReady(map);
        
        helper.getAsyncAttributeValue(map, 'data-zoom').then(function() {
            expect(mapLoadedInfo.getText()).toBe('The map is loaded.');
        });
    });

    it('should zoom in and change the extent information in a "<p>" element', function() {
        // element locator(s) specific to this test
        var extentInfo = element(by.id('extentInfo'));
        var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        var beforeExtent = extentInfo.getText();

        zoomIn.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function() {
            var afterExtent = extentInfo.getText();
            expect(afterExtent).not.toBe(beforeExtent);
        });
    });
});