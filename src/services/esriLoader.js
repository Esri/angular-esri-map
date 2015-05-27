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

        return {
            bootstrap: bootstrap,
            isLoaded:  isLoaded,
            require:   requireModule
        };

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
            deferred.reject("ESRI API is already loaded.");
          }

          // Default options object to empty hash
          options = angular.isDefined(options) ? options : {};

          // Create Script Object to be loaded
          var script    = document.createElement('script');
          script.type   = 'text/javascript';
          script.src    = options.url || 'http://js.arcgis.com/3.13compact';

          // Set onload callback to resolve promise
          script.onload = function() { deferred.resolve( window.esri ); }

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
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded
         */
        function requireModule(moduleName){
          var deferred = $q.defer();
          if (angular.isString(moduleName)) {
              require([moduleName], function (module) {
                  deferred.resolve(module);
              });
          } else if (angular.isArray(moduleName)) {
              require(moduleName, function (modules) {
                  deferred.resolve(modules);
              });
          }
          else {
              deferred.reject('An Array<String> or String is required to load modules.');
          }
          return deferred.promise;
        }
    });

})(angular);
