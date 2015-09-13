'use strict';

var helper = require('../helper');

describe('Simple Map', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/simple-map.html');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Simple Map');
    });

    it('should click on the "zoom in" and change the map zoom value from "13" to "14"', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('13');

        zoomIn.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('14');
        });
    });
});
