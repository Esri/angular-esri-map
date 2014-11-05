(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriMap', function($q, $timeout, esriLoader, esriRegistry) {

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

                // add this map to the registry
                esriRegistry._register($attrs.registerAs, mapDeferred);

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

                esriLoader('esri/map').then(function(Map){

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
