(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapViewController
     *
     * @description
     * Functions to help create MapView instances.
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

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Set a map on the MapView. A new MapView will be constructed
             * if it does not already exist.
             *
             * @param {Object} map Map instance
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }

                if (!self.view) {
                    self.options.map = map;
                    this.createMapView(self.options).then(function(result) {
                        self.view = result.view;
                        
                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(result.view);
                        }
                    });
                } else {
                    self.view.map = map;
                }
            };
        });
})(angular);
