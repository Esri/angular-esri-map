(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapController
     * @requires $attrs
     * @requires $timeout
     * @requires esri.core.factory:esriMapUtils
     * @requires esri.core.factory:esriRegistry
     *
     * @description
     * This controller is used by the esri-map directive to construct the map,
     * provide it with several supporting methods,
     * and also add it to the registry if following the {@link ../#/examples/registry-pattern Registry Pattern}.
     */
    angular.module('esri.map').controller('EsriMapController', function EsriMapController($attrs, $timeout, esriMapUtils, esriRegistry) {

        // check if a variable is undefined
        function isUndefined(v) {
            return typeof v === 'undefined';
        }

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

        /**
         * @ngdoc function
         * @name getMapProperties
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Formats and prepares map options from controller properties.
         *
         * @returns {Object} A map options object for map construction.
         */
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

        /**
         * @ngdoc function
         * @name getMap
         * @methodOf esri.map.controller:EsriMapController
         *
         * @return {Promise} The promise that will be resolved with the loaded map.
         */
        this.getMap = function() {
            return mapPromise;
        };

        /**
         * @ngdoc function
         * @name addLayer
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Adds the layer to the map.
         *
         * @param {FeatureLayer | VectorTileLayer | ArcGISDynamicMapServiceLayer} layer Layer to add to the map
         * @param {Number=} index Layer ordering position on the map
         *
         * @return {Promise} The promise that will be resolved with the result of `map.addLayer`.
         */
        this.addLayer = function(layer, index) {
            return this.getMap().then(function(map) {
                return map.addLayer(layer, index);
            });
        };

        /**
         * @ngdoc function
         * @name removeLayer
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Removes the layer from the map, for example when a esri-feature-layer directive goes out of scope.
         *
         * @param {FeatureLayer | VectorTileLayer | ArcGISDynamicMapServiceLayer} layer Layer to remove from the map
         *
         * @return {Promise} The promise that will be resolved with the result of `map.removeLayer`.
         */
        this.removeLayer = function (layer) {
            return this.getMap().then(function (map) {
                return map.removeLayer(layer);
            });
        };

        /**
         * @ngdoc function
         * @name addLayerInfo
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Adds to the array to store layer info, which is needed for the esri-legend directive.
         *
         * @param {Object} layerInfo Information about the layer, see
         *  {@link https://developers.arcgis.com/javascript/jsapi/legend-amd.html#legend1 layerInfo} for object specification.
         */
        this.addLayerInfo = function(layerInfo) {
            if (!this.layerInfos) {
                this.layerInfos = [layerInfo];
            } else {
                this.layerInfos.unshift(layerInfo);
            }
        };

        /**
         * @ngdoc function
         * @name getLayerInfos
         * @methodOf esri.map.controller:EsriMapController
         *
         * @return {Array} The array of layer info objects that are used by the esri-legend directive.
         */
        this.getLayerInfos = function() {
            return this.layerInfos;
        };

        /**
         * @ngdoc function
         * @name bindMapEvents
         * @methodOf esri.map.controller:EsriMapController
         *
         * @description
         * Updates scope in response to map events,
         * and updates the map in response to scope properties.
         *
         * @param {Object} scope $scope
         * @param {Object} attrs $attrs
         */
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
                if (!isUndefined(attrs.center) || !isUndefined(attrs.zoom)) {
                    scope.$watchGroup(['mapCtrl.center.lng', 'mapCtrl.center.lat', 'mapCtrl.zoom'], function(newCenterZoom) {
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
