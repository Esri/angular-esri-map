'use strict';

angular.module('esri-map-docs')
    .controller('DynamicMapServiceLayerCtrl', function ($scope) {
        $scope.dynamicLayer = {
            visible: true,
            opacity: 0.5
        };
    });
