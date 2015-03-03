'use strict';

angular.module('esri-map-docs')
    .controller('CenterAndZoomCtrl', function($scope) {
        $scope.map = {
            center: {
                lng: -122.45,
                lat: 37.75
            },
            zoom: 12,
            basemap: 'topo'
        };
        $scope.cities = {
            SanFrancisco: {
                lng: -122.45,
                lat: 37.75,
                zoom: 10
            },
            NewYork: {
                lng: -74.0059,
                lat: 40.7127,
                zoom: 12
            }
        };
        $scope.zoomToCity = function(city) {
            $scope.map.center.lat = city.lat;
            $scope.map.center.lng = city.lng;
            $scope.map.zoom = city.zoom;
        };
    });
