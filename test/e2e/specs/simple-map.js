/* globals beforeEach, describe, it, browser, element, expect, by, waitUntilElementIsReady, getAsyncAttributeValue */
'use strict';
describe('Simple Map Example', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));

    beforeEach(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/simple-map.html');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Simple Map Example');
    });

    it('should click on the "zoom in" and change the map zoom value from "13" to "14"', function() {
        // element locator(s) specific to this test
        waitUntilElementIsReady(zoomIn);
        waitUntilElementIsReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('13');

        zoomIn.click();

        getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('14');
        });
    });
});