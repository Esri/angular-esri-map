'use strict';

var helper = require('../helper');

describe('Feature Layers', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));
    var mapGraphics = element(by.id('map_gc'));
    // polygon
    var featureLayer1 = element(by.id('graphicsLayer1_layer'));
    // point
    var featureLayer2 = element(by.id('graphicsLayer2_layer'));
    // polyline, with unique ID defined by JSAPI constructor options
    var featureLayer3 = element(by.id('PortlandLightRail_layer'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/feature-layers.html');
    });

    it('should check that the map has 1 layer of each type (point, line, polygon)', function() {
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

        helper.getAsyncAttributeValue(featureLayer3, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('polyline');
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

    it('should submit a new definition expression and change the total number of point layer image DOM nodes', function() {
        // element locator(s) specific to this test
        var treesDefExpressionInputText = element(by.model('treesDefExpressionInputText'));
        var defExpressionSubmit = element(by.id('submit'));

        treesDefExpressionInputText.sendKeys('HEIGHT > 180');
        defExpressionSubmit.click();

        var featureLayerChildImageNodes = featureLayer2.all(by.tagName('image'));
        helper.getAsyncAttributeValue(featureLayer2, 'data-geometry-type').then(function() {
            // we are not concerned with the data-geometry-type
            // but we want to give the layer time to display itself after submitting the def expression form
            expect(featureLayerChildImageNodes.count()).toEqual(2);
        });
    });

    it('should change the opacity of the polygon layer', function() {
        // element locator(s) specific to this test
        var parksOpacityInputText = element(by.model('map.parksOpacity'));

        var beforeOpacity = featureLayer1.getAttribute('opacity');
        
        parksOpacityInputText.clear();
        parksOpacityInputText.sendKeys('0');
        
        var afterOpacity = featureLayer1.getAttribute('opacity');

        expect(afterOpacity).not.toBe(beforeOpacity);
    });
});