(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapViewController
     *
     * @description
     * Functions to help create map view instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.map')
        .controller('EsriMapViewController', function EsriMapViewController($element, esriLoader) {
            var self = this;

            // read options passed in as either a JSON string expression
            // or as a function bound object
            self.options = this.viewOptions() || {};
            // assign required and available properties
            self.options.container = $element.children()[0];

            /**
             * @ngdoc function
             * @name createMapView
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Create a map view instance
             *
             * @param {Object} options map view options
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the map view
             */
            this.createMapView = function(options) {
                return esriLoader.require('esri/views/MapView').then(function(MapView) {
                    return {
                        view: new MapView(options)
                    };
                });
            };
            
            // create the view, get a ref to the promise
            this.createViewPromise = this.createMapView(self.options).then(function(result) {
                if (typeof self.onCreate() === 'function') {
                    self.onCreate()(result.view);
                }
                return result;
            });

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Set a map on the map view
             *
             * @param {Object} map map instance
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the map view
             */
            this.setMap = function(map) {
                // preserve extent
                if (self.options.extent && map && !map.initialExtent) {
                    map.initialExtent = self.options.extent;
                }
                self.options.map = map;
                return this.createViewPromise.then(function(result) {
                    result.view.set(self.options);
                });
            };
        });
})(angular);
