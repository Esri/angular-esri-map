'use strict';

var helper = require('../helper');

describe('Add/Remove Layers', function() {
    // shared element locator(s)
    var map = element(by.id('map'));
    var mapGraphics = element(by.id('map_gc'));
    // point layer
    var pointFeatureLayer;
    // polygon layer
    var polygonFeatureLayer;
    // layer control checkboxes
    var layerCheckboxes;

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/add-remove-layers.html');
    });

    it('should have 2 layer control checkboxes', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(map);
        helper.waitUntilElementIsReady(mapGraphics);

        layerCheckboxes = element.all(by.repeater('layer in layers')).all(by.model('selected'));

        expect(layerCheckboxes.count()).toEqual(2);
    });

    it('should add a point layer to the map', function() {
        pointFeatureLayer = element(by.id('graphicsLayer1_layer'));

        layerCheckboxes.first().click();

        helper.getAsyncAttributeValue(pointFeatureLayer, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('point');
        });
    });

    it('should add a polygon layer to the map', function() {
        polygonFeatureLayer = element(by.id('graphicsLayer2_layer'));

        layerCheckboxes.last().click();

        helper.getAsyncAttributeValue(polygonFeatureLayer, 'data-geometry-type').then(function(value) {
            expect(value).toEqual('polygon');
        });
    });

    it('should remove a point layer from the map', function() {
        layerCheckboxes.first().click();

        // layer element should no longer be present
        expect(pointFeatureLayer.isPresent()).toBe(false);
    });

    it('should remove a polygon layer from the map', function() {
        layerCheckboxes.last().click();

        // layer element should no longer be present
        expect(polygonFeatureLayer.isPresent()).toBe(false);
    });
});