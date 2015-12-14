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
            script.src    = opts.url || 'http://js.arcgis.com/3.15compact';

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
            if ( !isLoaded() ) {
                deferred.reject('Trying to call esriLoader.require(), but esri API has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading esri ArcGIS API.');
                return deferred.promise;
            }
            if (typeof moduleName === 'string') {
                require([moduleName], function (module) {

                    // Check if callback exists, and execute if it does
                    if (callback && typeof callback === 'function') {
                        callback(module);
                    }
                    deferred.resolve(module);
                });
            }
            else if (moduleName instanceof Array) {
                require(moduleName, function () {

                    var args = Array.prototype.slice.call(arguments);

                    // callback check, sends modules loaded as arguments
                    if (callback && typeof callback === 'function') {
                        callback.apply(this, args);
                    }

                    // Grab all of the modules pass back from require callback and send as array to promise.
                    deferred.resolve(args);
                });
            } else {
                deferred.reject('An Array<String> or String is required to load modules.');
            }

            return deferred.promise;
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
     * @name esri.core.factory:esriMapViewUtils
     *
     * @description
     * Functions to help create map view instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriMapViewUtils', function esriMapViewUtils(esriLoader) {
        var service = {};

        /**
         * @ngdoc function
         * @name createMapView
         * @methodOf esri.core.factory:esriMapViewUtils
         *
         * @description
         * Create a map view instance
         *
         * @param {Object} options map view options.
         *
         * @return {Promise} Returns a $q style promise which is
         * resolved with an object with a `view` property that refers to the map view
         */
        service.createMapView = function(options) {
            return esriLoader.require('esri/views/MapView').then(function(MapView) {
                return {
                    view: new MapView(options)
                };
            });
        };
        return service;
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriSceneViewUtils
     *
     * @description
     * Functions to help create map view instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.core').factory('esriSceneViewUtils', function esriSceneViewUtils(esriLoader) {
        var service = {};

        /**
         * @ngdoc function
         * @name createSceneView
         * @methodOf esri.core.factory:esriSceneViewUtils
         *
         * @description
         * Create a map view instance
         *
         * @param {Object} options map view options.
         *
         * @return {Promise} Returns a $q style promise which is
         * resolved with an object with a `view` property that refers to the map view
         */
        service.createSceneView = function(options) {
            return esriLoader.require('esri/views/SceneView').then(function(SceneView) {
                return {
                    view: new SceneView(options)
                };
            });
        };
        return service;
    });

})(angular);
