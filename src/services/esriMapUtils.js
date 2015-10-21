(function (angular) {
  'use strict';

  // TODO: use esriLoader instead of dojo/require and $q?
  angular.module('esri.map').factory('esriMapUtils', function ($q, $timeout) {

    // TODO: rename to updateCenterAndZoom?
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

    // parse array of visible layer ids from a string
    function parseVisibleLayers(val) {
        var visibleLayers;
        if (typeof val === 'string') {
            visibleLayers = [];
            val.split(',').forEach(function(layerId) {
                var n = parseInt(layerId);
                if(!isNaN(n)) {
                    visibleLayers.push(n);
                }
            });
        }
        return visibleLayers;
    }

    // layerOptions.infoTemplate expects one of the following:
    //  1. [title <String | Function>, content <String | Function>]
    //  2. {title: <String | Function>, content: <String | Function>}
    //  3. a valid Esri JSAPI InfoTemplate
    function objectToInfoTemplate(infoTemplate, InfoTemplate) {
        // only attempt to construct if a valid InfoTemplate wasn't already passed in
        if (infoTemplate.declaredClass === 'esri.InfoTemplate') {
            return infoTemplate;
        } else {
            // construct infoTemplate from object, using 2 args style:
            //  https://developers.arcgis.com/javascript/jsapi/infotemplate-amd.html#infotemplate2
            if (angular.isArray(infoTemplate) && infoTemplate.length === 2) {
                return new InfoTemplate(infoTemplate[0], infoTemplate[1]);
            } else {
                return new InfoTemplate(infoTemplate.title, infoTemplate.content);
            }
        }
    }

    function objectToExtent(extent, Extent) {
        // construct Extent if object is not already an instance
        // e.g. if the controller or HTML view are only providing JSON
        if (extent.declaredClass === 'esri.geometry.Extent') {
            return extent;
        } else {
            return new Extent(extent);
        }
    }

    // stateless utility service
    var service = {};

    // test if a string value (i.e. directive attribute value)
    service.isTrue = function (val) {
        return val === true || val === 'true';
    };

    // TODO: rename to addBasemapDefinition
    service.addCustomBasemap = function(name, basemapDefinition) {
        var deferred = $q.defer();
        require(['esri/basemaps'], function(esriBasemaps) {
            var baseMapLayers = basemapDefinition.baseMapLayers;
            if (!angular.isArray(baseMapLayers) && angular.isArray(basemapDefinition.urls)) {
                baseMapLayers = basemapDefinition.urls.map(function (url) {
                    return {
                        url: url
                    };
                });
            }
            if (angular.isArray(baseMapLayers)) {
                esriBasemaps[name] = {
                    baseMapLayers: baseMapLayers,
                    thumbnailUrl: basemapDefinition.thumbnailUrl,
                    title: basemapDefinition.title
                };
            }
            deferred.resolve(esriBasemaps);
        });
        return deferred.promise;
    };

    // get map options from controller properties
    service.getMapOptions = function(mapController) {

        // setup our mapOptions based on object hash from attribute string
        // or from scope object property
        var mapOptions = mapController.mapOptions() || {};

        // check for 1 way bound properties (basemap)
        // basemap takes precedence over mapOptions.basemap
        if (mapController.basemap) {
            mapOptions.basemap = mapController.basemap;
        }

        // check for 2 way bound properties (center and zoom)
        // center takes precedence over mapOptions.center
        if (mapController.center) {
            if (mapController.center.lng && mapController.center.lat) {
                mapOptions.center = [mapController.center.lng, mapController.center.lat];
            } else {
                mapOptions.center = mapController.center;
            }
        }

        // zoom takes precedence over mapOptions.zoom
        if (mapController.zoom) {
            mapOptions.zoom = mapController.zoom;
        }

        return mapOptions;
    };

    // TODO: possibly split into bindLayerEvents and watchLayerScope?
    // bind directive attributes to layer properties and events
    service.initLayerDirective = function(scope, attrs, layerController, mapController) {
        var layerIndex = layerController.layerType === 'FeatureLayer' ? 0 : undefined;

        return layerController.getLayer().then(function(layer) {
            // add layer at index position so that layers can be
            // declaratively added to map in top-to-bottom order
            mapController.addLayer(layer, layerIndex);

            // Look for layerInfo related attributes. Add them to the map's layerInfos array for access in other components
            mapController.addLayerInfo({
                title: attrs.title || layer.name,
                layer: layer,
                // TODO: are these the right params to send
                hideLayers: (attrs.hideLayers) ? attrs.hideLayers.split(',') : undefined,
                defaultSymbol: (attrs.defaultSymbol) ? JSON.parse(attrs.defaultSymbol) : true
            });

            // watch the scope's visible property for changes
            // set the visibility of the feature layer
            scope.$watch('vm.visible', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setVisibility(service.isTrue(newVal));
                }
            });

            // watch the scope's opacity property for changes
            // set the opacity of the feature layer
            scope.$watch('vm.opacity', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setOpacity(Number(newVal));
                }
            });

            // call load handler (if any)
            if (attrs.load) {
                if (layer.loaded) {
                    // layer is already loaded
                    // make layer object available to caller immediately
                    scope.vm.load()(layer);
                } else {
                    // layer is not yet loaded
                    // wait for load event, and then make layer object available
                    layer.on('load', function() {
                        scope.$apply(function() {
                            scope.vm.load()(layer);
                        });
                    });
                }
            }

            // call updateEnd handler (if any)
            if (attrs.updateEnd) {
                layer.on('update-end', function(e) {
                    scope.$apply(function() {
                        scope.vm.updateEnd()(e);
                    });
                });
            }

            // remove the layer from the map when the layer scope is destroyed
            scope.$on('$destroy', function() {
                mapController.removeLayer(layer);
            });

            // return the layer
            return layer;
        });
    };

    // create a new map at an element w/ the given id
    service.createMap = function(elementId, mapOptions) {
        // this deferred will be resolved with the map
        var mapDeferred = $q.defer();

        require(['esri/map', 'esri/geometry/Extent'], function(Map, Extent) {

            // construct optional Extent for mapOptions
            if (mapOptions.hasOwnProperty('extent')) {
                mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
            }

            // create a new map object and
            // resolve the promise with the map
            mapDeferred.resolve(new Map(elementId, mapOptions));
        });

        return mapDeferred;
    };

    // TODO: would be better if we didn't have to pass mapController
    // create a new map from a web map at an element w/ the given id
    service.createWebMap = function(webmapId, elementId, mapOptions, mapController) {
        // this deferred will be resolved with the map
        var mapDeferred = $q.defer();

        require(['esri/arcgis/utils', 'esri/geometry/Extent'], function(arcgisUtils, Extent) {

            // construct optional Extent for mapOptions
            if (mapOptions.hasOwnProperty('extent')) {
                mapOptions.extent = objectToExtent(mapOptions.extent, Extent);
            }

            // load map object from web map
            arcgisUtils.createMap(webmapId, elementId, {
                mapOptions: mapOptions
            }).then(function(response) {
                // get layer infos for legend
                mapController.layerInfos = arcgisUtils.getLegendLayers(response);
                // get item info (map title, etc)
                mapController.itemInfo = response.itemInfo;
                // resolve the promise with the map and additional info
                mapDeferred.resolve(response.map);
            });
        });

        return mapDeferred;
    };


    // TODO: either pass mapController, or
    // pass controllerAs name to use w/ scope
    // TODO: break into bindMapEvents and watchMapScope?
    service.bindMapEvents = function(mapController, scope, attrs) {

        mapController.getMap().then(function(map) {
            if (map.loaded) {
                // map already loaded, we need to
                // update two-way bound scope properties
                // updateScopeFromMap(scope, map);
                updateScopeFromMap(mapController, map);
                // make map object available to caller
                // by calling the load event handler
                if (attrs.load) {
                    mapController.load()(map);
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
                            mapController.load()(map);
                        });
                    });
                }
            }

            // listen for changes to scope.basemap and update map
            scope.$watch('mapCtrl.basemap', function(newBasemap, oldBasemap) {
                if (map.loaded && newBasemap !== oldBasemap) {
                    map.setBasemap(newBasemap);
                }
            });

            // listen for changes to scope.center and scope.zoom and update map
            mapController.inUpdateCycle = false;
            if (!angular.isUndefined(attrs.center) || !angular.isUndefined(attrs.zoom)) {
                scope.$watchGroup(['mapCtrl.center.lng', 'mapCtrl.center.lat', 'mapCtrl.zoom'], function(newCenterZoom/*, oldCenterZoom*/) {
                    if (mapController.inUpdateCycle) {
                        return;
                    }
                    if (newCenterZoom[0] !== '' && newCenterZoom[1] !== '' && newCenterZoom[2] !== '') {
                        // prevent circular updates between $watch and $apply
                        mapController.inUpdateCycle = true;
                        map.centerAndZoom([newCenterZoom[0], newCenterZoom[1]], newCenterZoom[2]).then(function() {
                            mapController.inUpdateCycle = false;
                        });
                    }
                });
            }

            // listen for changes to map extent and
            // call extent-change handler (if any)
            // also update scope.center and scope.zoom
            map.on('extent-change', function(e) {
                if (attrs.extentChange) {
                    mapController.extentChange()(e);
                }
                // prevent circular updates between $watch and $apply
                if (mapController.inUpdateCycle) {
                    return;
                }
                mapController.inUpdateCycle = true;
                scope.$apply(function() {
                    // update scope properties
                    updateScopeFromMap(mapController, map);
                    $timeout(function() {
                        // this will be executed after the $digest cycle
                        mapController.inUpdateCycle = false;
                    }, 0);
                });
            });

            // clean up
            scope.$on('$destroy', function() {
                if (mapController.deregister) {
                    mapController.deregister();
                }
                map.destroy();
            });
        });
    };

    service.createFeatureLayer = function(url, layerOptions) {
        var layerDeferred = $q.defer();
        require(['esri/layers/FeatureLayer', 'esri/InfoTemplate'], function(FeatureLayer, InfoTemplate) {

            // normalize info template defined in $scope.layerOptions.infoTemplate
            // or nested esriLayerOption directive to be instance of esri/InfoTemplate
            // and pass to layer constructor in layerOptions
            if (layerOptions.infoTemplate) {
                layerOptions.infoTemplate = objectToInfoTemplate(layerOptions.infoTemplate, InfoTemplate);
            }

            // layerOptions.mode expects a FeatureLayer constant name as a <String>
            // https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#constants
            if (layerOptions.hasOwnProperty('mode')) {
                // look up and convert to the appropriate <Number> value
                layerOptions.mode = FeatureLayer[layerOptions.mode];
            }

            layerDeferred.resolve(new FeatureLayer(url, layerOptions));
        });

        return layerDeferred;
    };

    service.createDynamicMapServiceLayer = function(url, layerOptions, visibleLayers) {
        var layerDeferred = $q.defer();
        var layer;

        require(['esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate', 'esri/layers/ImageParameters'], function (ArcGISDynamicMapServiceLayer, InfoTemplate, ImageParameters) {

            // normalize info templates defined in $scope.layerOptions.infoTemplates
            // or nested esriLayerOption directives to be instances of esri/InfoTemplate
            // and pass to layer constructor in layerOptions
            if (layerOptions.infoTemplates) {
                for (var layerId in layerOptions.infoTemplates) {
                    if (layerOptions.infoTemplates.hasOwnProperty(layerId)) {
                        layerOptions.infoTemplates[layerId].infoTemplate = objectToInfoTemplate(layerOptions.infoTemplates[layerId].infoTemplate, InfoTemplate);
                    }
                }
            }

            // check for imageParameters property and
            // convert into ImageParameters() if needed
            if (angular.isObject(layerOptions.imageParameters)) {
                if (layerOptions.imageParameters.declaredClass !== 'esri.layers.ImageParameters') {
                    var imageParameters = new ImageParameters();
                    for (var key in layerOptions.imageParameters) {
                        if (layerOptions.imageParameters.hasOwnProperty(key)) {
                            // TODO: may want to conver timeExent to new TimeExtent()
                            // also not handling conversion for bbox, imageSpatialReference, nor layerTimeOptions
                            imageParameters[key] = layerOptions.imageParameters[key];
                        }
                    }
                    layerOptions.imageParameters = imageParameters;
                }
            }

            // create the layer object
            layer = new ArcGISDynamicMapServiceLayer(url, layerOptions);

            // set visible layers if passed as attribute
            if (visibleLayers) {
                layer.setVisibleLayers(parseVisibleLayers(visibleLayers));
            }

            // resolve deferred w/ layer
            layerDeferred.resolve(layer);
        });

        return layerDeferred;
    };

    return service;
  });

})(angular);
