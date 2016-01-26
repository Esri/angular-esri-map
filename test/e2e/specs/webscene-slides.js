'use strict';

var helper = require('../helper');

describe('Webscene Slides', function() {
    beforeAll(function() {
        browser.get('/webscene-slides.html');
    });

    it('should have a scene view', function() {
        helper.getSceneViewElement().then(function(sceneView) {
            expect(sceneView).toBeDefined();
        });
    });

    it('should have six slides', function() {
        helper.getSceneViewElement().then(function() {
            var slides = element.all(by.repeater('slide in exampleCtrl.slides'));

            browser.wait(function() {
                return slides.count().then(function(countValue) {
                    return countValue > 0;
                });
            }, 8000).then(function() {
                expect(slides.count()).toEqual(6);
            });
        });
    });
});
