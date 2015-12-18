(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriLayerUtils
     *
     * @description
     * Functions to create instances of layers and related classes (such as InfoTemplate).
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriLayerUtils', function(esriLoader) {

        // parse array of visible layer ids from a string
        function parseVisibleLayers(val) {
            var visibleLayers;
            if (typeof val === 'string') {
                visibleLayers = [];
                val.split(',').forEach(function(layerId) {
                    var n = parseInt(layerId);
                    if (!isNaN(n)) {
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
                if (infoTemplate instanceof Array && infoTemplate.length === 2) {
                    return new InfoTemplate(infoTemplate[0], infoTemplate[1]);
                } else {
                    return new InfoTemplate(infoTemplate.title, infoTemplate.content);
                }
            }
        }

        // stateless utility service
        var service = {};

        /**
         * @ngdoc function
         * @name createFeatureLayer
         * @description Create an instance of a {@link https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html FeatureLayer}
         * @methodOf esri.core.factory:esriLayerUtils
         * @param {String} url The url of the map or feature service layer
         * @param {Object=} options FeatureLayer options
         * @returns {Promise} Returns a $q style promise resolved with an instance of FeatureLayer
         */
        service.createFeatureLayer = function(url, layerOptions) {
            return esriLoader.require(['esri/layers/FeatureLayer', 'esri/InfoTemplate']).then(function(esriModules) {
                var FeatureLayer = esriModules[0];
                var InfoTemplate = esriModules[1];

                if (layerOptions) {
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
                }
                return new FeatureLayer(url, layerOptions);
            });
        };
        /**
         * @ngdoc function
         * @name createVectorTileLayer
         * @description Create an instance of a {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html#vectortilelayer1 VectorTileLayer}
         * @methodOf esri.core.factory:esriLayerUtils
         * @param {String} url The url of the vector tile service or style JSON
         * @param {Object=} options VectorTileLayer options
         * @returns {Promise} Returns a $q style promise resolved with an instance of VectorTileLayer
         */
        service.createVectorTileLayer = function(url, layerOptions) {
            return esriLoader.require(['esri/layers/VectorTileLayer']).then(function(esriModules) {
                var VectorTileLayer = esriModules[0];
                return new VectorTileLayer(url, layerOptions);
            });
        };

        /**
         * @ngdoc function
         * @name createDynamicMapServiceLayer
         * @description Create an instance of an {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1 ArcGISDynamicMapServiceLayer}
         * @methodOf esri.core.factory:esriLayerUtils
         * @param {String} url The url of the map service
         * @param {Object=} options ArcGISDynamicMapServiceLayer options
         * @returns {Promise} Returns a $q style promise resolved with an instance of ArcGISDynamicMapServiceLayer
         */
        service.createDynamicMapServiceLayer = function(url, layerOptions, visibleLayers) {
            return esriLoader.require(['esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate', 'esri/layers/ImageParameters']).then(function(esriModules) {
                var ArcGISDynamicMapServiceLayer = esriModules[0];
                var InfoTemplate = esriModules[1];
                var ImageParameters = esriModules[2];
                var layer;

                if (layerOptions) {
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
                    if (typeof layerOptions.imageParameters === 'object') {
                        if (layerOptions.imageParameters.declaredClass !== 'esri.layers.ImageParameters') {
                            var imageParameters = new ImageParameters();
                            for (var key in layerOptions.imageParameters) {
                                if (layerOptions.imageParameters.hasOwnProperty(key)) {
                                    // TODO: may want to convert timeExent to new TimeExtent()
                                    // also not handling conversion for bbox, imageSpatialReference, nor layerTimeOptions
                                    imageParameters[key] = layerOptions.imageParameters[key];
                                }
                            }
                            layerOptions.imageParameters = imageParameters;
                        }
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
        /**
         * @ngdoc function
         * @name createInfoTemplate
         * @description Create an instance of an {@link https://developers.arcgis.com/javascript/jsapi/infotemplate-amd.html InfoTemplate}
         * @methodOf esri.core.factory:esriLayerUtils
         * @param {Object|Array} infoTemplate Either an array with `['title', 'content']` or an object with `{title: 'title', content: 'content'}`
         * @returns {Promise} Returns a $q style promise resolved with an instance of InfoTemplate
         */
        service.createInfoTemplate = function(infoTemplate) {
            return esriLoader.require('esri/InfoTemplate').then(function(InfoTemplate) {
                return objectToInfoTemplate(infoTemplate, InfoTemplate);
            });
        };

        return service;
    });

})(angular);
