'use strict';

var helper = require('../helper');

describe('Custom Factory', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/custom-factory.html');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Custom Factory');
    });

    it('should click on the "zoom in" and change the map zoom value from "6" to "7"', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('6');

        zoomIn.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('7');
        });
    });
});
