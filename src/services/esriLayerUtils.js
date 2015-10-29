(function (angular) {
  'use strict';

  angular.module('esri.map').factory('esriLayerUtils', function (esriLoader) {

    // test if a string value (i.e. directive attribute value) is true
    function isTrue(val) {
        return val === true || val === 'true';
    }

    // parse array of visible layer ids from a string
    function parseVisibleLayers(val) {
        var visibleLayers;
        if (typeof val === 'string') {
            visibleLayers = [];
            val.split(',').forEach(function(layerId) {
                var n = parseInt(layerId);
                if(!isNaN(n)) {
                    visibleLayers.push(n);
                }
            });
        }
        return visibleLayers;
    }

    // layerOptions.infoTemplate expects one of the following:
    //  1. [title <String | Function>, content <String | Function>]
    //  2. {title: <String | Function>, content: <String | Function>}
    //  3. a valid Esri JSAPI InfoTemplate
    function objectToInfoTemplate(infoTemplate, InfoTemplate) {
        // only attempt to construct if a valid InfoTemplate wasn't already passed in
        if (infoTemplate.declaredClass === 'esri.InfoTemplate') {
            return infoTemplate;
        } else {
            // construct infoTemplate from object, using 2 args style:
            //  https://developers.arcgis.com/javascript/jsapi/infotemplate-amd.html#infotemplate2
            if (angular.isArray(infoTemplate) && infoTemplate.length === 2) {
                return new InfoTemplate(infoTemplate[0], infoTemplate[1]);
            } else {
                return new InfoTemplate(infoTemplate.title, infoTemplate.content);
            }
        }
    }

    // stateless utility service
    var service = {};

    // get common layer options from layer controller properties
    service.getLayerOptions = function (layerController) {

        // read options passed in as either a JSON string expression
        // or as a function bound object
        var layerOptions = layerController.layerOptions() || {};

        // visible takes precedence over layerOptions.visible
        if (angular.isDefined(layerController.visible)) {
            layerOptions.visible = isTrue(layerController.visible);
        }

        // opacity takes precedence over layerOptions.opacity
        if (layerController.opacity) {
            layerOptions.opacity = Number(layerController.opacity);
        }

        return layerOptions;
    };

    // create a feature layer
    service.createFeatureLayer = function(url, layerOptions) {
        return esriLoader.require(['esri/layers/FeatureLayer', 'esri/InfoTemplate']).then(function(esriModules) {
            var FeatureLayer = esriModules[0];
            var InfoTemplate = esriModules[1];

            // normalize info template defined in layerOptions.infoTemplate
            // or nested esriLayerOption directive to be instance of esri/InfoTemplate
            // and pass to layer constructor in layerOptions
            if (layerOptions.infoTemplate) {
                layerOptions.infoTemplate = objectToInfoTemplate(layerOptions.infoTemplate, InfoTemplate);
            }

            // layerOptions.mode expects a FeatureLayer constant name as a <String>
            // https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#constants
            if (layerOptions.hasOwnProperty('mode')) {
                // look up and convert to the appropriate <Number> value
                layerOptions.mode = FeatureLayer[layerOptions.mode];
            }

            return new FeatureLayer(url, layerOptions);
        });
    };

    // create a dynamic service layer
    service.createDynamicMapServiceLayer = function(url, layerOptions, visibleLayers) {
        return esriLoader.require(['esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate', 'esri/layers/ImageParameters']).then(function (esriModules) {
            var ArcGISDynamicMapServiceLayer = esriModules[0];
            var InfoTemplate = esriModules[1];
            var ImageParameters = esriModules[2];
            var layer;

            // normalize info templates defined in layerOptions.infoTemplates
            // or nested esriLayerOption directives to be instances of esri/InfoTemplate
            // and pass to layer constructor in layerOptions
            if (layerOptions.infoTemplates) {
                for (var layerId in layerOptions.infoTemplates) {
                    if (layerOptions.infoTemplates.hasOwnProperty(layerId)) {
                        layerOptions.infoTemplates[layerId].infoTemplate = objectToInfoTemplate(layerOptions.infoTemplates[layerId].infoTemplate, InfoTemplate);
                    }
                }
            }

            // check for imageParameters property and
            // convert into ImageParameters() if needed
            if (angular.isObject(layerOptions.imageParameters)) {
                if (layerOptions.imageParameters.declaredClass !== 'esri.layers.ImageParameters') {
                    var imageParameters = new ImageParameters();
                    for (var key in layerOptions.imageParameters) {
                        if (layerOptions.imageParameters.hasOwnProperty(key)) {
                            // TODO: may want to conver timeExent to new TimeExtent()
                            // also not handling conversion for bbox, imageSpatialReference, nor layerTimeOptions
                            imageParameters[key] = layerOptions.imageParameters[key];
                        }
                    }
                    layerOptions.imageParameters = imageParameters;
                }
            }

            // create the layer object
            layer = new ArcGISDynamicMapServiceLayer(url, layerOptions);

            // set visible layers if passed as attribute
            if (visibleLayers) {
                layer.setVisibleLayers(parseVisibleLayers(visibleLayers));
            }

            return layer;
        });
    };

    // create an InfoTemplate object from JSON
    service.createInfoTemplate = function(infoTemplate) {
        return esriLoader.require('esri/InfoTemplate').then(function(InfoTemplate) {
            return objectToInfoTemplate(infoTemplate, InfoTemplate);
        });
    };

    // get layer info from layer and directive attributes
    service.getLayerInfo = function(layer, attrs) {
        return {
            title: attrs.title || layer.name,
            layer: layer,
            // TODO: are these the right params to send
            hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',') : undefined,
            defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
        };
    };

    // bind directive attributes to layer properties and events
    service.bindLayerEvents = function(scope, attrs, layer, mapController) {

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

    return service;
  });

})(angular);
