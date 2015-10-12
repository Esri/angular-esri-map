(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriFeatureLayer', function($q, esriMapUtils) {
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

            controllerAs: 'vm',

            bindToController: true,

            // define an interface for working with this directive
            controller: function() {
                var self = this;
                var layerDeferred = $q.defer();

                this.layerType = 'FeatureLayer';

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

                    // var layerOptions = $scope.layerOptions() || {};
                    var layerOptions = self.layerOptions() || {};

                    // $scope.visible takes precedence over $scope.layerOptions.visible
                    if (angular.isDefined(self.visible)) {
                        layerOptions.visible = esriMapUtils.isTrue(self.visible);
                    }

                    // $scope.opacity takes precedence over $scope.layerOptions.opacity
                    if (self.opacity) {
                        layerOptions.opacity = Number(self.opacity);
                    }

                    // $scope.definitionExpression takes precedence over $scope.layerOptions.definitionExpression
                    if (self.definitionExpression) {
                        layerOptions.definitionExpression = self.definitionExpression;
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

                    // var layer = new FeatureLayer($scope.url, layerOptions);
                    var layer = new FeatureLayer(self.url, layerOptions);
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

                // bind directive attributes to layer properties and events
                esriMapUtils.initLayerDirective(scope, attrs, layerController, mapController).then(function(layer) {

                    // additional directive attribute binding specific to this type of layer

                    // watch the scope's definitionExpression property for changes
                    // set the definitionExpression of the feature layer
                    scope.$watch('vm.definitionExpression', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            layer.setDefinitionExpression(newVal);
                        }
                    });
                });
            }
        };
    });

})(angular);
