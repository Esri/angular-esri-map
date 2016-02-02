(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriSceneViewController
     *
     * @description
     * Functions to help create SceneView instances.
     *
     * @requires esri.core.factory:esriLoader
     * @requires $element
     * @requires $scope
     */
    angular.module('esri.map')
        .controller('EsriSceneViewController', function EsriSceneViewController($element, $scope, esriLoader) {
            var self = this;

            // read options passed in as either a JSON string expression
            // or as a function bound object
            self.options = this.viewOptions() || {};
            // assign required and available properties
            self.options.container = $element.children()[0];

            /**
             * @ngdoc function
             * @name getSceneView
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Load and get a reference to a SceneView module
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the SceneView
             */
            this.getSceneView = function() {
                return esriLoader.require('esri/views/SceneView').then(function(SceneView) {
                    return {
                        view: SceneView
                    };
                });
            };

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Set a Map or WebScene on the SceneView. A new SceneView will be constructed
             * if it does not already exist, and also execute optional `on-load` and `on-create` events.
             *
             * @param {Object} map Map instance or WebScene instance
             *
             * @return {Promise} Returns a $q style promise and then
             * sets the map property and other options on the SceneView.
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }

                if (!self.view) {
                    // construct a new SceneView with the supplied map and options
                    self.options.map = map;
                    return this.getSceneView().then(function(result) {
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
                    // SceneView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        });
})(angular);
