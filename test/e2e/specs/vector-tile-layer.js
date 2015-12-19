
'use strict';

var helper = require('../helper');

describe('Vector Tile Layer', function() {
    // shared element locator(s)
    var vectorTileLayer = element(by.id('map_vtl-dark-style'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/vector-tile-layer.html');
    });

    it('should check that the map has 1 vector tile layer containing 1 canvas element', function() {
        // element locator(s) specific to this test
        helper.waitUntilElementIsReady(vectorTileLayer);

        // check that it contains a canvas
        expect(vectorTileLayer.all(by.tagName('canvas')).count()).toEqual(1);
    });
});
