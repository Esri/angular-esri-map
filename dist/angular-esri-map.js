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
         * @param {String} options.url the url to load the ESRI API, defaults to http://js.arcgis.com/3.14compact
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
          script.src    = options.url || 'http://js.arcgis.com/3.14compact';

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

              var args = Array.prototype.slice.call(arguments);

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

(function (angular) {
  'use strict';

  angular.module('esri.map').service('esriRegistry', function ($q) {
    var registry = {};

    return {
      _register: function(name, deferred){
        // if there isn't a promise in the registry yet make one...
        // this is the case where a directive is nested higher then the controller
        // needing the instance
        if (!registry[name]){
          registry[name] = $q.defer();
        }

        var instance = registry[name];

        // when the deferred from the directive is rejected/resolved
        // reject/resolve the promise in the registry with the appropriate value
        deferred.promise.then(function(arg){
          instance.resolve(arg);
          return arg;
        }, function(arg){
          instance.reject(arg);
          return arg;
        });

        return function(){
          delete registry[name];
        };
      },

      get: function(name){
        // is something is already in the registry return its promise ASAP
        // this is the case where you might want to get a registry item in an
        // event handler
        if(registry[name]){
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

    angular.module('esri.map').directive('esriMap', function($q, $timeout, esriRegistry) {

        // update two-way bound scope properties based on map state
        function updateScopeFromMap(scope, map) {
            var geoCenter = map.geographicExtent && map.geographicExtent.getCenter();
            if (geoCenter) {
                scope.center = {
                    lat: geoCenter.y,
                    lng: geoCenter.x
                };
            }
            scope.zoom = map.getZoom();
        }

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

            // replace tag with div with same id
            compile: function($element, $attrs) {
                // remove the id attribute from the main element
                $element.removeAttr('id');

                // append a new div inside this element, this is where we will create our map
                $element.append('<div id=' + $attrs.id + '></div>');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                /*jshint unused: false*/
                return function(scope, element, attrs, controller) {};
            },

            // directive api
            controller: function($scope, $element, $attrs) {
                // get a reference to the controller
                var self = this;

                // only do this once per directive
                // this deferred will be resolved with the map
                var mapDeferred = $q.defer();

                // add this map to the registry
                if ($attrs.registerAs) {
                    var deregister = esriRegistry._register($attrs.registerAs, mapDeferred);

                    // remove this from the registry when the scope is destroyed
                    $scope.$on('$destroy', deregister);
                }

                require(['esri/map', 'esri/arcgis/utils', 'esri/geometry/Extent', 'esri/dijit/Popup'], function(Map, arcgisUtils, Extent, Popup) {
                    // setup our mapOptions based on object hash from attribute string
                    // or from scope object property
                    var mapOptions = $scope.mapOptions() || {};

                    // construct optional Extent for mapOptions
                    if (mapOptions.hasOwnProperty('extent')) {
                        // construct if parent controller isn'tsupplying a valid and already constructed Extent
                        // e.g. if the controller or HTML view are only providing JSON
                        if (mapOptions.extent.declaredClass !== 'esri.geometry.Extent') {
                            mapOptions.extent = new Extent(mapOptions.extent);
                        }
                    }

                    // construct optional infoWindow from mapOptions
                    // default to a new Popup dijit for now
                    if (mapOptions.hasOwnProperty('infoWindow')) {
                        mapOptions.infoWindow = new Popup(mapOptions.infoWindow.options, mapOptions.infoWindow.srcNodeRef);
                    }

                    // check for 1 way bound properties (basemap)
                    // $scope.basemap takes precedence over $scope.mapOptions.basemap
                    if ($scope.basemap) {
                        mapOptions.basemap = $scope.basemap;
                    }

                    // check for 2 way bound properties (center and zoom)
                    // $scope.center takes precedence over $scope.mapOptions.center
                    if ($scope.center) {
                        if ($scope.center.lng && $scope.center.lat) {
                            mapOptions.center = [$scope.center.lng, $scope.center.lat];
                        } else {
                            mapOptions.center = $scope.center;
                        }
                    }

                    // $scope.zoom takes precedence over $scope.mapOptions.zoom
                    if ($scope.zoom) {
                        mapOptions.zoom = $scope.zoom;
                    }

                    // initialize map and resolve the deferred
                    if ($attrs.webmapId) {
                        // load map object from web map
                        arcgisUtils.createMap($attrs.webmapId, $attrs.id, {
                            mapOptions: mapOptions
                        }).then(function(response) {
                            // update layer infos for legend
                            self.layerInfos = arcgisUtils.getLegendLayers(response);
                            // add item info to scope
                            $scope.itemInfo = response.itemInfo;
                            // resolve the promise with the map
                            mapDeferred.resolve(response.map);
                        });
                    } else {
                        // create a new map object
                        var map = new Map($attrs.id, mapOptions);
                        // resolve the promise with the map
                        mapDeferred.resolve(map);
                    }

                    mapDeferred.promise.then(function(map) {
                        if (map.loaded) {
                            // map already loaded, we need to
                            // update two-way bound scope properties
                            updateScopeFromMap($scope, map);
                            // make map object available to caller
                            // by calling the load event handler
                            if ($attrs.load) {
                                $scope.load()(map);
                            }
                        } else {
                            // map is not yet loaded, this means that
                            // two-way bound scope properties
                            // will be updated by extent-change handler below
                            // so don't need to update them here
                            // just set up a handler for the map load event (if any)
                            if ($attrs.load) {
                                map.on('load', function() {
                                    $scope.$apply(function() {
                                        $scope.load()(map);
                                    });
                                });
                            }
                        }

                        // listen for changes to $scope.basemap and update map
                        $scope.$watch('basemap', function(newBasemap, oldBasemap) {
                            if (map.loaded && newBasemap !== oldBasemap) {
                                map.setBasemap(newBasemap);
                            }
                        });

                        // listen for changes to $scope.center and $scope.zoom and update map
                        $scope.inUpdateCycle = false;
                        if (!angular.isUndefined($scope.center) || !angular.isUndefined($scope.zoom)) {
                            $scope.$watchGroup(['center.lng', 'center.lat', 'zoom'], function(newCenterZoom/*, oldCenterZoom*/) {
                                if ($scope.inUpdateCycle) {
                                    return;
                                }
                                if (newCenterZoom[0] !== '' && newCenterZoom[1] !== '' && newCenterZoom[2] !== '') {
                                    // prevent circular updates between $watch and $apply
                                    $scope.inUpdateCycle = true;
                                    map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]).then(function() {
                                        $scope.inUpdateCycle = false;
                                    });
                                }
                            });
                        }

                        // listen for changes to map extent and
                        // call extent-change handler (if any)
                        // also update $scope.center and $scope.zoom
                        map.on('extent-change', function(e) {
                            if ($attrs.extentChange) {
                                $scope.extentChange()(e);
                            }
                            // prevent circular updates between $watch and $apply
                            if ($scope.inUpdateCycle) {
                                return;
                            }
                            $scope.inUpdateCycle = true;
                            $scope.$apply(function() {
                                // update scope properties
                                updateScopeFromMap($scope, map);
                                $timeout(function() {
                                    // this will be executed after the $digest cycle
                                    $scope.inUpdateCycle = false;
                                }, 0);
                            });
                        });

                        // clean up
                        $scope.$on('$destroy', function() {
                            map.destroy();
                        });
                    });
                });

                // method returns the promise that will be resolved with the map
                this.getMap = function() {
                    return mapDeferred.promise;
                };

                // adds the layer, returns the promise that will be resolved with the result of map.addLayer
                this.addLayer = function(layer) {
                    return this.getMap().then(function(map) {
                        return map.addLayer(layer);
                    });
                };

                // array to store layer info, needed for legend
                this.addLayerInfo = function(lyrInfo) {
                    if (!this.layerInfos) {
                        this.layerInfos = [lyrInfo];
                    } else {
                        this.layerInfos.push(lyrInfo);
                    }
                };
                this.getLayerInfos = function() {
                    return this.layerInfos;
                };
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriFeatureLayer', function ($q) {
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

            // define an interface for working with this directive
            controller: function ($scope, $element, $attrs) {
                var layerDeferred = $q.defer();

                require([
                    'esri/layers/FeatureLayer'], function (FeatureLayer) {
                    var layer = new FeatureLayer($attrs.url);

                    layerDeferred.resolve(layer);
                });

                // return the defered that will be resolved with the feature layer
                this.getLayer = function () {
                    return layerDeferred.promise;
                };

                // set the visibility of the feature layer
                this.setVisible = function (isVisible) {
                    var visibleDeferred = $q.defer();

                    this.getLayer().then(function (layer) {
                        if (isVisible) {
                            layer.show();
                        } else {
                            layer.hide();
                        }

                        visibleDeferred.resolve();
                    });

                    return visibleDeferred.promise;
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                var visible = attrs.visible || 'true';
                var isVisible = scope.$eval(visible);

                // set the initial visible state of the feature layer
                layerController.setVisible(isVisible);

                // add a $watch condition on the visible attribute, if it changes and the new value is different than the previous, then use to
                // set the visibility of the feature layer
                scope.$watch(function () { return scope.$eval(attrs.visible); }, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        layerController.setVisible(newVal);
                    }
                });

                layerController.getLayer().then(function (layer) {
                    // add layer
                    mapController.addLayer(layer);

                    //look for layerInfo related attributes. Add them to the map's layerInfos array for access in other components
                    mapController.addLayerInfo({
                      title: attrs.title || layer.name,
                      layer: layer,
                      hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',') : undefined,
                      defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
                    });

                    // return the layer
                    return layer;
                });
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esriApp.directive:esriLegend
     * @description
     * # esriLegend
     */
    angular.module('esri.map')
      .directive('esriLegend', function ($document, $q) {
        return {
          //run last
          priority: -10,
          scope:{},
          replace: true,
          // require the esriMap controller
          // you can access these controllers in the link function
          require: ['^esriMap'],

          // now we can link our directive to the scope, but we can also add it to the map..
          link: function(scope, element, attrs, controllers){
            // controllers is now an array of the controllers from the 'require' option
            var mapController = controllers[0];
            var targetId = attrs.targetId || attrs.id;
            var legendDeferred = $q.defer();

            require(['esri/dijit/Legend', 'dijit/registry'], function (Legend, registry) {
              mapController.getMap().then(function(map) {
                var opts = {
                    map: map
                };
                var layerInfos = mapController.getLayerInfos();
                if (layerInfos) {
                  opts.layerInfos = layerInfos;
                }
                // NOTE: need to come up w/ a way to that is not based on id
                // or handle destroy at end of this view's lifecyle
                var legend = registry.byId(targetId);
                if (legend) {
                  legend.destroyRecursive();
                }
                legend = new Legend(opts, targetId);
                legend.startup();
                scope.layers = legend.layers;
                angular.forEach(scope.layers, function(layer, i) {
                  scope.$watch('layers['+i+'].renderer',function() {
                    legend.refresh();
                  });
                });
                legendDeferred.resolve(legend);
              });
            });
          }
        };
      });

})(angular);
