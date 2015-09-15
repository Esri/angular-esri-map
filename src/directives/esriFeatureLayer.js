(function(angular) {
    'use strict';

    function isTrue(val) {
        return val === true || val === 'true';
    }

    angular.module('esri.map').directive('esriFeatureLayer', function ($q) {
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
                visible: '@?'
            },

            // define an interface for working with this directive
            controller: function ($scope, $element, $attrs) {
                var layerDeferred = $q.defer();

                require([
                    'esri/layers/FeatureLayer'], function (FeatureLayer) {

                    var layerOptions = {};
                    if ($attrs.definitionExpression) {
                        layerOptions.definitionExpression = $attrs.definitionExpression;
                    }
                    if ($scope.visible !== undefined) {
                        layerOptions.visible = isTrue($scope.visible);
                    }
                    var layer = new FeatureLayer($scope.url, layerOptions);

                    layerDeferred.resolve(layer);
                });

                // return the defered that will be resolved with the feature layer
                this.getLayer = function () {
                    return layerDeferred.promise;
                };

                // set the visibility of the feature layer
                this.setVisible = function (visible) {
                    var isVisible = isTrue(visible);
                    var visibleDeferred = $q.defer();

                    this.getLayer().then(function (layer) {
                        layer.setVisibility(isVisible);
                        visibleDeferred.resolve();
                    });

                    return visibleDeferred.promise;
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // watch the scope's visible property for changes
                // set the visibility of the feature layer
                scope.$watch('visible', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        layerController.setVisible(newVal);
                    }
                });

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

                    // Remove the layer from the map when the layer scope is destroyed
                    scope.$on('$destroy', function () {
                        mapController.removeLayer(layer);
                    });

                    // return the layer
                    return layer;
                });
            }
        };
    });

})(angular);
