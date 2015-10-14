
'use strict';

var helper = require('../helper');

describe('Dynamic Map Service Layers', function() {
    // shared element locator(s)
    var map = element(by.id('map'));
    // dynamic map service layers
    var oilAndGasDynamicLayer = element(by.id('map_oilAndGasLayer'));
    var demographicsDynamicLayer = element(by.id('map_demographicsLayer'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/dynamic-map-service-layers.html');
    });

    it('should check that the map has 2 dynamic map service layers', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(oilAndGasDynamicLayer);
        helper.waitUntilElementIsReady(demographicsDynamicLayer);

        // check that the layers contain images
        expect(oilAndGasDynamicLayer.element(by.css('img'))).toBeDefined();
        expect(demographicsDynamicLayer.element(by.css('img'))).toBeDefined();
    });

    it('should click on the map and display a popup', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(map);
        var popup = element(by.className('esriPopup'));

        map.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function() {
            // we are not concerned with the map's data-zoom
            // but we want to give the click action some time to update the class names
            expect(popup.getAttribute('class')).toBe('esriPopup esriPopupVisible');
        });
    });
});
