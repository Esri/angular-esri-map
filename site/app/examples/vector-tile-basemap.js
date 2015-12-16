'use strict';
angular.module('esri-map-docs')
    .controller('VectorBasemapCtrl', function($scope) {
        $scope.map = {
            options: {
                center: [-122.70, 45.52],
                zoom: 10
            }
        };
    });
