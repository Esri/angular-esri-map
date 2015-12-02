'use strict';

var helper = require('../helper');

describe('Deferred Map', function() {
    // shared element locator(s)
    var loadJSAPIButton = element(by.buttonText('Load Esri JSAPI and Map'));
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/deferred-map.html');
    });

    it('should click on the load JSAPI button, and the map zoom value should be "13"', function() {
        loadJSAPIButton.click();

        helper.waitUntilElementIsReady(map);
        
        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('13');
        });
    });
});