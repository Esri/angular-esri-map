'use strict';

var helper = require('../helper');

describe('Additional Map Options', function() {
    // shared element locator(s)
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/additional-map-options.html');
    });

    it('should load a map with a horizontal and bottom-left map zoom slider', function() {
        // element locator(s) specific to this test
        var mapZoomSlider = element(by.id('map_zoom_slider'));
        helper.waitUntilElementIsReady(mapZoomSlider);
        helper.waitUntilElementIsReady(map);

        expect(mapZoomSlider.getAttribute('class')).toBe('esriSimpleSlider esriSimpleSliderHorizontal esriSimpleSliderBL');
    });

    it('should load a map from a WebmapId, and display the loaded item title and id information', function() {
        // element locator(s) specific to this test
        var webmapTitle = element(by.id('webmapTitle'));
        var webmapItemId = element(by.id('webmapItemId'));
        helper.waitUntilElementIsReady(map);

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function() {
            // we are not concerned with the map's data-zoom
            // but we want to give the map some time to load and then update the visible text
            expect(webmapTitle.getAttribute('innerHTML')).toBe('Portland Bike Map');
            expect(webmapItemId.getAttribute('innerHTML')).toBe('8e42e164d4174da09f61fe0d3f206641');
        });
    });
});