(function (angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriDynamicMapServiceLayer
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This directive creates an
     * {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html ArcGISDynamicMapServiceLayer}
     * and adds it to the map.
     * This directive **must** be placed within an esri-map directive.
     *
     * ## Examples
     * - {@link ../#/examples/dynamic-map-service-layer Dynamic Map Service Layer}
     * - {@link ../#/examples/dynamic-map-service-layers Multiple Dynamic Map Service Layers}
     * - {@link ../#/examples/layer-events Layer Events}
     *
     * @param {String} url The url to the ArcGIS Server REST map service resource.
     * @param {Boolean=} visible The visibility of the layer. Two-way bound.
     * @param {Number=} opacity The opacity of the layer. Two-way bound.
     * @param {Array|String=} visible-layers The visible sublayer ids of the map service,
     *  either an array of integers or a string of comma-separated integers. Two-way bound.
     * @param {Function=} load Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#event-load load event}.
     * @param {Function=} update-end Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#event-update-end update-end event}.
     * @param {Object | Function=} layer-options An object or inline object hash string defining additional layer constructor options.
     */
    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function () {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriDynamicMapServiceLayer to be used as an element (<esri-dynamic-map-service-layer>)
            restrict: 'E',

            // require the esriDynamicMapServiceLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriDynamicMapServiceLayer', '^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // isolate scope for dynamic layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                visibleLayers: '@?',
                // function binding for event handlers
                load: '&',
                updateEnd: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            controllerAs: 'layerCtrl',

            bindToController: true,

            // define an interface for working with this directive
            controller: 'EsriDynamicMapServiceLayerController',

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // get the layer object
                layerController.getLayer().then(function(layer){

                    // get layer info from layer object and directive attributes
                    var layerInfo = layerController.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    mapController.addLayer(layer);
                    mapController.addLayerInfo(layerInfo);

                    // bind directive attributes to layer properties and events
                    layerController.bindLayerEvents(scope, attrs, layer, mapController);
                });
            }
        };
    });

})(angular);
