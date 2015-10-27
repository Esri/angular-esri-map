(function(angular) {
    'use strict';

    angular.module('esri.map').controller('esriFeatureLayerController', function EsriFeatureLayerController(esriLayerUtils) {

        var layerPromise;

        // get feature layer options from layer controller properties
        this.getLayerOptions = function() {
            var layerOptions = esriLayerUtils.getLayerOptions(this);
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

        // create the layer
        layerPromise = esriLayerUtils.createFeatureLayer(this.url, this.getLayerOptions());
    });

})(angular);
