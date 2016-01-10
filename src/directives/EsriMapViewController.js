(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.directives.controller:EsriMapViewController
     *
     * @description
     * Functions to help create MapView instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.directives')
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
             * @methodOf esri.directives.controller:EsriMapViewController
             *
             * @description
             * Create a MapView instance
             *
             * @param {Object} options MapView options
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the MapView
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
             * @methodOf esri.directives.controller:EsriMapViewController
             *
             * @description
             * Set a map on the MapView
             *
             * @param {Object} map Map instance
             *
             * @return {Promise} Returns a $q style promise and then
             * sets the map property and other options property on the MapView.
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }
                // preserve extent
                if (self.options.extent && !map.initialExtent) {
                    map.initialExtent = self.options.extent;
                }
                self.options.map = map;
                return this.createViewPromise.then(function(result) {
                    result.view.set(self.options);
                });
            };
        });
})(angular);
