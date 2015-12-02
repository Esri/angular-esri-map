'use strict';

angular.module('esri-map-docs')
    .controller('PatternsCtrl', function($scope, pathService, appConfig) {

        $scope.leftNavStyle = 'none';
        $scope.patternsPages = appConfig.patternsPages;

        // toggle left nav visibility based on route path
        // toggle 'active' class of list items based on route controller name
        $scope.$on('$routeChangeStart', function(event, next) {
            var isPatternsPath = (pathService.getPathParts(next.originalPath)[0] === 'patterns');
            $scope.leftNavShow = isPatternsPath;
            $scope.leftNavStyle = isPatternsPath ? 'block' : 'none';
            $scope.activePath = next.originalPath;
        });
    });
