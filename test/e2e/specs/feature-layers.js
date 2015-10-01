'use strict';

var helper = require('../helper');

describe('Feature Layers', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));
    var mapGraphics = element(by.id('map_gc'));
    // point
    var pointFeatureLayer = element(by.id('graphicsLayer1_layer'));
    // polyline, with unique ID defined by JSAPI constructor options
    var polylineFeatureLayer = element(by.id('PortlandLightRail_layer'));
    // polygon
    var polygonFeatureLayer = element(by.id('graphicsLayer2_layer'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/feature-layers.html');
    });

    it('should check that the map has 1 layer of each type (point, line, polygon)', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);
        helper.waitUntilElementIsReady(mapGraphics);

        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('point');
        });

        helper.getAsyncAttributeValue(polylineFeatureLayer, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('polyline');
        });
        
        helper.getAsyncAttributeValue(polygonFeatureLayer, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('polygon');
        });
    });

    it('should click on the checkbox control and toggle on the point layer visibility', function() {
        // element locator(s) specific to this test
        var showTreesToggle = element(by.model('map.showTrees'));

        showTreesToggle.click();

        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function() {
            // we are not concerned with the data-geometry-type
            // but we want to give the layer time to display itself after executing showTreesToggle.click()
            expect(pointFeatureLayer.getCssValue('display')).toEqual('block');
        });
    });

    it('should submit a new definition expression and change the total number of point layer image DOM nodes', function() {
        // element locator(s) specific to this test
        var treesDefExpressionInputText = element(by.model('treesDefExpressionInputText'));
        var defExpressionSubmit = element(by.id('submit'));

        treesDefExpressionInputText.sendKeys('HEIGHT > 180');
        defExpressionSubmit.click();

        var featureLayerChildImageNodes = pointFeatureLayer.all(by.tagName('image'));
        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function() {
            // we are not concerned with the data-geometry-type
            // but we want to give the layer time to display itself after submitting the def expression form
            expect(featureLayerChildImageNodes.count()).toEqual(2);
        });
    });

    it('should change the opacity of the polygon layer', function() {
        // element locator(s) specific to this test
        var parksOpacityInputText = element(by.model('map.parksOpacity'));

        var beforeOpacity = polygonFeatureLayer.getAttribute('opacity');
        
        parksOpacityInputText.clear();
        parksOpacityInputText.sendKeys('0');
        
        var afterOpacity = polygonFeatureLayer.getAttribute('opacity');

        expect(afterOpacity).not.toBe(beforeOpacity);
    });

    it('should click on the map and display a popup', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(map);
        var popup = element(by.className('esriPopup'));

        map.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function() {
            // we are not concerned with the map's data-zoom
            // but we want to give the click action some time to update the class names
            expect(popup.getAttribute('class')).toBe('esriPopup esriPopupVisible');
        });
    });


});