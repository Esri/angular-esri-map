'use strict';

angular.module('esri-map-docs')
    .controller('ExamplesCtrl', function($scope, appConfig) {
        var examplePages = [];
        angular.forEach(appConfig.examplePageCategories, function(examplesArray/*, categoryKeyName*/) {
            examplePages = examplePages.concat(examplesArray);
        });
        var splitIndex = Math.floor(examplePages.length / 2);
        $scope.examplePageColumns = {
            left: examplePages.slice(0, splitIndex),
            right: examplePages.slice(splitIndex)
        };
    });
