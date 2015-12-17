(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriVectorTileLayer
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This directive creates a {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html VectorTileLayer}
     * and adds it to the map.
     * This directive **must** be placed within an esri-map directive.
     *
     * ## Examples
     * - {@link ../#/examples/vector-tile-layer Vector Tile Layer}
     *
     * @param {String} url The url to the ArcGIS Server REST layer resource.
     * @param {Boolean=} visible The visibility of the layer. Two-way bound.
     * @param {Number=} opacity The opacity of the layer. Two-way bound.
     * @param {Function=} load Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html#event-load load event}.
     * @param {Object | String=} layer-options An object or inline object hash string defining additional layer constructor options.
     */
    angular.module('esri.map').directive('esriVectorTileLayer', function() {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriVectorTileLayer to be used as an element (<esri-vector-tile-layer>)
            restrict: 'E',

            // require the esriVectorTileLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriVectorTileLayer', '^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // isolate scope for vector tile layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                // function binding for event handlers
                load: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            controllerAs: 'layerCtrl',

            bindToController: true,

            // define an interface for working with this directive
            controller: 'EsriVectorTileLayerController',

            // now we can link our directive to the scope, but we can also add it to the map
            link: function(scope, element, attrs, controllers) {
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
