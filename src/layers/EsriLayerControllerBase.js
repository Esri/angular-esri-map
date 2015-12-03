(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the controllers of the esri-feature-layer, esri-dynamic-map-service-layer
     * and esri-vector-tile-layer directives to provide several shared supporting methods.
     */
    angular.module('esri.map').controller('EsriLayerControllerBase', function EsriLayerControllerBase() {

        // test if a string value (i.e. directive attribute value) is true
        function isTrue(val) {
            return val === true || val === 'true';
        }

        /**
         * @ngdoc function
         * @name getLayerOptions
         * @methodOf esri.map.controller:EsriLayerControllerBase
         *
         * @description
         * Formats and prepares common layer options from layer controller properties.
         *
         * @returns {Object} A layer options object for layer construction.
         */
        this.getLayerOptions = function () {

            // read options passed in as either a JSON string expression
            // or as a function bound object
            var layerOptions = this.layerOptions() || {};

            // visible takes precedence over layerOptions.visible
            if (typeof this.visible !== 'undefined') {
                layerOptions.visible = isTrue(this.visible);
            }

            // opacity takes precedence over layerOptions.opacity
            if (this.opacity) {
                layerOptions.opacity = Number(this.opacity);
            }

            return layerOptions;
        };

        /**
         * @ngdoc function
         * @name getLayerInfo
         * @methodOf esri.map.controller:EsriLayerControllerBase
         *
         * @description
         * Gets layer info from layer and directive attributes.
         *
         * @param {FeatureLayer | ArcGISDynamicMapServiceLayer} layer Layer to get layerInfo for.
         * @param {Object} attrs Bound attribute properties such as `title`, `hideLayers`, or `defaultSymbol`.
         *
         * @returns {Object} A layerInfo object, which is needed for the esri-legend directive.
         *  See {@link https://developers.arcgis.com/javascript/jsapi/legend-amd.html#legend1 layerInfo} for object specification.
         */
        this.getLayerInfo = function(layer, attrs) {
            return {
                title: attrs.title || layer.name,
                layer: layer,
                hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',').map(Number) : undefined,
                defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
            };
        };

        // get common layer options from layer controller properties
        this._bindLayerEvents = function(scope, attrs, layer, mapController) {

            // call load handler (if any)
            if (attrs.load) {
                if (layer.loaded) {
                    // layer is already loaded
                    // make layer object available to caller immediately
                    scope.layerCtrl.load()(layer);
                } else {
                    // layer is not yet loaded
                    // wait for load event, and then make layer object available
                    layer.on('load', function() {
                        scope.$apply(function() {
                            scope.layerCtrl.load()(layer);
                        });
                    });
                }
            }

            // call updateEnd handler (if any)
            if (attrs.updateEnd) {
                layer.on('update-end', function(e) {
                    scope.$apply(function() {
                        scope.layerCtrl.updateEnd()(e);
                    });
                });
            }

            // watch the scope's visible property for changes
            // set the visibility of the feature layer
            scope.$watch('layerCtrl.visible', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setVisibility(isTrue(newVal));
                }
            });

            // watch the scope's opacity property for changes
            // set the opacity of the feature layer
            scope.$watch('layerCtrl.opacity', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setOpacity(Number(newVal));
                }
            });

            // remove the layer from the map when the layer scope is destroyed
            scope.$on('$destroy', function() {
                mapController.removeLayer(layer);
            });
        };
    });

})(angular);
