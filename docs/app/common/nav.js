'use strict';

angular.module('esri-map-docs')
    .controller('NavCtrl', function($scope) {

        function getPathParts(path) {
            if (!path) {
                return [];
            }
            return path.slice(path.indexOf('/') + 1).split('/');
        }

        // set page based on route
        $scope.$on('$routeChangeStart', function(event, next, current) {
            var pathParts = getPathParts(next.originalPath);
            $scope.page = pathParts.length > 0 ? pathParts[0] : '';
        });

    });
