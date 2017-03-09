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
     * Use `esriLoader` to lazy load the ArcGIS API for JavaScript or to require individual API modules.
     */
    angular.module('esri.core').factory('esriLoader', ['$q', function ($q) {

        /**
         * @ngdoc function
         * @name bootstrap
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Loads the ArcGIS API for JavaScript.
         *
         * @param {Object=} options Send a list of options of how to load the ArcGIS API for JavaScript.
         *  This defaults to `{url: '//js.arcgis.com/4.3'}`.
         *
         * @return {Promise} Returns a $q style promise which is resolved once the ArcGIS API for JavaScript has been loaded.
         */
        function bootstrap(options) {
            var deferred = $q.defer();

            // Default options object to empty hash
            var opts = options || {};

            // Don't reload API if it is already loaded
            if (isLoaded()) {
                deferred.reject('ArcGIS API for JavaScript is already loaded.');
                return deferred.promise;
            }

            // Create Script Object to be loaded
            var script    = document.createElement('script');
            script.type   = 'text/javascript';
            script.src    = opts.url || window.location.protocol + '//js.arcgis.com/4.3';

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
         * @return {Boolean} Returns a boolean if the ArcGIS API for JavaScript is already loaded.
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
         * Load an Esri module(s) using the Dojo AMD loader.
         *
         * @param {Array|String} modules  An array of module strings (or a string of a single module) to be loaded.
         * @param {Function=} callback An optional function used to support AMD style loading.
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded.
         */
        function requireModule(moduleName, callback){
            var deferred = $q.defer();

            // Throw Error if Esri is not loaded yet
            if (!isLoaded()) {
                deferred.reject('Trying to call esriLoader.require(), but the ArcGIS API for JavaScript has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading the ArcGIS API for JavaScript.');
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
    }]);

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriRegistry
     *
     * @description
     * Use `esriRegistry` to store and retrieve MapView or SceneView instances for use in different controllers.
     *
     * ## Examples
     * - {@link ../#/examples/registry-pattern Registry Pattern}
     */
    angular.module('esri.core').service('esriRegistry', ['$q', function($q) {
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
             * Get the MapView or SceneView instance registered with the given name.
             * See {@link esri.map.directive:esriMapView esriMapView} or
             * {@link esri.map.directive:esriSceneView esriSceneView}
             * for info on how to register a map using the `register-as` attribute.
             *
             * @param {String} name The name that the view was registered with.
             *
             * @return {Promise} Returns a $q style promise which is resolved with the view once it has been loaded.
             */
            get: function(name) {
                // If something is already in the registry return its promise ASAP.
                // This is the case where you might want to get a registry item in an event handler.
                if (registry[name]) {
                    return registry[name].promise;
                }

                // If we dont already have a registry item create one. This covers the
                // case where the directive is nested inside the controller. The parent
                // controller will be executed and gets a promise that will be resolved
                // later when the item is registered
                var deferred = $q.defer();

                registry[name] = deferred;

                return deferred.promise;
            }
        };
    }]);

})(angular);
