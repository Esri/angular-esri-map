'use strict';

angular.module('esri-map-docs')
    .controller('ExamplesLeftNavCtrl', function($scope, pathService, appConfig) {

        $scope.activeExample = null;
        $scope.leftNavStyle = 'none';

        $scope.examplePageCategories = appConfig.examplePageCategories;

        // toggle left nav visibility based on route path
        // toggle 'active' class of list items based on route controller name
        $scope.$on('$routeChangeStart', function(event, next) {
            var isExamplePath = (pathService.getPathParts(next.originalPath)[0] === 'examples');
            $scope.leftNavShow = isExamplePath;
            $scope.leftNavStyle = isExamplePath ? 'block' : 'none';
            $scope.activeExample = next.controller;
        });
    });
