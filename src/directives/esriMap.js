(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriMap', function($q, $timeout, esriRegistry) {

        // update two-way bound scope properties based on map state
        function updateScopeFromMap(scope, map) {
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
                        // construct if parent controller isn't supplying a valid and already constructed Extent
                        // e.g. if the controller or HTML view are only providing JSON
                        if (mapOptions.extent.declaredClass !== 'esri.geometry.Extent') {
                            mapOptions.extent = new Extent(mapOptions.extent);
                        }
                    }

                    // construct optional infoWindow from mapOptions
                    // default to a new Popup dijit for now
                    // mapOptions.infoWindow expects:
                    //  {options: <Object>, srcNodeRef: <Node | String>}
                    if (mapOptions.hasOwnProperty('infoWindow')) {
                        if (mapOptions.infoWindow.hasOwnProperty('srcNodeRef')) {
                            mapOptions.infoWindow = new Popup(mapOptions.infoWindow.options || {}, mapOptions.infoWindow.srcNodeRef);
                        }
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

                // support removing layers, e.g. when esriFeatureLayer goes out of scope
                this.removeLayer = function (layer) {
                    return this.getMap().then(function (map) {
                        return map.removeLayer(layer);
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
