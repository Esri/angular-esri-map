(function (angular) {
  'use strict';

  angular.module('esri.core').factory('esriMapUtils', function ($q, esriLoader) {

    // construct Extent if object is not already an instance
    // e.g. if the controller or HTML view are only providing JSON
    function objectToExtent(extent, Extent) {
        if (extent.declaredClass === 'esri.geometry.Extent') {
            return extent;
        } else {
            return new Extent(extent);
        }
    }

    // stateless utility service
    var service = {};

    // add a custom basemap definition to be used by maps
    service.addCustomBasemap = function(name, basemapDefinition) {
        return esriLoader.require('esri/basemaps').then(function(esriBasemaps) {
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
            return esriBasemaps;
        });
    };

    // create a new map at an element w/ the given id
    service.createMap = function(elementId, mapOptions) {
        return esriLoader.require(['esri/map', 'esri/geometry/Extent']).then(function(esriModules) {
            var Map = esriModules[0];
            var Extent = esriModules[1];

            // construct optional Extent for mapOptions
            if (mapOptions.hasOwnProperty('extent')) {
                mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
            }

            // create a new map object and
            // resolve the promise with the map
            return new Map(elementId, mapOptions);
        });
    };

    // TODO: would be better if we didn't have to pass mapController
    // create a new map from a web map at an element w/ the given id
    service.createWebMap = function(webmapId, elementId, mapOptions, mapController) {
        // this deferred will be resolved with the map
        // NOTE: wrapping in $q deferred to avoid injecting
        // dojo/Deferred into promise chain by returning argisUtils.createMap()
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

        // return the map deferred's promise
        return mapDeferred.promise;
    };

    return service;
  });

})(angular);
