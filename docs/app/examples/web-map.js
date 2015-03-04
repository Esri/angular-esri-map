'use strict';

angular.module('esri-map-docs')
    .controller('WebMapCtrl', function($scope, esriLoader, esriRegistry) {
        $scope.map = {
            center: {
                lng: -122.6819,
                lat: 45.5200
            },
            zoom: 13
        };
        $scope.goToBookmark = function(bookmark) {
            esriRegistry.get('myMap').then(function(map) {
                esriLoader('esri/geometry/Extent').then(function(Extent) {
                    var extent = new Extent(bookmark.extent);
                    map.setExtent(extent);
                });
            });
        };
    });
