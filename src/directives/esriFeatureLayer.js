(function(angular) {
    'use strict';

    function isTrue(val) {
        return val === true || val === 'true';
    }

    angular.module('esri.map').directive('esriFeatureLayer', function($q) {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriFeatureLayer to be used as an element (<esri-feature-layer>)
            restrict: 'E',

            // require the esriFeatureLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriFeatureLayer', '^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // isolate scope for feature layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                definitionExpression: '@?',
                // function binding for event handlers
                load: '&',
                updateEnd: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            // define an interface for working with this directive
            controller: function($scope) {
                var self = this;
                var layerDeferred = $q.defer();

                require(['esri/layers/FeatureLayer', 'esri/InfoTemplate'], function(FeatureLayer, InfoTemplate) {

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

                    var layerOptions = $scope.layerOptions() || {};

                    // $scope.visible takes precedence over $scope.layerOptions.visible
                    if (angular.isDefined($scope.visible)) {
                        layerOptions.visible = isTrue($scope.visible);
                    }

                    // $scope.opacity takes precedence over $scope.layerOptions.opacity
                    if ($scope.opacity) {
                        layerOptions.opacity = Number($scope.opacity);
                    }

                    // $scope.definitionExpression takes precedence over $scope.layerOptions.definitionExpression
                    if ($scope.definitionExpression) {
                        layerOptions.definitionExpression = $scope.definitionExpression;
                    }

                    // $scope.layerOptions.infoTemplate takes precedence over
                    // layer options defined in nested esriLayerOption directives
                    if (layerOptions.hasOwnProperty('infoTemplate')) {
                        self.setInfoTemplate(layerOptions.infoTemplate);
                    }

                    // normalize info template defined in $scope.layerOptions.infoTemplate
                    // or nested esriLayerOption directive to be instance of esri/InfoTemplate
                    // and pass to layer constructor in layerOptions
                    if (self._infoTemplate) {
                        self._infoTemplate = objectToInfoTemplate(self._infoTemplate);
                        layerOptions.infoTemplate = self._infoTemplate;
                    }

                    // layerOptions.mode expects a FeatureLayer constant name as a <String>
                    // https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#constants
                    if (layerOptions.hasOwnProperty('mode')) {
                        // look up and convert to the appropriate <Number> value
                        layerOptions.mode = FeatureLayer[layerOptions.mode];
                    }

                    var layer = new FeatureLayer($scope.url, layerOptions);
                    layerDeferred.resolve(layer);
                });

                // return the defered that will be resolved with the feature layer
                this.getLayer = function() {
                    return layerDeferred.promise;
                };

                this.setInfoTemplate = function(infoTemplate) {
                    this._infoTemplate = infoTemplate;
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map
            link: function(scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                layerController.getLayer().then(function(layer) {
                    // add layer at index position 0
                    // so that layers can be declaratively added to map in top-to-bottom order
                    mapController.addLayer(layer, 0);

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
                    scope.$watch('visible', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            layer.setVisibility(isTrue(newVal));
                        }
                    });

                    // watch the scope's opacity property for changes
                    // set the opacity of the feature layer
                    scope.$watch('opacity', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            layer.setOpacity(Number(newVal));
                        }
                    });

                    // watch the scope's definitionExpression property for changes
                    // set the definitionExpression of the feature layer
                    scope.$watch('definitionExpression', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            layer.setDefinitionExpression(newVal);
                        }
                    });

                    // call load handler (if any)
                    if (attrs.load) {
                        if (layer.loaded) {
                        // layer is already loaded
                        // make layer object available to caller immediately
                            scope.load()(layer);
                        } else {
                            // layer is not yet loaded
                            // wait for load event, and then make layer object available
                            layer.on('load', function() {
                                scope.$apply(function() {
                                    scope.load()(layer);
                                });
                            });
                        }
                    }

                    // call updateEnd handler (if any)
                    if (attrs.updateEnd) {
                        layer.on('update-end', function(e) {
                            scope.updateEnd()(e);
                        });
                    }

                    // remove the layer from the map when the layer scope is destroyed
                    scope.$on('$destroy', function() {
                        mapController.removeLayer(layer);
                    });

                    // return the layer
                    return layer;
                });
            }
        };
    });

})(angular);
