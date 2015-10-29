'use strict';

angular.module('esri-map-docs')
    .controller('WebMapCtrl', function($scope, esriLoader) {

        // initial map settings
        $scope.map = {
            center: {
                lng: -122.6819,
                lat: 45.5200
            },
            zoom: 13
        };

        // this example requires the extent module
        // so let's get that once the map is loaded
        $scope.mapLoaded = function(map) {
            esriLoader.require('esri/geometry/Extent').then(function(Extent) {
                // now that we have the Extent module, we can
                // wire up the click handler for bookmark buttons
                $scope.goToBookmark = function(bookmark) {
                    var extent = new Extent(bookmark.extent);
                    map.setExtent(extent);
                };
            });
        };

    });
