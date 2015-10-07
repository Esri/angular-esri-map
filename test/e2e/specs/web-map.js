'use strict';

var helper = require('../helper');

describe('Web Map', function() {
    // shared element locators
    var map = element(by.id('map'));

    beforeAll(function() {
        // refer to "gulp test" task to get the baseUrl that is prepended
        browser.get('/web-map.html');
    });

    it('should have a legend', function() {
        var legend = element(by.id('legend'));
        helper.waitUntilElementIsReady(legend);
        // should be an instance of the legend dijit
        helper.getAsyncAttributeValue(legend, 'widgetid').then(function(newValue) {
            expect(newValue).toEqual('legend');
        });
    });

    it('should load 1 bookmark and then click on this bookmark to change the map "data-zoom" value to "4"', function() {
        // element locator(s) specific to this test
        var zoomIn = element(by.css('.esriSimpleSliderIncrementButton'));

        helper.waitUntilElementIsReady(zoomIn);
        helper.waitUntilElementIsReady(map);

        // something to alter the map's zoom before testing the bookmark
        zoomIn.click();
        zoomIn.click();

        // zoom should NOT be 4
        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).not.toEqual('4');
        });

        // NOTE: An async ElementArrayFinder by repeater is proving to be tricky to
        // wait on until its individual bookmark elements are either "isPresent",
        // "isDisplayed", or if the ElementArrayFinder itself has a "count() > 0".
        // However, this seems to be available more often than not if used later in our assertion.
        var bookmarks = element.all(by.repeater('bookmark in itemInfo.itemData.bookmarks'));

        expect(bookmarks.count()).toEqual(1);

        bookmarks.first().click();

        // zoom should be 4
        helper.getAsyncAttributeValue(map, 'data-zoom').then(function(newValue) {
            expect(newValue).toEqual('4');
        });
    });
});
