describe('esriMapUtils', function() {

    // service we're testing
    var esriMapUtils;

    // angular mocks
    var $rootScope;
    var $q;
    var deferred;

    // load the core module
    beforeEach(module('esri.core'));

    // inject modules and mocks and
    // fake esriLoader.require to return a mock deferred
    beforeEach(inject(function(_$rootScope_, _$q_, _esriLoader_, _esriMapUtils_) {
        var esriLoader = _esriLoader_;
        esriMapUtils = _esriMapUtils_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        deferred = _$q_.defer();
        spyOn(esriLoader, 'require').and.returnValue(deferred.promise);
    }));

    describe('addCustomBasemap', function() {

        beforeEach(function(){
            var esriBasemaps = {
                'streets': {
                    'title': 'Streets',
                    'thumbnailUrl': 'http://js.arcgis.com/3.14compact/esri/images/basemap/streets.jpg',
                    'itemId': 'd8855ee4d3d74413babfb0f41203b168',
                    'baseMapLayers': [{
                        'url': 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
                    }]
                },
                'satellite': {
                    'title': 'Imagery',
                    'thumbnailUrl': 'http://js.arcgis.com/3.14compact/esri/images/basemap/satellite.jpg',
                    'itemId': '86de95d4e0244cba80f0fa2c9403a7b2',
                    'baseMapLayers': [{
                        'url': 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
                    }]
                }
            };
            deferred.resolve(esriBasemaps);
        });

        it('should add definition from an array of urls', function() {
            var definition = {
                urls: ['http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer'],
                title: 'DeLorme',
                thumbnailUrl: 'http://servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png'
            };
            esriMapUtils.addCustomBasemap('delorme', definition).then(function(esriBasemaps) {
                expect(esriBasemaps.delorme.baseMapLayers).toEqual([{
                    'url': 'http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer'
                }]);
                expect(esriBasemaps.delorme.title).toEqual(definition.title);
                expect(esriBasemaps.delorme.thumbnailUrl).toBe(definition.thumbnailUrl);
            });
            $rootScope.$digest();
        });

        it('should add definition from an array of objects', function() {
            var definition = {
                baseMapLayers: [{
                    url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer'
                }],
                title: 'DeLorme',
                thumbnailUrl: 'http://servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png'
            };
            esriMapUtils.addCustomBasemap('delorme', definition).then(function(esriBasemaps) {
                expect(esriBasemaps.delorme).toEqual(definition);
            });
            $rootScope.$digest();
        });

        it('should not add definition w/o urls or baseMapLayers', function() {
            var definition = {
                title: 'DeLorme',
                thumbnailUrl: 'http://servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png'
            };
            esriMapUtils.addCustomBasemap('delorme', definition).then(function(esriBasemaps) {
                expect(esriBasemaps.delorme).toBe(undefined);
            });
            $rootScope.$digest();
        });
    });

    describe('createMap', function() {
        var Map;
        var Extent;

        beforeEach(function(){
            Map = jasmine.createSpy();
            Extent = jasmine.createSpy();
            deferred.resolve([Map, Extent]);
        });

        it('should create a map with no options', function() {
            esriMapUtils.createMap('notARealNodeId').then(function(/*map*/) {
                expect(Map.calls.argsFor(0)).toEqual(['notARealNodeId', undefined]);
                expect(Extent.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should create a map with options', function() {
            var options = {
                center: [-111.879655861, 40.571338776],
                zoom: 13,
                sliderStyle: 'small'
            };
            esriMapUtils.createMap('notARealNodeId', options).then(function(/*map*/) {
                expect(Map.calls.argsFor(0)).toEqual(['notARealNodeId', options]);
                expect(Extent.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });

        it('should normalize extent option without already declared Extent', function() {
            var options = {
                extent: {
                    'xmin': -1556394,
                    'ymin': -2051901,
                    'xmax': 1224513,
                    'ymax': 2130408,
                    'spatialReference': {
                        'wkid': 102003
                    }
                }
            };
            esriMapUtils.createMap('notARealNodeId', options).then(function(/*map*/) {
                expect(Map.calls.argsFor(0)).toEqual(['notARealNodeId', options]);
                expect(Extent.calls.argsFor(0)).toEqual([{
                    'xmin': -1556394,
                    'ymin': -2051901,
                    'xmax': 1224513,
                    'ymax': 2130408,
                    'spatialReference': {
                        'wkid': 102003
                    }
                }]);
            });
            $rootScope.$digest();
        });
        
        it('should normalize extent option with already declared Extent', function() {
            var options = {
                extent: {
                    'xmin': -1556394,
                    'ymin': -2051901,
                    'xmax': 1224513,
                    'ymax': 2130408,
                    'spatialReference': {
                        'wkid': 102003
                    },
                    'declaredClass': 'esri.geometry.Extent'
                }
            };
            esriMapUtils.createMap('notARealNodeId', options).then(function(/*map*/) {
                expect(Map.calls.argsFor(0)).toEqual(['notARealNodeId', options]);
                expect(Extent.calls.count()).toEqual(0);
            });
            $rootScope.$digest();
        });
    });

    // TODO: tests for create web map not working
    xdescribe('createWebMap', function() {
        var arcgisUtils;
        var Extent;

        beforeEach(function(){
            arcgisUtils = {};
            arcgisUtils.createMap = function() {
                // return additional promise b/c we're chainging?
                var map = {};
                var mapDeferred = $q.defer();
                mapDeferred.resolve(map);
                return mapDeferred.promise;
            };
            spyOn(arcgisUtils, 'createMap');
            Extent = jasmine.createSpy();
            deferred.resolve([arcgisUtils, Extent]);
        });

        it('should create a web map with no options', function() {
            var mapController = {};
            esriMapUtils.createWebMap('notARealWebMapId', 'notARealNodeId', null, mapController).then(function() {
                expect(arcgisUtils.createMap).toHaveBeenCalledWith(['notARealWebMapId', 'notARealNodeId', undefined]);
                expect(Extent.calls.count()).toEqual(1);
            });
            $rootScope.$digest();
        });

    });

});
