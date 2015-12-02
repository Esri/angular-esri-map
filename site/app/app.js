(function(angular) {
    'use strict';
    // NOTE: ngSelect and hljs are only included to support
    // tabs that dynamically load code and highlight syntax
    // see: https://github.com/pc035860/angular-highlightjs#demos
    angular
        .module('esri-map-docs', ['ngRoute', 'ngSanitize', 'ngSelect', 'hljs', 'esri.map'])
        .config(function($routeProvider, appConfig) {
            $routeProvider
                // TODO: add home page
                .when('/home', {
                    templateUrl: 'app/home/home.html',
                    controller: 'HomeCtrl'
                })
                .when('/examples', {
                    templateUrl: 'app/examples/examples.html',
                    controller: 'ExamplesCtrl'
                })
                .when('/patterns', {
                    templateUrl: 'app/patterns/patterns.html',
                    controller: 'PatternsCtrl'
                })
                .when('/about', {
                    redirectTo: '/patterns'
                })
                .otherwise({
                    redirectTo: '/home'
                });
            // set routes of examples pages from appConfig
            angular.forEach(appConfig.examplePageCategories, function(examplesArray) {
                angular.forEach(examplesArray, function(example) {
                    $routeProvider
                        .when(example.route.path, {
                            templateUrl: example.route.templateUrl,
                            controller: example.route.controller
                        });
                });
            });

            // set routes of patterns pages from appConfig
            angular.forEach(appConfig.patternsPages, function(page) {
                $routeProvider
                    .when(page.path, {
                        templateUrl: page.templateUrl,
                        controller: 'PatternsCtrl'
                    });
            });
        });
})(angular);
