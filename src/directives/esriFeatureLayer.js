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
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            // define an interface for working with this directive
            controller: function($scope) {
                var layerDeferred = $q.defer();

                require(['esri/layers/FeatureLayer', 'esri/InfoTemplate'], function(FeatureLayer, InfoTemplate) {
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

                    // layerOptions.infoTemplate expects one of the following:
                    //  1. [title <String | Function>, content <String | Function>]
                    //  2. {title: <String | Function>, content: <String | Function>}
                    //  3. a valid Esri JSAPI InfoTemplate
                    if (layerOptions.hasOwnProperty('infoTemplate')) {
                        var infoT = layerOptions.infoTemplate; // shortcut reference
                        if (infoT.declaredClass !== 'esri.InfoTemplate') {
                            // only attempt to construct if a valid InfoTemplate wasn't already passed in
                            // construct optional infoTemplate from layerOptions, using 2 args style:
                            //  https://developers.arcgis.com/javascript/jsapi/infotemplate-amd.html#infotemplate2
                            if (angular.isArray(infoT) && infoT.length === 2) {
                                var title = infoT[0];
                                var content = infoT[1];
                                layerOptions.infoTemplate = new InfoTemplate(title, content);
                            } else {
                                if (infoT.hasOwnProperty('title') && infoT.hasOwnProperty('content')) {
                                    layerOptions.infoTemplate = new InfoTemplate(infoT.title, infoT.content);
                                }
                            }
                        }
                    }

                    // layerOptions.mode expects a FeatureLayer constant name as a <String>
                    // https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#constants
                    if (layerOptions.hasOwnProperty('mode')) {
                        // look up and convert to the appropriate <Number> value
                        layerOptions.mode = FeatureLayer[layerOptions.mode];
                    }

                    var layer = new FeatureLayer($scope.url, layerOptions);
                    layerDeferred.resolve(layer);

                    layerDeferred.promise.then(function(layer) {
                        // TODO: move these watches to the link function
                        // watch the scope's visible property for changes
                        // set the visibility of the feature layer
                        $scope.$watch('visible', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                layer.setVisibility(isTrue(newVal));
                            }
                        });

                        // watch the scope's opacity property for changes
                        // set the opacity of the feature layer
                        $scope.$watch('opacity', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                layer.setOpacity(Number(newVal));
                            }
                        });

                        // watch the scope's definitionExpression property for changes
                        // set the definitionExpression of the feature layer
                        $scope.$watch('definitionExpression', function(newVal, oldVal) {
                            if (newVal !== oldVal) {
                                layer.setDefinitionExpression(newVal);
                            }
                        });
                    });
                });

                // return the defered that will be resolved with the feature layer
                this.getLayer = function() {
                    return layerDeferred.promise;
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
