(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriMapUtils
     *
     * @description
     * Functions to help create map instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriMapUtils', function($q, esriLoader) {

        // check if a variable is an array
        function isArray(v) {
            return v instanceof Array;
        }

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

        /**
         * @ngdoc function
         * @name addCustomBasemap
         * @description Add a custom basemap definition to {@link https://developers.arcgis.com/javascript/jsapi/esri.basemaps-amd.html esriBasemaps}
         * @methodOf esri.core.factory:esriMapUtils
         * @param {String} name Name to be used when setting the basemap
         * @param {Object} basemapDefinition Basemap layer urls and other options (either basemapDefinition.baseMapLayers or basemapDefinition.urls is required)
         * @param {Array=} basemapDefinition.baseMapLayers Array of basemap layer objects
         * @param {Array=} basemapDefinition.urls Array of basemap layer urls
         * @param {String=} basemapDefinition.thumbnailUrl Basemap thumbnail URL
         * @param {String=} basemapDefinition.title Basemap Title
         * @returns {Promise} Returns a $q style promise resolved with esriBasemaps
         */
        service.addCustomBasemap = function(name, basemapDefinition) {
            return esriLoader.require('esri/basemaps').then(function(esriBasemaps) {
                var baseMapLayers = basemapDefinition.baseMapLayers;
                if (!isArray(baseMapLayers) && isArray(basemapDefinition.urls)) {
                    baseMapLayers = basemapDefinition.urls.map(function(url) {
                        return {
                            url: url
                        };
                    });
                }
                if (isArray(baseMapLayers)) {
                    esriBasemaps[name] = {
                        baseMapLayers: baseMapLayers,
                        thumbnailUrl: basemapDefinition.thumbnailUrl,
                        title: basemapDefinition.title
                    };
                }
                return esriBasemaps;
            });
        };

        /**
         * @ngdoc function
         * @name createMap
         * @description Create a new {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html Map} instance at an element w/ the given id
         * @methodOf esri.core.factory:esriMapUtils
         * @param {String} elementId Id of the element for the map
         * @param {Object} options {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1 Optional parameters}
         * @returns {Promise} Returns a $q style promise resolved with the Map instance
         */
        service.createMap = function(elementId, mapOptions) {
            return esriLoader.require(['esri/map', 'esri/geometry/Extent']).then(function(esriModules) {
                var Map = esriModules[0];
                var Extent = esriModules[1];

                // construct optional Extent for mapOptions
                if (mapOptions && mapOptions.hasOwnProperty('extent')) {
                    mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
                }

                // create a new map object and
                // resolve the promise with the map
                return new Map(elementId, mapOptions);
            });
        };

        /**
         * @ngdoc function
         * @name createWebMap
         * @description Create a new {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html Map} instance from a web map at an element w/ the given id
         * @methodOf esri.core.factory:esriMapUtils
         * @param {String} webmapId Item id of the web map
         * @param {String} elementId Id of the element for the map
         * @param {Object} options {@link https://developers.arcgis.com/javascript/jsapi/esri.arcgis.utils-amd.html#createmap Optional parameters}
         * @returns {Promise} Returns a $q style promise resolved with the Map instance
         */
        // TODO: would be better if we didn't have to pass mapController
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
