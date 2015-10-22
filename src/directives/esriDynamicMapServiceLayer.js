(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function (esriMapUtils) {
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
            controller: function () {
                var layerDeferred;

                // create layer from bound controller properties
                this.createLayer = function() {

                    // get dynamic service layer options from layer controller properties
                    var layerOptions = esriMapUtils.getDynamicMapServiceLayerOptions(this);

                    // create the layer and return resolve the defered
                    layerDeferred = esriMapUtils.createDynamicMapServiceLayer(this.url, layerOptions, this.visibleLayers);
                    return layerDeferred.promise;
                };

                // return the defered that will be resolved with the dynamic layer
                this.getLayer = function () {
                    // throw error if createLayer was not called
                    if (!layerDeferred.promise) {
                        throw Error('Layer has not yet been created. Call createLayer().');
                    }
                    return layerDeferred.promise;
                };

                // set the info template for a layer
                this.setInfoTemplate = function(layerId, infoTemplate) {
                    // initialize info templates hash if needed
                    if (!angular.isObject(this._infoTemplates)) {
                        this._infoTemplates = {};
                    }

                    // add the infotemplate for this layer to the hash
                    // NOTE: ignoring layerUrl and resourceInfo for now
                    // https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1
                    this._infoTemplates[layerId] = {
                        infoTemplate: infoTemplate
                    };
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // create the layer
                layerController.createLayer().then(function(layer){

                    // get layer info from layer and directive attributes
                    var layerInfo = esriMapUtils.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    esriMapUtils.addLayerToMap(mapController, layer, undefined, layerInfo);

                    // bind directive attributes to layer properties and events
                    esriMapUtils.bindLayerEvents(scope, attrs, layer, mapController);
                });
            }
        };
    });

})(angular);
