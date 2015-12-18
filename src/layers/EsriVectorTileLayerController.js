(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriVectorTileLayerController
     *
     * @requires $controller
     * @requires esri.core.factory:esriLayerUtils
     * @requires esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the esri-vector-tile-layer directive to construct the layer,
     * provide it with several supporting methods,
     * and help bind layer events and other properties such as layer visibility.
     */
    angular.module('esri.map').controller('EsriVectorTileLayerController', function EsriVectorTileLayerController($controller, esriLayerUtils) {

        var layerPromise;

        // extends layer controller base class
        angular.extend(this, $controller('EsriLayerControllerBase'));

        /**
         * @ngdoc function
         * @name getLayer
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @returns {Promise} Returns a $q style promise resolved with an instance of
         *  {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html#vectortilelayer1 VectorTileLayer}
         */
        this.getLayer = function() {
            return layerPromise;
        };

        /**
         * @ngdoc function
         * @name bindLayerEvents
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @description
         * Binds esri-vector-tile-layer directive attributes to layer properties and events,
         * such as the visibility and opacity.
         *
         * @param {Object} scope Isolate scope for layer directive controller
         * @param {Object} attrs Attribute properties
         * @param {VectorTileLayer} layer The layer to bind properties and events to.
         * @param {EsriMapController} mapController The map controller is also required to help remove the layer
         *  from the map when the layer scope is destroyed.
         */
        this.bindLayerEvents = function(scope, attrs, layer, mapController) {
            // bind directive attributes to layer properties and events
            this._bindLayerEvents(scope, attrs, layer, mapController);
        };

        // create the layer
        layerPromise = esriLayerUtils.createVectorTileLayer(this.url, this.getLayerOptions());
    });

})(angular);
