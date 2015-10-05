'use strict';

angular.module('esri-map-docs')
    .controller('ExamplesCtrl', function($scope, appConfig) {
        var splitIndex = Math.floor(appConfig.examplePages.length / 2);
        $scope.examplePageColumns = {
            left: appConfig.examplePages.slice(0, splitIndex),
            right: appConfig.examplePages.slice(splitIndex)
        };
    });