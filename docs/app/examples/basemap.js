'use strict';

angular.module('esri-map-docs')
    .controller('BasemapCtrl', function($scope) {
        $scope.$parent.page = 'examples';
        $scope.map = {
            center: {
                lng: -31.036,
                lat: 42.747
            },
            zoom: 3,
            basemap: 'satellite'
        };
    });
