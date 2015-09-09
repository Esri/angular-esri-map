/* globals protractor, beforeEach, describe, it, browser, element, expect, by */

'use strict';

describe('Set Basemap', function() {
    // shared element locators
    var map = element(by.id('map'));

    // syncronous wait blocker to help find elements
    function waitUntilElementIsReady(element) {
        browser.wait(function() {
            return element.isPresent();
        }, 5000);
        browser.wait(function() {
            return element.isDisplayed();
        }, 5000);
    }

    // helper for waiting on async map attributes to change
    function getAsyncAttributeValue(element, attribute) {
        return browser.wait(function() {
            var deferred = protractor.promise.defer();
            // setting an artificial timeout to wait and hope
            // that an async map attribute such as "data-zoom" is different
            setTimeout(function() {
                element.getAttribute(attribute).then(function(value) {
                    // resolve the deferred for both the the browser.wait()
                    // and to get outside access to the attribute value
                    deferred.fulfill(value);
                });
            }, 2000);
            return deferred.promise;
        }, 5000);
    }

    beforeEach(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/set-basemap.html');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Set Basemap');
    });

    it('should click on the "zoom in" and change the map "data-zoom" value from "3" to "4"', function() {
        // element locator(s) specific to this test
        var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
        waitUntilElementIsReady(zoomIn);
        waitUntilElementIsReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('3');

        zoomIn.click();

        getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('4');
        });
    });

    it('should choose a different basemap select and change the map "data-basemap" value from "satellite" to "oceans"', function() {
        // element locator(s) specific to this test
        var basemapSelect = element(by.model('map.basemap'));
        waitUntilElementIsReady(map);

        expect(map.getAttribute('data-basemap')).toEqual('satellite');

        basemapSelect.sendKeys('oceans');

        getAsyncAttributeValue(map, 'data-basemap').then(function(newValue) {
            expect(newValue).toEqual('oceans');
        });
    });
});