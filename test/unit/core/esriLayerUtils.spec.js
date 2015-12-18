describe('esriLayerUtils', function() {

    // service we're testing
    // var esriLoader;
    var esriLayerUtils;

    // angular mocks
    var $rootScope;
    var deferred;

    // load the core module
    beforeEach(module('esri.core'));

    // inject modules and mocks and
    // fake esriLoader.require to return a mock deferred
    beforeEach(inject(function(_$rootScope_, _$q_, _esriLoader_, _esriLayerUtils_) {
        var esriLoader = _esriLoader_;
        esriLayerUtils = _esriLayerUtils_;
        $rootScope = _$rootScope_;
        deferred = _$q_.defer();
        spyOn(esriLoader, 'require').and.returnValue(deferred.promise);
    }));

    describe('createInfoTemplate', function() {
        var InfoTemplate;

        beforeEach(function(){
            InfoTemplate = jasmine.createSpy();
            deferred.resolve(InfoTemplate);
        });

        it('should create a new InfoTemplate from an object', function() {
            esriLayerUtils.createInfoTemplate({
                title: 'title',
                content: 'content'
            }).then(function() {
                expect(InfoTemplate.calls.argsFor(0)).toEqual(['title', 'content']);
            });
            $rootScope.$digest();
        });

        it('should create a new InfoTemplate from an array', function() {
            esriLayerUtils.createInfoTemplate(['title', 'content']).then(function() {
                expect(InfoTemplate.calls.argsFor(0)).toEqual(['title', 'content']);
            });
            $rootScope.$digest();
        });

        it('should not create a new InfoTemplate from an InfoTemplate', function() {
            esriLayerUtils.createInfoTemplate({
                declaredClass: 'esri.InfoTemplate'
            }).then(function() {
                expect(InfoTemplate.calls.any()).toEqual(false);
            });
            $rootScope.$digest();
        });
    });

    describe('createFeatureLayer', function() {
        var FeatureLayer;
        var InfoTemplate;

        beforeEach(function(){
            FeatureLayer = jasmine.createSpy();
            FeatureLayer.MODE_SNAPSHOT = 3;
            InfoTemplate = jasmine.createSpy();
            deferred.resolve([FeatureLayer, InfoTemplate]);
        });

        it('should pass just url to layer constructor if no options', function() {
            esriLayerUtils.createFeatureLayer('notARealUrl').then(function() {
                expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', undefined]);
                expect(InfoTemplate.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should pass url and options to layer constructor', function() {
            var options = {
                id: 'test'
            };
            esriLayerUtils.createFeatureLayer('notARealUrl', options).then(function() {
                expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
                expect(InfoTemplate.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should normalize mode option', function() {
            var options = {
                mode: 'MODE_SNAPSHOT'
            };
            esriLayerUtils.createFeatureLayer('notARealUrl', options).then(function() {
                expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
                expect(options.mode).toEqual(3);
                expect(InfoTemplate.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should normalize infoTemplate option', function() {
            var options = {
                infoTemplate: ['title', 'content']
            };
            esriLayerUtils.createFeatureLayer('notARealUrl', options).then(function() {
                expect(FeatureLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
                expect(InfoTemplate.calls.argsFor(0)).toEqual(['title', 'content']);
            });
            $rootScope.$digest();
        });
    });

    describe('createVectorTileLayer', function() {
        var VectorTileLayer;

        beforeEach(function(){
            VectorTileLayer = jasmine.createSpy();
            deferred.resolve([VectorTileLayer]);
        });

        it('should pass just url to layer constructor if no options', function() {
            esriLayerUtils.createVectorTileLayer('notARealUrl').then(function() {
                expect(VectorTileLayer.calls.argsFor(0)).toEqual(['notARealUrl', undefined]);
            });
            $rootScope.$digest();
        });

        it('should pass url and options to layer constructor', function() {
            var options = {
                id: 'test'
            };
            esriLayerUtils.createVectorTileLayer('notARealUrl', options).then(function() {
                expect(VectorTileLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
            });
            $rootScope.$digest();
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
            deferred.resolve([ArcGISDynamicMapServiceLayer, InfoTemplate, ImageParameters]);
        });

        it('should pass just url to layer constructor if no options', function() {
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl').then(function() {
                expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', undefined]);
                expect(InfoTemplate.calls.count()).toEqual(0);
                expect(ImageParameters.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should pass url and options to layer constructor', function() {
            var options = {
                id: 'test'
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', options).then(function() {
                expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
                expect(InfoTemplate.calls.count()).toEqual(0);
                expect(ImageParameters.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should normalize imageParameters option', function() {
            var options = {
                imageParameters: {
                    format: 'jpeg'
                }
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', options).then(function() {
                expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
                expect(InfoTemplate.calls.count()).toEqual(0);
                expect(ImageParameters.calls.count()).toEqual(1);
            });
            $rootScope.$digest();
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
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', options).then(function() {
                expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', options]);
                expect(InfoTemplate.calls.argsFor(0)).toEqual(['title1', 'content1']);
                expect(InfoTemplate.calls.argsFor(1)).toEqual(['title2', 'content2']);
                expect(ImageParameters.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should set visibleLayers', function() {
            // this feels dirty
            ArcGISDynamicMapServiceLayer.prototype.setVisibleLayers = function(layers) {
                expect(layers).toEqual([1,2]);
            };
            esriLayerUtils.createDynamicMapServiceLayer('notARealUrl', null, '1,2').then(function() {
                expect(ArcGISDynamicMapServiceLayer.calls.argsFor(0)).toEqual(['notARealUrl', null]);
                expect(InfoTemplate.calls.count()).toEqual(0);
                expect(ImageParameters.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });
    });

});
