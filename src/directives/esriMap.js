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
