angular.module('esri.map', []).directive('esriMap', function ($q) {
    return {
        restrict: 'E',
        scope: {
          basemap: '=',
          center: '=',
          zoom: '='
        },
        compile: function ($element, $attrs) {
            // remove the id attribute from the main element
            $element.removeAttr('id');

            // append a new div inside this element, this is where we will create our map
            $element.append('<div id=' + $attrs.id + '></div>');

            // since we are using compile we need to return our linker function
            // the 'link' function handles how our directive responds to changes in $scope
            /*jshint unused: false*/
            return function (scope, element, attrs, controller) {
                // link function
            };
        },
        controller: function ($scope, $element, $attrs) {
            // only do this once per directive
            // this deferred will be resolved with the map
            var mapDeferred = $q.defer();

            // setup our map options based on the attributes and scope
            var mapOptions = {};
            if($attrs.extent){
              mapOptions.extent = $scope[$attrs.extent];
            }
            if($scope.center){
              mapOptions.center = $scope.center.split(',');
            } else if ($attrs.lng && $attrs.lat) {
              mapOptions.center = [$attrs.lng, $attrs.lat];
            }
            if($scope.zoom){
              mapOptions.zoom = $scope.zoom;
            }
            if($scope.basemap){
              mapOptions.basemap = $scope.basemap;
            }

            // load esri dependencies via AMD
            require(['esri/map'], function (Map) {

                // initialize map and resolve the deferred
                var map = new Map($attrs.id, mapOptions);
                mapDeferred.resolve(map);

                // listen for changes to scope and update map
                $scope.$watch('basemap', function(newBasemap) {
                  if (map.loaded) {
                    map.setBasemap(newBasemap);
                  }
                });
                $scope.$watch('zoom', function(newZoom) {
                  if (map.loaded) {
                    map.setZoom(newZoom);
                  }
                });

                // listen for map events and update scope
                map.on('extent-change', function() {
                  $scope.$apply(function() {
                    $scope.zoom = map.getZoom();
                  });
                });
            });

            // method returns the promise that will be resolved with the map
            this.getMap = function () {
                return mapDeferred.promise;
            };

            // adds the layer, returns teh promise that will be resolved with the result of map.addLayer
            this.addLayer = function (layer) {
                return this.getMap().then(function (map) {
                    return map.addLayer(layer);
                });
            };

            this.addLayerInfo = function(lyrInfo){
              if(!this.layerInfos){
                this.layerInfos = [lyrInfo];
              } else {
                this.layerInfos.push(lyrInfo);
              }
            };

            this.getLayerInfos = function(){
              return this.layerInfos;
            };

        }
    };
});

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
