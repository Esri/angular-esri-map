(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriMap', function($q, $timeout, esriRegistry) {

        // get the map's center in geographic coords
        function getCenter(map) {
            var geoCenter = map.geographicExtent && map.geographicExtent.getCenter();
            if (geoCenter) {
                return {
                    lat: geoCenter.y,
                    lng: geoCenter.x
                };
            } else {
                return null;
            }
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
                            // add item info to scope
                            $scope.itemInfo = response.itemInfo;
                            // TODO: update layer info for legend after loading web map?
                            mapDeferred.resolve(response.map);
                        });
                    } else {
                        // create a new map object
                        var map = new Map($attrs.id, mapOptions);
                        mapDeferred.resolve(map);
                    }

                    mapDeferred.promise.then(function(map) {
                        // TODO: do we have to update scope properties on map load?
                        // var center = getCenter(map);
                        // console.log('center: ', center);
                        // console.log('zoom: ', map.getZoom());
                        // if (center) {
                        //     $scope.center = center;
                        // }
                        // $scope.zoom = map.getZoom();

                        // make a reference to the map object available
                        // to the controller once it is loaded.
                        if ($attrs.load) {
                            if (map.loaded) {
                                $scope.load()(map);
                            } else {
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
                                    $scope.inUpdateCycle = true; // prevent circular updates between $watch and $apply
                                    map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]).then(function() {
                                        $scope.inUpdateCycle = false;
                                    });
                                }
                            });
                        }

                        // listen for changes to map extent and then
                        // update $scope.center and $scope.zoom
                        // and call extent-change handler (if any)
                        map.on('extent-change', function(e) {
                            if ($scope.inUpdateCycle) {
                                return;
                            }
                            $scope.inUpdateCycle = true; // prevent circular updates between $watch and $apply
                            $scope.$apply(function() {
                                var center = getCenter(map);
                                if (center) {
                                    $scope.center = center;
                                }
                                $scope.zoom = map.getZoom();

                                // execute extent change event handler, if supplied
                                if ($attrs.extentChange) {
                                    $scope.extentChange()(e);
                                }

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
