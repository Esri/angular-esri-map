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
         * @name getVectorTileLayerOptions
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @description
         * Formats and prepares vector layer options from layer controller properties.
         * In addition to {@link esri.map.controller:EsriLayerControllerBase#methods_getlayeroptions EsriLayerControllerBase.getLayerOptions()},
         * it also sets the definitionExpression on the returned options object.
         *
         * @returns {Object} A layer options object for layer construction.
         */
        this.getVectorTileLayerOptions = function() {
            var layerOptions = this.getLayerOptions();
            // definitionExpression takes precedence over layerOptions.definitionExpression
            if (this.definitionExpression) {
                layerOptions.definitionExpression = this.definitionExpression;
            }

            return layerOptions;
        };

        /**
         * @ngdoc function
         * @name getVectorTileLayerOptions
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
         * @name setInfoTemplate
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @description
         * Sets the InfoTemplate once the layer has been loaded.
         *
         * @param {Object|Array} infoTemplate Either an array with `['title', 'content']` or an object with `{title: 'title', content: 'content'}`
         */
        this.setInfoTemplate = function(infoTemplate) {
            return this.getLayer().then(function(layer) {
                return esriLayerUtils.createInfoTemplate(infoTemplate).then(function(infoTemplateObject) {
                    layer.setInfoTemplate(infoTemplateObject);
                    return infoTemplateObject;
                });
            });
        };

        /**
         * @ngdoc function
         * @name bindLayerEvents
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @description
         * Binds esri-vector-tile-layer directive attributes to layer properties and events,
         * such as the visibility and definitionExpression.
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

            // additional directive attribute binding specific to this type of layer

            // watch the scope's definitionExpression property for changes
            // set the definitionExpression of the vector tile layer
            scope.$watch('layerCtrl.definitionExpression', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setDefinitionExpression(newVal);
                }
            });
        };

        // create the layer
        layerPromise = esriLayerUtils.createVectorTileLayer(this.url, this.getVectorTileLayerOptions());
    });

})(angular);
