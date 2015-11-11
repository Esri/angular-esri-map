describe('esriLayerUtils', function() {

    var esriLoader;
    var esriLayerUtils;
    beforeEach(module('esri.core'));
    beforeEach(module(function($provide) {
        esriLoader = {};
        $provide.value('esriLoader', esriLoader);
    }));
    beforeEach(inject(function(_esriLayerUtils_) {
        esriLayerUtils = _esriLayerUtils_;
    }));

    describe('createInfoTemplate', function() {
        var InfoTemplate;

        beforeEach(function(){
            InfoTemplate = jasmine.createSpy();
            esriLoader.require = function() {
                return {
                    then: function(callback) {
                        callback(InfoTemplate);
                    }
                };
            };
        });

        it('should create a new InfoTemplate from an object', function() {
            esriLayerUtils.createInfoTemplate({
                title: 'title',
                content: 'content'
            });
            expect(InfoTemplate.calls.argsFor(0)).toEqual(['title', 'content']);
        });

        it('should create a new InfoTemplate from an array', function() {
            esriLayerUtils.createInfoTemplate(['title', 'content']);
            expect(InfoTemplate.calls.argsFor(0)).toEqual(['title', 'content']);
        });

        it('should not create a new InfoTemplate from an InfoTemplate', function() {
            esriLayerUtils.createInfoTemplate({
                declaredClass: 'esri.InfoTemplate'
            });
            expect(InfoTemplate.calls.any()).toEqual(false);
        });
    });

    describe('createFeatureLayer', function() {
        var FeatureLayer;
        var InfoTemplate;

        beforeEach(function(){
            FeatureLayer = jasmine.createSpy();
            FeatureLayer.MODE_SNAPSHOT = 3;
            InfoTemplate = jasmine.createSpy();
            esriLoader.require = function() {
                return {
                    then: function(callback) {
                        callback([FeatureLayer, InfoTemplate]);
                    }
                };
            };
        });

        it('should pass just url to layer constructor if no options', function() {
            esriLayerUtils.createFeatureLayer('notARealUrl');
            expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', undefined]);
            expect(InfoTemplate.calls.count()).toEqual(0);
        });

        it('should pass url and options to layer constructor', function() {
            var options = {
                id: 'test'
            };
            esriLayerUtils.createFeatureLayer('notARealUrl', options);
            expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            expect(InfoTemplate.calls.count()).toEqual(0);
        });

        it('should normalize mode option', function() {
            var options = {
                mode: 'MODE_SNAPSHOT'
            };
            esriLayerUtils.createFeatureLayer('notARealUrl', options);
            expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            expect(options.mode).toEqual(3);
            expect(InfoTemplate.calls.count()).toEqual(0);
        });

        it('should normalize infoTemplate option', function() {
            var options = {
                infoTemplate: ['title', 'content']
            };
            esriLayerUtils.createFeatureLayer('notARealUrl', options);
            expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            expect(InfoTemplate.calls.argsFor(0)).toEqual(['title', 'content']);
        });

    });

    describe('createDynamicMapServiceLayer', function() {
        var ArcGISDynamicMapServiceLayer;
        var InfoTemplate;
        var ImageParameters;

        beforeEach(function(){
            ArcGISDynamicMapServiceLayer = jasmine.createSpy();
            InfoTemplate = jasmine.createSpy();
            ImageParameters = jasmine.createSpy();
            // spyOn(ArcGISDynamicMapServiceLayer, 'setVisibleLayers');
            esriLoader.require = function() {
                return {
                    then: function(callback) {
                        callback([ArcGISDynamicMapServiceLayer, InfoTemplate, ImageParameters]);
                    }
                };
            };
        });

        it('should pass just url to layer constructor if no options', function() {
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl');
            expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', undefined]);
            expect(InfoTemplate.calls.count()).toEqual(0);
            expect(ImageParameters.calls.count()).toEqual(0);
        });

        it('should pass url and options to layer constructor', function() {
            var options = {
                id: 'test'
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', options);
            expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            expect(InfoTemplate.calls.count()).toEqual(0);
            expect(ImageParameters.calls.count()).toEqual(0);
        });

        it('should normalize imageParameters option', function() {
            var options = {
                imageParameters: {
                    format: 'jpeg'
                }
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', options);
            expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            expect(InfoTemplate.calls.count()).toEqual(0);
            expect(ImageParameters.calls.count()).toEqual(1);
        });

        it('should normalize infoTemplates option', function() {
            var options = {
                infoTemplates: {
                    1: {
                        infoTemplate: {
                            title: 'title1',
                            content: 'content1'
                        }
                    },
                    2: {
                        infoTemplate: ['title2', 'content2']
                    }
                }
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', options);
            expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            expect(InfoTemplate.calls.argsFor(0)).toEqual(['title1', 'content1']);
            expect(InfoTemplate.calls.argsFor(1)).toEqual(['title2', 'content2']);
            expect(ImageParameters.calls.count()).toEqual(0);
        });

        it('should set visibleLayers', function() {
            // this feels dirty
            ArcGISDynamicMapServiceLayer.prototype.setVisibleLayers = function(layers) {
                expect(layers).toEqual([1,2]);
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', null, '1,2');
            expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', null]);
            expect(InfoTemplate.calls.count()).toEqual(0);
            expect(ImageParameters.calls.count()).toEqual(0);
        });

    });

});
