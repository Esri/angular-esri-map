'use strict';

var helper = require('../helper');

describe('Set Basemap', function() {
    // shared element locators
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/set-basemap.html');
    });

    it('should click on the "zoom in" and change the map "data-zoom" value from "3" to "4"', function() {
        // element locator(s) specific to this test
        var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('3');

        zoomIn.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('4');
        });
    });

    it('should choose a different basemap select and change the map "data-basemap" value from "satellite" to "oceans"', function() {
        // element locator(s) specific to this test
        var basemapSelect = element(by.model('map.basemap'));
        helper.waitUntilElementIsReady(map);

        expect(map.getAttribute('data-basemap')).toEqual('satellite');

        basemapSelect.sendKeys('oceans');

        helper.getAsyncAttributeValue(map, 'data-basemap').then(function(newValue) {
            expect(newValue).toEqual('oceans');
        });
    });
});
