(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriSceneViewUtils
     *
     * @description
     * Functions to help create map view instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriSceneViewUtils', function esriSceneViewUtils(esriLoader) {
        var service = {};

        /**
         * @ngdoc function
         * @name createSceneView
         * @methodOf esri.core.factory:esriSceneViewUtils
         *
         * @description
         * Create a map view instance
         *
         * @param {Object} options map view options.
         *
         * @return {Promise} Returns a $q style promise which is
         * resolved with an object with a `view` property that refers to the map view
         */
        service.createSceneView = function(options) {
            return esriLoader.require('esri/views/SceneView').then(function(SceneView) {
                return {
                    view: new SceneView(options)
                };
            });
        };
        return service;
    });

})(angular);
