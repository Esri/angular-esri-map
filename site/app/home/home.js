'use strict';

angular.module('esri-map-docs')
    .controller('HomeCtrl', function($scope, $timeout) {
        $scope.esriMapViewTitle = true;

        var toggleJumbotronTitles = function() {
            $timeout(function() {
                $scope.esriMapViewTitle = $scope.esriMapViewTitle ? false : true;
                toggleJumbotronTitles();
            }, 5000);
        };

        toggleJumbotronTitles();
    });
