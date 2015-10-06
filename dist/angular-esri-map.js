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
(function (angular) {
  'use strict';

  angular.module('esri.map').factory('esriMapUtils', function () {

    // test if a string value (i.e. directive attribute value)
    function isTrue(val) {
        return val === true || val === 'true';
    }

    // stateless utility service
    var service = {};

    // bind directive attributes to layer properties and events
    service.initLayerDirecive = function(scope, attrs, layerController, mapController) {
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
            scope.$watch('visible', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setVisibility(isTrue(newVal));
                }
            });

            // watch the scope's opacity property for changes
            // set the opacity of the feature layer
            scope.$watch('opacity', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    layer.setOpacity(Number(newVal));
                }
            });

            // call load handler (if any)
            if (attrs.load) {
                if (layer.loaded) {
                    // layer is already loaded
                    // make layer object available to caller immediately
                    scope.load()(layer);
                } else {
                    // layer is not yet loaded
                    // wait for load event, and then make layer object available
                    layer.on('load', function() {
                        scope.$apply(function() {
                            scope.load()(layer);
                        });
                    });
                }
            }

            // call updateEnd handler (if any)
            if (attrs.updateEnd) {
                layer.on('update-end', function(e) {
                    scope.$apply(function() {
                        scope.updateEnd()(e);
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

    return service;
  });

})(angular);

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
            }
        };
    });

})(angular);

(function(angular) {
    'use strict';

    function isTrue(val) {
        return val === true || val === 'true';
    }

    angular.module('esri.map').directive('esriFeatureLayer', function($q, esriMapUtils) {
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

            // isolate scope for feature layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                definitionExpression: '@?',
                // function binding for event handlers
                load: '&',
                updateEnd: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            // define an interface for working with this directive
            controller: function($scope) {
                var self = this;
                var layerDeferred = $q.defer();

                this.layerType = 'FeatureLayer';

                require(['esri/layers/FeatureLayer', 'esri/InfoTemplate'], function(FeatureLayer, InfoTemplate) {

                    // layerOptions.infoTemplate expects one of the following:
                    //  1. [title <String | Function>, content <String | Function>]
                    //  2. {title: <String | Function>, content: <String | Function>}
                    //  3. a valid Esri JSAPI InfoTemplate
                    // TODO: refactor to shared factory/service to be used by feature layer directive as well
                    function objectToInfoTemplate(infoTemplate) {
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

                    var layerOptions = $scope.layerOptions() || {};

                    // $scope.visible takes precedence over $scope.layerOptions.visible
                    if (angular.isDefined($scope.visible)) {
                        layerOptions.visible = isTrue($scope.visible);
                    }

                    // $scope.opacity takes precedence over $scope.layerOptions.opacity
                    if ($scope.opacity) {
                        layerOptions.opacity = Number($scope.opacity);
                    }

                    // $scope.definitionExpression takes precedence over $scope.layerOptions.definitionExpression
                    if ($scope.definitionExpression) {
                        layerOptions.definitionExpression = $scope.definitionExpression;
                    }

                    // $scope.layerOptions.infoTemplate takes precedence over
                    // layer options defined in nested esriLayerOption directives
                    if (layerOptions.hasOwnProperty('infoTemplate')) {
                        self.setInfoTemplate(layerOptions.infoTemplate);
                    }

                    // normalize info template defined in $scope.layerOptions.infoTemplate
                    // or nested esriLayerOption directive to be instance of esri/InfoTemplate
                    // and pass to layer constructor in layerOptions
                    if (self._infoTemplate) {
                        self._infoTemplate = objectToInfoTemplate(self._infoTemplate);
                        layerOptions.infoTemplate = self._infoTemplate;
                    }

                    // layerOptions.mode expects a FeatureLayer constant name as a <String>
                    // https://developers.arcgis.com/javascript/jsapi/featurelayer-amd.html#constants
                    if (layerOptions.hasOwnProperty('mode')) {
                        // look up and convert to the appropriate <Number> value
                        layerOptions.mode = FeatureLayer[layerOptions.mode];
                    }

                    var layer = new FeatureLayer($scope.url, layerOptions);
                    layerDeferred.resolve(layer);
                });

                // return the defered that will be resolved with the feature layer
                this.getLayer = function() {
                    return layerDeferred.promise;
                };

                this.setInfoTemplate = function(infoTemplate) {
                    this._infoTemplate = infoTemplate;
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map
            link: function(scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // bind directive attributes to layer properties and events
                esriMapUtils.initLayerDirecive(scope, attrs, layerController, mapController).then(function(layer) {

                    // additional directive attribute binding specific to this type of layer

                    // watch the scope's definitionExpression property for changes
                    // set the definitionExpression of the feature layer
                    scope.$watch('definitionExpression', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            layer.setDefinitionExpression(newVal);
                        }
                    });
                });
            }
        };
    });

})(angular);

(function (angular) {
    'use strict';

    function isTrue(val) {
        return val === true || val === 'true';
    }

    // TODO: refactor to shared factory/service?
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

    angular.module('esri.map').directive('esriDynamicMapServiceLayer', function ($q, esriMapUtils) {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriDynamicMapServiceLayer to be used as an element (<esri-dynamic-map-service-layer>)
            restrict: 'E',

            // require the esriDynamicMapServiceLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriDynamicMapServiceLayer', '^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // isolate scope for dynamic layer so it can be added/removed dynamically
            scope: {
                url: '@',
                visible: '@?',
                opacity: '@?',
                visibleLayers: '@?',
                // function binding for event handlers
                load: '&',
                updateEnd: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                layerOptions: '&'
            },

            // define an interface for working with this directive
            controller: function ($scope, $element, $attrs) {
                var self = this;
                var layerDeferred = $q.defer();

                this.layerType = 'ArcGISDynamicMapServiceLayer';

                // set the info template for a layer
                this.setInfoTemplate = function(layerId, infoTemplate) {
                    // initialize info templates hash if needed
                    if (!angular.isObject(this._infoTemplates)) {
                        this._infoTemplates = {};
                    }

                    // add the infotemplate for this layer to the hash
                    // NOTE: ignoring layerUrl and resourceInfo for now
                    // https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1
                    this._infoTemplates[layerId] = {
                        infoTemplate: infoTemplate
                    };
                };


                require(['esri/layers/ArcGISDynamicMapServiceLayer', 'esri/InfoTemplate', 'esri/layers/ImageParameters'], function (ArcGISDynamicMapServiceLayer, InfoTemplate, ImageParameters) {

                    // layerOptions.infoTemplate expects one of the following:
                    //  1. [title <String | Function>, content <String | Function>]
                    //  2. {title: <String | Function>, content: <String | Function>}
                    //  3. a valid Esri JSAPI InfoTemplate
                    // TODO: refactor to shared factory/service to be used by feature layer directive as well
                    function objectToInfoTemplate(infoTemplate) {
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

                    var layerOptions = $scope.layerOptions() || {};

                    // $scope.visible takes precedence over $scope.layerOptions.visible
                    if (angular.isDefined($scope.visible)) {
                        layerOptions.visible = isTrue($scope.visible);
                    }

                    // $scope.opacity takes precedence over $scope.layerOptions.opacity
                    if ($scope.opacity) {
                        layerOptions.opacity = Number($scope.opacity);
                    }

                    // $scope.layerOptions.infoTemplates takes precedence over
                    // layer options defined in nested esriLayerOption directives
                    if (angular.isObject(layerOptions.infoTemplates)) {
                        for (var layerIndex in layerOptions.infoTemplates) {
                            if (layerOptions.infoTemplates.hasOwnProperty(layerIndex)) {
                                self.setInfoTemplate(layerIndex, layerOptions.infoTemplates[layerIndex].infoTemplate);
                            }
                        }
                    }

                    // normalize info templates defined in $scope.layerOptions.infoTemplates
                    // or nested esriLayerOption directives to be instances of esri/InfoTemplate
                    // and pass to layer constructor in layerOptions
                    if (self._infoTemplates) {
                        for (var layerId in self._infoTemplates) {
                            if (self._infoTemplates.hasOwnProperty(layerId)) {
                                self._infoTemplates[layerId].infoTemplate = objectToInfoTemplate(self._infoTemplates[layerId].infoTemplate);
                            }
                        }
                        layerOptions.infoTemplates = self._infoTemplates;
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
                    var layer = new ArcGISDynamicMapServiceLayer($attrs.url, layerOptions);

                    // set visible layers if passed as attribute
                    if ($scope.visibleLayers) {
                        layer.setVisibleLayers(parseVisibleLayers($scope.visibleLayers));
                    }

                    // resolve deferred w/ layer
                    layerDeferred.resolve(layer);
                });

                // return the defered that will be resolved with the dynamic layer
                this.getLayer = function () {
                    return layerDeferred.promise;
                };

                // set the info template for a layer
                self.setInfoTemplate = function(layerId, infoTemplate) {
                    // initialize info templates hash if needed
                    if (!angular.isObject(this._infoTemplates)) {
                        this._infoTemplates = {};
                    }

                    // add the infotemplate for this layer to the hash
                    // NOTE: ignoring layerUrl and resourceInfo for now
                    // https://developers.arcgis.com/javascript/jsapi/arcgisdynamicmapservicelayer-amd.html#arcgisdynamicmapservicelayer1
                    this._infoTemplates[layerId] = {
                        infoTemplate: infoTemplate
                    };
                };
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var layerController = controllers[0];
                var mapController = controllers[1];

                // bind directive attributes to layer properties and events
                esriMapUtils.initLayerDirecive(scope, attrs, layerController, mapController);
            }
        };
    });

})(angular);

(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriInfoTemplate', function () {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriInfoTemplate to be used as an element (<esri-feature-layer>)
            restrict: 'E',

            // require the esriInfoTemplate to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['?esriInfoTemplate', '?^esriDynamicMapServiceLayer', '?^esriFeatureLayer'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            compile: function($element) {

                // get info template content from element inner HTML
                var content = $element.html();

                // clear element inner HTML
                $element.html('');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function (scope, element, attrs, controllers) {
                    // controllers is now an array of the controllers from the 'require' option
                    // var templateController = controllers[0];
                    var dynamicMapServiceLayerController = controllers[1];
                    var featureLayerController = controllers[2];
                    
                    if (dynamicMapServiceLayerController) {
                        dynamicMapServiceLayerController.setInfoTemplate(attrs.layerId, {
                            title: attrs.title,
                            content: content
                        });
                    }
                    
                    if (featureLayerController) {
                        featureLayerController.setInfoTemplate({
                            title: attrs.title,
                            content: content
                        });
                    }
                };
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
                scope.$watchCollection(function () { return mapController.getLayerInfos(); }, function (newValue/*, oldValue, scope*/) {
                    legend.refresh(newValue);
                });
                legendDeferred.resolve(legend);
              });
            });
          }
        };
      });

})(angular);
