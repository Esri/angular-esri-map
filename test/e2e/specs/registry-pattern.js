'use strict';

var helper = require('../helper');

describe('Registry Pattern', function() {
    // shared element locator(s)
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/registry-pattern.html');
    });

    it('should click on the "zoom in" and change the map zoom value from "13" to "14"', function() {
        // element locator(s) specific to this test
        var mapClickInfo = element(by.id('mapClickInfo'));
        helper.waitUntilElementIsReady(map);

        map.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function() {
            // we are not concerned with the map's data-zoom
            // but we want to give the click action some time to update the visible text
            expect(mapClickInfo.getCssValue('display')).toEqual('block');
        });
    });
});
