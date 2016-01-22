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
             * @name getMapView
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Load and get a reference to a MapView module
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the MapView
             */
            this.getMapView = function() {
                return esriLoader.require('esri/views/MapView').then(function(MapView) {
                    return {
                        view: MapView
                    };
                });
            };

            // load the view module, get a ref to the promise
            this.createViewPromise = this.getMapView().then(function(result) {
                return result;
            });

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Set a Map on the MapView. A new MapView will be constructed
             * if it does not already exist.
             *
             * @param {Object} map Map instance
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }

                if (!self.view) {
                    // construct a new MapView with the supplied map and options
                    self.options.map = map;
                    return this.createViewPromise.then(function(result) {
                        self.view = new result.view(self.options);

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }
                    });
                } else {
                    // MapView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        });
})(angular);
