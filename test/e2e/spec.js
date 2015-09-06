/* globals protractor, beforeEach, describe, it, browser, element, expect, by */

'use strict';

describe('Simple Map Example', function() {
    // element finders
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

    beforeEach(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/simple-map.html');
    });

    it('should have a title', function() {
        expect(browser.getTitle()).toEqual('Simple Map Example');
    });

    it('should click on the "zoom in" and change the map zoom value from "13" to "14"', function() {
        waitUntilElementReady(zoomIn);
        waitUntilElementReady(map);

        expect(map.getAttribute('data-zoom')).toEqual('13');

        // NOTE: The above 1-line assertion can also be written with a callback,
        //  since action methods return promises.
        // map.getAttribute('data-zoom').then(function(value) {
        //     console.log('data-zoom: ', value);
        //     expect(value).toEqual('13');
        // });

        zoomIn.click();

        // TODO: can we find a better way to wait for JSAPI map values to change in the DOM?
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            // setting an artificial timeout to wait & hope that "data-zoom" is different
            setTimeout(function() {
                map.getAttribute('data-zoom').then(function(value) {
                    expect(value).toEqual('14');
                    // resolve the deferred for the sake of the browser.wait()
                    deferred.fulfill(true);
                });
            }, 2000);

            return deferred.promise;
        }, 5000);

    });
});