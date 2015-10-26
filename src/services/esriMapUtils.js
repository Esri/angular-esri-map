(function (angular) {
  'use strict';

  // TODO: use the esriLoader promise syntax instead of callback/deferred and remove $q?
  angular.module('esri.map').factory('esriMapUtils', function ($q, $timeout, esriLoader) {

    // construct Extent if object is not already an instance
    // e.g. if the controller or HTML view are only providing JSON
    function objectToExtent(extent, Extent) {
        if (extent.declaredClass === 'esri.geometry.Extent') {
            return extent;
        } else {
            return new Extent(extent);
        }
    }

    // update two-way bound scope properties based on map state
    function updateCenterAndZoom(scope, map) {
        var geoCenter = map.geographicExtent && map.geographicExtent.getCenter();
        if (geoCenter) {
            geoCenter = geoCenter.normalize();
            scope.center = {
                lat: geoCenter.y,
                lng: geoCenter.x
            };
        }
        scope.zoom = map.getZoom();
    }

    // stateless utility service
    var service = {};

    // add a custom basemap definition to be used by maps
    service.addCustomBasemap = function(name, basemapDefinition) {
        var deferred = $q.defer();
        esriLoader.require(['esri/basemaps'], function(esriBasemaps) {
            var baseMapLayers = basemapDefinition.baseMapLayers;
            if (!angular.isArray(baseMapLayers) && angular.isArray(basemapDefinition.urls)) {
                baseMapLayers = basemapDefinition.urls.map(function (url) {
                    return {
                        url: url
                    };
                });
            }
            if (angular.isArray(baseMapLayers)) {
                esriBasemaps[name] = {
                    baseMapLayers: baseMapLayers,
                    thumbnailUrl: basemapDefinition.thumbnailUrl,
                    title: basemapDefinition.title
                };
            }
            deferred.resolve(esriBasemaps);
        });
        return deferred.promise;
    };

    // get map options from controller properties
    service.getMapOptions = function(mapController) {

        // read options passed in as either a JSON string expression
        // or as a function bound object
        var mapOptions = mapController.mapOptions() || {};

        // check for 1 way bound properties (basemap)
        // basemap takes precedence over mapOptions.basemap
        if (mapController.basemap) {
            mapOptions.basemap = mapController.basemap;
        }

        // check for 2 way bound properties (center and zoom)
        // center takes precedence over mapOptions.center
        if (mapController.center) {
            if (mapController.center.lng && mapController.center.lat) {
                mapOptions.center = [mapController.center.lng, mapController.center.lat];
            } else {
                mapOptions.center = mapController.center;
            }
        }

        // zoom takes precedence over mapOptions.zoom
        if (mapController.zoom) {
            mapOptions.zoom = mapController.zoom;
        }

        return mapOptions;
    };

    // create a new map at an element w/ the given id
    service.createMap = function(elementId, mapOptions) {
        // this deferred will be resolved with the map
        var mapDeferred = $q.defer();

        esriLoader.require(['esri/map', 'esri/geometry/Extent'], function(Map, Extent) {

            // construct optional Extent for mapOptions
            if (mapOptions.hasOwnProperty('extent')) {
                mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
            }

            // create a new map object and
            // resolve the promise with the map
            mapDeferred.resolve(new Map(elementId, mapOptions));
        });

        return mapDeferred;
    };

    // TODO: would be better if we didn't have to pass mapController
    // create a new map from a web map at an element w/ the given id
    service.createWebMap = function(webmapId, elementId, mapOptions, mapController) {
        // this deferred will be resolved with the map
        var mapDeferred = $q.defer();

        esriLoader.require(['esri/arcgis/utils', 'esri/geometry/Extent'], function(arcgisUtils, Extent) {

            // construct optional Extent for mapOptions
            if (mapOptions.hasOwnProperty('extent')) {
                mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
            }

            // load map object from web map
            arcgisUtils.createMap(webmapId, elementId, {
                mapOptions: mapOptions
            }).then(function(response) {
                // get layer infos for legend
                mapController.layerInfos = arcgisUtils.getLegendLayers(response);
                // get item info (map title, etc)
                mapController.itemInfo = response.itemInfo;
                // resolve the promise with the map and additional info
                mapDeferred.resolve(response.map);
            });
        });

        return mapDeferred;
    };

    // update scope in response to map events and
    // update map in response to changes in scope properties
    service.bindMapEvents = function(scope, attrs, mapController, map) {

        if (map.loaded) {
            // map already loaded, we need to
            // update two-way bound scope properties
            // updateCenterAndZoom(scope, map);
            updateCenterAndZoom(mapController, map);
            // make map object available to caller
            // by calling the load event handler
            if (attrs.load) {
                mapController.load()(map);
            }
        } else {
            // map is not yet loaded, this means that
            // two-way bound scope properties
            // will be updated by extent-change handler below
            // so don't need to update them here
            // just set up a handler for the map load event (if any)
            if (attrs.load) {
                map.on('load', function() {
                    scope.$apply(function() {
                        mapController.load()(map);
                    });
                });
            }
        }

        // listen for changes to map extent and
        // call extent-change handler (if any)
        // also update scope.center and scope.zoom
        map.on('extent-change', function(e) {
            if (attrs.extentChange) {
                mapController.extentChange()(e);
            }
            // prevent circular updates between $watch and $apply
            if (mapController.inUpdateCycle) {
                return;
            }
            mapController.inUpdateCycle = true;
            scope.$apply(function() {
                // update scope properties
                updateCenterAndZoom(mapController, map);
                $timeout(function() {
                    // this will be executed after the $digest cycle
                    mapController.inUpdateCycle = false;
                }, 0);
            });
        });

        // listen for changes to scope.basemap and update map
        scope.$watch('mapCtrl.basemap', function(newBasemap, oldBasemap) {
            if (map.loaded && newBasemap !== oldBasemap) {
                map.setBasemap(newBasemap);
            }
        });

        // listen for changes to scope.center and scope.zoom and update map
        mapController.inUpdateCycle = false;
        if (!angular.isUndefined(attrs.center) || !angular.isUndefined(attrs.zoom)) {
            scope.$watchGroup(['mapCtrl.center.lng', 'mapCtrl.center.lat', 'mapCtrl.zoom'], function(newCenterZoom/*, oldCenterZoom*/) {
                if (mapController.inUpdateCycle) {
                    return;
                }
                if (newCenterZoom[0] !== '' && newCenterZoom[1] !== '' && newCenterZoom[2] !== '') {
                    // prevent circular updates between $watch and $apply
                    mapController.inUpdateCycle = true;
                    map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]).then(function() {
                        mapController.inUpdateCycle = false;
                    });
                }
            });
        }

        // clean up
        scope.$on('$destroy', function() {
            if (mapController.deregister) {
                mapController.deregister();
            }
            map.destroy();
        });
    };

    return service;
  });

})(angular);
