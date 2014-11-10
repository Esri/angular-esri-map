'use strict';

angular.module('esri-map-docs')
    .controller('WebMapCtrl', function($scope, esriLoader, esriRegistry) {
        $scope.$parent.page = 'examples';
        $scope.map = {
            center: {
                lng: -122.45,
                lat: 37.75
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
