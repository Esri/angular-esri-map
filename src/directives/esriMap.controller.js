(function(angular) {
    'use strict';

    angular.module('esri.map').controller('esriMapController', function EsriMapController($attrs, $timeout, esriMapUtils, esriRegistry) {

        // update two-way bound scope properties based on map state
        function updateCenterAndZoom(scope, map) {
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

        var attrs = $attrs;

        // this deferred will be resolved with the map
        var mapPromise;

        // get map options from controller properties
        this.getMapOptions = function() {

            // read options passed in as either a JSON string expression
            // or as a function bound object
            var mapOptions = this.mapOptions() || {};

            // check for 1 way bound properties (basemap)
            // basemap takes precedence over mapOptions.basemap
            if (this.basemap) {
                mapOptions.basemap = this.basemap;
            }

            // check for 2 way bound properties (center and zoom)
            // center takes precedence over mapOptions.center
            if (this.center) {
                if (this.center.lng && this.center.lat) {
                    mapOptions.center = [this.center.lng, this.center.lat];
                } else {
                    mapOptions.center = this.center;
                }
            }

            // zoom takes precedence over mapOptions.zoom
            if (this.zoom) {
                mapOptions.zoom = this.zoom;
            }

            return mapOptions;
        };

        // method returns the promise that will be resolved with the map
        this.getMap = function() {
            return mapPromise;
        };

        // adds the layer, returns the promise that will be resolved with the result of map.addLayer
        this.addLayer = function(layer, index) {
            // layer: valid JSAPI layer
            // index: optional <Number>; likely only used internally by, for example, esriFeatureLayer
            return this.getMap().then(function(map) {
                return map.addLayer(layer, index);
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
                this.layerInfos.unshift(lyrInfo);
            }
        };
        this.getLayerInfos = function() {
            return this.layerInfos;
        };

        // update scope in response to map events and
        // update map in response to changes in scope properties
        this.bindMapEvents = function(scope, attrs) {
            var self = this;

            // get the map once it's loaded
            this.getMap().then(function(map) {
                if (map.loaded) {
                    // map already loaded, we need to
                    // update two-way bound scope properties
                    // updateCenterAndZoom(scope, map);
                    updateCenterAndZoom(self, map);
                    // make map object available to caller
                    // by calling the load event handler
                    if (attrs.load) {
                        self.load()(map);
                    }
                } else {
                    // map is not yet loaded, this means that
                    // two-way bound scope properties
                    // will be updated by extent-change handler below
                    // so don't need to update them here
                    // just set up a handler for the map load event (if any)
                    if (attrs.load) {
                        map.on('load', function() {
                            scope.$apply(function() {
                                self.load()(map);
                            });
                        });
                    }
                }

                // listen for changes to map extent and
                // call extent-change handler (if any)
                // also update scope.center and scope.zoom
                map.on('extent-change', function(e) {
                    if (attrs.extentChange) {
                        self.extentChange()(e);
                    }
                    // prevent circular updates between $watch and $apply
                    if (self.inUpdateCycle) {
                        return;
                    }
                    self.inUpdateCycle = true;
                    scope.$apply(function() {
                        // update scope properties
                        updateCenterAndZoom(self, map);
                        $timeout(function() {
                            // this will be executed after the $digest cycle
                            self.inUpdateCycle = false;
                        }, 0);
                    });
                });

                // listen for changes to scope.basemap and update map
                scope.$watch('mapCtrl.basemap', function(newBasemap, oldBasemap) {
                    if (map.loaded && newBasemap !== oldBasemap) {
                        map.setBasemap(newBasemap);
                    }
                });

                // listen for changes to scope.center and scope.zoom and update map
                self.inUpdateCycle = false;
                if (!angular.isUndefined(attrs.center) || !angular.isUndefined(attrs.zoom)) {
                    scope.$watchGroup(['mapCtrl.center.lng', 'mapCtrl.center.lat', 'mapCtrl.zoom'], function(newCenterZoom/*, oldCenterZoom*/) {
                        if (self.inUpdateCycle) {
                            return;
                        }
                        if (newCenterZoom[0] !== '' && newCenterZoom[1] !== '' && newCenterZoom[2] !== '') {
                            // prevent circular updates between $watch and $apply
                            self.inUpdateCycle = true;
                            map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]).then(function() {
                                self.inUpdateCycle = false;
                            });
                        }
                    });
                }

                // clean up
                scope.$on('$destroy', function() {
                    if (self.deregister) {
                        self.deregister();
                    }
                    map.destroy();
                });
            });
        };

        // initialize the map
        if (attrs.webmapId) {
            // load map object from web map
            mapPromise = esriMapUtils.createWebMap(attrs.webmapId, attrs.id, this.getMapOptions(), this);
        } else {
            // create a new map object
            mapPromise = esriMapUtils.createMap(attrs.id, this.getMapOptions());
        }

        // add this map to the registry and get a
        // handle to deregister the map when it's destroyed
        if (attrs.registerAs) {
            this.deregister = esriRegistry._register(attrs.registerAs, mapPromise);
        }
    });

})(angular);
