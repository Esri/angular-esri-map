(function(angular) {

    /**
     * @ngdoc controller
     * @name esri.directives.controller:EsriSceneViewController
     *
     * @description
     * Functions to help create scene view instances.
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
             * Create a scene view instance
             *
             * @param {Object} options scene view options
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the scene view
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
             * Set a map on the scene view
             *
             * @param {Object} map map instance
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the scene view
             */
            this.setMap = function(map) {
                self.options.map = map;
                return this.createViewPromise.then(function(result) {
                    result.view.set(self.options);
                });
            };
        });
})(angular);
