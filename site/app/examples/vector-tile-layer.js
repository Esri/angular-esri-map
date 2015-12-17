'use strict';
angular.module('esri-map-docs')
    .controller('VectorTileLayerCtrl', function($scope) {
        $scope.map = {
            options: {
                center: [2.3508, 48.8567],
                zoom: 10
            }
        };
    });
