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
     */
    angular.module('esri.map')
        .controller('EsriSceneViewController', function EsriSceneViewController($element, esriLoader) {
            var self = this;

            // read options passed in as either a JSON string expression
            // or as a function bound object
            self.options = this.viewOptions() || {};
            // assign required and available properties
            self.options.container = $element.children()[0];

            /**
             * @ngdoc function
             * @name createSceneView
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Create a SceneView instance
             *
             * @param {Object} options SceneView options
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the SceneView
             */
            this.createSceneView = function(options) {
                return esriLoader.require('esri/views/SceneView').then(function(SceneView) {
                    return {
                        view: new SceneView(options)
                    };
                });
            };

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Set a map on the SceneView. A new SceneView will be constructed
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
                    this.createSceneView(self.options).then(function(result) {
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
