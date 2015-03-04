'use strict';

angular.module('esri-map-docs')
    .controller('NavCtrl', function($scope, pathService) {

        // set page based on route
        $scope.$on('$routeChangeStart', function(event, next/*, current*/) {
            var pathParts = pathService.getPathParts(next.originalPath);
            $scope.page = pathParts.length > 0 ? pathParts[0] : '';
        });

    });
