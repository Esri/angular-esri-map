(function(angular) {
    'use strict';

    angular.module('esri.map', []).directive('esriMap', function($q, $timeout) {

        // don't apply if already in digest cycle
        // TODO: is there a better way to do this, since it's an anti-pattern:
        // https://github.com/angular/angular.js/wiki/Anti-Patterns
        function safeApply ($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                console.log('trying to apply in ' + phase);
                $scope.$eval(fn);
            } else {
                $scope.$apply(fn);
            }
        }

        function getLatLngSignificantDigits(zoom) {
            return Math.max(Math.floor(zoom / 2) - 2, 0);
        }

        return {
            // element only
            restrict: 'E',

            // isoloate scope
            scope: {
                // two-way binding for center/zoom
                // because map pan/zoom can chnage these
                center: '=',
                zoom: '=',
                // one-way binding for other properties
                basemap: '@',
                // function binding for event handlers
                load: '&',
                extentChange: '&'
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
                return function(scope, element, attrs, controller) {
                };
            },

            // directive api
            controller: function($scope, $element, $attrs) {
                // only do this once per directive
                // this deferred will be resolved with the map
                var mapDeferred = $q.defer();

                // setup our map options based on the attributes and scope
                var mapOptions = {};

                var centerTimeout,
                    tempCenterLat,
                    tempCenterLng;

                // center/zoom/extent
                // check for convenience extent attribute
                // otherwise get from scope center/zoom
                if ($attrs.extent) {
                    mapOptions.extent = $scope[$attrs.extent];
                } else {
                    if ($scope.center.lng && $scope.center.lat) {
                        mapOptions.center = [$scope.center.lng, $scope.center.lat];
                    } else if ($scope.center) {
                        mapOptions.center = $scope.center;
                    }
                    if ($scope.zoom) {
                        mapOptions.zoom = $scope.zoom;
                    }
                }

                // basemap
                if ($scope.basemap) {
                    mapOptions.basemap = $scope.basemap;
                }

                // load esri dependencies via AMD
                require(['esri/map'], function(Map) {

                    // initialize map and resolve the deferred
                    var map = new Map($attrs.id, mapOptions);
                    mapDeferred.resolve(map);

                    // make a reference to the map object available
                    // to the controller once it is loaded.
                    map.on('load', function() {
                        if (!$attrs.load) {
                            return;
                        }
                        $scope.$apply(function() {
                            $scope.load()(map);
                        });
                    });

                    // listen for changes to scope and update map
                    $scope.$watch('basemap', function(newBasemap, oldBasemap) {
                        if (map.loaded && newBasemap !== oldBasemap) {
                            map.setBasemap(newBasemap);
                        }
                    });
                    // $scope.$watch(function(scope) {
                    //     console.log('function watched');
                    //     return scope.center && scope.center.lat + ',' + scope.center.lng;
                    // }, function (newCenter, oldCenter) {
                    //     console.log('diff');
                    //     if (map.loaded && !angular.equals(newCenter, oldCenter)) {
                    //         console.log('centerAt');
                    //         map.centerAt([newCenter.lng, newCenter.lat]);
                    //     }
                    // });
                    $scope.$watch('center.lng', function(newLng, oldLng) {
                        var digits = getLatLngSignificantDigits($scope.zoom);
                        if (!map.loaded || !newLng || !oldLng || newLng.toFixed(digits) === oldLng.toFixed(digits) || !$scope.center.lat) {
                            return;
                        }
                        console.log('lng diff', newLng, oldLng);
                        if (centerTimeout) {
                            $timeout.cancel(centerTimeout);
                        }
                        tempCenterLng = newLng;
                        centerTimeout = $timeout(function() {
                            console.log('newLng', newLng, oldLng);
                            map.centerAt([tempCenterLng, tempCenterLat || $scope.center.lat]);
                            tempCenterLng = null;
                            tempCenterLat = null;
                        }, 500);
                    });
                    $scope.$watch('center.lat', function(newLat, oldLat) {
                        var digits = getLatLngSignificantDigits($scope.zoom);
                        if (!map.loaded || !newLat || !oldLat || newLat.toFixed(digits) === oldLat.toFixed(digits) || !$scope.center.lng) {
                            return;
                        }
                        console.log('lat diff', newLat, oldLat, digits);
                        if (centerTimeout) {
                            $timeout.cancel(centerTimeout);
                        }
                        tempCenterLat = newLat;
                        centerTimeout = $timeout(function() {
                            console.log('newLat', newLat, oldLat);
                            map.centerAt([tempCenterLng || $scope.center.lng, tempCenterLat]);
                            tempCenterLng = null;
                            tempCenterLat = null;
                        }, 500);
                    });
                    $scope.$watch('zoom', function(newZoom, oldZoom) {
                        if (map.loaded && newZoom !== oldZoom) {
                            map.setZoom(newZoom);
                        }
                    });

                    // // listen for map events and update scope
                    // map.on('zoom-end', function(e) {
                    //     console.log('zoom-end', e);
                    //     safeApply($scope, function() {
                    //         $scope.zoom = e.level;
                    //     });
                    // });


                    map.on('extent-change', function(e) {
                        console.log('extent-change', e);
                        safeApply($scope, function() {
                            var geoCenter, digits;
                            $scope.zoom = map.getZoom();
                            digits = getLatLngSignificantDigits($scope.zoom);

                            // TODO: get center x/y/spatialReference?
                            // $scope.center = e.extent.getCenter().toJson();

                            if (map.geographicExtent) {
                                geoCenter = map.geographicExtent.getCenter();
                                if ($scope.center.lng.toFixed(digits) !== geoCenter.x.toFixed(digits)) {
                                    $scope.center.lng = geoCenter.x;
                                }
                                if ($scope.center.lat.toFixed(digits) !== geoCenter.y.toFixed(digits)) {
                                    $scope.center.lat = geoCenter.y;
                                }
                            }
                            // if extent change handler defined, call it
                            if ($attrs.extentChange) {
                                $scope.extentChange()(e);
                            }
                        });
                        // $scope.$emit('mapExtentChange', e);
                    });

                    // clean up
                    $scope.$on('$destroy', function () {
                        map.destroy();
                        // TODO: anything else?
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
                // TODO: is this the right place for this?
                // can it be done on the legend directive itself?
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
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

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
