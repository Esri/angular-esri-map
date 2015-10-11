(function (angular) {
    'use strict';

    // TODO: refactor to shared factory/service?
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

    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function ($q, esriMapUtils) {
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

            controllerAs: 'vm',

            bindToController: true,

            // define an interface for working with this directive
            controller: function () {
                var self = this;
                var layerDeferred = $q.defer();

                this.layerType = 'ArcGISDynamicMapServiceLayer';

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


                require(['esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate', 'esri/layers/ImageParameters'], function (ArcGISDynamicMapServiceLayer, InfoTemplate, ImageParameters) {

                    // layerOptions.infoTemplate expects one of the following:
                    //  1. [title <String | Function>, content <String | Function>]
                    //  2. {title: <String | Function>, content: <String | Function>}
                    //  3. a valid Esri JSAPI InfoTemplate
                    // TODO: refactor to shared factory/service to be used by feature layer directive as well
                    function objectToInfoTemplate(infoTemplate) {
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

                    var layerOptions = self.layerOptions() || {};

                    // $scope.visible takes precedence over $scope.layerOptions.visible
                    if (angular.isDefined(self.visible)) {
                        layerOptions.visible = esriMapUtils.isTrue(self.visible);
                    }

                    // $scope.opacity takes precedence over $scope.layerOptions.opacity
                    if (self.opacity) {
                        layerOptions.opacity = Number(self.opacity);
                    }

                    // self.layerOptions.infoTemplates takes precedence over
                    // layer options defined in nested esriLayerOption directives
                    if (angular.isObject(layerOptions.infoTemplates)) {
                        for (var layerIndex in layerOptions.infoTemplates) {
                            if (layerOptions.infoTemplates.hasOwnProperty(layerIndex)) {
                                self.setInfoTemplate(layerIndex, layerOptions.infoTemplates[layerIndex].infoTemplate);
                            }
                        }
                    }

                    // normalize info templates defined in $scope.layerOptions.infoTemplates
                    // or nested esriLayerOption directives to be instances of esri/InfoTemplate
                    // and pass to layer constructor in layerOptions
                    if (self._infoTemplates) {
                        for (var layerId in self._infoTemplates) {
                            if (self._infoTemplates.hasOwnProperty(layerId)) {
                                self._infoTemplates[layerId].infoTemplate = objectToInfoTemplate(self._infoTemplates[layerId].infoTemplate);
                            }
                        }
                        layerOptions.infoTemplates = self._infoTemplates;
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
                    var layer = new ArcGISDynamicMapServiceLayer(self.url, layerOptions);

                    // set visible layers if passed as attribute
                    if (self.visibleLayers) {
                        layer.setVisibleLayers(parseVisibleLayers(self.visibleLayers));
                    }

                    // resolve deferred w/ layer
                    layerDeferred.resolve(layer);
                });

                // return the defered that will be resolved with the dynamic layer
                this.getLayer = function () {
                    return layerDeferred.promise;
                };

                // set the info template for a layer
                self.setInfoTemplate = function(layerId, infoTemplate) {
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

                // bind directive attributes to layer properties and events
                esriMapUtils.initLayerDirective(scope, attrs, layerController, mapController);
            }
        };
    });

})(angular);
