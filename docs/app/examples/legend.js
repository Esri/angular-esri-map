'use strict';

angular.module('esri-map-docs')
    .controller('LegendCtrl', function($scope) {
        $scope.$parent.page = 'examples';
        $scope.map = {
            center: {
                lng: -96.53,
                lat: 38.374
            },
            zoom: 13
        };
    });
