/* globals protractor, beforeEach, describe, it, browser, element, expect, by */

'use strict';

describe('Simple Map Example', function() {
    // shared element locator(s)
    var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));
    var map = element(by.id('map'));

    // syncronous wait blocker to help find elements
    function waitUntilElementReady(elm) {
        browser.wait(function() {
            return elm.isPresent();
        }, 5000);
        browser.wait(function() {
            return elm.isDisplayed();
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
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/simple-map.html');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Simple Map Example');
    });

    it('should click on the "zoom in" and change the map zoom value from "13" to "14"', function() {
        // element locator(s) specific to this test
        waitUntilElementReady(zoomIn);
        waitUntilElementReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('13');

        zoomIn.click();

        getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('14');
        });
    });
});