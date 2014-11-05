(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriMap', function($q, $timeout, esriLoader) {

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

                    $scope.$watch(function(scope){ return [scope.center.lng,scope.center.lat, scope.zoom].join(',');}, function(newCenterZoom,oldCenterZoom)
                    // $scope.$watchGroup(['center.lng','center.lat', 'zoom'], function(newCenterZoom,oldCenterZoom)
                    {
                        console.log("center/zoom changed", newCenterZoom, oldCenterZoom);
                        newCenterZoom = newCenterZoom.split(',');
                        map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]);
                    });

                    map.on('extent-change', function(e) 
                    {
                        console.log('extent-change', e.extent.toJson());
                        console.log('extent-change geo', map.geographicExtent);

                        var geoCenter = map.geographicExtent.getCenter();

                        $scope.$apply(function()
                        {
                            $scope.center.lng = geoCenter.x;
                            $scope.center.lat = geoCenter.y;
                            $scope.zoom = map.getZoom();

                            if( $attrs.extentChange )
                                $scope.extentChange()(e);
                        });

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
