'use strict';

var helper = require('../helper');

describe('Set Basemap', function() {
    // shared element locators
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/custom-basemap.html');
    });

    it('should have a custom basemap ', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(map);

        expect(map.getAttribute('data-basemap')).toEqual('delorme');
    });
});
