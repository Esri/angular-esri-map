'use strict';

angular.module('esri-map-docs')
    .controller('FeatureLayersCtrl', function($scope) {
        $scope.map = {
            center: {
                lng: -122.676207,
                lat: 45.523452
            },
            zoom: 12
        };
    });
