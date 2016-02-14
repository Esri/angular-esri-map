'use strict';

angular.module('esri-map-docs')
    .controller('AlertController', function($scope) {
        $scope.showAlert = true;
        $scope.hideAlert = function() {
            $scope.showAlert = false;
        };
    });
