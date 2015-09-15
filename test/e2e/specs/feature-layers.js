'use strict';

var helper = require('../helper');

describe('Feature Layers', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));
    var mapGraphics = element(by.id('map_gc'));
    var featureLayer1 = element(by.id('graphicsLayer1_layer'));
    var featureLayer2 = element(by.id('graphicsLayer2_layer'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/feature-layers.html');
    });

    it('should check that the map has 1 polygon layer and 1 point layer', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);
        helper.waitUntilElementIsReady(mapGraphics);

        helper.getAsyncAttributeValue(featureLayer1, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('polygon');
        });

        helper.getAsyncAttributeValue(featureLayer2, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('point');
        });
    });

    it('should click on the checkbox control and toggle on the point layer visibility', function() {
        // element locator(s) specific to this test
        var showTreesToggle = element(by.model('map.showTrees'));

        showTreesToggle.click();

        helper.getAsyncAttributeValue(featureLayer2, 'data-geometry-type').then(function() {
            // we are not concerned with the data-geometry-type
            // but we want to give the layer time to display itself after executing showTreesToggle.click()
            expect(featureLayer2.getCssValue('display')).toEqual('block');
        });
    });
});