'use strict';

angular.module('esri-map-docs')
    .controller('WebMapCtrl', function($scope, esriLoader) {
        // get a reference to the controller
        // for use within the callback
        var self = this;
        // this example requires the extent module
        // so let's go ahead and load that now
        esriLoader.require('esri/geometry/Extent').then(function(Extent) {
            $scope.map = {
                center: {
                    lng: -122.6819,
                    lat: 45.5200
                },
                zoom: 13
            };
            // get a reference to the map object once it's loaded
            $scope.mapLoaded = function(map) {
                self.mapObj = map;
            };
            // click handler for bookmark buttons
            $scope.goToBookmark = function(bookmark) {
                if (!self.mapObj) {
                    return;
                }
                var extent = new Extent(bookmark.extent);
                self.mapObj.setExtent(extent);
            };
        });
    });
