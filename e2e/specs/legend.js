'use strict';

var helper = require('../helper');

describe('Web Map', function() {
    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/legend.html');
    });

    it('should have a legend and information about 2 layers', function() {
        // element locator(s) specific to this test
        var legend = element(by.id('legend'));
        helper.waitUntilElementIsReady(legend);

        // should be an instance of the legend dijit
        // should have 1 section for each of the map's 2 layers
        helper.getAsyncAttributeValue(legend, 'widgetid').then(function(value) {
            expect(value).toEqual('legend');
            legend.all(by.css('.esriLegendServiceLabel')).then(function(elements) {
                expect(elements[0].getText()).toEqual('Water Bodies');
                expect(elements[1].getText()).toEqual('Rivers');
            });
        });
    });
});
