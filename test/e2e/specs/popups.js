'use strict';

var helper = require('../helper');

xdescribe('Popups', function() {
    beforeAll(function() {
        browser.get('/popups.html');
    });

    it('should how a popup when the feature layer is clicked on', function() {
        helper.getMapViewElement().then(function(mapView) {
            var allGs = mapView.all(by.tagName('g'));

            browser.wait(function() {
                return allGs.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                var popupDiv = element(by.css('.esri-popup'));

                var clickableMapElement = element(by.css('.esri-view-surface'));
                clickableMapElement.click();

                // SHOULD NOT INCLUDE CLASS "esri-invisible"
                expect(popupDiv.getAttribute('class')).toEqual('esri-popup');
            });
        });
    });
});
