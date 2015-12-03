'use strict';

angular.module('esri-map-docs')
    .controller('LeftNavCtrl', function($scope, pathService, appConfig) {

        $scope.activeExample = null;
        $scope.leftNavStyle = 'none';

        $scope.examplePageCategories = appConfig.examplePageCategories;
        $scope.patternsPages = appConfig.patternsPages;

        // toggle left nav visibility based on route path
        // toggle 'active' class of list items based on route controller name or path
        $scope.$on('$routeChangeStart', function(event, next) {
            var isExamplePath = (pathService.getPathParts(next.originalPath)[0] === 'examples');
            $scope.examplesLeftNavShow = isExamplePath;
            $scope.examplesLeftNavStyle = isExamplePath ? 'block' : 'none';

            var isPatternsPath = (pathService.getPathParts(next.originalPath)[0] === 'patterns');
            $scope.patternsLeftNavShow = isPatternsPath;
            $scope.patternsLeftNavStyle = isPatternsPath ? 'block' : 'none';
            
            $scope.activeExample = next.controller;
            $scope.activePath = next.originalPath;
        });
    });
