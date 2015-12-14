(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriMapViewUtils
     *
     * @description
     * Functions to help create map view instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriMapViewUtils', function esriMapViewUtils(esriLoader) {
        var service = {};

        /**
         * @ngdoc function
         * @name createMapView
         * @methodOf esri.core.factory:esriMapViewUtils
         *
         * @description
         * Create a map view instance
         *
         * @param {Object} options map view options.
         *
         * @return {Promise} Returns a $q style promise which is
         * resolved with an object with a `view` property that refers to the map view
         */
        service.createMapView = function(options) {
            return esriLoader.require('esri/views/MapView').then(function(MapView) {
                return {
                    view: new MapView(options)
                };
            });
        };
        return service;
    });

})(angular);
