(function(angular) {
    'use strict';

    angular.module('esri.core', []);

})(angular);

/*global require: false*/
(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriLoader
     *
     * @requires $q
     *
     * @description
     * Use `esriLoader` to lazyload the Esri ArcGIS API or to require API modules.
     */
    angular.module('esri.core').factory('esriLoader', function ($q) {

        /**
         * @ngdoc function
         * @name bootstrap
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Loads the Esri ArcGIS API for JavaScript.
         *
         * @param {Object=} options Send a list of options of how to load the Esri ArcGIS API for JavaScript.
         *  Defaults to `{url: 'http://js.arcgis.com/3.15compact'}`
         *
         * @return {Promise} Returns a $q style promise which is resolved once the ArcGIS API for JavaScript has been loaded.
         */
        function bootstrap(options) {
            var deferred = $q.defer();

            // Default options object to empty hash
            var opts = options || {};

            // Don't reload API if it is already loaded
            if (isLoaded()) {
                deferred.reject('ESRI API is already loaded.');
                return deferred.promise;
            }

            // Create Script Object to be loaded
            var script    = document.createElement('script');
            script.type   = 'text/javascript';
            script.src    = opts.url || window.location.protocol + '//js.arcgis.com/3.15compact';

            // Set onload callback to resolve promise
            script.onload = function() { deferred.resolve( window.require ); };

            document.body.appendChild(script);

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name isLoaded
         * @methodOf esri.core.factory:esriLoader
         *
         * @return {Boolean} Returns a boolean if the Esri ArcGIS API for JavaScript is already loaded.
         */
        function isLoaded() {
            return typeof window.require !== 'undefined';
        }

        /**
         * @ngdoc function
         * @name require
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Load an Esri module using the Dojo AMD loader.
         *
         * @param {String|Array} modules A string of a module or an array of modules to be loaded.
         * @param {Function=} callback An optional function used to support AMD style loading, promise and callback are both added to the event loop, possible race condition.
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded
         */
        function requireModule(moduleName, callback){
            var deferred = $q.defer();

            // Throw Error if Esri is not loaded yet
            if (!isLoaded()) {
                deferred.reject('Trying to call esriLoader.require(), but Esri ArcGIS API has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading Esri ArcGIS API.');
                return deferred.promise;
            }
            
            if (typeof moduleName === 'string') {
                require([moduleName], function (module) {
                    // grab the single module passed back from require callback and send to promise
                    deferred.resolve(module);
                });

                // return a chained promise that calls the callback function
                //  to ensure it occurs within the digest cycle
                return deferred.promise.then(function(module) {
                    if (callback && typeof callback === 'function') {
                        callback(module);
                    }
                    return module;
                });
            } else if (moduleName instanceof Array) {
                require(moduleName, function () {
                    var modules = Array.prototype.slice.call(arguments);
                    // grab all of the modules passed back from require callback and send as array to promise
                    deferred.resolve(modules);
                });

                // return a chained promise that calls the callback function
                //  to ensure it occurs within the digest cycle
                return deferred.promise.then(function(modules) {
                    if (callback && typeof callback === 'function') {
                        callback.apply(this, modules);
                    }
                    return modules;
                });
            } else {
                deferred.reject('An Array<String> or String is required to load modules.');
                return deferred.promise;
            }
        }

        // Return list of aformentioned functions
        return {
            bootstrap: bootstrap,
            isLoaded:  isLoaded,
            require:   requireModule
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriRegistry
     *
     * @description
     * Use `esriRegistry` to store and retrieve map instances for use in parent controllers.
     *
     * ## Examples
     * - {@link ../#/examples/registry-pattern Registry Pattern}
     */
    angular.module('esri.core').service('esriRegistry', function($q) {
        var registry = {};

        return {
            _register: function(name, promise) {
                // if there isn't a promise in the registry yet make one...
                // this is the case where a directive is nested higher then the controller
                // needing the instance
                if (!registry[name]) {
                    registry[name] = $q.defer();
                }

                var instance = registry[name];

                // when the promise from the directive is rejected/resolved
                // reject/resolve the promise in the registry with the appropriate value
                promise.then(function(arg) {
                    instance.resolve(arg);
                    return arg;
                }, function(arg) {
                    instance.reject(arg);
                    return arg;
                });

                // return a function to "deregister" the promise
                // by deleting it from the registry
                return function() {
                    delete registry[name];
                };
            },

            /**
             * @ngdoc function
             * @name get
             * @methodOf esri.core.factory:esriRegistry
             *
             * @description
             * Get the map instance registered with the given name.
             * See {@link esri.map.directive:esriMap esriMap} for info on how to register a map using the `resgister-as` attribute.
             *
             * @param {String} name Name that the map was registered with.
             *
             * @return {Promise} Returns a $q style promise which is resolved with the map once it has been loaded.
             */
            get: function(name) {
                // is something is already in the registry return its promise ASAP
                // this is the case where you might want to get a registry item in an
                // event handler
                if (registry[name]) {
                    return registry[name].promise;
                }

                // if we dont already have a registry item create one. This covers the
                // case where the directive is nested inside the controler. The parent
                // controller will be executed and gets a promise that will be resolved
                // later when the item is registered
                var deferred = $q.defer();

                registry[name] = deferred;

                return deferred.promise;
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriMapUtils
     *
     * @description
     * Functions to help create map instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriMapUtils', function($q, esriLoader) {

        // check if a variable is an array
        function isArray(v) {
            return v instanceof Array;
        }

        // construct Extent if object is not already an instance
        // e.g. if the controller or HTML view are only providing JSON
        function objectToExtent(extent, Extent) {
            if (extent.declaredClass === 'esri.geometry.Extent') {
                return extent;
            } else {
                return new Extent(extent);
            }
        }

        // stateless utility service
        var service = {};

        /**
         * @ngdoc function
         * @name addCustomBasemap
         * @description Add a custom basemap definition to {@link https://developers.arcgis.com/javascript/jsapi/esri.basemaps-amd.html esriBasemaps}
         * @methodOf esri.core.factory:esriMapUtils
         * @param {String} name Name to be used when setting the basemap
         * @param {Object} basemapDefinition Basemap layer urls and other options (either basemapDefinition.baseMapLayers or basemapDefinition.urls is required)
         * @param {Array=} basemapDefinition.baseMapLayers Array of basemap layer objects
         * @param {Array=} basemapDefinition.urls Array of basemap layer urls
         * @param {String=} basemapDefinition.thumbnailUrl Basemap thumbnail URL
         * @param {String=} basemapDefinition.title Basemap Title
         * @returns {Promise} Returns a $q style promise resolved with esriBasemaps
         */
        service.addCustomBasemap = function(name, basemapDefinition) {
            return esriLoader.require('esri/basemaps').then(function(esriBasemaps) {
                var baseMapLayers = basemapDefinition.baseMapLayers;
                if (!isArray(baseMapLayers) && isArray(basemapDefinition.urls)) {
                    baseMapLayers = basemapDefinition.urls.map(function(url) {
                        return {
                            url: url
                        };
                    });
                }
                if (isArray(baseMapLayers)) {
                    esriBasemaps[name] = {
                        baseMapLayers: baseMapLayers,
                        thumbnailUrl: basemapDefinition.thumbnailUrl,
                        title: basemapDefinition.title
                    };
                }
                return esriBasemaps;
            });
        };

        /**
         * @ngdoc function
         * @name createMap
         * @description Create a new {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html Map} instance at an element w/ the given id
         * @methodOf esri.core.factory:esriMapUtils
         * @param {String} elementId Id of the element for the map
         * @param {Object} options {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html#map1 Optional parameters}
         * @returns {Promise} Returns a $q style promise resolved with the Map instance
         */
        service.createMap = function(elementId, mapOptions) {
            return esriLoader.require(['esri/map', 'esri/geometry/Extent']).then(function(esriModules) {
                var Map = esriModules[0];
                var Extent = esriModules[1];

                // construct optional Extent for mapOptions
                if (mapOptions && mapOptions.hasOwnProperty('extent')) {
                    mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
                }

                // create a new map object and
                // resolve the promise with the map
                return new Map(elementId, mapOptions);
            });
        };

        /**
         * @ngdoc function
         * @name createWebMap
         * @description Create a new {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html Map} instance from a web map at an element w/ the given id
         * @methodOf esri.core.factory:esriMapUtils
         * @param {String} webmapId Item id of the web map
         * @param {String} elementId Id of the element for the map
         * @param {Object} options {@link https://developers.arcgis.com/javascript/jsapi/esri.arcgis.utils-amd.html#createmap Optional parameters}
         * @returns {Promise} Returns a $q style promise resolved with the Map instance
         */
        // TODO: would be better if we didn't have to pass mapController
        service.createWebMap = function(webmapId, elementId, mapOptions, mapController) {
            // this deferred will be resolved with the map
            // NOTE: wrapping in $q deferred to avoid injecting
            // dojo/Deferred into promise chain by returning argisUtils.createMap()
            var mapDeferred = $q.defer();

            esriLoader.require(['esri/arcgis/utils', 'esri/geometry/Extent'], function(arcgisUtils, Extent) {

                // construct optional Extent for mapOptions
                if (mapOptions.hasOwnProperty('extent')) {
                    mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
                }

                // load map object from web map
                arcgisUtils.createMap(webmapId, elementId, {
                    mapOptions: mapOptions
                }).then(function(response) {
                    // get layer infos for legend
                    mapController.layerInfos = arcgisUtils.getLegendLayers(response);
                    // get item info (map title, etc)
                    mapController.itemInfo = response.itemInfo;
                    // resolve the promise with the map and additional info
                    mapDeferred.resolve(response.map);
                });
            });

            // return the map deferred's promise
            return mapDeferred.promise;
        };

        return service;
    });

})(angular);

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
