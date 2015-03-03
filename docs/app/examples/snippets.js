'use strict';

angular.module('esri-map-docs')
    .controller('SnippetsCtrl', function($scope) {

        function getPathParts(path) {
            if (!path) {
                return [];
            }
            return path.slice(path.indexOf('/') + 1).split('/');
        }

        // parse snippet include file locations from route
        function getTabs(path) {
            var pathParts = getPathParts(path),
                tabs,
                page;
            if (pathParts.length === 0) {
                return;
            }
            page = pathParts[0];
            if (!page) {
                return;
            }
            if (page === 'examples' && pathParts.length > 1) {
                tabs = [];
                tabs.push('app/examples/' + pathParts[1] + '.html');
                tabs.push('app/examples/' + pathParts[1] + '.js');
                return tabs;
            }
        }

        // update snippet parameters based on route
        $scope.$on('$routeChangeStart', function(event, next/*, current*/) {
            $scope.tabs = getTabs(next.originalPath);
            $scope.currentTab = $scope.tabs && $scope.tabs.length > 0 ? $scope.tabs[0] : null;
        });
    });
