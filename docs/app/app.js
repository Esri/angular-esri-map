(function(angular) {
    'use strict';
    // NOTE: ngSelect and hljs are only included to support
    // tabs that dynamically load code and highlight syntax
    // see: https://github.com/pc035860/angular-highlightjs#demos
    angular
        .module('esri-map-docs', ['ngRoute', 'ngSanitize', 'ngSelect', 'hljs', 'esri.map'])
        .config(function($routeProvider, appConfig) {
            $routeProvider
                .when('/examples', {
                    templateUrl: 'app/examples/examples.html',
                    controller: 'ExamplesCtrl'
                })
                .when('/about', {
                    templateUrl: 'app/about/about.html',
                    controller: 'AboutCtrl'
                })
                .otherwise({
                    redirectTo: '/examples'
                });
            // set routes of examples pages from appConfig
            angular.forEach(appConfig.examplePages, function(example) {
                $routeProvider
                    .when(example.route.path, {
                        templateUrl: example.route.templateUrl,
                        controller: example.route.controller
                    });
            });
        });
})(angular);