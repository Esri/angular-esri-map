'use strict';

angular.module('esri-map-docs')
    .controller('SimpleMapCtrl', function($scope) {
        $scope.map = {
            options: {
                basemap: 'topo',
                center: [-122.45,37.75],
                zoom: 13,
                sliderStyle: 'small'
            }
        };
    });
