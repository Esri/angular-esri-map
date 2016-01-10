(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.directives.controller:EsriSceneViewController
     *
     * @description
     * Functions to help create SceneView instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.directives')
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
             * @methodOf esri.directives.controller:EsriSceneViewController
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

            // create the view, get a ref to the promise
            this.createViewPromise = this.createSceneView(self.options).then(function(result) {
                if (typeof self.onCreate() === 'function') {
                    self.onCreate()(result.view);
                }
                return result;
            });

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.directives.controller:EsriSceneViewController
             *
             * @description
             * Set a map on the SceneView
             *
             * @param {Object} map Map instance
             *
             * @return {Promise} Returns a $q style promise and then
             * sets the map property and other options on the SceneView.
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }
                self.options.map = map;
                return this.createViewPromise.then(function(result) {
                    result.view.set(self.options);
                });
            };
        });
})(angular);
