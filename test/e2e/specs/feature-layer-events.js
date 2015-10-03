'use strict';

var helper = require('../helper');

describe('Feature Layer Events', function() {
    // shared element locators
    var map = element(by.id('map'));
    var mapGraphics = element(by.id('map_gc'));
    // point
    var pointFeatureLayer = element(by.id('graphicsLayer1_layer'));
    var treesUpdateEndCountInfo = element(by.id('treesUpdateEndCountInfo'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/feature-layer-events.html');
    });

    it('should check that the map has a feature layer', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(map);
        helper.waitUntilElementIsReady(mapGraphics);

        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('point');
        });
    });

    it('should load the point feature layer and change informational text', function() {
        // element locator(s) specific to this test
        var treesLoadedInfo = element(by.id('treesLoadedInfo'));
        helper.waitUntilElementIsReady(map);
        helper.waitUntilElementIsReady(mapGraphics);

        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function() {
            // we are not concerned with the data-geometry-type
            // but we want to give the layer time to load
            expect(treesLoadedInfo.getText()).toBe('is loaded');
            expect(treesUpdateEndCountInfo.getText()).toBe('has been updated 0 times');
        });
    });

    it('should click on the checkbox control, toggle on layer visibility, and change informational text', function() {
        // element locator(s) specific to this test
        var showTreesToggle = element(by.model('map.showTrees'));
        var treesVisibleInfo = element(by.id('treesVisibleInfo'));

        showTreesToggle.click();

        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function() {
            // we are not concerned with the data-geometry-type
            // but we want to give the layer time to display itself after executing showTreesToggle.click()
            expect(pointFeatureLayer.getCssValue('display')).toEqual('block');
            expect(treesVisibleInfo.getText()).toBe('is visible');
            expect(treesUpdateEndCountInfo.getText()).not.toBe('has been updated 0 times');
        });
    });
});