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
     * @requires $element
     * @requires $scope
     */
    angular.module('esri.map')
        .controller('EsriMapViewController', function EsriMapViewController($element, $scope, esriLoader) {
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

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Set a Map on the MapView. A new MapView will be constructed
             * if it does not already exist, and also execute optional `on-load` and `on-create` events.
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
                    return this.getMapView().then(function(result) {
                        self.view = new result.view(self.options);

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }

                        self.view.then(function() {
                            if (typeof self.onLoad() === 'function') {
                                $scope.$apply(function() {
                                    self.onLoad()(self.view);
                                });
                            }
                        });
                    });
                } else {
                    // MapView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        });
})(angular);
