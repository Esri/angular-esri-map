'use strict';

var helper = require('../helper');

xdescribe('Deferred Map', function() {
    // shared element locator(s)
    var loadJSAPIButton = element(by.buttonText('Load Esri JSAPI and MapView'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/deferred-map.html');
    });

    it('should click on the load JSAPI button, and create a standard map view that is not rotated', function() {
        loadJSAPIButton.click();

        // var mapView = helper.getMapViewElement();
        helper.getMapViewElement().then(function(mapView) {
            expect(mapView.getAttribute('style')).toMatch(/(transform: rotateZ\(0deg\))/);
        });
    });
});
