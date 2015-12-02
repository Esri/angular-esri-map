
'use strict';

var helper = require('../helper');

describe('Dynamic Map Service Layer', function() {
    // shared element locator(s)
    // dynamic map service layer
    var dynamicLayer = element(by.id('map_layer0'));

    beforeAll(function() {
        // refer to conf.js to get the baseUrl that is prepended
        browser.get('/dynamic-map-service-layer.html');
    });

    it('should check that the map has 1 dynamic map service layer', function() {
        // element locator(s) specific to this test
        // helper.waitUntilElementIsReady(zoomIn);
        // helper.waitUntilElementIsReady(map);
        helper.waitUntilElementIsReady(dynamicLayer);

        // check that it contains an image
        expect(dynamicLayer.element(by.css('img'))).toBeDefined();
    });

    it('should click on the checkbox control and toggle the dynamic layer visibility', function() {
        // element locator(s) specific to this test
        var visibleToggle = element(by.model('dynamicLayer.visible'));

        // wait until layer div is rendered w/ style attribute
        helper.getAsyncAttributeValue(dynamicLayer, 'style').then(function() {
            expect(dynamicLayer.getCssValue('display')).toEqual('block');
            visibleToggle.click();
            expect(dynamicLayer.getCssValue('display')).toEqual('none');
        });
    });

    it('should change the opacity of the dynamic layer', function() {
        // element locator(s) specific to this test
        var opacityInputText = element(by.model('dynamicLayer.opacity'));
        // var beforeOpacity = dynamicLayer.getCssValue('opacity');
        var newOpacity = '0.1';

        opacityInputText.clear();
        opacityInputText.sendKeys(newOpacity);

        var afterOpacity = dynamicLayer.getCssValue('opacity');

        expect(afterOpacity).toBe(newOpacity);
    });
});
