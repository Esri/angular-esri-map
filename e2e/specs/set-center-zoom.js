'use strict';

var helper = require('../helper');

describe('Set Map Center and Zoom', function() {
    // shared element locators
    var map = element(by.id('map'));
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var lat = element(by.model('map.center.lat'));
    var lng = element(by.model('map.center.lng'));
    var zoomSelect = element(by.model('map.zoom'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/set-center-zoom.html');
    });

    it('should click on the "San Francisco" button and change the map "data-zoom" value, along with the lat, lng, and zoom element values', function() {
        // element locator(s) specific to this test
        var sanFrancisco = element(by.buttonText('San Francisco'));
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        zoomIn.click(); // clicking on this first seems to help successfully execute a click on the following button
        sanFrancisco.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            var expectedZoom = '10',
                expectedLat = '37.75',
                expectedLng = '-122.45';
            expect(newValue).toEqual(expectedZoom);
            expect(zoomSelect.getAttribute('value')).toEqual(expectedZoom);
            expect(lat.getAttribute('value')).toEqual(expectedLat);
            expect(lng.getAttribute('value')).toEqual(expectedLng);
        });
    });

    it('should click on the "New York" button and change the map "data-zoom" value, along with the lat, lng, and zoom element values', function() {
        // element locator(s) specific to this test
        var newYork = element(by.buttonText('New York'));
        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        zoomIn.click(); // clicking on this first seems to help successfully execute a click on the following button
        newYork.click();

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            var expectedZoom = '12',
                expectedLat = '40.7127',
                expectedLng = '-74.0059';
            expect(newValue).toEqual(expectedZoom.toString());
            expect(zoomSelect.getAttribute('value')).toEqual(expectedZoom);
            expect(lat.getAttribute('value')).toEqual(expectedLat);
            expect(lng.getAttribute('value')).toEqual(expectedLng);
        });
    });

    it('should choose a new option of "7" from the zoom select and change the map "data-zoom" value to "7"', function() {
        helper.waitUntilElementIsReady(map);

        var expectedZoom = '7';
        zoomSelect.sendKeys(expectedZoom);

        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual(expectedZoom);
        });
    });
});