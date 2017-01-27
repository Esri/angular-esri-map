(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapViewController
     *
     * @description
     * Functions to help create
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html MapView}
     * instances. This contoller is used by the {@link esri.map.directive:esriMapView esriMapView} directive.
     *
     * @requires esri.core.factory:esriLoader
     * @requires esri.core.factory:esriRegistry
     * @requires $element
     * @requires $scope
     * @requires $q
     */
    angular.module('esri.map')
        .controller('EsriMapViewController', function EsriMapViewController($element, $scope, $q, esriLoader, esriRegistry) {
            var self = this;

            // Put initialization logic inside `$onInit()`
            // to make sure bindings have been initialized.
            this.$onInit = function() {
                // read options passed in as either a JSON string expression
                // or as a function bound object
                self.options = this.viewOptions() || {};
                // assign required and available properties
                self.options.container = $element.children()[0];
            };

            // Prior to v1.5, we need to call `$onInit()` manually.
            // (Bindings will always be pre-assigned in these versions.)
            if (angular.version.major === 1 && angular.version.minor < 5) {
                this.$onInit();
            }

            /**
             * @ngdoc function
             * @name getMapView
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Load and get a reference to a MapView module.
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the MapView module.
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
             * Set a Map on the MapView.
             * A new MapView will be constructed if it does not already exist,
             * and also execute the optional `on-load` and `on-create` events.
             * If a new MapView is rejected, the optional `on-error` event will be executed.
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

                        // set up a deferred for dealing with the (optional) esriRegistry
                        var viewRegistryDeferred = $q.defer();
                        if (typeof self.registerAs === 'string') {
                            self.deregister = esriRegistry._register(self.registerAs, viewRegistryDeferred.promise);
                            $scope.$on('$destroy', function() {
                                if (self.deregister) {
                                    self.deregister();
                                }
                            });
                        }

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }

                        self.view.then(function() {
                            if (typeof self.onLoad() === 'function') {
                                $scope.$apply(function() {
                                    self.onLoad()(self.view);
                                });
                            }
                            // handle the deferred that is intended for use with the esriRegistry
                            viewRegistryDeferred.resolve({
                                view: self.view
                            });
                        }, function(err) {
                            if (typeof self.onError() === 'function') {
                                self.onError()(err);
                            }
                            // handle the deferred that is intended for use with the esriRegistry
                            viewRegistryDeferred.reject(err);
                        });
                    });
                } else {
                    // MapView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        });
})(angular);
