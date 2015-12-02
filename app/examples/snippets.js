'use strict';

angular.module('esri-map-docs')
    .controller('SnippetsCtrl', function($scope, pathService) {

        // update snippet parameters based on route
        $scope.$on('$routeChangeStart', function(event, next/*, current*/) {
            $scope.tabs = pathService.getSnippetPaths(next.originalPath);
            $scope.currentTab = $scope.tabs && $scope.tabs.length > 0 ? $scope.tabs[0] : null;
        });

    });
