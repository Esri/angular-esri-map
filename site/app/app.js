(function(angular) {
    'use strict';
    // NOTE: ngSelect and hljs are only included to support
    // tabs that dynamically load code and highlight syntax
    // see: https://github.com/pc035860/angular-highlightjs#demos
    angular
        .module('esri-map-docs', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ngSelect', 'hljs', 'esri.map'])
        .config(function($locationProvider, $routeProvider, appConfig) {
            $locationProvider.hashPrefix('');
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
                            controller: example.route.controller,
                            controllerAs: example.route.controllerAs
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

            // redirects from previous version of docs
            $routeProvider.when('/patterns/references-to-map-and-layers', {
                redirectTo: '/patterns/references-to-views'
            });
        });
})(angular);
