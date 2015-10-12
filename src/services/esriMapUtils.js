(function (angular) {
  'use strict';

  angular.module('esri.map').factory('esriMapUtils', function ($q) {

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
    // TODO: refactor to shared factory/service to be used by feature layer directive as well
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

    // test if a string value (i.e. directive attribute value)
    service.isTrue = function (val) {
        return val === true || val === 'true';
    };

    service.addCustomBasemap = function(name, basemapDefinition) {
        var deferred = $q.defer();
        require(['esri/basemaps'], function(esriBasemaps) {
            var baseMapLayers = basemapDefinition.baseMapLayers;
            if (!angular.isArray(baseMapLayers) && angular.isArray(basemapDefinition.urls)) {
                baseMapLayers = basemapDefinition.urls.map(function (url) {
                    return {
                        url: url
                    };
                });
            }
            if (angular.isArray(baseMapLayers)) {
                esriBasemaps[name] = {
                    baseMapLayers: baseMapLayers,
                    thumbnailUrl: basemapDefinition.thumbnailUrl,
                    title: basemapDefinition.title
                };
            }
            deferred.resolve(esriBasemaps);
        });
        return deferred.promise;
    };

    // bind directive attributes to layer properties and events
    service.initLayerDirective = function(scope, attrs, layerController, mapController) {
        var layerIndex = layerController.layerType === 'FeatureLayer' ? 0 : undefined;

        return layerController.getLayer().then(function(layer) {
            // add layer at index position so that layers can be
            // declaratively added to map in top-to-bottom order
            mapController.addLayer(layer, layerIndex);

            // Look for layerInfo related attributes. Add them to the map's layerInfos array for access in other components
            mapController.addLayerInfo({
                title: attrs.title || layer.name,
                layer: layer,
                // TODO: are these the right params to send
                hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',') : undefined,
                defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
            });

            // watch the scope's visible property for changes
            // set the visibility of the feature layer
            scope.$watch('vm.visible', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setVisibility(service.isTrue(newVal));
                }
            });

            // watch the scope's opacity property for changes
            // set the opacity of the feature layer
            scope.$watch('vm.opacity', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setOpacity(Number(newVal));
                }
            });

            // call load handler (if any)
            if (attrs.load) {
                if (layer.loaded) {
                    // layer is already loaded
                    // make layer object available to caller immediately
                    scope.vm.load()(layer);
                } else {
                    // layer is not yet loaded
                    // wait for load event, and then make layer object available
                    layer.on('load', function() {
                        scope.$apply(function() {
                            scope.vm.load()(layer);
                        });
                    });
                }
            }

            // call updateEnd handler (if any)
            if (attrs.updateEnd) {
                layer.on('update-end', function(e) {
                    scope.$apply(function() {
                        scope.vm.updateEnd()(e);
                    });
                });
            }

            // remove the layer from the map when the layer scope is destroyed
            scope.$on('$destroy', function() {
                mapController.removeLayer(layer);
            });

            // return the layer
            return layer;
        });
    };

    service.createFeatureLayer = function(url, layerOptions) {
        var layerDeferred = $q.defer();
        require(['esri/layers/FeatureLayer', 'esri/InfoTemplate'], function(FeatureLayer, InfoTemplate) {

            // normalize info template defined in $scope.layerOptions.infoTemplate
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

            layerDeferred.resolve(new FeatureLayer(url, layerOptions));
        });

        return layerDeferred;
    };

    service.createDynamicMapServiceLayer = function(url, layerOptions, visibleLayers) {
        var layerDeferred = $q.defer();
        var layer;

        require(['esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate', 'esri/layers/ImageParameters'], function (ArcGISDynamicMapServiceLayer, InfoTemplate, ImageParameters) {

            // normalize info templates defined in $scope.layerOptions.infoTemplates
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

            // resolve deferred w/ layer
            layerDeferred.resolve(layer);
        });

        return layerDeferred;
    };

    return service;
  });

})(angular);
