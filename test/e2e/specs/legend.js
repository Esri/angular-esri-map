'use strict';

var helper = require('../helper');

describe('Web Map', function() {
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/legend.html');
    });

    it('should have a legend and information about 2 layers', function() {
        zoomIn.click(); // zooming in assists with getting both layers visible in the map's extent

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
