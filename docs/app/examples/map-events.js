'use strict';

angular.module('esri-map-docs')
    .controller('MapEventsCtrl', function($scope) {
        $scope.map = {
            center: {
                lng: -122.45,
                lat: 37.75
            },
            zoom: 13,
            loaded: false,
        };
        // one way to get a reference to the map is to
        // set a handler for the map directive's load attribute
        $scope.mapLoaded = function(map) {
            // now you have a reference to the map
            // that you can do whatever you want with
            console.log(map);
            $scope.map.loaded = true;
        };
        // the map directive also exposes an extent-change attribute
        $scope.extentChanged = function(e) {
            // now you have a reference to the extent
            $scope.map.extent = e.extent;
        };
    });
