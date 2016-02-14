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

(function(angular) {
    'use strict';

    angular.module('esri.map', ['esri.core']);

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapController
     * @requires $attrs
     * @requires $timeout
     * @requires esri.core.factory:esriMapUtils
     * @requires esri.core.factory:esriRegistry
     *
     * @description
     * This controller is used by the esri-map directive to construct the map,
     * provide it with several supporting methods,
     * and also add it to the registry if following the {@link ../#/examples/registry-pattern Registry Pattern}.
     */
    angular.module('esri.map').controller('EsriMapController', function EsriMapController($attrs, $timeout, esriMapUtils, esriRegistry) {

        // check if a variable is undefined
        function isUndefined(v) {
            return typeof v === 'undefined';
        }

        // update two-way bound scope properties based on map state
        function updateCenterAndZoom(scope, map) {
            var geoCenter = map.geographicExtent && map.geographicExtent.getCenter();
            if (geoCenter) {
                geoCenter = geoCenter.normalize();
                scope.center = {
                    lat: geoCenter.y,
                    lng: geoCenter.x
                };
            }
            scope.zoom = map.getZoom();
        }

        var attrs = $attrs;

        // this deferred will be resolved with the map
        var mapPromise;

        /**
         * @ngdoc function
         * @name getMapProperties
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Formats and prepares map options from controller properties.
         *
         * @returns {Object} A map options object for map construction.
         */
        this.getMapOptions = function() {

            // read options passed in as either a JSON string expression
            // or as a function bound object
            var mapOptions = this.mapOptions() || {};

            // check for 1 way bound properties (basemap)
            // basemap takes precedence over mapOptions.basemap
            if (this.basemap) {
                mapOptions.basemap = this.basemap;
            }

            // check for 2 way bound properties (center and zoom)
            // center takes precedence over mapOptions.center
            if (this.center) {
                if (this.center.lng && this.center.lat) {
                    mapOptions.center = [this.center.lng, this.center.lat];
                } else {
                    mapOptions.center = this.center;
                }
            }

            // zoom takes precedence over mapOptions.zoom
            if (this.zoom) {
                mapOptions.zoom = this.zoom;
            }

            return mapOptions;
        };

        /**
         * @ngdoc function
         * @name getMap
         * @methodOf esri.map.controller:EsriMapController
         *
         * @return {Promise} The promise that will be resolved with the loaded map.
         */
        this.getMap = function() {
            return mapPromise;
        };

        /**
         * @ngdoc function
         * @name addLayer
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Adds the layer to the map.
         *
         * @param {FeatureLayer | VectorTileLayer | ArcGISDynamicMapServiceLayer} layer Layer to add to the map
         * @param {Number=} index Layer ordering position on the map
         *
         * @return {Promise} The promise that will be resolved with the result of `map.addLayer`.
         */
        this.addLayer = function(layer, index) {
            return this.getMap().then(function(map) {
                return map.addLayer(layer, index);
            });
        };

        /**
         * @ngdoc function
         * @name removeLayer
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Removes the layer from the map, for example when a esri-feature-layer directive goes out of scope.
         *
         * @param {FeatureLayer | VectorTileLayer | ArcGISDynamicMapServiceLayer} layer Layer to remove from the map
         *
         * @return {Promise} The promise that will be resolved with the result of `map.removeLayer`.
         */
        this.removeLayer = function (layer) {
            return this.getMap().then(function (map) {
                return map.removeLayer(layer);
            });
        };

        /**
         * @ngdoc function
         * @name addLayerInfo
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Adds to the array to store layer info, which is needed for the esri-legend directive.
         *
         * @param {Object} layerInfo Information about the layer, see
         *  {@link https://developers.arcgis.com/javascript/jsapi/legend-amd.html#legend1 layerInfo} for object specification.
         */
        this.addLayerInfo = function(layerInfo) {
            if (!this.layerInfos) {
                this.layerInfos = [layerInfo];
            } else {
                this.layerInfos.unshift(layerInfo);
            }
        };

        /**
         * @ngdoc function
         * @name getLayerInfos
         * @methodOf esri.map.controller:EsriMapController
         *
         * @return {Array} The array of layer info objects that are used by the esri-legend directive.
         */
        this.getLayerInfos = function() {
            return this.layerInfos;
        };

        /**
         * @ngdoc function
         * @name bindMapEvents
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Updates scope in response to map events,
         * and updates the map in response to scope properties.
         *
         * @param {Object} scope $scope
         * @param {Object} attrs $attrs
         */
        this.bindMapEvents = function(scope, attrs) {
            var self = this;

            // get the map once it's loaded
            this.getMap().then(function(map) {
                if (map.loaded) {
                    // map already loaded, we need to
                    // update two-way bound scope properties
                    // updateCenterAndZoom(scope, map);
                    updateCenterAndZoom(self, map);
                    // make map object available to caller
                    // by calling the load event handler
                    if (attrs.load) {
                        self.load()(map);
                    }
                } else {
                    // map is not yet loaded, this means that
                    // two-way bound scope properties
                    // will be updated by extent-change handler below
                    // so don't need to update them here
                    // just set up a handler for the map load event (if any)
                    if (attrs.load) {
                        map.on('load', function() {
                            scope.$apply(function() {
                                self.load()(map);
                            });
                        });
                    }
                }

                // listen for changes to map extent and
                // call extent-change handler (if any)
                // also update scope.center and scope.zoom
                map.on('extent-change', function(e) {
                    if (attrs.extentChange) {
                        self.extentChange()(e);
                    }
                    // prevent circular updates between $watch and $apply
                    if (self.inUpdateCycle) {
                        return;
                    }
                    self.inUpdateCycle = true;
                    scope.$apply(function() {
                        // update scope properties
                        updateCenterAndZoom(self, map);
                        $timeout(function() {
                            // this will be executed after the $digest cycle
                            self.inUpdateCycle = false;
                        }, 0);
                    });
                });

                // listen for changes to scope.basemap and update map
                scope.$watch('mapCtrl.basemap', function(newBasemap, oldBasemap) {
                    if (map.loaded && newBasemap !== oldBasemap) {
                        map.setBasemap(newBasemap);
                    }
                });

                // listen for changes to scope.center and scope.zoom and update map
                self.inUpdateCycle = false;
                if (!isUndefined(attrs.center) || !isUndefined(attrs.zoom)) {
                    scope.$watchGroup(['mapCtrl.center.lng', 'mapCtrl.center.lat', 'mapCtrl.zoom'], function(newCenterZoom) {
                        if (self.inUpdateCycle) {
                            return;
                        }
                        if (newCenterZoom[0] !== '' && newCenterZoom[1] !== '' && newCenterZoom[2] !== '') {
                            // prevent circular updates between $watch and $apply
                            self.inUpdateCycle = true;
                            map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]).then(function() {
                                self.inUpdateCycle = false;
                            });
                        }
                    });
                }

                // clean up
                scope.$on('$destroy', function() {
                    if (self.deregister) {
                        self.deregister();
                    }
                    map.destroy();
                });
            });
        };

        // initialize the map
        if (attrs.webmapId) {
            // load map object from web map
            mapPromise = esriMapUtils.createWebMap(attrs.webmapId, attrs.id, this.getMapOptions(), this);
        } else {
            // create a new map object
            mapPromise = esriMapUtils.createMap(attrs.id, this.getMapOptions());
        }

        // add this map to the registry and get a
        // handle to deregister the map when it's destroyed
        if (attrs.registerAs) {
            this.deregister = esriRegistry._register(attrs.registerAs, mapPromise);
        }
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriMap
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a map using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     * For additional information, we recommend the
     * {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html Esri Map documentation}.
     *
     * ## Examples
     * - Choose from a {@link ../#/examples number of examples} making use of this directive
     *
     * @param {String} id The id of the element where to construct the map.
     * @param {Array | Object=} center The initial location of the map.
     * @param {Number=} zoom The initial zoom level of the map.
     * @param {Object=} item-info When loading a web map from an item id, this object will be populated with the item's info.
     * @param {String=} basemap The basemap of the map, which can be a valid string from the ArcGIS API for JavaScript, or a custom basemap.
     * @param {Function=} load Callback for map `load` event.
     * @param {Function=} extent-change Callback for map `extent-change` event.
     * @param {Object | String=} map-options An object or inline object hash string defining additional map constructor options.
     *  See {@link ../#/examples/additional-map-options Additional Map Options} example.
     * @param {String=} register-as A name to use when registering the map so that it can be used by parent controllers.
     *  See {@link esri.core.factory:esriRegistry esriRegistry}.
     */
    angular.module('esri.map').directive('esriMap', function() {

        return {
            // element only
            restrict: 'E',

            // isolate scope
            scope: {
                // two-way binding for center/zoom
                // because map pan/zoom can change these
                center: '=?',
                zoom: '=?',
                itemInfo: '=?',
                // one-way binding for other properties
                basemap: '@',
                // function binding for event handlers
                load: '&',
                extentChange: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                mapOptions: '&'
            },

            controllerAs: 'mapCtrl',

            bindToController: true,

            // directive api
            controller: 'EsriMapController',

            // replace tag with div with same id
            compile: function($element, $attrs) {

                // remove the id attribute from the main element
                $element.removeAttr('id');

                // append a new div inside this element, this is where we will create our map
                $element.append('<div id=' + $attrs.id + '></div>');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function(scope, element, attrs, controller) {

                    // update scope in response to map events and
                    // update map in response to changes in scope properties
                    controller.bindMapEvents(scope, attrs);

                };
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriLegend
     * @restrict EA
     * @element
     *
     * @description
     * Show a legend for the map in the specified element on the page.
     * The legend directive **must** be placed within an esri-map directive,
     * but the target element (that will contain the legend) can be anywhere
     * on the page.
     * 
     * ## Examples
     * - {@link ../#/examples/legend Legend}
     * - {@link ../#/examples/web-map Web Map}
     * - {@link ../#/examples/additional-map-options Additional Map Options}
     *
     * @param {string} target-id The id of the element where you want to place the legend
     */
    angular.module('esri.map')
        .directive('esriLegend', function($q, esriLoader) {
            return {
                //run last
                priority: -10,
                restrict: 'EA',
                // require the esriMap controller
                // you can access these controllers in the link function
                require: ['?esriLegend', '^esriMap'],
                replace: true,

                scope: {},
                controllerAs: 'legendCtrl',
                bindToController: true,

                controller: function() {},

                // now we can link our directive to the scope, but we can also add it to the map
                link: function(scope, element, attrs, controllers) {

                    // controllers is now an array of the controllers from the 'require' option
                    // var legendController = controllers[0];
                    var mapController = controllers[1];
                    var targetId = attrs.targetId || attrs.id;
                    var legendDeferred = $q.defer();

                    esriLoader.require(['esri/dijit/Legend'], function(Legend) {
                        mapController.getMap().then(function(map) {
                            var createLegend = function(map) {
                                var legend;

                                var options = {
                                    map: map
                                };

                                var layerInfos = mapController.getLayerInfos();
                                if (layerInfos) {
                                    options.layerInfos = layerInfos;
                                }

                                legend = new Legend(options, targetId);
                                legend.startup();

                                scope.$watchCollection(function() {
                                    return mapController.getLayerInfos();
                                }, function(newValue /*, oldValue, scope*/ ) {
                                    legend.refresh(newValue);
                                });

                                legendDeferred.resolve(legend);

                                scope.$on('$destroy', function() {
                                    legend.destroy();
                                });
                            };

                            if (!map.loaded) {
                                map.on('load', function() {
                                    createLegend(map);
                                });
                            } else {
                                createLegend(map);
                            }
                        });
                    });
                }
            };
        });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the controllers of the esri-feature-layer, esri-dynamic-map-service-layer
     * and esri-vector-tile-layer directives to provide several shared supporting methods.
     */
    angular.module('esri.map').controller('EsriLayerControllerBase', function EsriLayerControllerBase() {

        // test if a string value (i.e. directive attribute value) is true
        function isTrue(val) {
            return val === true || val === 'true';
        }

        /**
         * @ngdoc function
         * @name getLayerOptions
         * @methodOf esri.map.controller:EsriLayerControllerBase
         *
         * @description
         * Formats and prepares common layer options from layer controller properties.
         *
         * @returns {Object} A layer options object for layer construction.
         */
        this.getLayerOptions = function () {

            // read options passed in as either a JSON string expression
            // or as a function bound object
            var layerOptions = this.layerOptions() || {};

            // visible takes precedence over layerOptions.visible
            if (typeof this.visible !== 'undefined') {
                layerOptions.visible = isTrue(this.visible);
            }

            // opacity takes precedence over layerOptions.opacity
            if (this.opacity) {
                layerOptions.opacity = Number(this.opacity);
            }

            return layerOptions;
        };

        /**
         * @ngdoc function
         * @name getLayerInfo
         * @methodOf esri.map.controller:EsriLayerControllerBase
         *
         * @description
         * Gets layer info from layer and directive attributes.
         *
         * @param {FeatureLayer | ArcGISDynamicMapServiceLayer} layer Layer to get layerInfo for.
         * @param {Object} attrs Bound attribute properties such as `title`, `hideLayers`, or `defaultSymbol`.
         *
         * @returns {Object} A layerInfo object, which is needed for the esri-legend directive.
         *  See {@link https://developers.arcgis.com/javascript/jsapi/legend-amd.html#legend1 layerInfo} for object specification.
         */
        this.getLayerInfo = function(layer, attrs) {
            return {
                title: attrs.title || layer.name,
                layer: layer,
                hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',').map(Number) : undefined,
                defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
            };
        };

        // get common layer options from layer controller properties
        this._bindLayerEvents = function(scope, attrs, layer, mapController) {

            // call load handler (if any)
            if (attrs.load) {
                if (layer.loaded) {
                    // layer is already loaded
                    // make layer object available to caller immediately
                    scope.layerCtrl.load()(layer);
                } else {
                    // layer is not yet loaded
                    // wait for load event, and then make layer object available
                    layer.on('load', function() {
                        scope.$apply(function() {
                            scope.layerCtrl.load()(layer);
                        });
                    });
                }
            }

            // call updateEnd handler (if any)
            if (attrs.updateEnd) {
                layer.on('update-end', function(e) {
                    scope.$apply(function() {
                        scope.layerCtrl.updateEnd()(e);
                    });
                });
            }

            // watch the scope's visible property for changes
            // set the visibility of the feature layer
            scope.$watch('layerCtrl.visible', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setVisibility(isTrue(newVal));
                }
            });

            // watch the scope's opacity property for changes
            // set the opacity of the feature layer
            scope.$watch('layerCtrl.opacity', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setOpacity(Number(newVal));
                }
            });

            // remove the layer from the map when the layer scope is destroyed
            scope.$on('$destroy', function() {
                mapController.removeLayer(layer);
            });
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriFeatureLayerController
     *
     * @requires $controller
     * @requires esri.core.factory:esriLayerUtils
     * @requires esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the esri-feature-layer directive to construct the layer,
     * provide it with several supporting methods,
     * and help bind layer events and other properties such as layer visibility.
     */
    angular.module('esri.map').controller('EsriFeatureLayerController', function EsriFeatureLayerController($controller, esriLayerUtils) {

        var layerPromise;

        // extends layer controller base class
        angular.extend(this, $controller('EsriLayerControllerBase'));

        /**
         * @ngdoc function
         * @name getFeatureLayerOptions
         * @methodOf esri.map.controller:EsriFeatureLayerController
         *
         * @description
         * Formats and prepares feature layer options from layer controller properties.
         * In addition to {@link esri.map.controller:EsriLayerControllerBase#methods_getlayeroptions EsriLayerControllerBase.getLayerOptions()},
         * it also sets the definitionExpression on the returned options object.
         *
         * @returns {Object} A layer options object for layer construction.
         */
        this.getFeatureLayerOptions = function() {
            var layerOptions = this.getLayerOptions();
            // definitionExpression takes precedence over layerOptions.definitionExpression
            if (this.definitionExpression) {
                layerOptions.definitionExpression = this.definitionExpression;
            }

            return layerOptions;
        };

        /**
         * @ngdoc function
         * @name getLayer
         * @methodOf esri.map.controller:EsriFeatureLayerController
         *
         * @returns {Promise} Returns a $q style promise resolved with an instance of
         *  {@link https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#featurelayer1 FeatureLayer}
         */
        this.getLayer = function() {
            return layerPromise;
        };

        /**
         * @ngdoc function
         * @name setInfoTemplate
         * @methodOf esri.map.controller:EsriFeatureLayerController
         *
         * @description
         * Sets the InfoTemplate once the layer has been loaded.
         *
         * @param {Object|Array} infoTemplate Either an array with `['title', 'content']` or an object with `{title: 'title', content: 'content'}`
         */
        this.setInfoTemplate = function(infoTemplate) {
            return this.getLayer().then(function(layer) {
                return esriLayerUtils.createInfoTemplate(infoTemplate).then(function(infoTemplateObject) {
                    layer.setInfoTemplate(infoTemplateObject);
                    return infoTemplateObject;
                });
            });
        };

        /**
         * @ngdoc function
         * @name bindLayerEvents
         * @methodOf esri.map.controller:EsriFeatureLayerController
         *
         * @description
         * Binds esri-feature-layer directive attributes to layer properties and events,
         * such as the visibility and definitionExpression.
         *
         * @param {Object} scope Isolate scope for layer directive controller
         * @param {Object} attrs Attribute properties
         * @param {FeatureLayer} layer The layer to bind properties and events to.
         * @param {EsriMapController} mapController The map controller is also required to help remove the layer
         *  from the map when the layer scope is destroyed.
         */
        this.bindLayerEvents = function(scope, attrs, layer, mapController) {
            // bind directive attributes to layer properties and events
            this._bindLayerEvents(scope, attrs, layer, mapController);

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

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriFeatureLayer
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This directive creates a {@link https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html FeatureLayer}
     * and adds it to the map.
     * This directive **must** be placed within an esri-map directive.
     *
     * ## Examples
     * - {@link ../#/examples/feature-layers Feature Layers}
     * - {@link ../#/examples/add-remove-layers Add/Remove Layers}
     * - {@link ../#/examples/layer-events Layer Events}
     * - {@link ../#/examples/no-basemap No Basemap}
     * - and more...
     *
     * @param {String} url The url to the ArcGIS Server REST layer resource.
     * @param {Boolean=} visible The visibility of the layer. Two-way bound.
     * @param {Number=} opacity The opacity of the layer. Two-way bound.
     * @param {String=} definition-expression The definition expression where clause. Two-way bound.
     * @param {Function=} load Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#event-load load event}.
     * @param {Function=} update-end Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#event-update-end update-end event}.
     * @param {Object | String=} layer-options An object or inline object hash string defining additional layer constructor options.
     */
    angular.module('esri.map').directive('esriFeatureLayer', function() {
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

            controllerAs: 'layerCtrl',

            bindToController: true,

            // define an interface for working with this directive
            controller: 'EsriFeatureLayerController',

            // now we can link our directive to the scope, but we can also add it to the map
            link: function(scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // get the layer object
                layerController.getLayer().then(function(layer){
                    // get layer info from layer object and directive attributes
                    var layerInfo = layerController.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    mapController.addLayer(layer, 0);
                    mapController.addLayerInfo(layerInfo);

                    // bind directive attributes to layer properties and events
                    layerController.bindLayerEvents(scope, attrs, layer, mapController);
                });
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriDynamicMapServiceLayerController
     *
     * @requires $controller
     * @requires esri.core.factory:esriLayerUtils
     * @requires esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the esri-dynamic-map-service-layer directive to construct the layer,
     * provide it with several supporting methods,
     * and help bind layer events and other properties such as layer visibility.
     */
    angular.module('esri.map').controller('EsriDynamicMapServiceLayerController', function EsriDynamicMapServiceLayerController($controller, esriLayerUtils) {

        var layerPromise;

        // extends layer controller base class
        angular.extend(this, $controller('EsriLayerControllerBase'));

        /**
         * @ngdoc function
         * @name getLayer
         * @methodOf esri.map.controller:EsriDynamicMapServiceLayerController
         *
         * @returns {Promise} Returns a $q style promise resolved with an instance of
         *  {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1 ArcGISDynamicMapServiceLayer}
         */
        this.getLayer = function () {
            return layerPromise;
        };

        /**
         * @ngdoc function
         * @name setInfoTemplate
         * @methodOf esri.map.controller:EsriDynamicMapServiceLayerController
         *
         * @description
         * Sets the InfoTemplate once the layer has been loaded.
         *
         * @param {String} layerId The sublayer id to which the InfoTemplate should be connected to.
         * @param {Object|Array} infoTemplate Either an array with `['title', 'content']` or an object with `{title: 'title', content: 'content'}`
         */
        this.setInfoTemplate = function(layerId, infoTemplate) {
            return this.getLayer().then(function(layer) {
                return esriLayerUtils.createInfoTemplate(infoTemplate).then(function(infoTemplateObject) {
                    // check if layer has info templates defined
                    var infoTemplates = layer.infoTemplates;
                    if (!infoTemplates) {
                        // create a new info templates hash
                        infoTemplates = {};
                    }
                    // set the info template for sublayer
                    // NOTE: ignoring layerUrl and resourceInfo for now
                    // https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1
                    infoTemplates[layerId] = {
                        infoTemplate: infoTemplateObject
                    };
                    layer.setInfoTemplates(infoTemplates);
                    return infoTemplates;
                });
            });
        };

        /**
         * @ngdoc function
         * @name bindLayerEvents
         * @methodOf esri.map.controller:EsriDynamicMapServiceLayerController
         *
         * @description
         * Binds esri-dynamic-map-service-layer directive attributes to layer properties and events,
         * such as the visibility and opacity.
         *
         * @param {Object} scope Isolate scope for layer directive controller
         * @param {Object} attrs Attribute properties
         * @param {ArcGISDynamicMapServiceLayer} layer The layer to bind properties and events to.
         * @param {EsriMapController} mapController The map controller is also required to help remove the layer
         *  from the map when the layer scope is destroyed.
         */
        this.bindLayerEvents = function(scope, attrs, layer, mapController) {
            // bind directive attributes to layer properties and events
            this._bindLayerEvents(scope, attrs, layer, mapController);
        };

        // create the layer
        layerPromise = esriLayerUtils.createDynamicMapServiceLayer(this.url, this.getLayerOptions(), this.visibleLayers);
    });

})(angular);

(function (angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriDynamicMapServiceLayer
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This directive creates an
     * {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html ArcGISDynamicMapServiceLayer}
     * and adds it to the map.
     * This directive **must** be placed within an esri-map directive.
     *
     * ## Examples
     * - {@link ../#/examples/dynamic-map-service-layer Dynamic Map Service Layer}
     * - {@link ../#/examples/dynamic-map-service-layers Multiple Dynamic Map Service Layers}
     * - {@link ../#/examples/layer-events Layer Events}
     *
     * @param {String} url The url to the ArcGIS Server REST map service resource.
     * @param {Boolean=} visible The visibility of the layer. Two-way bound.
     * @param {Number=} opacity The opacity of the layer. Two-way bound.
     * @param {Array|String=} visible-layers The visible sublayer ids of the map service,
     *  either an array of integers or a string of comma-separated integers. Two-way bound.
     * @param {Function=} load Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#event-load load event}.
     * @param {Function=} update-end Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#event-update-end update-end event}.
     * @param {Object | Function=} layer-options An object or inline object hash string defining additional layer constructor options.
     */
    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function () {
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

            controllerAs: 'layerCtrl',

            bindToController: true,

            // define an interface for working with this directive
            controller: 'EsriDynamicMapServiceLayerController',

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // get the layer object
                layerController.getLayer().then(function(layer){

                    // get layer info from layer object and directive attributes
                    var layerInfo = layerController.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    mapController.addLayer(layer);
                    mapController.addLayerInfo(layerInfo);

                    // bind directive attributes to layer properties and events
                    layerController.bindLayerEvents(scope, attrs, layer, mapController);
                });
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriVectorTileLayerController
     *
     * @requires $controller
     * @requires esri.core.factory:esriLayerUtils
     * @requires esri.map.controller:EsriLayerControllerBase
     *
     * @description
     * This controller is used by the esri-vector-tile-layer directive to construct the layer,
     * provide it with several supporting methods,
     * and help bind layer events and other properties such as layer visibility.
     */
    angular.module('esri.map').controller('EsriVectorTileLayerController', function EsriVectorTileLayerController($controller, esriLayerUtils) {

        var layerPromise;

        // extends layer controller base class
        angular.extend(this, $controller('EsriLayerControllerBase'));

        /**
         * @ngdoc function
         * @name getLayer
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @returns {Promise} Returns a $q style promise resolved with an instance of
         *  {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html#vectortilelayer1 VectorTileLayer}
         */
        this.getLayer = function() {
            return layerPromise;
        };

        /**
         * @ngdoc function
         * @name bindLayerEvents
         * @methodOf esri.map.controller:EsriVectorTileLayerController
         *
         * @description
         * Binds esri-vector-tile-layer directive attributes to layer properties and events,
         * such as the visibility and opacity.
         *
         * @param {Object} scope Isolate scope for layer directive controller
         * @param {Object} attrs Attribute properties
         * @param {VectorTileLayer} layer The layer to bind properties and events to.
         * @param {EsriMapController} mapController The map controller is also required to help remove the layer
         *  from the map when the layer scope is destroyed.
         */
        this.bindLayerEvents = function(scope, attrs, layer, mapController) {
            // bind directive attributes to layer properties and events
            this._bindLayerEvents(scope, attrs, layer, mapController);
        };

        // create the layer
        layerPromise = esriLayerUtils.createVectorTileLayer(this.url, this.getLayerOptions());
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriVectorTileLayer
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This directive creates a {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html VectorTileLayer}
     * and adds it to the map.
     * This directive **must** be placed within an esri-map directive.
     *
     * ## Examples
     * - {@link ../#/examples/vector-tile-layer Vector Tile Layer}
     *
     * @param {String} url The url to the ArcGIS Server REST layer resource.
     * @param {Boolean=} visible The visibility of the layer. Two-way bound.
     * @param {Number=} opacity The opacity of the layer. Two-way bound.
     * @param {Function=} load Callback for layer
     *  {@link https://developers.arcgis.com/javascript/jsapi/vectortilelayer-amd.html#event-load load event}.
     * @param {Object | String=} layer-options An object or inline object hash string defining additional layer constructor options.
     */
    angular.module('esri.map').directive('esriVectorTileLayer', function() {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriVectorTileLayer to be used as an element (<esri-vector-tile-layer>)
            restrict: 'E',

            // require the esriVectorTileLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriVectorTileLayer', '^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // isolate scope for vector tile layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                // function binding for event handlers
                load: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            controllerAs: 'layerCtrl',

            bindToController: true,

            // define an interface for working with this directive
            controller: 'EsriVectorTileLayerController',

            // now we can link our directive to the scope, but we can also add it to the map
            link: function(scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // get the layer object
                layerController.getLayer().then(function(layer){
                    // get layer info from layer object and directive attributes
                    var layerInfo = layerController.getLayerInfo(layer, attrs);

                    // add the layer to the map
                    mapController.addLayer(layer);
                    mapController.addLayerInfo(layerInfo);

                    // bind directive attributes to layer properties and events
                    layerController.bindLayerEvents(scope, attrs, layer, mapController);
                });
            }
        };
    });

})(angular);

(function (angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriInfoTemplate
     * @restrict E
     * @element
     *
     * @description
     * This directive creates an
     * {@link https://developers.arcgis.com/javascript/jsapi/infotemplate-amd.html InfoTemplate}
     * and binds it to a layer to provide "popup" information functionality when clicking on the visible layer in the map.
     * This directive **must** be placed within an esri-feature-layer directive or esri-dynamic-map-service-layer directive.
     * 
     * ## Examples
     * - {@link ../#/examples/dynamic-map-service-layers Multiple Dynamic Map Service Layers}
     *
     * <pre>
     *   <!-- The title is provided as an attribute parameter
     *   but the content is the entire inner HTML -->
     *
     *   <esri-info-template title="Parks">
     *      <span>${PARK_NAME}</span>
     *      <span>This park had ${TOTAL_VISITS_2014} visitors in 2014</span>
     *   </esri-info-template>
     * </pre>
     *
     * @param {String=} layer-id The layer id to which the InfoTemplate should be connected to.
     *  **Note:** This is only applicable when the parent directive is an esri-dynamic-map-service-layer.
     * @param {String=} title The title of the template.
     * @param {String | Node[]=} content **Note:** The content of the template is provided as inner HTML to this directive.
     * 
     */
    angular.module('esri.map').directive('esriInfoTemplate', function () {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriInfoTemplate to be used as an element (<esri-feature-layer>)
            restrict: 'E',

            // require the esriInfoTemplate to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['?esriInfoTemplate', '?^esriDynamicMapServiceLayer', '?^esriFeatureLayer'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            compile: function($element) {

                // get info template content from element inner HTML
                var content = $element.html();

                // clear element inner HTML
                $element.html('');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function (scope, element, attrs, controllers) {
                    // controllers is now an array of the controllers from the 'require' option
                    // var templateController = controllers[0];
                    var dynamicMapServiceLayerController = controllers[1];
                    var featureLayerController = controllers[2];
                    
                    if (dynamicMapServiceLayerController) {
                        dynamicMapServiceLayerController.setInfoTemplate(attrs.layerId, {
                            title: attrs.title,
                            content: content
                        });
                    }
                    
                    if (featureLayerController) {
                        featureLayerController.setInfoTemplate({
                            title: attrs.title,
                            content: content
                        });
                    }
                };
            }
        };
    });

})(angular);
