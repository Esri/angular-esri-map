'use strict';

angular.module('esri-map-docs')
    .controller('FeatureLayerEventsCtrl', function($scope) {
        $scope.map = {
            center: {
                lng: -122.676207,
                lat: 45.523452
            },
            zoom: 12,
            showTrees: false,
            treesLoaded: false,
            treesUpdateEndCount: 0
        };
        $scope.treesLayerLoaded = function(layer) {
            // a 1-time reference to the layer is available
            console.log(layer);
            $scope.map.treesLoaded = true;
        };
        $scope.treesLayerUpdateEnd = function(e) {
            // reference to the layer's updateEnd event object is available
            // e.target will also provide reference to the layer
            console.log(e);
            $scope.map.treesUpdateEndCount += 1;
        };
    });