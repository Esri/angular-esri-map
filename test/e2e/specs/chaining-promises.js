'use strict';

var helper = require('../helper');

describe('Chaining Promises', function() {
    beforeAll(function() {
        browser.get('/chaining-promises.html');
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });

    it('should report the area at the end of the promise chain', function() {
        helper.getSceneViewElement().then(function() {
            var startPromiseChainButton = element(by.buttonText('Start Promise Chain'));
            var areaSpan = element(by.id('areaSpan'));
            areaSpan.getText().then(function(value) {
                var areaTextBefore = value;

                startPromiseChainButton.click();

                browser.wait(function() {
                    return areaSpan.getAttribute('class').then(function(value) {
                        return value.indexOf('ng-hide') === -1;
                    });
                }, 8000).then(function() {
                    areaSpan.getText().then(function(value) {
                        var areaTextAfter = value;
                        expect(areaTextBefore).not.toEqual(areaTextAfter);
                    });
                });
            });
        });
    });
});
