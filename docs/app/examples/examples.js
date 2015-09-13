'use strict';

angular.module('esri-map-docs')
    .controller('ExamplesCtrl', function($scope, appConfig) {
        $scope.examplePages = appConfig.examplePages;
    });