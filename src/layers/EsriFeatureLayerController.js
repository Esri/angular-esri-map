(function(angular) {
    'use strict';

    angular.module('esri.map').controller('EsriFeatureLayerController', function EsriFeatureLayerController($controller, esriLayerUtils) {

        var layerPromise;

        // extends layer controller base class
        angular.extend(this, $controller('EsriLayerControllerBase'));

        // get feature layer options from layer controller properties
        this.getFeatureLayerOptions = function() {
            var layerOptions = this.getLayerOptions();
            // definitionExpression takes precedence over layerOptions.definitionExpression
            if (this.definitionExpression) {
                layerOptions.definitionExpression = this.definitionExpression;
            }

            return layerOptions;
        };

        // return the defered that will be resolved with the feature layer
        this.getLayer = function() {
            return layerPromise;
        };

        // set info template once layer has been loaded
        this.setInfoTemplate = function(infoTemplate) {
            return this.getLayer().then(function(layer) {
                return esriLayerUtils.createInfoTemplate(infoTemplate).then(function(infoTemplateObject) {
                    layer.setInfoTemplate(infoTemplateObject);
                    return infoTemplateObject;
                });
            });
        };

        this.bindLayerEvents = function(scope, attrs, layer, mapController) {
            // bind directive attributes to layer properties and events
            this.bindLayerEventsBase(scope, attrs, layer, mapController);

            // additional directive attribute binding specific to this type of layer

            // watch the scope's definitionExpression property for changes
            // set the definitionExpression of the feature layer
            scope.$watch('layerCtrl.definitionExpression', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setDefinitionExpression(newVal);
                }
            });
        };

        // create the layer
        layerPromise = esriLayerUtils.createFeatureLayer(this.url, this.getFeatureLayerOptions());
    });

})(angular);
