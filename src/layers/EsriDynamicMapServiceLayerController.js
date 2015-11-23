(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriDynamicMapServiceLayerController
     *
     * @requires $controller
     * @requires esri.core.factory:esriLayerUtils
     * @requires esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the esri-dynamic-map-service-layer directive to construct the layer,
     * provide it with several supporting methods,
     * and help bind layer events and other properties such as layer visibility.
     */
    angular.module('esri.map').controller('EsriDynamicMapServiceLayerController', function EsriDynamicMapServiceLayerController($controller, esriLayerUtils) {

        var layerPromise;

        // extends layer controller base class
        angular.extend(this, $controller('EsriLayerControllerBase'));

        /**
         * @ngdoc function
         * @name getLayer
         * @methodOf esri.map.controller:EsriDynamicMapServiceLayerController
         *
         * @returns {Promise} Returns a $q style promise resolved with an instance of
         *  {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1 ArcGISDynamicMapServiceLayer}
         */
        this.getLayer = function () {
            return layerPromise;
        };

        /**
         * @ngdoc function
         * @name setInfoTemplate
         * @methodOf esri.map.controller:EsriDynamicMapServiceLayerController
         *
         * @description
         * Sets the InfoTemplate once the layer has been loaded.
         *
         * @param {String} layerId The sublayer id to which the InfoTemplate should be connected to.
         * @param {Object|Array} infoTemplate Either an array with `['title', 'content']` or an object with `{title: 'title', content: 'content'}`
         */
        this.setInfoTemplate = function(layerId, infoTemplate) {
            return this.getLayer().then(function(layer) {
                return esriLayerUtils.createInfoTemplate(infoTemplate).then(function(infoTemplateObject) {
                    // check if layer has info templates defined
                    var infoTemplates = layer.infoTemplates;
                    if (!infoTemplates) {
                        // create a new info templates hash
                        infoTemplates = {};
                    }
                    // set the info template for sublayer
                    // NOTE: ignoring layerUrl and resourceInfo for now
                    // https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1
                    infoTemplates[layerId] = {
                        infoTemplate: infoTemplateObject
                    };
                    layer.setInfoTemplates(infoTemplates);
                    return infoTemplates;
                });
            });
        };

        /**
         * @ngdoc function
         * @name bindLayerEvents
         * @methodOf esri.map.controller:EsriDynamicMapServiceLayerController
         *
         * @description
         * Binds esri-dynamic-map-service-layer directive attributes to layer properties and events,
         * such as the visibility and opacity.
         *
         * @param {Object} scope Isolate scope for layer directive controller
         * @param {Object} attrs Attribute properties
         * @param {ArcGISDynamicMapServiceLayer} layer The layer to bind properties and events to.
         * @param {EsriMapController} mapController The map controller is also required to help remove the layer
         *  from the map when the layer scope is destroyed.
         */
        this.bindLayerEvents = function(scope, attrs, layer, mapController) {
            // bind directive attributes to layer properties and events
            this._bindLayerEvents(scope, attrs, layer, mapController);
        };

        // create the layer
        layerPromise = esriLayerUtils.createDynamicMapServiceLayer(this.url, this.getLayerOptions(), this.visibleLayers);
    });

})(angular);
