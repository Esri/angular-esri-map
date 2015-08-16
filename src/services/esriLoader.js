(function(angular) {
    'use strict';

    angular.module('esri.map', []);

    /**
     * @ngdoc provider
     * @name esriLoader
     * @description
     * Use `esriLoader` to lazyload the ESRI ArcGIS API or to require API modules.
     */
    angular.module('esri.map').factory('esriLoader', function ($q) {

        /**
         * Load the ESRI ArcGIS API
         *
         * @param {Object} options Send a list of options of how to load the API.
         * @param {String} options.url the url to load the ESRI API, defaults to http://js.arcgis.com/3.13compact
         * @return {Promise} Returns a $q style which is resolved once the ESRI API has loaded.
         */
        function bootstrap(options) {
          var deferred = $q.defer();

          // Don't reload API if it is already loaded
          if ( angular.isDefined(window.esri) ) {
            deferred.reject('ESRI API is already loaded.');
          }

          // Default options object to empty hash
          options = angular.isDefined(options) ? options : {};

          // Create Script Object to be loaded
          var script    = document.createElement('script');
          script.type   = 'text/javascript';
          script.src    = options.url || 'http://js.arcgis.com/3.13compact';

          // Set onload callback to resolve promise
          script.onload = function() { deferred.resolve( window.esri ); };

          document.body.appendChild(script);

          return deferred.promise;
        }

        /** Check if the ESRI ArcGIS API is loaded
         * @return {Boolean} Returns a boolean if ESRI ArcGIS ASK is, in fact, loaded
         */
        function isLoaded() {
          return angular.isDefined(window.esri);
        }

        /**
         * Load ESRI Module, this will use dojo's AMD loader
         *
         * @param {String|Array} modules A string of a module or an array of modules to be loaded.
         * @param {Function} optional callback function used to support AMD style loading, promise and callback are both add to the event loop, possible race condition.
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded
         */
        function requireModule(moduleName, callback){
          var deferred = $q.defer();

          // Throw Error if ESRI is not loaded yet
          if ( !isLoaded() ) {
            deferred.reject('Trying to call esriLoader.require(), but esri API has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading esri ArcGIS API.');
            return deferred.promise;
          }
          if (angular.isString(moduleName)) {
            require([moduleName], function (module) {

              // Check if callback exists, and execute if it does
              if ( callback && angular.isFunction(callback) ) {
                  callback(module);
              }
              deferred.resolve(module);
            });
          }
          else if (angular.isArray(moduleName)) {
            require(moduleName, function () {

              var args = Array.prototype.slice.call(arguments)

              // callback check, sends modules loaded as arguments
              if ( callback && angular.isFunction(callback) ) {
                  callback.apply(this, args);
              }

              // Grab all of the modules pass back from require callback and send as array to promise.
              deferred.resolve(args);
            });
          }
          else {
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
