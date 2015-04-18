(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function ($q) {
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

            // define an interface for working with this directive
            controller: function ($scope, $element, $attrs) {
                var self = this;
                self.InfoTemplates = [];
                var layerDeferred = $q.defer();

                require([
                    'esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate'], function (ArcGISDynamicMapServiceLayer, InfoTemplate) {
                        var layer = new ArcGISDynamicMapServiceLayer($attrs.url);
                        layer.setOpacity($attrs.opacity);
                        layer.visible = ($attrs.visible.toString().toLowerCase() === 'true');
                        layer.setVisibleLayers(($attrs.visibleLayers) ? $attrs.visibleLayers.split(',') : [-1]);

                        if ($attrs.imageFormat) {
                            layer.setImageFormat($attrs.imageFormat);
                        }

                        var generatedInfoTemplates = {};
                        angular.forEach(self.InfoTemplates, function (value, key) {
                            var layerIDs = value.layerIDs.split(',');
                            angular.forEach(layerIDs, function (layerID, lKey) {
                                var _infoTemplate = new InfoTemplate({ title: value.title, content: value.content });
                                generatedInfoTemplates[layerID] = { infoTemplate: _infoTemplate };
                            });
                        });

                        layer.setInfoTemplates(generatedInfoTemplates);

                        layerDeferred.resolve(layer);
                    });

                // return the defered that will be resolved with the feature layer
                this.getLayer = function () {
                    return layerDeferred.promise;
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                layerController.getLayer().then(function (layer) {
                    // add layer
                    mapController.addLayer(layer);

                    //look for layerInfo related attributes. Add them to the map's layerInfos array for access in other components
                    mapController.addLayerInfo({
                        title: attrs.title || layer.name,
                        layer: layer,
                        hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',') : undefined,
                        defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
                    });

                    // return the layer
                    return layer;
                });
            }
        };
    });

})(angular);
