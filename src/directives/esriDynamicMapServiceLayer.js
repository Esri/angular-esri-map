(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function (esriLayerUtils) {
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

                // get dynamic service layer options from layer controller properties
                var layerOptions = esriLayerUtils.getLayerOptions(this);

                // create the layer and return resolve the defered
                layerDeferred = esriLayerUtils.createDynamicMapServiceLayer(this.url, layerOptions, this.visibleLayers);

                // return the defered that will be resolved with the dynamic layer
                this.getLayer = function () {
                    return layerDeferred.promise;
                };

                // set the info template for a layer
                this.setInfoTemplate = function(layerId, infoTemplate) {
                    return this.getLayer().then(function(layer) {
                        return esriLayerUtils.createInfoTemplate(infoTemplate).then(function(infoTemplateObject) {
                            // check if layer has info templates defined
                            var infoTemplates = layer.infoTemplates;
                            if (!angular.isObject(infoTemplates)) {
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
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // get the layer object
                layerController.getLayer().then(function(layer){

                    // get layer info from layer object and directive attributes
                    var layerInfo = esriLayerUtils.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    mapController.addLayer(layer);
                    mapController.addLayerInfo(layerInfo);

                    // bind directive attributes to layer properties and events
                    esriLayerUtils.bindLayerEvents(scope, attrs, layer, mapController);
                });
            }
        };
    });

})(angular);
